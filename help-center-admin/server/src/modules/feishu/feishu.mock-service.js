export class FeishuMockService {
  getLoginUrl() {
    return {
      mode: "mock",
      message: "Real Feishu OAuth is intentionally disabled in phase one."
    };
  }

  previewDocument() {
    return {
      title: "飞书文档导入转换样例",
      blocks: [],
      resources: []
    };
  }
}

