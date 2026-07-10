"""
智扫通 - 统一 API 后端服务器
将 Python RAG Agent 后端与前端对接的 FastAPI 服务
"""
import os
import sys
import json
import random
import time
import uuid
import asyncio
from datetime import datetime, timedelta
from typing import Optional, AsyncGenerator

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# App init
# ---------------------------------------------------------------------------
app = FastAPI(
    title="智扫通 API",
    description="扫地机器人智能客服系统后端 API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory data stores
# ---------------------------------------------------------------------------
_chat_messages: list[dict] = []
_knowledge_docs: list[dict] = []
_user_reports: list[dict] = []
_system_configs: dict[str, dict] = {
    "model_temperature": {"value": "0.7", "type": "model", "description": "模型温度"},
    "model_max_tokens": {"value": "2048", "type": "model", "description": "最大 Token 数"},
    "model_system_prompt": {"value": "你是智扫通智能客服助手，专门回答扫地机器人相关问题。", "type": "model", "description": "系统提示词"},
    "knowledge_threshold": {"value": "0.75", "type": "knowledge", "description": "相似度阈值"},
    "knowledge_top_k": {"value": "5", "type": "knowledge", "description": "Top-K 召回数量"},
}

_quick_questions = [
    {"id": "1", "content": "如何更换边刷"},
    {"id": "2", "content": "地图重建失败怎么办"},
    {"id": "3", "content": "如何清理尘盒"},
    {"id": "4", "content": "App连接失败"},
    {"id": "5", "content": "预约清扫设置"},
    {"id": "6", "content": "滤网多久换一次"},
]

# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------
def _seed_data():
    """生成初始演示数据"""
    now = datetime.now()

    # Chat messages
    sessions = [f"session_{int(now.timestamp())}_{uuid.uuid4().hex[:6]}" for _ in range(3)]
    user_questions = [
        "扫地机器人适合什么地板？", "怎么清理尘盒？", "拖地功能怎么用？",
        "边刷多久换一次？", "滤网多久换一次？", "水箱怎么清洗？",
        "App连接不上怎么办？", "地图重建失败如何解决？", "如何预约清扫？",
        "机器人在某个房间来回跑怎么回事？",
    ]
    ai_answers = [
        "扫地机器人适用于多种地板类型，包括瓷砖、木地板、大理石等。建议根据家居环境选择合适的机型。",
        "清理尘盒很简单：1) 按下尘盒释放按钮取出尘盒；2) 打开尘盒盖倒出灰尘；3) 用清水冲洗尘盒和滤网；4) 晾干后装回即可。",
        "使用拖地功能前，请先安装拖布支架并加满清水。在App中选择拖地模式或扫拖一体模式即可。建议根据不同地板材质调节水量。",
        "边刷建议每3-6个月更换一次，具体频率取决于使用频率和地面情况。当发现边刷变形或清洁效果下降时，应及时更换。",
        "滤网建议每1-2个月清洗一次，每3-6个月更换一次。如果滤网堵塞严重，会影响吸尘效果和机器性能。",
        "水箱清洗步骤：1) 取出水箱倒掉残留水；2) 用软布蘸取少量中性清洁剂擦拭水箱内部；3) 用清水冲洗干净；4) 晾干后装回。",
        "App连接失败请尝试：1) 确认WiFi连接正常；2) 重启机器人和路由器；3) 检查App是否为最新版本；4) 如仍无法连接，请联系客服。",
        "地图重建失败的解决方法：1) 确保机器人电量充足；2) 清理地面障碍物；3) 重启机器人后重新建图；4) 如反复失败，建议重置地图并重新扫描。",
        "预约清扫设置方法：打开App进入设备页面点击预约设置预约时间和清扫模式保存即可。支持每天或工作日重复预约。",
        "机器人在某区域来回跑通常是因为：1) 该区域较脏，机器人正在重点清扫；2) 传感器被遮挡，建议清理传感器；3) 地图信息异常，可尝试重建地图。",
    ]
    for i in range(50):
        q_idx = i % len(user_questions)
        ts = (now - timedelta(hours=i * 2)).isoformat()
        sid = sessions[i % len(sessions)]
        _chat_messages.append({
            "id": uuid.uuid4().hex,
            "sessionId": sid,
            "content": user_questions[q_idx],
            "type": "user",
            "isQuickQuestion": False,
            "responseTime": None,
            "createdAt": ts,
        })
        _chat_messages.append({
            "id": uuid.uuid4().hex,
            "sessionId": sid,
            "content": ai_answers[q_idx],
            "type": "ai",
            "isQuickQuestion": False,
            "responseTime": random.randint(500, 3000),
            "createdAt": (datetime.fromisoformat(ts) + timedelta(seconds=2)).isoformat(),
        })

    # Knowledge documents
    doc_names = [
        "扫地机器人100问.pdf", "扫拖一体机器人使用指南.txt", "故障排除手册.pdf",
        "维护保养指南.txt", "选购指南.pdf",
    ]
    for i, name in enumerate(doc_names):
        _knowledge_docs.append({
            "id": uuid.uuid4().hex,
            "name": name,
            "type": "pdf" if name.endswith(".pdf") else "txt",
            "size": random.randint(1024, 512000),
            "url": f"/data/{name}",
            "status": "success",
            "quoteCount": random.randint(5, 50),
            "createdAt": (now - timedelta(days=random.randint(1, 30))).isoformat(),
        })

    # User reports
    users = [
        {"id": "1847292357012580", "name": "张先生"},
        {"id": "1847292986161210", "name": "李女士"},
        {"id": "1838411738368010", "name": "王先生"},
        {"id": "1856321049783650", "name": "赵女士"},
    ]
    for user in users:
        for m_offset in range(3):
            month = (now.replace(day=1) - timedelta(days=m_offset * 30)).strftime("%Y-%m")
            total_chats = random.randint(10, 50)
            _user_reports.append({
                "id": uuid.uuid4().hex,
                "userId": user["id"],
                "userName": user["name"],
                "month": month,
                "content": json.dumps({
                    "overview": {
                        "totalChats": total_chats,
                        "totalArea": random.randint(1000, 5000),
                        "totalCleanCount": random.randint(20, 80),
                    },
                    "frequentQuestions": [
                        {"question": "集尘袋何时更换", "count": random.randint(3, 8)},
                        {"question": "边刷清理方法", "count": random.randint(2, 6)},
                        {"question": "App连接失败", "count": random.randint(1, 5)},
                        {"question": "地图重建失败", "count": random.randint(1, 4)},
                    ],
                    "cleaningAdvice": "建议增加客厅区域清扫频次，定期清理滤网和边刷，保持机器人最佳性能。根据使用数据显示，您家中的厨房区域清洁频率较低，建议增加清扫次数。",
                    "supplyReminder": [
                        {"item": "边刷", "status": "warning", "detail": "已使用2个月，建议近期更换"},
                        {"item": "滤网", "status": "normal", "detail": "状态良好"},
                        {"item": "尘袋", "status": "replace", "detail": "已使用3个月，建议立即更换"},
                    ],
                }),
                "status": "success",
                "exportUrlPdf": None,
                "exportUrlExcel": None,
                "createdAt": (now - timedelta(days=random.randint(1, 14))).isoformat(),
            })

_seed_data()

# ---------------------------------------------------------------------------
# AI Agent (lazy init)
# ---------------------------------------------------------------------------
_agent = None

def _get_agent():
    global _agent
    if _agent is None:
        try:
            from agent.react_agent import ReactAgent
            _agent = ReactAgent()
        except Exception as e:
            print(f"[WARN] ReactAgent not available: {e}")
            _agent = None
    return _agent

def _fallback_chat(question: str) -> str:
    """Fallback response when AI agent is unavailable"""
    responses = [
        f"关于「{question}」，建议您查看产品使用手册或联系客服获取详细帮助。",
        f"您提到的「{question}」是常见问题。一般来说，建议定期清理和维护扫地机器人以保持最佳性能。",
        f"对于「{question}」的问题，您可以尝试：1) 检查设备状态；2) 清理相关部件；3) 重启设备后重试。如问题仍存在，请联系售后客服。",
    ]
    return random.choice(responses)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class ChatMessageCreate(BaseModel):
    sessionId: str
    content: str
    type: str = Field(pattern=r"^(user|ai)$")
    isQuickQuestion: bool = False
    responseTime: Optional[int] = None

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    pageSize: int

class KnowledgeDocCreate(BaseModel):
    name: str
    type: str = Field(pattern=r"^(pdf|docx|xlsx|txt)$")
    size: int = 0
    url: str = ""

class SystemConfigUpdate(BaseModel):
    key: str
    value: str

class SystemConfigsUpdate(BaseModel):
    configs: list[SystemConfigUpdate]

class ReportCreate(BaseModel):
    userId: str
    month: str

# ---------------------------------------------------------------------------
# API Routes - Health
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# ---------------------------------------------------------------------------
# API Routes - AI Chat (streaming)
# ---------------------------------------------------------------------------
@app.post("/api/ai/chat")
async def ai_chat(body: dict = Body(...)):
    question = body.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="question is required")

    async def generate():
        agent = _get_agent()
        if agent:
            try:
                for chunk in agent.execute_stream(question):
                    yield f"data: {json.dumps({'content': chunk}, ensure_ascii=False)}\n\n"
                    await asyncio.sleep(0.02)
            except Exception as e:
                print(f"[AI Agent Error] {e}")
                yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"
        else:
            full = _fallback_chat(question)
            for i in range(0, len(full), 5):
                yield f"data: {json.dumps({'content': full[i:i+5]}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0.05)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# API Routes - Chat Messages
