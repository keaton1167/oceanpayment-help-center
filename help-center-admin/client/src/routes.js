import {
  Bot,
  ClipboardCheck,
  FileText,
  FolderTree,
  LayoutDashboard,
  Rocket,
  Settings,
  UploadCloud,
  ListChecks
} from "lucide-react";

export const routes = [
  { path: "dashboard", label: "运营工作台", icon: LayoutDashboard },
  { path: "documents", label: "内容管理", icon: FileText },
  { path: "categories", label: "目录设置", icon: FolderTree },
  { path: "imports", label: "飞书导入", icon: UploadCloud },
  { path: "reviews", label: "审核中心", icon: ClipboardCheck },
  { path: "agent", label: "Agent 助手", icon: Bot },
  { path: "release", label: "发布中心", icon: Rocket },
  { path: "tasks", label: "任务日志", icon: ListChecks },
  { path: "settings", label: "系统配置", icon: Settings }
];

export function getCurrentRoute() {
  return window.location.hash.replace("#/", "") || "dashboard";
}

