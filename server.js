#!/usr/bin/env node
/**
 * Rabbithole — MCP Starter Kit
 * ------------------------------------------------------------
 * A tiny, real MCP server that gives an AI assistant (like Claude
 * Desktop) safe, read-only access to YOUR business data.
 *
 * You don't have to understand the code. You just edit business.json
 * (or use the browser playground — run `npm run play`), then connect
 * this to your AI. The AI can then answer customer questions, quote
 * jobs, and check availability using your real info — not made-up answers.
 *
 * Everything runs on your own computer. Nothing is sent anywhere
 * except to the AI app you connect it to.
 * ------------------------------------------------------------
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  loadBusiness,
  getBusinessInfo,
  priceQuote,
  lookupFaq,
  checkAvailability,
} from "./tools.js";

const text = (t) => ({ content: [{ type: "text", text: t }] });

// --- "--check" mode: a friendly self-test so a non-technical owner
//     can confirm the kit works before wiring it into their AI. ---
if (process.argv.includes("--check")) {
  try {
    const b = loadBusiness();
    console.log("✅ Your kit looks good!");
    console.log(`   Business: ${b.name}`);
    console.log(`   Services loaded: ${b.services.length}`);
    console.log(`   FAQs loaded: ${b.faqs.length}`);
    console.log("\nTip: run `npm run play` to try it in your browser first,");
    console.log("then connect it to your AI app (see the README).");
    process.exit(0);
  } catch (err) {
    console.error("❌ Something's off with business.json:");
    console.error("   " + err.message);
    process.exit(1);
  }
}

const server = new McpServer({
  name: "rabbit-hole-business-kit",
  version: "1.0.0",
});

server.registerTool(
  "get_business_info",
  {
    title: "Get business info",
    description:
      "Returns the business name, contact details, address, and opening hours. Use this to answer questions about the business itself.",
    inputSchema: {},
  },
  async () => text(getBusinessInfo())
);

server.registerTool(
  "price_quote",
  {
    title: "Price a quote",
    description:
      "Given a service name and quantity, returns the price and a calculated total. Use this when a customer asks how much something costs.",
    inputSchema: {
      service: z.string().describe("The name of the service or product."),
      quantity: z.number().min(1).default(1).describe("How many."),
    },
  },
  async (args) => text(priceQuote(args))
);

server.registerTool(
  "lookup_faq",
  {
    title: "Look up an FAQ",
    description:
      "Searches the business's frequently asked questions for the best match. Use this for common customer questions (wifi, parking, catering, etc.).",
    inputSchema: {
      question: z.string().describe("The customer's question."),
    },
  },
  async (args) => text(lookupFaq(args))
);

server.registerTool(
  "check_availability",
  {
    title: "Check availability",
    description:
      "Returns the currently open appointment or booking slots. Use this when a customer wants to book or asks what times are available.",
    inputSchema: {},
  },
  async () => text(checkAvailability())
);

const transport = new StdioServerTransport();
await server.connect(transport);
