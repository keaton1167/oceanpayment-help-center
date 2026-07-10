import { DashboardService } from "./dashboard/dashboard.service.js";
import { DocumentsService } from "./documents/documents.service.js";
import { CategoriesService } from "./categories/categories.service.js";
import { TasksService } from "./tasks/tasks.service.js";
import { SystemConfigService } from "./system-config/system-config.service.js";
import { FeishuMockService } from "./feishu/feishu.mock-service.js";
import { AgentMockService } from "./agent/agent.mock-service.js";

export function createAppContext() {
  const documentsService = new DocumentsService();
  const categoriesService = new CategoriesService();
  const tasksService = new TasksService();

  return {
    dashboardService: new DashboardService({ documentsService, tasksService }),
    documentsService,
    categoriesService,
    tasksService,
    systemConfigService: new SystemConfigService(),
    feishuService: new FeishuMockService(),
    agentService: new AgentMockService()
  };
}

