export class SystemConfigService {
  getPublicConfig() {
    return {
      siteDomain: "https://support.oceanpayment.com",
      docusaurusRoot: "../",
      zhDocsDir: "../docs",
      enDocsDir: "../i18n/en/docusaurus-plugin-content-docs/current",
      imageDir: "../static/img/help-center",
      attachmentDir: "../static/files/help-center",
      buildOutputDir: "../build",
      sensitiveConfigStatus: {
        feishuAppId: "missing",
        feishuAppSecret: "missing",
        feishuRedirectUri: "missing",
        notifyChatId: "missing",
        modelApiKey: "missing"
      }
    };
  }
}

