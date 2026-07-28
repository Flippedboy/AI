#!/usr/bin/env node
/**
 * 智扫通 · RAG-Agent 智能客服系统 - 跨平台启动脚本
 *
 * 使用方式：
 *   node start.js              # 启动前后端
 *   node start.js --backend    # 仅启动后端
 *   node start.js --frontend   # 仅启动前端
 *   node start.js --no-install # 跳过依赖安装
 *
 * 与 start.bat / start.ps1 相比，本脚本可在 Windows / macOS / Linux 上一致运行，
 * 同时通过子进程并行启动前后端，并将日志按前缀上色输出到同一终端。
 */

const { spawn, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// ----------------------------- 工具函数 -----------------------------
const ROOT = __dirname;
const BACKEND_DIR = path.join(ROOT, 'backend');
const FRONTEND_DIR = path.join(ROOT, 'frontend');
const isWindows = os.platform() === 'win32';
const SHELL = isWindows ? true : false;

const COLORS = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

const log = (msg, color = COLORS.cyan) =>
  console.log(`${color}[智扫通]${COLORS.reset} ${msg}`);

const logStep = (n, total, msg) =>
  console.log(`${COLORS.yellow}[${n}/${total}]${COLORS.reset} ${msg}`);

const banner = () => {
  console.log(`${COLORS.cyan}========================================${COLORS.reset}`);
  console.log(`${COLORS.cyan}  智扫通 · 智能客服系统 (Node 启动器)${COLORS.reset}`);
  console.log(`${COLORS.cyan}========================================${COLORS.reset}`);
  console.log();
};

// 解析命令行参数
const args = process.argv.slice(2);
const backendOnly = args.includes('--backend');
const frontendOnly = args.includes('--frontend');
const skipInstall = args.includes('--no-install');

// ----------------------------- 环境检测 -----------------------------
function checkCommand(cmd) {
  try {
    const file = isWindows ? `${cmd}.exe` : cmd;
    const result = spawnSync(file, ['--version'], {
      encoding: 'utf-8',
      shell: SHELL,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    if (result.status === 0) return result.stdout.trim();
    // 退回到 `cmd --version`（依赖 PATH 解析，shell=true 时可用）
    const fallback = spawnSync(cmd, ['--version'], {
      encoding: 'utf-8',
      shell: SHELL,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return fallback.status === 0 ? fallback.stdout.trim() : null;
  } catch {
    return null;
  }
}

function detectEnv() {
  logStep(1, 4, '检测运行环境...');
  const python = checkCommand('python') || checkCommand('python3');
  if (!python) {
    log('未检测到 Python，请先安装 Python 3.9+ 并加入 PATH。', COLORS.red);
    process.exit(1);
  }
  log(`Python: ${COLORS.green}${python}${COLORS.reset}`);

  const node = process.versions.node;
  const major = parseInt(node.split('.')[0], 10);
  if (major < 22) {
    log(`Node.js 版本过低: ${node}，需要 22.0+`, COLORS.red);
    process.exit(1);
  }
  log(`Node.js: ${COLORS.green}v${node}${COLORS.reset}`);
  console.log();
}

// ----------------------------- 启动后端 -----------------------------
function startBackend() {
  logStep(2, 4, '启动 Python API 后端 (端口 8000)...');
  const env = { ...process.env, PYTHONPATH: BACKEND_DIR };
  const child = spawn('python', ['api_server.py'], {
    cwd: BACKEND_DIR,
    env,
    shell: SHELL,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (data) => {
    data.toString()
      .split('\n')
      .filter(Boolean)
      .forEach((line) =>
        console.log(`${COLORS.magenta}[backend]${COLORS.reset} ${line}`)
      );
  });
  child.stderr.on('data', (data) => {
    data.toString()
      .split('\n')
      .filter(Boolean)
      .forEach((line) =>
        console.log(`${COLORS.red}[backend]${COLORS.reset} ${line}`)
      );
  });
  child.on('exit', (code) => {
    log(`后端进程退出 (code=${code})`, COLORS.red);
    process.exit(code ?? 0);
  });

  log('后端已启动 (FastAPI + Uvicorn)', COLORS.green);
  return child;
}

// ----------------------------- 安装前端依赖 -----------------------------
function ensureFrontendDeps() {
  logStep(3, 4, '检查前端依赖...');
  const nodeModules = path.join(FRONTEND_DIR, 'node_modules');
  if (fs.existsSync(nodeModules) && !skipInstall) {
    log('前端依赖已安装', COLORS.green);
    return;
  }
  if (skipInstall) {
    log('已通过 --no-install 跳过依赖安装', COLORS.yellow);
    return;
  }
  log('安装前端依赖 (npm install --ignore-scripts)...', COLORS.yellow);
  const result = spawnSync('npm', ['install', '--ignore-scripts'], {
    cwd: FRONTEND_DIR,
    stdio: 'inherit',
    shell: SHELL,
  });
  if (result.status !== 0) {
    log('前端依赖安装失败', COLORS.red);
    process.exit(result.status ?? 1);
  }
  log('依赖安装完成', COLORS.green);
}

// ----------------------------- 启动前端 -----------------------------
function startFrontend() {
  logStep(4, 4, '启动前端开发服务器 (端口 8080)...');
  const env = { ...process.env, NODE_ENV: 'development' };
  const child = spawn(
    isWindows ? 'npx.cmd' : 'npx',
    ['vite', '--config', 'vite.config.ts', '--host', '0.0.0.0'],
    {
      cwd: FRONTEND_DIR,
      env,
      shell: SHELL,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  child.stdout.on('data', (data) => {
    data.toString()
      .split('\n')
      .filter(Boolean)
      .forEach((line) =>
        console.log(`${COLORS.blue}[frontend]${COLORS.reset} ${line}`)
      );
  });
  child.stderr.on('data', (data) => {
    data.toString()
      .split('\n')
      .filter(Boolean)
      .forEach((line) =>
        console.log(`${COLORS.red}[frontend]${COLORS.reset} ${line}`)
      );
  });
  child.on('exit', (code) => {
    log(`前端进程退出 (code=${code})`, COLORS.red);
    process.exit(code ?? 0);
  });

  log('前端开发服务器已启动 (Vite)', COLORS.green);
  return child;
}

// ----------------------------- 主流程 -----------------------------
function main() {
  banner();
  detectEnv();

  const children = [];
  if (!frontendOnly) children.push(startBackend());
  if (!backendOnly) {
    ensureFrontendDeps();
    children.push(startFrontend());
  }

  console.log();
  log('========================================', COLORS.green);
  log('启动完成！', COLORS.green);
  log(`前端页面: ${COLORS.cyan}http://localhost:8080${COLORS.reset}`);
  if (!frontendOnly) {
    log(`后端 API: ${COLORS.cyan}http://localhost:8000${COLORS.reset}`);
    log(`API 文档: ${COLORS.cyan}http://localhost:8000/docs${COLORS.reset}`);
  }
  log('========================================', COLORS.green);
  console.log();
  log('按 Ctrl+C 退出，将自动关闭前后端进程', COLORS.gray);

  // 信号转发：父进程退出时杀掉子进程
  const cleanup = () => {
    children.forEach((c) => {
      try {
        if (isWindows) {
          // Windows 下用 taskkill 杀掉子进程树
          spawnSync('taskkill', ['/pid', String(c.pid), '/T', '/F'], {
            shell: true,
          });
        } else {
          process.kill(-c.pid, 'SIGTERM');
        }
      } catch {
        /* ignore */
      }
    });
    process.exit(0);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}

main();
