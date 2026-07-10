from langchain.agents import AgentState
from langchain.agents.middleware import wrap_tool_call, before_model, dynamic_prompt, ModelRequest
from langchain_core.messages import ToolMessage
from langgraph.runtime import Runtime
from langgraph.types import Command
from utils.logger_handler import logger
from utils.prompt_loader import load_report_prompts,load_system_prompts

@wrap_tool_call
def monitor_tool(request,handler) -> ToolMessage | Command:
    """
    工具执行的监控
    :param request: 请求数据的封装
    :param handler: 执行的函数本身
    :return:
    """
    logger.info(f"[monitor_tool]执行工具：{request.tool_call['name']}")
    logger.info(f"[monitor_tool]传入参数：{request.tool_call['args']}")

    try:
        result = handler(request)
        logger.info(f"[monitor_tool]工具{request.tool_call['name']}调用成功")

        if request.tool_call['name'] == "fill_context_for_report":
            request.runtime.context["report"] = True

        return result
    except Exception as e:
        logger.error(f"工具{request.tool_call['name']}调用失败，原因；{str(e)}")
        raise e

@before_model
def log_before_model(state:AgentState,runtime:Runtime):
    """
    在模型执行前输出日志
    :param state: 整个Agent智能体的状态记录
    :param runtime: 记录了整个执行过程中的上下文信息
    :return:
    """
    logger.info(f"[log_before_model]即将调用模型，带有{len(state['messages'])}条信息")
    logger.debug(f"[log_before_model]{type(state['messages'][-1])} | {state['messages'][-1].content.strip()}")
    return None

@dynamic_prompt
def report_pormpt_switch(request:ModelRequest):
    """
    每一次生成提示词之前，调用此函数，动态切换提示词
    :param request:
    :return:
    """
    is_report = request.runtime.context.get("report", False)
    if is_report:
        return load_report_prompts()
    
    return load_system_prompts()