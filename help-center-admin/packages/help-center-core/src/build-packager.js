export function createBuildPackager() {
  return {
    async checkBuildReadiness() {
      return {
        ready: false,
        reason: "Phase one does not execute Docusaurus build or produce real artifacts."
      };
    },
    async createArtifact() {
      throw new Error("Real build.zip generation is intentionally disabled in phase one.");
    }
  };
}

