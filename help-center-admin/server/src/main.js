import { createServer } from "node:http";
import { URL } from "node:url";
import { createAppContext } from "./modules/app.context.js";
import { registerRoutes } from "./routes.js";

const port = Number(process.env.HELP_CENTER_ADMIN_PORT || 4310);
const host = process.env.HELP_CENTER_ADMIN_HOST || "127.0.0.1";
const context = createAppContext();
const routes = registerRoutes(context);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type"
  });
  response.end(JSON.stringify(payload, null, 2));
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  const url = new URL(request.url || "/", `http://${host}:${port}`);
  const routeKey = `${request.method || "GET"} ${url.pathname}`;
  const handler = routes.get(routeKey);

  if (!handler) {
    sendJson(response, 404, {
      error: "Not Found",
      message: "This phase-one server only exposes mock admin APIs."
    });
    return;
  }

  try {
    const payload = await handler({ request, url });
    sendJson(response, 200, payload);
  } catch (error) {
    sendJson(response, 500, {
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

server.listen(port, host, () => {
  console.log(`help-center-admin mock API listening at http://${host}:${port}`);
});

