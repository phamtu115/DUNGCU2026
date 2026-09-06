#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../../public");
const port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

try {
  await stat(root);
} catch {
  console.error("Chưa có public/. Hãy chạy npm run build trước.");
  process.exit(1);
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", "http://localhost");
    const decoded = decodeURIComponent(requestUrl.pathname);
    const candidate = path.resolve(root, "." + decoded);
    if (candidate !== root && !candidate.startsWith(root + path.sep)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    let file = candidate;
    try {
      const info = await stat(file);
      if (info.isDirectory()) file = path.join(file, "index.html");
    } catch {
      file = path.join(root, "index.html");
    }

    const data = await readFile(file);
    response.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(data);
  } catch (error) {
    response.writeHead(500);
    response.end("Local server error");
    console.error(error);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Local demo: http://localhost:${port}`);
  console.log("Dữ liệu demo dùng localStorage; không phải production.");
});
