import {
  createBuildPackager,
  createMdxConverter,
  createProjectScanner,
  createResourceChecker
} from "../src/index.js";

const scanner = createProjectScanner();
const converter = createMdxConverter();
const checker = createResourceChecker();
const packager = createBuildPackager();

if (!scanner.describe().zhDocsDir) {
  throw new Error("Scanner descriptor is incomplete.");
}

if (!converter.convertFeishuDocumentToMdx({ title: "Smoke" }).body.includes("# Smoke")) {
  throw new Error("MDX converter smoke check failed.");
}

await checker.check();
await packager.checkBuildReadiness();

console.log("help-center-core smoke check passed.");