# ---------------------------------------------------------------------------
@app.get("/api/chat-messages")
async def chat_messages(sessionId: str = "", page: int = 1, pageSize: int = 50):
    msgs = _chat_messages
    if sessionId:
        msgs = [m for m in msgs if m['sessionId'] == sessionId]
    total = len(msgs)
    start = (page - 1) * pageSize
    items = msgs[start:start + pageSize]
    return {"items": items, "total": total, "page": page, "pageSize": pageSize}

@app.post("/api/chat-messages")
async def create_chat_message(body: ChatMessageCreate):
    msg = {
        "id": uuid.uuid4().hex,
        "sessionId": body.sessionId,
        "content": body.content,
        "type": body.type,
        "isQuickQuestion": body.isQuickQuestion,
        "responseTime": body.responseTime,
        "createdAt": datetime.now().isoformat(),
    }
    _chat_messages.append(msg)
    return {"id": msg["id"]}
@app.get("/api/ai/quick-questions")
async def quick_questions():
    return {"items": _quick_questions}

@app.post("/api/ai/parse-document")
async def parse_document(body: dict = Body(...)):
    file_urls = body.get("fileUrls", [])
    await asyncio.sleep(1)
    return {
        "content": f"成功解析 {len(file_urls)} 个文档，提取了知识片段。",
        "status": "success",
    }

