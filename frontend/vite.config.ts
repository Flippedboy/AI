

import path from 'path';
import fs from 'fs';
import { defineConfig } from '@lark-apaas/fullstack-vite-preset';
import type { Plugin } from 'vite';

/**
 * 自定义插件：直接通过 Vite 提供 client/index.html
 *
 * 背景：@lark-apaas/fullstack-vite-preset 默认会把所有 HTML 请求反代到
 * 本地 NestJS 后端（默认端口 3000）。本项目后端是 Python FastAPI
 * （端口 8000，只提供 /api/* 接口），不会渲染 HTML，导致默认配置下
 * 访问 http://localhost:8080/ 返回 502 Bad Gateway。
 *
 * 本插件以 enforce:'pre' 优先于 preset 的 HTML 代理中间件执行：
 *   - 命中 HTML 请求时，读取 client/index.html，替换模板变量后交由
 *     Vite 的 transformIndexHtml 注入开发脚本，直接返回；
 *   - 非 HTML 请求放行至下游中间件（preset 的 /api 代理、Vite 静态资源等）。
 */
function serveLocalIndexHtml(): Plugin {
  return {
    name: 'serve-local-index-html',
    enforce: 'pre',
    configureServer(server) {
      const indexHtmlPath = path.resolve(__dirname, 'client/index.html');
      // preset HTML 代理所使用的白名单，与之保持一致以避免误拦截 dev server 资源
      const devServerWhiteList = [
        '/@vite',
        '/@fs',
        '/__vite',
        '/@id',
        '/node_modules',
        '/dev/',
        '.hot-update',
      ];
      const staticAssetRegex = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i;

      server.middlewares.use(async (req, res, next) => {
        try {
          const acceptHeader = req.headers.accept || '';
          const isHtmlRequest = acceptHeader.includes('text/html');
          const pathname = (req.url || '').split('?')[0];
          const isDevServerPath = devServerWhiteList.some((item) => pathname.includes(item));
          const isStaticAsset = staticAssetRegex.test(pathname);

          if (!isHtmlRequest || isDevServerPath || isStaticAsset) {
            next();
            return;
          }

          let html = fs.readFileSync(indexHtmlPath, 'utf-8');
          // index.html 中的 {{{__platform__}}} 是妙搭平台注入的模板变量，
          // 本地开发没有平台注入，替换成空 JSON 让 try/catch 正常解析。
          html = html.replace(/\{\{\{__platform__\}\}\}/g, '{}');
          // 经 Vite 转换：注入 HMR client、React refresh 等
          html = await server.transformIndexHtml(req.url || '/', html, req.originalUrl);
          // 替换 preset viewContextPlugin 注入的平台模板变量
          // 本地开发无 NestJS 后端注入，需手动替换避免页面显示 {{appName}} 等字面量
          html = html
            .replace(/\{\{appName\}\}/g, 'AI扫地机智能客服')
            .replace(/\{\{csrfToken\}\}/g, '')
            .replace(/\{\{userId\}\}/g, '')
            .replace(/\{\{tenantId\}\}/g, '')
            .replace(/\{\{appId\}\}/g, '')
            .replace(/\{\{environment\}\}/g, 'development')
            .replace(/\{\{appDescription\}\}/g, '扫地机器人专属智能客服系统')
            .replace(/\{\{\{appAvatar\}\}\}/g, '')
            .replace(/\{\{basename\}\}/g, '/');
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.statusCode = 200;
          res.end(html);
        } catch (err) {
          next(err as any);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [serveLocalIndexHtml()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
});
