# 🐇 The Plain-English MCP Starter Kit

### Everyone's talking about "MCP." Here's one you can actually *use* — in 5 minutes, with your own business.

You've probably heard that AI can now "connect to your tools." That connection
has a name: **MCP** (Model Context Protocol). It's how an AI assistant stops
*guessing* and starts answering with **your real business data** — your hours,
your prices, your FAQs.

This kit is a tiny, working MCP server. You edit one file with your info, run
one command, and connect it to your AI. Then you can ask your AI things like:

> *"How much for 3 lattes and a pastry platter?"*
> *"What are your Saturday hours?"*
> *"What times are open this week?"*

…and it answers correctly, every time — because it's reading **your** data, not
making it up.

> 💬 **Want the link to this kit?** Comment **"MCP"** on the post and we'll send it over.

---

## What's an MCP, in one sentence?

An MCP server is a **safe translator** between your AI and your stuff. The AI
can only do the specific actions you allow — nothing else on your computer.

See the picture: [docs/diagram.md](docs/diagram.md)

This kit allows exactly **four** safe, read-only actions:

| Action | What it does |
|--------|--------------|
| `get_business_info` | Shares your hours, contact, and address |
| `price_quote` | Calculates a price from your service list |
| `lookup_faq` | Answers common customer questions |
| `check_availability` | Lists your open booking slots |

---

## Set it up in 5 minutes

**You need:** [Node.js](https://nodejs.org) (the free "LTS" download) and a
free AI app that supports MCP, like [Claude Desktop](https://claude.ai/download).
You do **not** need to know how to code.

### 1. Download this kit
Click the green **Code** button above → **Download ZIP** → unzip it.

### 2. Add your business info
Open **`business.json`** in any text editor and replace the example
(Maple Street Coffee) with your own name, hours, services, prices, and FAQs.
Save it.

### 3. Install + test it
Open Terminal, go into the folder, and run:

```bash
npm install
npm run check
```

You should see ✅ **Your kit looks good!**

### 4. Connect it to your AI
In **Claude Desktop**: Settings → Developer → Edit Config, and add this
(change the path to where you unzipped the folder):

```json
{
  "mcpServers": {
    "my-business": {
      "command": "node",
      "args": ["/full/path/to/mcp-starter-kit/server.js"]
    }
  }
}
```

Restart Claude Desktop. You'll see your business tools appear. Now ask it a
question about your business — and watch it use the real answer. 🎉

---

## The 5 questions to ask before you connect AI to anything

Before you wire AI into your real tools (email, CRM, calendar, payments), ask:

1. **What can it actually *do*?** — Read-only, or can it change/delete things?
   (This kit is read-only on purpose.)
2. **What data does it touch?** — And is any of it sensitive?
3. **Where does that data go?** — Stays on your machine, or sent to a company?
4. **Who can use it?** — Just you, or your whole team / your customers?
5. **What happens if it's wrong?** — What's the worst-case, and can you undo it?

If you can't answer these for a tool someone's trying to sell you — slow down.

---

## Make it yours

Everything lives in **`business.json`** — no coding needed to update your info.
Want it to do more (real bookings, live inventory, connect to your CRM or
email)? That's exactly the kind of thing we build.

---

## 🐇 Built by Rabbit Hole

We help small and medium businesses put AI to work — safely, and in plain
English. This is **Day 1** of our 30-day series of free, working AI kits.

**Want this set up for your business, with your real tools connected?**
👉 [Reach out to Rabbit Hole](#) *(add your link)*

*Free to use under the MIT License. Built to be opened, edited, and run by real business owners.*
