export function createResourceChecker() {
  return {
    async check() {
      return {
        status: "mock",
        missing: [],
        warnings: ["Resource checking will scan /img/help-center and /files/help-center later."]
      };
    }
  };
}

