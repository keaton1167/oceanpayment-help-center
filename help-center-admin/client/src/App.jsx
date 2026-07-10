import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, CircleDot, Play, Plus, RefreshCw } from "lucide-react";
import { routes, getCurrentRoute } from "./routes.js";
import { documents, metrics, taskLogs } from "./mockData.js";

const apiBase = "";

function useHashRoute() {
  const [route, setRoute] = useState(getCurrentRoute());

  useEffect(() => {
    const onHashChange = () => setRoute(getCurrentRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

function AppShell({ children, activeRoute }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">OP</div>
          <div>
            <strong>帮助中心运营</strong>
            <span>Agent 工作台</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="主导航">
          {routes.map((route) => {
            const Icon = route.icon;
            const isActive = activeRoute === route.path;
            return (
              <a
                className={isActive ? "nav-item active" : "nav-item"}
                href={`#/${route.path}`}
                key={route.path}
              >
                <Icon size={18} />
                <span>{route.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div>
            <h1>{routes.find((item) => item.path === activeRoute)?.label || "运营工作台"}</h1>
            <p>本地 mock 骨架，真实飞书、数据库和构建写入后续接入。</p>
          </div>
          <div className="user-chip">
            <span>Mock 用户</span>
            <strong>管理员</strong>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function DashboardPage() {
  return (
    <section className="content-grid">
      <div className="metric-grid">
        {metrics.map((metric) => (
          <div className={`metric ${metric.tone}`} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
      <Panel title="快捷操作" actions={<button><Plus size={16} />新建文档</button>}>
        <div className="quick-actions">
          <button><Plus size={16} />新建文档</button>
          <button><RefreshCw size={16} />导入飞书文档</button>
          <button><CheckCircle2 size={16} />查看待审核</button>
          <button><Play size={16} />构建检查</button>
        </div>
      </Panel>
      <DocumentTable />
      <TaskPanel />
    </section>
  );
}

function DocumentsPage() {
  return (
    <section className="stack">
      <Toolbar title="文档列表" primary="新建文档" />
      <Filters labels={["关键词", "语言", "一级目录", "状态", "负责人", "来源"]} />
      <DocumentTable />
    </section>
  );
}

function CategoriesPage() {
  return (
    <section className="two-column">
      <Panel title="目录树">
        <ul className="tree">
          <li>账户管理</li>
          <li>支付产品</li>
          <li>OP Card
            <ul>
              <li>Business</li>
              <li>Application</li>
            </ul>
          </li>
        </ul>
      </Panel>
      <Panel title="目录详情">
        <FormRows rows={["中文名称", "英文名称", "slug", "层级", "排序", "Docusaurus path", "启用状态"]} />
      </Panel>
    </section>
  );
}

function ImportsPage() {
  return (
    <section className="stack">
      <Panel title="飞书单篇文档导入">
        <FormRows rows={["飞书文档链接", "目标语言", "一级目录", "二级目录", "slug", "是否生成英文草稿"]} />
        <div className="preview-box">转换后的 MDX 预览、资源下载结果和错误说明会显示在这里。</div>
      </Panel>
      <Panel title="知识库批量导入">
        <div className="empty-state">第一阶段保留入口和 mock 流程，真实知识库读取后续接入。</div>
      </Panel>
    </section>
  );
}

function ReviewsPage() {
  return (
    <section className="stack">
      <Toolbar title="待审核内容" primary="批量通过" />
      <DocumentTable filterStatus="待审核" />
    </section>
  );
}

function AgentPage() {
  return (
    <section className="content-grid">
      {[
        "检查选中文档",
        "生成英文草稿",
        "生成部署交接说明",
        "汇总本周文档变更"
      ].map((task) => (
        <div className="agent-action" key={task}>
          <CircleDot size={18} />
          <span>{task}</span>
        </div>
      ))}
      <Panel title="Agent 建议">
        <div className="suggestion">
          <AlertCircle size={18} />
          <span>检测到 2 个资源异常。第一阶段仅展示 mock 建议，不执行真实修复。</span>
        </div>
      </Panel>
    </section>
  );
}

function ReleasePage() {
  return (
    <section className="stack">
      <Toolbar title="Build 包交付" primary="生成 build.zip" />
      <div className="release-steps">
        {["构建检查", "生成 build.zip", "生成变更清单", "预览飞书通知", "标记已交付"].map((step) => (
          <div className="step" key={step}>{step}</div>
        ))}
      </div>
      <TaskPanel />
    </section>
  );
}

function TasksPage() {
  return <TaskPanel />;
}

function SettingsPage() {
  return (
    <section className="stack">
      <Panel title="非敏感配置">
        <FormRows rows={["帮助中心正式域名", "Docusaurus 项目路径", "中文 docs 目录", "英文 i18n 目录", "图片目录", "附件目录", "build 输出目录"]} />
      </Panel>
      <Panel title="敏感配置状态">
        <div className="status-list">
          {["Feishu App ID", "Feishu App Secret", "飞书登录回调", "机器人消息权限", "模型服务 Key"].map((item) => (
            <span key={item}>{item}: 未配置</span>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function Toolbar({ title, primary }) {
  return (
    <div className="toolbar">
      <h2>{title}</h2>
      <button><Plus size={16} />{primary}</button>
    </div>
  );
}

function Filters({ labels }) {
  return (
    <div className="filters">
      {labels.map((label) => <button key={label}>{label}</button>)}
    </div>
  );
}

function Panel({ title, actions, children }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

function DocumentTable({ filterStatus }) {
  const rows = useMemo(
    () => documents.filter((doc) => !filterStatus || doc.status === filterStatus),
    [filterStatus]
  );

  return (
    <Panel title="最近文档">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>标题</th>
              <th>语言</th>
              <th>目录</th>
              <th>状态</th>
              <th>来源</th>
              <th>负责人</th>
              <th>更新时间</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((doc) => (
              <tr key={doc.title}>
                <td>{doc.title}</td>
                <td>{doc.language}</td>
                <td>{doc.category}</td>
                <td><span className="status-pill">{doc.status}</span></td>
                <td>{doc.source}</td>
                <td>{doc.owner}</td>
                <td>{doc.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function TaskPanel() {
  return (
    <Panel title="任务日志">
      <div className="task-list">
        {taskLogs.map((task) => (
          <div className="task-row" key={task.name}>
            <span>{task.name}</span>
            <small>{task.type}</small>
            <strong>{task.status}</strong>
            <em>{task.duration}</em>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function FormRows({ rows }) {
  return (
    <div className="form-rows">
      {rows.map((row) => (
        <label key={row}>
          <span>{row}</span>
          <input placeholder="第一阶段 mock" />
        </label>
      ))}
    </div>
  );
}

export function App() {
  const activeRoute = useHashRoute();
  const pageMap = {
    dashboard: <DashboardPage />,
    documents: <DocumentsPage />,
    categories: <CategoriesPage />,
    imports: <ImportsPage />,
    reviews: <ReviewsPage />,
    agent: <AgentPage />,
    release: <ReleasePage />,
    tasks: <TasksPage />,
    settings: <SettingsPage />
  };

  useEffect(() => {
    fetch(`${apiBase}/health`).catch(() => undefined);
  }, []);

  return (
    <AppShell activeRoute={activeRoute}>
      {pageMap[activeRoute] || <DashboardPage />}
    </AppShell>
  );
}

