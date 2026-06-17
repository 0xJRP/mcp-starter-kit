/**
 * Shared business logic for the MCP Starter Kit.
 *
 * Both the real MCP server (server.js) AND the browser playground
 * (playground.js) use these exact functions — so what you see in the
 * playground is exactly what your AI gets. One source of truth.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "business.json");

export function loadBusiness() {
  return JSON.parse(readFileSync(DATA_PATH, "utf8"));
}

export function saveBusiness(data) {
  // Validate the essentials before writing, so a bad save can't break things.
  if (!data || typeof data !== "object") throw new Error("Invalid data.");
  if (!data.name) throw new Error("Your business needs a name.");
  if (!Array.isArray(data.services)) throw new Error("Services must be a list.");
  if (!Array.isArray(data.faqs)) throw new Error("FAQs must be a list.");
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
  return loadBusiness();
}

// --- The four tools, as plain functions returning a text answer. ---

export function getBusinessInfo() {
  const b = loadBusiness();
  return JSON.stringify(
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
  );
}

export function priceQuote({ service, quantity = 1 }) {
  const b = loadBusiness();
  const match = b.services.find(
    (s) => s.name.toLowerCase() === String(service || "").toLowerCase()
  );
  if (!match) {
    const available = b.services.map((s) => s.name).join(", ");
    return `No service named "${service}". Available: ${available}.`;
  }
  const qty = Number(quantity) || 1;
  const total = match.price * qty;
  return `${qty} x ${match.name} @ $${match.price.toFixed(2)}/${match.unit} = $${total.toFixed(
    2
  )}`;
}

export function lookupFaq({ question }) {
  const b = loadBusiness();
  const q = String(question || "").toLowerCase();
  const scored = b.faqs
    .map((f) => {
      const words = f.q.toLowerCase().split(/\W+/).filter(Boolean);
      const hits = words.filter((w) => q.includes(w)).length;
      return { f, hits };
    })
    .sort((a, b) => b.hits - a.hits);
  const best = scored[0];
  if (!best || best.hits === 0) {
    return "No matching FAQ found. Suggest the customer call or email the business.";
  }
  return `Q: ${best.f.q}\nA: ${best.f.a}`;
}

export function checkAvailability() {
  const b = loadBusiness();
  const slots = b.appointment_slots || [];
  return slots.length
    ? "Open slots:\n- " + slots.join("\n- ")
    : "No open slots right now.";
}
