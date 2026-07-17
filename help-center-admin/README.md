# Help Center Admin

Oceanpayment 帮助中心运营 Agent 工作台骨架。

## Scope

- 独立于根目录 Docusaurus 公开站点。
- 第一阶段只提供本地可运行骨架和 mock 数据。
- 不接真实飞书、不写真实密钥、不自动部署公司服务器。
- `miaoda-app` 仅作为参考，不参与运行。

## Structure

```text
help-center-admin/
  client/                  # React + Vite 管理后台
  server/                  # 模块化 Node 服务，预留 NestJS 风格模块边界
  packages/
    help-center-core/      # Docusaurus 扫描、MDX 转换、资源检查、build 打包占位
```

## Local Start

Install dependencies when network/package registry is available:

```powershell
npm install
```

Run the mock API:

```powershell
npm run dev:server
```

Run the Vite client:

```powershell
npm run dev:client
```

Run the lightweight skeleton check:

```powershell
npm run check
```

## Mock API

The local server starts on `http://127.0.0.1:4310` by default.

- `GET /health`
- `GET /api/dashboard`
- `GET /api/documents`
- `GET /api/categories`
- `GET /api/tasks`
- `GET /api/system/config`

