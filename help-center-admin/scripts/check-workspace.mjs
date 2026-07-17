import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const requiredPaths = [
  "client/package.json",
  "client/index.html",
  "client/src/App.jsx",
  "client/src/routes.js",
  "server/package.json",
  "server/src/main.js",
  "server/src/modules/documents/documents.service.js",
  "packages/help-center-core/package.json",
  "packages/help-center-core/src/index.js"
];

for (const relativePath of requiredPaths) {
  await access(path.join(root, relativePath));
}

const serverPackage = JSON.parse(
  await readFile(path.join(root, "server/package.json"), "utf8")
);
const clientPackage = JSON.parse(
  await readFile(path.join(root, "client/package.json"), "utf8")
);

if (!clientPackage.dependencies?.react || !clientPackage.devDependencies?.vite) {
  throw new Error("Client package must define React and Vite dependencies.");
}

if (serverPackage.dependencies && Object.keys(serverPackage.dependencies).length > 0) {
  throw new Error("Server skeleton should stay dependency-light during phase one.");
}

console.log("help-center-admin skeleton check passed.");

