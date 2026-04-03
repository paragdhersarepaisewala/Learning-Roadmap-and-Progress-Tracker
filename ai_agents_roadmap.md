# 🤖 Zero → Job-Ready: AI Agent Developer in 3 Months
### 100% Free — No Paid API Keys Required
**Start Date:** April 1, 2026 · **End Date:** June 30, 2026  
**Daily Commitment:** ~2.5–3 hours/day · **Total:** ~80 hours/month

---

## 💸 Free LLM Setup — Your Three Tools

This replaces the paid OpenAI/Anthropic stack entirely. You will use all three — they each teach you something different.

| Tool | What it is | Free Limit | Best for |
|---|---|---|---|
| **Google Gemini API** (AI Studio) | Cloud LLM, Google's best models | 1,500 req/day · 1M tokens/min (Flash) | Primary LLM for all agent work |
| **Ollama** | Runs LLMs locally on your PC | Unlimited — runs offline | Learning without any quota. Tool calling, RAG testing |
| **Groq** | Free cloud inference, very fast | ~14,400 req/day (free tier) | Fast experiments, Llama 3 models |

### Getting Your Free API Keys (Do This First)

```
1. Gemini (AI Studio)  → https://aistudio.google.com/  → "Get API key" → free, no card needed
2. Groq               → https://console.groq.com/     → sign up → free tier auto-applied
3. Ollama             → https://ollama.com/download   → install locally → runs on your machine
```

### Which Models to Use

| Provider | Model | Why |
|---|---|---|
| Gemini | `gemini-2.0-flash` | Fast, free, 1M context, excellent tool use |
| Gemini | `gemini-1.5-pro` | For complex reasoning (50 req/day free) |
| Ollama | `llama3.1:8b` | Best local model for agents + tool calling |
| Ollama | `phi3:mini` | Lightning fast, runs well on low-end hardware |
| Ollama | `gemma2:2b` | Smallest useful model, instant, made by Google |
| Groq | `llama-3.3-70b-versatile` | 70B quality at free speed |
| Groq | `gemma2-9b-it` | Fast + free Google model on cloud |

> [!TIP]
> **Hardware note for Ollama:** `gemma2:2b` and `phi3:mini` run well even without a GPU (4GB RAM minimum). `llama3.1:8b` needs 8GB RAM. If your PC is low-end, use Gemini + Groq cloud for free and skip local models.

---

> [!IMPORTANT]
> **The single rule that makes this work:** Never study a library in full. Learn only the 3–5 functions you need *right now*. Let the project tell you what to learn next. Real engineers do not read docs cover to cover — they read the 10-line quickstart, build something, and look things up as problems arise.

> [!NOTE]
> **Philosophy:** No data science. No ML theory. No statistics. No NumPy. No Pandas (unless the agent writes it, not you). This is a pure *"build AI agents as a software engineer"* track. Every week ends with something that runs.

---

## 📦 The Complete Inventory — Everything You Will Learn

| Category | Items |
|---|---|
| **Python Concepts (11)** | Variables & types, functions, lists & dicts, loops, conditionals, f-strings, error handling (try/except), classes (basic), decorators (basic), async/await, list comprehensions |
| **Standard Library (4)** | `os.getenv()`, `json`, `re` (basic), `sqlite3` (only if a project needs it) |
| **Third-Party Libraries (14)** | `requests`, `python-dotenv`, `httpx`, `google-generativeai`, `ollama`, `groq`, `langchain`, `langgraph`, `langchain-google-genai`, `langchain-ollama`, `google-adk`, `chromadb`, `fastapi`, `uvicorn`, `pydantic` (Month 3 only) |
| **Deployment & Tooling (6)** | Git + GitHub, VS Code, Docker (basics), GCP Cloud Run, `.env` secrets management, GitHub Actions (basic CI) |

> [!TIP]
> **OpenAI/Anthropic?** You'll understand their APIs from reading docs — the concepts are identical. You're not learning to use one company's API; you're learning agent architecture. LangChain and LangGraph are model-agnostic. Switching from Gemini to OpenAI in a LangGraph agent is one line of code.

---

