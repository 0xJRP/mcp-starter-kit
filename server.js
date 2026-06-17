#!/usr/bin/env node
/**
 * Rabbit Hole — MCP Starter Kit
 * ------------------------------------------------------------
 * A tiny, real MCP server that gives an AI assistant (like Claude
 * Desktop) safe, read-only access to YOUR business data.
 *
 * You don't have to understand the code. You just edit business.json,
 * run `npm start`, and connect it to your AI. The AI can then answer
 * customer questions, quote jobs, and check availability using your
 * real info — not made-up answers.
 *
 * Everything runs on your own computer. Nothing is sent anywhere
 * except to the AI app you connect it to.
 * ------------------------------------------------------------
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the business data. THIS is the file you edit with your own info.
function loadBusiness() {
  const raw = readFileSync(join(__dirname, "business.json"), "utf8");
  return JSON.parse(raw);
}

// --- "--check" mode: a friendly self-test so a non-technical owner
//     can confirm the kit works before wiring it into their AI. ---
if (process.argv.includes("--check")) {
  try {
    const b = loadBusiness();
    console.log("✅ Your kit looks good!");
    console.log(`   Business: ${b.name}`);
    console.log(`   Services loaded: ${b.services.length}`);
    console.log(`   FAQs loaded: ${b.faqs.length}`);
    console.log("\nNext step: connect it to your AI app (see the README).");
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

// 1) Business info — hours, contact, address.
server.registerTool(
  "get_business_info",
  {
    title: "Get business info",
    description:
      "Returns the business name, contact details, address, and opening hours. Use this to answer questions about the business itself.",
    inputSchema: {},
  },
  async () => {
    const b = loadBusiness();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              name: b.name,
              tagline: b.tagline,
              phone: b.phone,
              email: b.email,
              address: b.address,
              hours: b.hours,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// 2) Price quote — calculate a total from the service list.
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
  async ({ service, quantity = 1 }) => {
    const b = loadBusiness();
    const match = b.services.find(
      (s) => s.name.toLowerCase() === service.toLowerCase()
    );
    if (!match) {
      const available = b.services.map((s) => s.name).join(", ");
      return {
        content: [
          {
            type: "text",
            text: `No service named "${service}". Available: ${available}.`,
          },
        ],
      };
    }
    const total = match.price * quantity;
    return {
      content: [
        {
          type: "text",
          text: `${quantity} x ${match.name} @ $${match.price.toFixed(
            2
          )}/${match.unit} = $${total.toFixed(2)}`,
        },
      ],
    };
  }
);

// 3) FAQ lookup — answer common customer questions.
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
  async ({ question }) => {
    const b = loadBusiness();
    const q = question.toLowerCase();
    // Simple keyword scoring — good enough for a starter kit.
    const scored = b.faqs
      .map((f) => {
        const words = f.q.toLowerCase().split(/\W+/).filter(Boolean);
        const hits = words.filter((w) => q.includes(w)).length;
        return { f, hits };
      })
      .sort((a, b) => b.hits - a.hits);
    const best = scored[0];
    if (!best || best.hits === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No matching FAQ found. Suggest the customer call or email the business.",
          },
        ],
      };
    }
    return {
      content: [{ type: "text", text: `Q: ${best.f.q}\nA: ${best.f.a}` }],
    };
  }
);

// 4) Availability — list open appointment/booking slots.
server.registerTool(
  "check_availability",
  {
    title: "Check availability",
    description:
      "Returns the currently open appointment or booking slots. Use this when a customer wants to book or asks what times are available.",
    inputSchema: {},
  },
  async () => {
    const b = loadBusiness();
    const slots = b.appointment_slots || [];
    return {
      content: [
        {
          type: "text",
          text: slots.length
            ? "Open slots:\n- " + slots.join("\n- ")
            : "No open slots right now.",
        },
      ],
    };
  }
);

// Start listening over stdio — the standard way AI apps talk to MCP servers.
const transport = new StdioServerTransport();
await server.connect(transport);
