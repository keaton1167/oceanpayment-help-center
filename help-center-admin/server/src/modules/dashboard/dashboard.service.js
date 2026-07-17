export class DashboardService {
  constructor({ documentsService, tasksService }) {
    this.documentsService = documentsService;
    this.tasksService = tasksService;
  }

  getSummary() {
    const documents = this.documentsService.listDocuments().items;
    const tasks = this.tasksService.listTasks().items;

    return {
      metrics: {
        allDocuments: documents.length,
        drafts: documents.filter((item) => item.status === "draft").length,
        waitingReview: documents.filter((item) => item.status === "review").length,
        pendingPublish: documents.filter((item) => item.status === "pending_publish").length,
        resourceWarnings: 2,
        englishNeedsReview: 6
      },
      recentDocuments: documents,
      recentTasks: tasks
    };
  }
}

