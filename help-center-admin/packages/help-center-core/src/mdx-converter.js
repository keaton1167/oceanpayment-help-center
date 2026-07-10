export function createMdxConverter() {
  return {
    convertFeishuDocumentToMdx(input = {}) {
      const title = input.title || "Untitled";

      return {
        frontMatter: {
          title,
          sidebar_label: title
        },
        body: `# ${title}\n\n${input.markdown || "Phase-one mock content."}\n`,
        resources: [],
        warnings: ["Real Feishu block conversion is not enabled yet."]
      };
    }
  };
}