# ---------------------------------------------------------------------------
# API Routes - Dashboard
# ---------------------------------------------------------------------------
@app.get("/api/dashboard/metrics")
async def dashboard_metrics():
    user_msg_count = len([m for m in _chat_messages if m["type"] == "user"])
    ai_msg_count = len([m for m in _chat_messages if m["type"] == "ai"])
    unique_sessions = len(set(m["sessionId"] for m in _chat_messages))
    total_docs = len(_knowledge_docs)
    response_times = [
        m["responseTime"] for m in _chat_messages
        if m["type"] == "ai" and m.get("responseTime")
    ]
    avg_time = round(sum(response_times) / len(response_times)) if response_times else 0
    return {
        "totalChats": user_msg_count + ai_msg_count,
        "totalUsers": unique_sessions,
        "totalKnowledgeDocs": total_docs,
        "averageResponseTime": avg_time,
        "chatGrowthRate": 12.5,
        "userGrowthRate": 8.3,
    }

@app.get("/api/dashboard/chat-trend")
async def chat_trend(dimension: str = "day", days: int = 30):
    now = datetime.now()
    data: dict[str, int] = {}
    for msg in _chat_messages:
        d = datetime.fromisoformat(msg["createdAt"]).strftime("%Y-%m-%d")
        data[d] = data.get(d, 0) + 1
    items = []
    for i in range(days - 1, -1, -1):
        d = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        items.append({"date": d, "count": data.get(d, random.randint(0, 5))})
    return {"items": items}