## 🗓️ MONTH 1 — Python × Free LLM APIs × First Working Bot
**Goal:** Go from zero Python to calling Gemini and local Ollama models, building a CLI chatbot. You do not need to *master* Python — you need to be *functional* enough to use it. You should be calling APIs by end of Week 3.

> [!NOTE]
> **Time math:** 4 weeks × ~3 hrs/day × 7 days = ~84 hours. Ratio must be 70% building, 30% reading. Every day block has a coding task — not just watching.

---

### WEEK 1 — Python Just Enough
**Goal:** Read, write, and run Python programs. Understand the exact subset you need. Nothing else.

| Day | Topic | Exact Scope | Resource |
|---|---|---|---|
| 1 | Setup | Install Python 3.11+, VS Code + Pylance extension, terminal basics. Also install Ollama and pull `gemma2:2b` | [VS Code Python Setup](https://code.visualstudio.com/docs/python/python-tutorial) |
| 2 | Variables, types, print | `str`, `int`, `float`, `bool`, f-strings, `type()`. Write a program that describes yourself | Python docs: Built-in Types |
| 3 | Functions | `def`, parameters, `return`, calling functions, default arguments. Write 5 utility functions | Python docs: Defining Functions |
| 4 | Lists & Dicts | `list`, `dict`, indexing, `.append()`, `.get()`, looping with `for`. Build a contact book | — |
| 5 | Conditionals & Logic | `if/elif/else`, `and/or/not`, `==` vs `is`. Add search & filter to contact book | — |
| 6 | Error Handling | `try/except/finally`, `raise`, print error messages cleanly. Make contact book crash-proof | — |
| 7 | **Build Day** | **Mini project:** CLI To-Do App — add, list, complete, delete tasks. All in one `.py` file | — |

**Libraries this week:** None. Vanilla Python only.

**What NOT to learn this week:** Classes, decorators, async, file I/O, OS module, threading, generators, `__init__.py`, packages. Those come when a project needs them.

---

### WEEK 2 — Python for Real-World API Work
**Goal:** Make HTTP calls, handle secrets, parse JSON, read/write files. The exact Python skills you use daily when building agents.

| Day | Topic | Exact Scope | Resource |
|---|---|---|---|
| 1 | Files & JSON | `open()`, `read()`, `write()`, `json.loads()`, `json.dumps()`. **NOT** `os.walk`, `os.path.join`. Just these 5 things | Python docs: Reading and Writing Files |
| 2 | Environment variables | `pip install python-dotenv`, create `.env` file, `os.getenv("KEY")`. Put your Gemini API key in here. Never hardcode keys | python-dotenv docs (1-page quickstart) |
| 3 | HTTP with `requests` | `pip install requests`, `requests.get()`, `requests.post()`, `response.json()`, status codes. Call a free weather API (wttr.in — no key needed) | requests Quickstart — "Make a Request" section only |
| 4 | List comprehensions | `[x for x in list if condition]`. Rewrite your Week 1 loops using this. One concept, deep practice | — |
| 5 | Classes (just enough) | `class`, `__init__`, `self`, one or two methods. Build a `Chatbot` class that holds a conversation list | Python docs: Classes (first 2 sections only) |
| 6 | Virtual environments | `python -m venv .venv`, activate, `pip install`, `requirements.txt`, `pip freeze` | — |
| 7 | **Build Day** | **Mini project:** Weather CLI — takes a city name, calls wttr.in (free, no key), formats and prints a weather report. `.env` ready for when you do need keys | — |

**Libraries this week:** `requests`, `python-dotenv`
**Standard library this week:** `json`, `os.getenv()` (nothing else from `os`)

---

### WEEK 3 — Free LLM APIs (The Core Skill)
**Goal:** Call Gemini API, Ollama (local), and Groq. Understand tokens, roles, system prompts, temperature. Build your first real chatbot.

| Day | Topic | Exact Scope | Resource |
|---|---|---|---|
| 1 | Gemini API | `pip install google-generativeai`. `genai.configure(api_key=...)`, `GenerativeModel("gemini-2.0-flash")`, `.generate_content()`, extract `.text`. Print a haiku | [Gemini API Python Quickstart](https://ai.google.dev/gemini-api/docs/quickstart?lang=python) |
| 2 | Chat & system prompts | `model.start_chat()`, send messages, read history. System instructions via `system_instruction=` param. Experiment with temperature `generation_config={"temperature": 0}` | Gemini SDK docs — Chat section |
| 3 | Ollama (local LLM) | `pip install ollama`. `ollama.chat(model="gemma2:2b", messages=[...])`. Same role structure as cloud APIs. Run a full conversation with zero internet required | [Ollama Python Quickstart](https://github.com/ollama/ollama-python) |
| 4 | Groq (free fast cloud) | `pip install groq`. `client.chat.completions.create(model="llama-3.3-70b-versatile", ...)`. Notice it's OpenAI-compatible — same `.choices[0].message.content` pattern | [Groq Python Quickstart](https://console.groq.com/docs/quickstart) |
| 5 | Conversation history | How to maintain `messages = []` list, append user/assistant turns, send full history each call. Implement for all three providers | — |
| 6 | Structured output with Gemini | `response_mime_type="application/json"`, `response_schema=`. Make Gemini return clean JSON. This is how agents communicate structured data | [Gemini structured output docs](https://ai.google.dev/gemini-api/docs/structured-output) |
| 7 | **Build Day** | **Multi-provider chatbot:** `--provider gemini/ollama/groq` flag. Maintains conversation history. Saves chat to `conversation.json`. All free | — |

**Libraries this week:** `google-generativeai`, `ollama`, `groq`

> [!TIP]
> **Why learn all three?** Gemini = primary (cloud, free, best for ADK). Ollama = local dev (zero quota, no internet needed, great for confidential data). Groq = Llama 3 access for free. In interviews you can say "I've worked with both cloud and local LLM deployments" — which is true.

---

### WEEK 4 — Build Something Real (Month 1 Capstone)
**Goal:** Put everything together into a deployable CLI tool. Learn Git properly. Push to GitHub.

| Day | Topic | Exact Scope | Resource |
|---|---|---|---|
| 1 | Git basics | `git init`, `git add`, `git commit`, `git push`, `.gitignore` (always ignore `.env`!), GitHub repo creation | GitHub's own quickstart |
| 2 | CLI arguments | `argparse` — make your chatbot configurable from the terminal (`--provider`, `--persona`, `--save`) | Python docs: argparse (first 2 sections) |
| 3 | Structuring a project | Splitting into multiple `.py` files, `import`. Organize Week 3 chatbot into `chatbot/` folder | — |
| 4–6 | **Capstone: CLI AI Assistant with Persistent Memory** | Builds on Week 3. Adds: file-based memory (saves/loads JSON), system prompt configurable via `--persona`, conversation history persists between sessions. Default provider: Gemini (free). Fallback to Ollama if offline. Clean README | — |
| 7 | Polish + Push | Write a proper `README.md` with setup instructions. Push to GitHub | — |

**Month 1 Capstone Project:** `cli-ai-assistant`
A CLI chatbot maintaining history across sessions, supporting Gemini/Ollama/Groq providers. Demonstrates multi-provider architecture and offline capability.

---

## 🗓️ MONTH 2 — Tools · Memory · RAG · LangChain · LangGraph · Google ADK
**Goal:** Go from basic LLM calls to real agent architecture — tools, memory, multi-step reasoning, retrieval. Build a Research Agent that knows things.

> [!NOTE]
> **LangChain context:** You'll use roughly 20% of what LangChain offers. Focus specifically on **LangGraph** — it's the part that handles multi-step agent logic and is what serious agent systems use in 2025–2026. LangChain is model-agnostic: the same graph runs on Gemini, Ollama, or Groq.

---

### WEEK 5 — Tool Use & Function Calling
**Goal:** Give an LLM the ability to call your Python functions. Foundational skill of agent development. Use Gemini — it has excellent free tool calling support.

| Day | Topic | Exact Scope | Resource |
|---|---|---|---|
| 1 | What is a tool? | A Python function + a description. The LLM reads the description and decides when to call it. Read Gemini function calling docs (10-min read) | [Gemini Function Calling](https://ai.google.dev/gemini-api/docs/function-calling) |
| 2 | First tool: Web search | Build a `search_web(query)` function wrapping the free DuckDuckGo API (no key needed). Register as a Gemini tool | — |
| 3 | Tool call loop | Implement: LLM responds with tool call → you execute function → send result back → LLM gives final answer. Understand what happens under the hood | Gemini function calling examples |
| 4 | Multiple tools | Add `get_weather(city)` (wttr.in), `calculate(expression)` (eval). Agent picks the right one | — |
| 5 | Tool calling with Ollama | `llama3.1:8b` supports tool calling. Same concept, local, zero quota | [Ollama tool calling docs](https://ollama.com/blog/tool-support) |
| 6 | ReAct pattern | Reason → Act → Observe loop. Implement manually without a framework first so you understand what LangGraph does for you later | — |
| 7 | **Build Day** | **Mini agent:** Tool-calling agent (Gemini primary, Ollama fallback) that can search the web, get weather, do math. Raw API calls, no framework yet | — |

---

### WEEK 6 — LangChain & LangGraph
**Goal:** Understand why LangChain exists, learn LangGraph for stateful multi-step agents, build your first graph-based agent. Using Gemini + Ollama.

| Day | Topic | Exact Scope | Resource |
|---|---|---|---|
| 1 | LangChain overview | What problem it solves. Install: `pip install langchain langchain-google-genai langchain-ollama`. Read "Why LangChain?" page (skip tutorials) | [LangChain Conceptual Guide](https://python.langchain.com/docs/concepts/) |
| 2 | LangChain with Gemini | `from langchain_google_genai import ChatGoogleGenerativeAI`. `ChatGoogleGenerativeAI(model="gemini-2.0-flash")`. Rebuild Week 3 chatbot in 20 lines | LangChain Google GenAI docs |
| 3 | LangChain with Ollama | `from langchain_ollama import ChatOllama`. `ChatOllama(model="llama3.1:8b")`. Same interface, different model. One-line switch | LangChain Ollama docs |
| 4 | LangGraph intro | Why LangGraph: stateful graph-based agents. `pip install langgraph`. State, Nodes, Edges concepts | [LangGraph Quickstart](https://langchain-ai.github.io/langgraph/tutorials/introduction/) |
| 5 | First LangGraph agent | Build a simple graph: `agent_node` → `tool_node` → back to `agent_node`. Use `ChatGoogleGenerativeAI` as the LLM | LangGraph tutorial Day 1 |
| 6 | State management & conditional edges | `TypedDict` state, `add_messages`, `should_continue` pattern. Graph branches: tool call vs. final answer | LangGraph tutorials Day 2–3 |
| 7 | **Build Day** | **LangGraph agent** with 3+ tools, persistent conversation memory, conditional routing. Switch model between Gemini/Ollama to verify model-agnostic architecture | — |

**Libraries this week:** `langchain`, `langchain-google-genai`, `langchain-ollama`, `langgraph`

---

### WEEK 7 — Memory & RAG (ChromaDB + Vector Search)
**Goal:** Give agents access to knowledge bases. Build a RAG pipeline that makes an agent "know" a document set. Use Gemini embeddings (free).

| Day | Topic | Exact Scope | Resource |
|---|---|---|---|
| 1 | Why RAG? | LLMs have knowledge cutoffs and limited context. RAG = retrieve relevant chunks at runtime. Read the concept, 10 mins | — |
| 2 | Embeddings (conceptual) | Text → vector → similarity search. You don't need the math. Use Gemini's free embedding API: `genai.embed_content(model="models/text-embedding-004", ...)` | [Gemini Embeddings docs](https://ai.google.dev/gemini-api/docs/embeddings) |
| 3 | ChromaDB basics | `pip install chromadb`. Create collection, `add()`, `query()`. Add 10 paragraphs, query for the most relevant one. Runs locally, no server | [ChromaDB Quickstart](https://docs.trychroma.com/getting-started) |
| 4 | Document chunking | Split a long text/markdown file into chunks. Use `RecursiveCharacterTextSplitter` from langchain. Fixed-size with overlap | — |
| 5 | Full RAG pipeline | Load doc → chunk → embed (Gemini embeddings) → store in ChromaDB → query → inject into LLM prompt. Manual implementation | — |
| 6 | RAG as a LangGraph tool node | Make retrieval a tool node in your agent graph. Agent decides when to retrieve vs. answer from memory | — |
| 7 | **Build Day** | **RAG agent:** Takes a folder of markdown/text files, builds a vector store, answers questions from it. Default embedding: Gemini `text-embedding-004` (free) | — |

**Libraries this week:** `chromadb`, `langchain` text splitters
**Gemini feature used:** `text-embedding-004` — free, no quota issues

---

### WEEK 8 — Google ADK
**Goal:** Learn Google's Agent Development Kit. Understand how it differs from LangGraph. Build a multi-agent system using ADK + Gemini. This is where Gemini shines — ADK is built specifically for Gemini.

| Day | Topic | Exact Scope | Resource |
|---|---|---|---|
| 1 | ADK overview | What ADK is, how it relates to Gemini, why it exists alongside LangGraph. Install: `pip install google-adk` | [Google ADK Docs](https://google.github.io/adk-docs/) |
| 2 | ADK Agent basics | `Agent` class, `Runner`, session management. Build a single agent with one custom tool | ADK Quickstart |
| 3 | ADK built-in tools | `google_search` (free), `code_execution` (free sandbox). Add both to an agent. These are free because they're Google-provided | ADK Built-in Tools guide |
| 4 | Multi-agent in ADK | Sub-agents, `AgentTool`, orchestrator pattern. One coordinator agent delegates to specialist agents | ADK Multi-agent guide |
| 5 | ADK + Gemini models | `gemini-2.0-flash` (free tier), `gemini-1.5-pro` (50 req/day free). Assign different models to different agents based on task complexity | — |
| 6 | LangGraph vs ADK | Side-by-side: when to use which. LangGraph = fine-grained control + any LLM. ADK = fastest path + Gemini + Google tools. Both are valid. Knowing both = stack-agnostic | — |
| 7 | **Build Day** | **Month 2 Capstone: Research Agent with RAG** — Multi-agent: `Researcher` (web search + RAG), `Synthesizer` (writes answer), `Critic` (checks quality). Built with LangGraph using Gemini. Output saved as markdown report | — |

**Libraries this week:** `google-adk`
**Free tools used:** ADK built-in `google_search`, `code_execution`

**Month 2 Capstone:** `research-agent`
A multi-agent system that takes a research question, searches the web (free), queries a local ChromaDB knowledge base, synthesizes an answer, and saves a markdown report. Uses Gemini 2.0 Flash throughout — zero API cost.

---

## 🗓️ MONTH 3 — APIs · Multi-Agent Systems · Deploy · Portfolio
**Goal:** Wrap your agents in real APIs, deploy them to GCP Cloud Run (free tier), build 3 portfolio projects with live demos and clean READMEs.

> [!TIP]
> **GCP Free Tier:** Cloud Run gives 2 million requests/month free. Your portfolio projects will run live for free indefinitely on this tier.

---

### WEEK 9 — APIs & Web Layer (FastAPI)
**Goal:** Wrap your agent in a REST API so real applications can call it.

| Day | Topic | Exact Scope | Resource |
|---|---|---|---|
| 1 | FastAPI intro | `pip install fastapi uvicorn`. `@app.get()`, `@app.post()`, run with `uvicorn main:app --reload`. "Hello World" API | [FastAPI Tutorial — First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/) |
| 2 | Pydantic models | `BaseModel` for request/response shapes. Define `ChatRequest(BaseModel)` with `message: str`. FastAPI validates automatically | FastAPI Tutorial — Request Body |
| 3 | LLM endpoint | `POST /chat` → calls your LangGraph/Gemini agent → returns response JSON | — |
| 4 | Streaming API | Stream Gemini tokens over HTTP using `StreamingResponse`. Gemini supports streaming natively | FastAPI — StreamingResponse + `genai` streaming |
| 5 | Auth basics | API key via `X-API-Key` header. `Header()` dependency in FastAPI | FastAPI — Security (API Key section only) |
| 6 | Async FastAPI | `async def` endpoints, `await` your async LLM calls. Why this matters for concurrent requests | FastAPI — Async docs |
| 7 | **Build Day** | **FastAPI wrapper** around your Month 2 Research Agent. Test with the built-in `/docs` UI (Swagger — comes free with FastAPI) | — |

**Libraries this week:** `fastapi`, `uvicorn`, `pydantic`

---

### WEEK 10 — Multi-Agent Systems
**Goal:** Architect systems with multiple cooperating agents. Orchestrator/worker patterns, human-in-the-loop, structured inter-agent communication.

| Day | Topic | Exact Scope | Resource |
|---|---|---|---|
| 1 | Why multi-agent? | Specialization, parallelization, error correction. Read LangGraph multi-agent conceptual docs (20 mins) | [LangGraph Multi-Agent Systems](https://langchain-ai.github.io/langgraph/concepts/multi_agent/) |
| 2 | Orchestrator pattern | One coordinator routes to specialist workers. `Command` routing in LangGraph. All on Gemini free tier | — |
| 3 | Human in the loop | `interrupt_before`, approval checkpoints, resuming interrupted graphs. Essential for production agents | [LangGraph Human-in-the-loop](https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/) |
| 4 | Agent communication | Shared state vs. message passing vs. tool calls between agents. Type your state with `TypedDict` | — |
| 5 | Structured inter-agent output | Gemini structured output + Pydantic schemas for clean agent-to-agent data. `response_schema=` in Gemini | — |
| 6 | Error handling in agents | Retry logic, fallback from Gemini to Groq (if quota hit), graceful degradation | — |
| 7 | **Build Day** | 3-agent system of your own design. Clean state flow, error paths, swap Gemini ↔ Ollama to verify portability | — |

---

### WEEK 11 — Docker, Cloud Run, Observability
**Goal:** Deploy your agent API to the cloud. Monitor it. Keep costs at $0.

| Day | Topic | Exact Scope | Resource |
|---|---|---|---|
| 1 | Docker basics | `Dockerfile`, `docker build`, `docker run`. Containerize your FastAPI app | [Docker — Get Started (Part 1 & 2 only)](https://docs.docker.com/get-started/) |
| 2 | Docker for Python | `requirements.txt`, `.dockerignore`, `ENV` for secrets. Pass your Gemini API key via env var | — |
| 3 | GCP Cloud Run | `gcloud auth login`, `gcloud run deploy`. Deploy Dockerized API. Get a live HTTPS URL. Free tier: 2M req/month | [Cloud Run Python Quickstart](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-python-service) |
| 4 | Secrets in production | Cloud Run env vars for `GEMINI_API_KEY`. Never bake keys into Docker images | — |
| 5 | LangSmith tracing | Free tier. Traces every node in your LangGraph agent. See exactly what happened at each step | [LangSmith Quickstart](https://docs.smith.langchain.com/) |
| 6 | Basic CI with GitHub Actions | `.github/workflows/deploy.yml` — push to main → auto-deploy to Cloud Run | — |
| 7 | **Deploy Day** | Deploy a complete agent API to Cloud Run with a live HTTPS URL. This goes in your resume | — |

**Tools this week:** Docker, GCP Cloud Run (free tier), LangSmith (free tier), GitHub Actions

---

### WEEK 12 — Portfolio Projects & Job Prep
**Goal:** Three deployable projects. Live demos. Clean READMEs. All running on free infrastructure.

---

#### 📁 Project 1: Customer Support Agent API
> A customer support agent with FAQ knowledge base, order status lookup, and escalation to human. FastAPI backend, ChromaDB for FAQ RAG, Gemini 2.0 Flash.

**Stack:** FastAPI · LangGraph · ChromaDB · Gemini 2.0 Flash · Cloud Run (free)
**What it shows:** Tool use, RAG, REST API design, deployment, human-in-the-loop escalation

```
POST /chat        → sends message to agent
GET  /session     → retrieves conversation history
POST /escalate    → triggers human-in-the-loop interrupt
```

---

#### 📁 Project 2: Autonomous Coding Assistant
> Agent that reads a GitHub repo, understands the codebase, writes unit tests, explains the code, and opens a PR using GitHub API tools.

**Stack:** Google ADK · Gemini 1.5 Pro (50 req/day free) · GitHub REST API tools · Cloud Run
**What it shows:** ADK multi-agent, real API integration, ADK built-in `code_execution` tool

---

#### 📁 Project 3: Personal Data Analyst Agent
> Upload a CSV → agent understands the schema, writes & executes analysis code (via ADK code execution), explains the findings, returns structured insights.

**Stack:** LangGraph · Google ADK `code_execution` tool · FastAPI · Gemini structured output · Pydantic
**What it shows:** Code execution tools, structured output, data pipeline agents, multi-framework knowledge

---

#### 📋 Job-Ready Checklist

**By the end of Month 3, you can:**
- [x] Build single and multi-agent systems with LangGraph and Google ADK
- [x] Use Gemini, Ollama, and Groq — and switch between them in one line of code
- [x] Build custom agent tools from any API
- [x] Build RAG pipelines with ChromaDB and Gemini embeddings
- [x] Wrap agents in FastAPI endpoints with auth, streaming, and Pydantic validation
- [x] Deploy on GCP Cloud Run with Docker, secrets management, and CI/CD
- [x] Trace and debug agent runs with LangSmith
- [x] Design orchestrator/worker multi-agent architectures
- [x] Implement human-in-the-loop approval flows
- [x] Run agents locally with Ollama (zero cost, zero internet, confidential data safe)

**Honest gaps (don't need for most jobs):**
- [ ] Fine-tuning models (ML Engineering track — different role)
- [ ] Browser automation agents (1-week Playwright add-on)
- [ ] High-volume production infra (DevOps/SRE territory)

> [!NOTE]
> **On OpenAI/Anthropic in interviews:** You'll be able to say "I've worked with Gemini and Ollama. LangGraph is model-agnostic — switching to GPT-4 is one import change." This is actually *more impressive* than only knowing one provider.

---

## 📚 Complete Resource List

| Resource | URL | When |
|---|---|---|
| CS50P (Harvard Python) | https://cs50.harvard.edu/python/ | Month 1 Weeks 1–2 |
| Google AI Studio (get API key) | https://aistudio.google.com/ | Day 1 |
| Gemini API Python Quickstart | https://ai.google.dev/gemini-api/docs/quickstart?lang=python | Month 1 Week 3 |
| Ollama | https://ollama.com/download | Day 1 |
| Ollama Python SDK | https://github.com/ollama/ollama-python | Month 1 Week 3 |
| Groq Console (free key) | https://console.groq.com/ | Month 1 Week 3 |
| Gemini Function Calling | https://ai.google.dev/gemini-api/docs/function-calling | Month 2 Week 5 |
| LangChain Conceptual Guide | https://python.langchain.com/docs/concepts/ | Month 2 Week 6 |
| LangGraph Tutorials | https://langchain-ai.github.io/langgraph/tutorials/ | Month 2 Week 6 |
| Gemini Embeddings | https://ai.google.dev/gemini-api/docs/embeddings | Month 2 Week 7 |
| ChromaDB Docs | https://docs.trychroma.com | Month 2 Week 7 |
| Google ADK Docs | https://google.github.io/adk-docs/ | Month 2 Week 8 |
| FastAPI Tutorial | https://fastapi.tiangolo.com/tutorial/ | Month 3 Week 9 |
| LangGraph Multi-Agent | https://langchain-ai.github.io/langgraph/concepts/multi_agent/ | Month 3 Week 10 |
| Docker Get Started | https://docs.docker.com/get-started/ | Month 3 Week 11 |
| Cloud Run Python | https://cloud.google.com/run/docs/quickstarts | Month 3 Week 11 |
| LangSmith | https://docs.smith.langchain.com/ | Month 3 Week 11 |

---

## 💼 The Tech Stack a Recruiter Should See on Your Profile

```
Python 3.11+  ·  Gemini API  ·  Ollama  ·  Groq
LangChain  ·  LangGraph  ·  Google ADK  ·  ChromaDB
FastAPI  ·  Pydantic  ·  Docker  ·  GCP Cloud Run
LangSmith  ·  GitHub Actions  ·  Git
```

> [!IMPORTANT]
> The clearest signal that you're job-ready isn't a certificate — it's being able to look at a real business problem, sketch which agents and tools you'd need, open a blank repo, and have a working deployed prototype within a day or two. That's what Month 3 builds toward.

---

*Roadmap version 2.0 — 100% Free Stack · Updated April 1, 2026*
