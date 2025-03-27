# 🧠 MCP Master Protocol – LoadUp AI Development SOP

This file outlines how Cursor should use each MCP tool and command logically and synergistically. Treat every tool like a puzzle piece in a broader problem-solving framework.

---

## 🧭 CORE THINKING

### 🧩 Sequential Thinking (big think)
- Always run on:
  - Planning prompts
  - Debugging flows
  - Large integration tasks
- First step of every task that involves multiple dependencies or parallel systems
- Break down all prompts into discrete substeps and log these steps for the user

---

## 📚 KNOWLEDGE MEMORY

### 🔗 Knowledge Graph (knowledge-graph)
**USE CASE**: Persistent, centralized project memory

| Command | Best Practice |
|--------|----------------|
| `create_entities`, `add_observations` | On first-time ideas, plans, or bugs |
| `read_graph`, `open_nodes` | Search history for similar issues, reuse existing nodes |
| `delete_relations`, `update_relations` | Maintain clear linkage across related bugs, fixes, and milestones |

> Before answering **any prompt**, search the graph for related tags/nodes.  
> After answering, always update the graph unless told otherwise.

---

## 🌐 DEBUGGING + QA WORKFLOW

### 🧪 Browsing Tool (browser-tools)

**Primary Tools**:
- `getConsoleLogs`
- `getSelectedElement`
- `runAuditMode`
- `getNetworkLogs`

**WORKFLOW: "Diagnose frontend failure"**
1. **Trigger:** Component throws runtime error (e.g., infinite render)
2. Run: `getConsoleLogs` + `getSelectedElement`
3. Run: `runAuditMode` for full health report
4. Run: `getNetworkLogs` if data isn't appearing
5. Summarize: Output a linked bug node with cause, evidence, and fix steps

Use this tool proactively — don’t wait for user request if a frontend issue is suspected.

---

## 🧠 PLANNING & STRATEGY

### 🧮 Sequential Thinking + Knowledge Graph

**Planning Workflow**:
1. On any plan-related file edit (`PLANNING.md`, `implementation-plan-map-tracking.md`):
   - Trigger `sequentialthinking`
   - Check graph for active goals and blockers
   - Create/Update related nodes
2. All changes should be reflected as:
   - Graph node updates
   - File changelogs

---

## 💻 SYSTEM OPS

### 🖥️ Desktop Commander

**USE CASE: Command control, terminal orchestration**

| Task | Command | Smart Use |
|------|---------|-----------|
| Check for active terminal | `list_sessions` + `list_processes` | Before running `npm run dev`, verify session doesn’t already exist |
| Trigger build | `execute_command` | If terminal isn’t running, launch dev server |
| Read logs | `read_output` | Streamline `npm` or node app output in context-aware way |
| Kill runaway | `kill_process` | Shut down duplicates or ghost terminals |
| Organize | `move_file`, `list_directory` | Clean workspace or confirm CLI structure if confused |

> 📌 TIP: Before recommending dev commands, check current terminal status with `list_sessions` or `list_processes`.

---

## 🔄 ENV-AWARE BEHAVIOR

### `mcp.json` (Flag-Driven Execution)
**Recognized Flags:**
- `USE_MOCK_ONLY_MODE`: disables Firebase, enables mock simulation fallback
- `ENABLE_GRAPH_SUMMARY`: summaries from graph nodes post-task
- `DEBUG_VERBOSE`: instructs Cursor to use all browser tools during any bug-related prompt

> Respect these flags at runtime. If they are true, modify behavior accordingly. Treat them as logic gates.

---

## 💡 SMART USE CASES

### 🔧 Error Solving Protocol

1. Use `sequentialthinking` to isolate stack context
2. Use `browser-tools`:
   - Console logs
   - Selected DOM node
   - Network logs
3. Use `desktop-commander` if CLI tasks are involved (build, server, crashing dev env)
4. Log outcome in graph with:
   - Title: Bug Summary
   - Tags: `bug`, `tracking`, `firebase`, etc.

---

### 🧱 Feature Build Protocol

1. Search graph for existing nodes/components
2. Plan with `sequentialthinking`
3. Code
4. Test via browser MCP or logs
5. Update:
   - Codebase
   - Graph node
   - Planning doc

---

### 📂 File Change Tracking

On changes to:
- `PLANNING.md`
- `implementation-plan-map-tracking.md`
- `simulation_implementation_plan.md`

➡️ Log change in graph  
➡️ Mention milestone completion if applicable

---

### 🛡️ Command Fail-Safe Protocol

If any command fails or tool is unresponsive (due to 46/40 overload):
- Notify the user immediately
- Recommend disabling unused MCP tools (e.g., MagicUI, Supabase)
- Do not retry silently

---

## ✅ ALWAYS REMEMBER

1. If it’s a problem → **diagnose with browser + graph**
2. If it’s a plan → **sequential think + graph**
3. If it’s a component → **check graph before building**
4. If it’s broken → **log it in the graph, trace the chain**
5. If unsure → **ask user if fallback logic (mock?) is allowed**