@app.get("/api/dashboard/hot-questions")
async def hot_questions(limit: int = 10):
    questions: dict[str, int] = {}
    for msg in _chat_messages:
        if msg["type"] == "user":
            q = msg["content"][:30] + ("..." if len(msg["content"]) > 30 else "")
            questions[q] = questions.get(q, 0) + 1
    items = [{"question": k, "count": v} for k, v in questions.items()]
    items.sort(key=lambda x: x["count"], reverse=True)
    return {"items": items[:limit]}

@app.get("/api/dashboard/knowledge-usage")
async def knowledge_usage():
    if not _knowledge_docs:
        return {"items": []}
    total = sum(d["quoteCount"] for d in _knowledge_docs) or 1
    items = [
        {
            "docName": d["name"],
            "quoteCount": d["quoteCount"],
            "percentage": round(d["quoteCount"] / total * 100, 1),
        }
        for d in sorted(_knowledge_docs, key=lambda x: x["quoteCount"], reverse=True)
    ]
    return {"items": items}

# ---------------------------------------------------------------------------
# API Routes - Knowledge Base
# ---------------------------------------------------------------------------
@app.get("/api/knowledge-documents")
async def list_documents(keyword: str = "", page: int = 1, pageSize: int = 20):
    docs = _knowledge_docs
    if keyword:
        docs = [d for d in docs if keyword.lower() in d["name"].lower()]
    total = len(docs)
    start = (page - 1) * pageSize
    items = docs[start:start + pageSize]
    return {"items": items, "total": total, "page": page, "pageSize": pageSize}

@app.post("/api/knowledge-documents")
async def create_document(body: KnowledgeDocCreate):
    doc = {
        "id": uuid.uuid4().hex,
        "name": body.name,
        "type": body.type,
        "size": body.size,
        "url": body.url,
        "status": "indexing",
        "quoteCount": 0,
        "createdAt": datetime.now().isoformat(),
    }
    _knowledge_docs.insert(0, doc)
    asyncio.create_task(_simulate_indexing(doc["id"]))
    return {"id": doc["id"]}

async def _simulate_indexing(doc_id: str):
    await asyncio.sleep(2)
    for doc in _knowledge_docs:
        if doc["id"] == doc_id:
            doc["status"] = "success"
            doc["quoteCount"] = random.randint(3, 20)
            break

@app.delete("/api/knowledge-documents/{doc_id}")
async def delete_document(doc_id: str):
    global _knowledge_docs
    _knowledge_docs = [d for d in _knowledge_docs if d["id"] != doc_id]
    return {"success": True}

@app.get("/api/knowledge/status")
async def knowledge_status():
    total = len(_knowledge_docs)
    success = len([d for d in _knowledge_docs if d["status"] == "success"])
    rate = round(success / total * 100, 1) if total > 0 else 100
    last_updated = max((d["createdAt"] for d in _knowledge_docs), default=datetime.now().isoformat())
    return {
        "totalDocs": total,
        "indexSuccessRate": rate,
        "lastUpdatedAt": last_updated,
    }

