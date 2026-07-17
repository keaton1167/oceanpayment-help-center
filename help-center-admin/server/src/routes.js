export function registerRoutes(context) {
  const routes = new Map();

  routes.set("GET /health", () => ({
    ok: true,
    service: "help-center-admin-server",
    mode: "mock"
  }));

  routes.set("GET /api/dashboard", () => context.dashboardService.getSummary());
  routes.set("GET /api/documents", () => context.documentsService.listDocuments());
  routes.set("GET /api/categories", () => context.categoriesService.listCategories());
  routes.set("GET /api/tasks", () => context.tasksService.listTasks());
  routes.set("GET /api/system/config", () => context.systemConfigService.getPublicConfig());

  return routes;
}

