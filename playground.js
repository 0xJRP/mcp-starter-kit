#!/usr/bin/env node
/**
 * Rabbithole — MCP Starter Kit: Browser Playground
 * ------------------------------------------------------------
 * A friendly local web page to:
 *   1. Edit your business info in a form (no JSON, no code)
 *   2. Try the AI tools live and see the real answers
 *
 * It runs entirely on your computer. Run `npm run play`, then open
 * the link it prints. This uses the SAME logic as the real MCP server,
 * so what you see here is exactly what your AI will get.
 * ------------------------------------------------------------
 */

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  loadBusiness,
  saveBusiness,
  getBusinessInfo,
  priceQuote,
  lookupFaq,
  checkAvailability,
} from "./tools.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4321;

function send(res, status, body, type = "application/json") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1e6) reject(new Error("Body too large"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const TOOLS = {
  get_business_info: () => getBusinessInfo(),
  price_quote: (a) => priceQuote(a),
  lookup_faq: (a) => lookupFaq(a),
  check_availability: () => checkAvailability(),
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === "GET" && url.pathname === "/") {
      const html = readFileSync(join(__dirname, "public", "index.html"));
      return send(res, 200, html, "text/html; charset=utf-8");
    }

    if (req.method === "GET" && url.pathname === "/api/business") {
      return send(res, 200, JSON.stringify(loadBusiness()));
    }

    if (req.method === "POST" && url.pathname === "/api/business") {
      const body = JSON.parse(await readBody(req));
      const saved = saveBusiness(body);
      return send(res, 200, JSON.stringify({ ok: true, business: saved }));
    }

    if (req.method === "POST" && url.pathname.startsWith("/api/tool/")) {
      const name = url.pathname.replace("/api/tool/", "");
      const tool = TOOLS[name];
      if (!tool) return send(res, 404, JSON.stringify({ error: "Unknown tool" }));
      const args = req.headers["content-length"]
        ? JSON.parse(await readBody(req))
        : {};
      const result = tool(args);
      return send(res, 200, JSON.stringify({ ok: true, result }));
    }

    return send(res, 404, JSON.stringify({ error: "Not found" }));
  } catch (err) {
    return send(res, 400, JSON.stringify({ ok: false, error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log("\n🐇  Rabbithole — MCP Starter Kit playground is running!");
  console.log(`\n    Open this in your browser:  http://localhost:${PORT}\n`);
  console.log("    Edit your business info, try the tools, then connect");
  console.log("    it to your AI app. Press Ctrl+C here to stop.\n");
});