# ---------------------------------------------------------------------------
# API Routes - Reports
# ---------------------------------------------------------------------------
@app.post("/api/user-reports")
async def create_report(body: ReportCreate):
    report = {
        "id": uuid.uuid4().hex,
        "userId": body.userId,
        "userName": "用户",
        "month": body.month,
        "content": None,
        "status": "generating",
        "exportUrlPdf": None,
        "exportUrlExcel": None,
        "createdAt": datetime.now().isoformat(),
    }
    _user_reports.insert(0, report)
    asyncio.create_task(_generate_report_async(report["id"], body.userId, body.month))
    return {"id": report["id"], "status": "generating"}

async def _generate_report_async(report_id: str, user_id: str, month: str):
    await asyncio.sleep(3)
    user_names = {
        "1847292357012580": "张先生",
        "1847292986161210": "李女士",
        "1838411738368010": "王先生",
        "1856321049783650": "赵女士",
    }
    content = {
        "overview": {
            "totalChats": random.randint(10, 50),
            "totalArea": random.randint(1000, 5000),
            "totalCleanCount": random.randint(20, 80),
        },
        "frequentQuestions": [
            {"question": "集尘袋何时更换", "count": random.randint(3, 8)},
            {"question": "边刷清理方法", "count": random.randint(2, 6)},
            {"question": "App连接失败", "count": random.randint(1, 5)},
        ],
        "cleaningAdvice": "建议增加客厅区域清扫频次，定期清理滤网和边刷，保持机器人最佳性能。",
        "supplyReminder": [
            {"item": "边刷", "status": "warning", "detail": "已使用2个月，建议近期更换"},
            {"item": "滤网", "status": "normal", "detail": "状态良好"},
            {"item": "尘袋", "status": "replace", "detail": "已使用3个月，建议立即更换"},
        ],
    }
    for report in _user_reports:
        if report["id"] == report_id:
            report["content"] = json.dumps(content, ensure_ascii=False)
            report["status"] = "success"
            report["userName"] = user_names.get(user_id, "用户")
            break

@app.get("/api/user-reports")
async def list_reports(page: int = 1, pageSize: int = 10):
    total = len(_user_reports)
    start = (page - 1) * pageSize
    items = []
    for r in _user_reports[start:start + pageSize]:
        item = dict(r)
        if item["content"]:
            try:
                item["content"] = json.loads(item["content"])
            except (json.JSONDecodeError, TypeError):
                item["content"] = None
        items.append(item)
    return {"items": items, "total": total, "page": page, "pageSize": pageSize}

@app.get("/api/user-reports/{report_id}")
async def get_report(report_id: str):
    for r in _user_reports:
        if r["id"] == report_id:
            item = dict(r)
            if item["content"]:
                try:
                    item["content"] = json.loads(item["content"])
                except (json.JSONDecodeError, TypeError):
                    item["content"] = None
            return item
    raise HTTPException(status_code=404, detail="Report not found")

# ---------------------------------------------------------------------------
# API Routes - System Configs
# ---------------------------------------------------------------------------
@app.get("/api/system-configs")
async def get_system_configs(type: str = ""):
    items = []
    for key, cfg in _system_configs.items():
        if type and cfg["type"] != type:
            continue
        items.append({
            "key": key,
            "value": cfg["value"],
            "type": cfg["type"],
            "description": cfg["description"],
        })
    return {"items": items}

@app.put("/api/system-configs")
async def update_system_configs(body: SystemConfigsUpdate):
    for cfg in body.configs:
        if cfg.key in _system_configs:
            _system_configs[cfg.key]["value"] = cfg.value
    return {"success": True}

# ---------------------------------------------------------------------------
# Run entry
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("API_HOST", "0.0.0.0")
    port = int(os.environ.get("API_PORT", "8000"))
    print(f"API Server starting on {host}:{port}")
    uvicorn.run("api_server:app", host=host, port=port, reload=False)
