# How an MCP connection works (plain English)

An **MCP server** is a little translator that sits between your AI and your
stuff (your data, your tools). The AI doesn't get direct access — it can only
use the specific, safe actions you allow.

```
   ┌─────────────┐        asks a question         ┌──────────────────┐
   │             │  ───────────────────────────▶  │                  │
   │   You /     │                                 │   Your AI app    │
   │  customer   │                                 │ (e.g. Claude     │
   │             │  ◀───────────────────────────   │  Desktop)        │
   └─────────────┘        plain answer             └────────┬─────────┘
                                                            │
                                       "I need real info."  │  MCP
                                                            ▼
                                                   ┌──────────────────┐
                                                   │   MCP SERVER     │
                                                   │ (this kit)       │
                                                   │                  │
                                                   │ Allowed actions: │
                                                   │ • business info  │
                                                   │ • price a quote  │
                                                   │ • look up FAQ    │
                                                   │ • availability   │
                                                   └────────┬─────────┘
                                                            │ reads
                                                            ▼
                                                   ┌──────────────────┐
                                                   │  business.json   │
                                                   │ (YOUR real data) │
                                                   └──────────────────┘
```

**The point:** the AI stops guessing. Instead of inventing your hours or your
prices, it calls one of the allowed actions and answers with *your real data*.
And it can only do the four things you allowed — nothing else on your computer.
