export function createProjectScanner(options = {}) {
  const root = options.root || "../";

  return {
    describe() {
      return {
        root,
        zhDocsDir: options.zhDocsDir || "docs",
        enDocsDir: options.enDocsDir || "i18n/en/docusaurus-plugin-content-docs/current",
        imageDir: options.imageDir || "static/img/help-center",
        attachmentDir: options.attachmentDir || "static/files/help-center",
        mode: "placeholder"
      };
    },
    async scan() {
      return {
        documents: [],
        categories: [],
        resources: [],
        warnings: ["Project scanner is a phase-one placeholder."]
      };
    }
  };
}

