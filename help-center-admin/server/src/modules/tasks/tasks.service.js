export class TasksService {
  listTasks() {
    return {
      items: [
        {
          id: "task_scan_mock",
          name: "项目初始化扫描",
          type: "scan",
          status: "success",
          durationMs: 12000
        },
        {
          id: "task_import_mock",
          name: "飞书单篇导入 mock",
          type: "import",
          status: "mock",
          durationMs: 3000
        },
        {
          id: "task_build_placeholder",
          name: "build.zip 生成占位",
          type: "build",
          status: "pending",
          durationMs: null
        }
      ]
    };
  }
}

