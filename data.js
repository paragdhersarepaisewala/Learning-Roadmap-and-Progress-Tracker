// ============================================================
// ROADMAP DATA — 3-Month AI Agent Developer Course (Free Stack)
// ============================================================
const ROADMAP_DATA = {
  title: "Zero → Job-Ready: AI Agent Developer",
  subtitle: "100% Free — Gemini · Ollama · Groq",
  totalWeeks: 12,
  totalDays: 84,
  months: [
    {
      id: 1,
      title: "Month 1",
      subtitle: "Python × Free LLM APIs × First Working Bot",
      color: "#8b5cf6",
      colorRgb: "139,92,246",
      weeks: [
        {
          id: "m1w1", weekNum: 1,
          title: "Python Just Enough",
          goal: "Read, write, and run Python programs. Understand the exact subset you need. Nothing else.",
          libraries: [],
          project: "CLI To-Do App",
          capstone: false,
          days: [
            { id: "m1w1d1", day: 1, topic: "Setup", scope: "Install Python 3.11+, VS Code + Pylance extension, terminal basics. Also install Ollama and pull gemma2:2b", resource: "VS Code Python Setup", url: "https://code.visualstudio.com/docs/python/python-tutorial" },
            { id: "m1w1d2", day: 2, topic: "Variables & Types", scope: "str, int, float, bool, f-strings, type(). Write a program that describes yourself in code", resource: "Python docs: Built-in Types", url: "https://docs.python.org/3/library/stdtypes.html" },
            { id: "m1w1d3", day: 3, topic: "Functions", scope: "def, parameters, return, calling functions, default arguments. Write 5 utility functions", resource: "Python docs: Defining Functions", url: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions" },
            { id: "m1w1d4", day: 4, topic: "Lists & Dicts", scope: "list, dict, indexing, .append(), .get(), looping with for. Build a contact book CLI", resource: "Python docs: Data Structures", url: "https://docs.python.org/3/tutorial/datastructures.html" },
            { id: "m1w1d5", day: 5, topic: "Conditionals & Logic", scope: "if/elif/else, and/or/not, == vs is. Add search & filter to your contact book", resource: "Python docs: Control Flow", url: "https://docs.python.org/3/tutorial/controlflow.html" },
            { id: "m1w1d6", day: 6, topic: "Error Handling", scope: "try/except/finally, raise, print error messages cleanly. Make contact book crash-proof", resource: "Python docs: Errors and Exceptions", url: "https://docs.python.org/3/tutorial/errors.html" },
            { id: "m1w1d7", day: 7, topic: "🏗️ Build Day: CLI To-Do App", scope: "Mini project: CLI To-Do — add, list, complete, delete tasks. All in one .py file. This is your first real program", resource: "Build it from scratch!", url: "" },
          ]
        },
        {
          id: "m1w2", weekNum: 2,
          title: "Python for Real-World API Work",
          goal: "Make HTTP calls, handle secrets, parse JSON, read/write files. The exact skills you use daily building agents.",
          libraries: ["requests", "python-dotenv"],
          project: "Weather CLI",
          capstone: false,
          days: [
            { id: "m1w2d1", day: 1, topic: "Files & JSON", scope: "open(), read(), write(), json.loads(), json.dumps(). NOT os.walk, NOT os.path.join — just these 5 things", resource: "Python docs: Reading and Writing Files", url: "https://docs.python.org/3/tutorial/inputoutput.html" },
            { id: "m1w2d2", day: 2, topic: "Environment Variables", scope: "pip install python-dotenv, create .env, os.getenv('KEY'). Put your Gemini API key here. Never hardcode keys", resource: "python-dotenv GitHub", url: "https://github.com/theskumar/python-dotenv" },
            { id: "m1w2d3", day: 3, topic: "HTTP with requests", scope: "requests.get(), requests.post(), response.json(), status codes. Call wttr.in (free weather API, no key needed)", resource: "requests Quickstart", url: "https://docs.python-requests.org/en/latest/user/quickstart/" },
            { id: "m1w2d4", day: 4, topic: "List Comprehensions", scope: "[x for x in list if condition]. Rewrite your Week 1 loops using this. One concept, deep practice", resource: "Python docs: List Comprehensions", url: "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions" },
            { id: "m1w2d5", day: 5, topic: "Classes (just enough)", scope: "class, __init__, self, one or two methods. Build a Chatbot class that holds a conversation list", resource: "Python docs: Classes (first 2 sections only)", url: "https://docs.python.org/3/tutorial/classes.html" },
            { id: "m1w2d6", day: 6, topic: "Virtual Environments", scope: "python -m venv .venv, activate, pip install, requirements.txt, pip freeze. Every project needs this", resource: "Python venv docs", url: "https://docs.python.org/3/library/venv.html" },
            { id: "m1w2d7", day: 7, topic: "🏗️ Build Day: Weather CLI", scope: "Weather CLI — takes city name, calls wttr.in (free, no key), formats and prints a weather report. Use .env for future keys", resource: "wttr.in API", url: "https://wttr.in/:help" },
          ]
        },
        {
          id: "m1w3", weekNum: 3,
          title: "Free LLM APIs — The Core Skill",
          goal: "Call Gemini, Ollama, and Groq. Understand tokens, roles, system prompts, temperature. Build your first real chatbot.",
          libraries: ["google-generativeai", "ollama", "groq"],
          project: "Multi-Provider Chatbot",
          capstone: false,
          days: [
            { id: "m1w3d1", day: 1, topic: "Gemini API", scope: "pip install google-generativeai. genai.configure(api_key=...), GenerativeModel('gemini-2.0-flash'), .generate_content(), extract .text", resource: "Gemini API Python Quickstart", url: "https://ai.google.dev/gemini-api/docs/quickstart?lang=python" },
            { id: "m1w3d2", day: 2, topic: "Chat & System Prompts", scope: "model.start_chat(), send messages, read history. system_instruction= param. Experiment with temperature (0 = deterministic, 1 = creative)", resource: "Gemini SDK docs — Chat section", url: "https://ai.google.dev/gemini-api/docs/text-generation?lang=python" },
            { id: "m1w3d3", day: 3, topic: "Ollama (Local LLM)", scope: "pip install ollama. ollama.chat(model='gemma2:2b', messages=[...]). Same role structure as cloud APIs. Full conversation with ZERO internet", resource: "Ollama Python Quickstart", url: "https://github.com/ollama/ollama-python" },
            { id: "m1w3d4", day: 4, topic: "Groq (Free Fast Cloud)", scope: "pip install groq. client.chat.completions.create(model='llama-3.3-70b-versatile'). OpenAI-compatible syntax — same .choices[0].message.content pattern", resource: "Groq Python Quickstart", url: "https://console.groq.com/docs/quickstart" },
            { id: "m1w3d5", day: 5, topic: "Conversation History", scope: "How to maintain messages = [] list, append user/assistant turns, send full history each call. This is how raw memory works at the API level", resource: "Gemini Multi-turn Chat docs", url: "https://ai.google.dev/gemini-api/docs/text-generation?lang=python#multi-turn-conversations" },
            { id: "m1w3d6", day: 6, topic: "Structured Output with Gemini", scope: "response_mime_type='application/json', response_schema=. Make Gemini return clean JSON. This is how agents communicate structured data", resource: "Gemini Structured Output docs", url: "https://ai.google.dev/gemini-api/docs/structured-output" },
            { id: "m1w3d7", day: 7, topic: "🏗️ Build Day: Multi-Provider Chatbot", scope: "--provider gemini/ollama/groq flag. Maintains conversation history in memory. Saves chat to conversation.json on exit. All free", resource: "Build it from scratch!", url: "" },
          ]
        },
        {
          id: "m1w4", weekNum: 4,
          title: "Build Something Real (Month 1 Capstone)",
          goal: "Put everything together into a deployable CLI tool. Learn Git properly. Push your first repo to GitHub.",
          libraries: [],
          project: "CLI AI Assistant with Persistent Memory",
          capstone: true,
          days: [
            { id: "m1w4d1", day: 1, topic: "Git Basics", scope: "git init, git add, git commit, git push, .gitignore (ALWAYS ignore .env!), GitHub repo creation", resource: "GitHub Quickstart", url: "https://docs.github.com/en/get-started/quickstart" },
            { id: "m1w4d2", day: 2, topic: "CLI Arguments with argparse", scope: "argparse — make your chatbot configurable: --provider, --persona, --save. Professional CLI interface", resource: "Python argparse docs", url: "https://docs.python.org/3/library/argparse.html" },
            { id: "m1w4d3", day: 3, topic: "Project Structure", scope: "Splitting into multiple .py files, import, relative imports. Organize Week 3 chatbot into a chatbot/ folder properly", resource: "Python Modules docs", url: "https://docs.python.org/3/tutorial/modules.html" },
            { id: "m1w4d4", day: 4, topic: "Capstone Day 1", scope: "Build CLI AI Assistant: file-based memory that saves/loads from JSON, conversation history persists between sessions", resource: "Build it!", url: "" },
            { id: "m1w4d5", day: 5, topic: "Capstone Day 2", scope: "Add: multi-provider support (Gemini primary, Ollama fallback if offline), --persona flag for custom system prompts", resource: "Build it!", url: "" },
            { id: "m1w4d6", day: 6, topic: "Capstone Day 3", scope: "Polish: error handling, helpful error messages, clean code, docstrings on functions", resource: "Build it!", url: "" },
            { id: "m1w4d7", day: 7, topic: "🚀 Polish + Push to GitHub", scope: "Write proper README.md with: what it does, install steps, usage examples. Push with clean .gitignore. This is your first portfolio piece", resource: "GitHub README best practices", url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes" },
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Month 2",
      subtitle: "Tools · Memory · RAG · LangGraph · ADK",
      color: "#06b6d4",
      colorRgb: "6,182,212",
      weeks: [
        {
          id: "m2w1", weekNum: 5,
          title: "Tool Use & Function Calling",
          goal: "Give an LLM the ability to call your Python functions. This is the foundational skill of agent development.",
          libraries: [],
          project: "Raw Tool-Calling Agent",
          capstone: false,
          days: [
            { id: "m2w1d1", day: 1, topic: "What is a Tool?", scope: "A Python function + a JSON description. The LLM reads the description and decides when to call it. Read Gemini function calling docs", resource: "Gemini Function Calling docs", url: "https://ai.google.dev/gemini-api/docs/function-calling" },
            { id: "m2w1d2", day: 2, topic: "First Tool: Web Search", scope: "Build search_web(query) wrapping DuckDuckGo API (no key needed, pip install duckduckgo-search). Register as a Gemini tool", resource: "duckduckgo-search PyPI", url: "https://pypi.org/project/duckduckgo-search/" },
            { id: "m2w1d3", day: 3, topic: "The Tool Call Loop", scope: "Implement: LLM responds with tool call → you execute function → send result back → LLM gives final answer. Understand what happens under the hood", resource: "Gemini Function Calling Examples", url: "https://ai.google.dev/gemini-api/docs/function-calling?lang=python" },
            { id: "m2w1d4", day: 4, topic: "Multiple Tools", scope: "Add get_weather(city) via wttr.in, calculate(expression) via eval(). Agent must pick the right tool for each query", resource: "Build it!", url: "" },
            { id: "m2w1d5", day: 5, topic: "Tool Calling with Ollama", scope: "llama3.1:8b supports tool calling natively. Same concept, local, zero quota, zero internet", resource: "Ollama Tool Calling docs", url: "https://ollama.com/blog/tool-support" },
            { id: "m2w1d6", day: 6, topic: "ReAct Pattern", scope: "Reason → Act → Observe loop. Implement it manually without any framework so you understand what LangGraph does for you later", resource: "ReAct pattern explanation", url: "https://react-lm.github.io/" },
            { id: "m2w1d7", day: 7, topic: "🏗️ Build Day: Tool-Calling Agent", scope: "Tool-calling agent (Gemini primary, Ollama fallback) — web search, weather, math. Raw API calls, no framework yet — you understand every line", resource: "Build it!", url: "" },
          ]
        },
        {
          id: "m2w2", weekNum: 6,
          title: "LangChain & LangGraph",
          goal: "Learn LangGraph for stateful multi-step agents using Gemini + Ollama. Model-agnostic architecture.",
          libraries: ["langchain", "langchain-google-genai", "langchain-ollama", "langgraph"],
          project: "LangGraph Multi-Tool Agent",
          capstone: false,
          days: [
            { id: "m2w2d1", day: 1, topic: "LangChain Overview", scope: "What problem it solves. pip install langchain langchain-google-genai langchain-ollama. Read Why LangChain? page (skip the tutorial)", resource: "LangChain Conceptual Guide", url: "https://python.langchain.com/docs/concepts/" },
            { id: "m2w2d2", day: 2, topic: "LangChain with Gemini", scope: "from langchain_google_genai import ChatGoogleGenerativeAI. ChatGoogleGenerativeAI(model='gemini-2.0-flash'). Rebuild your Week 3 chatbot in 20 lines", resource: "LangChain Google GenAI docs", url: "https://python.langchain.com/docs/integrations/chat/google_generativeai/" },
            { id: "m2w2d3", day: 3, topic: "LangChain with Ollama", scope: "from langchain_ollama import ChatOllama. ChatOllama(model='llama3.1:8b'). Same interface, different model. One import line change to switch providers", resource: "LangChain Ollama docs", url: "https://python.langchain.com/docs/integrations/chat/ollama/" },
            { id: "m2w2d4", day: 4, topic: "LangGraph Intro", scope: "Why LangGraph: stateful graph-based agents. pip install langgraph. Core concepts: State, Nodes, Edges, Checkpoints", resource: "LangGraph Quickstart", url: "https://langchain-ai.github.io/langgraph/tutorials/introduction/" },
            { id: "m2w2d5", day: 5, topic: "First LangGraph Agent", scope: "Build a simple graph: agent_node → tool_node → back to agent_node. Use ChatGoogleGenerativeAI as the LLM. Add one real tool", resource: "LangGraph Tutorial Part 1", url: "https://langchain-ai.github.io/langgraph/tutorials/introduction/" },
            { id: "m2w2d6", day: 6, topic: "State & Conditional Edges", scope: "TypedDict state, add_messages reducer, should_continue pattern. Graph branches based on LLM decision: tool call vs. final answer", resource: "LangGraph Tutorial Parts 2-3", url: "https://langchain-ai.github.io/langgraph/tutorials/introduction/" },
            { id: "m2w2d7", day: 7, topic: "🏗️ Build Day: LangGraph Agent", scope: "LangGraph agent with 3+ tools, persistent conversation memory, conditional routing. Switch between Gemini and Ollama to verify model-agnostic design", resource: "Build it!", url: "" },
          ]
        },
        {
          id: "m2w3", weekNum: 7,
          title: "Memory & RAG (ChromaDB + Vector Search)",
          goal: "Give agents access to knowledge bases. Build a RAG pipeline using Gemini embeddings (free).",
          libraries: ["chromadb", "langchain (text splitters)"],
          project: "RAG Agent with ChromaDB",
          capstone: false,
          days: [
            { id: "m2w3d1", day: 1, topic: "Why RAG?", scope: "LLMs have knowledge cutoffs and limited context. RAG = retrieve relevant chunks at runtime and inject into the prompt. Conceptual read, 10 mins", resource: "Gemini RAG Overview", url: "https://ai.google.dev/gemini-api/docs/semantic_retrieval" },
            { id: "m2w3d2", day: 2, topic: "Embeddings (Conceptual)", scope: "Text → vector → similarity search. You don't need the math. Use Gemini's free embedding API: genai.embed_content(model='models/text-embedding-004')", resource: "Gemini Embeddings docs", url: "https://ai.google.dev/gemini-api/docs/embeddings" },
            { id: "m2w3d3", day: 3, topic: "ChromaDB Basics", scope: "pip install chromadb. Create collection, add(), query(). Add 10 text paragraphs, query for the most relevant one. Runs locally, no server, no account", resource: "ChromaDB Quickstart", url: "https://docs.trychroma.com/getting-started" },
            { id: "m2w3d4", day: 4, topic: "Document Chunking", scope: "Split a long text/markdown file into chunks. Use RecursiveCharacterTextSplitter from langchain. Fixed-size with overlap strategy", resource: "LangChain Text Splitters", url: "https://python.langchain.com/docs/concepts/text_splitters/" },
            { id: "m2w3d5", day: 5, topic: "Full RAG Pipeline", scope: "Load doc → chunk → embed (Gemini text-embedding-004) → store in ChromaDB → query → inject into LLM prompt. Manual implementation, no magic", resource: "Build it!", url: "" },
            { id: "m2w3d6", day: 6, topic: "RAG as LangGraph Tool Node", scope: "Make your retrieval function a tool node in LangGraph. Agent decides when to retrieve vs. answer from conversation context", resource: "LangGraph RAG tutorial", url: "https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_agentic_rag/" },
            { id: "m2w3d7", day: 7, topic: "🏗️ Build Day: RAG Agent", scope: "Takes a folder of markdown/text files, builds vector store on startup, answers questions from the knowledge base using retrieval + Gemini", resource: "Build it!", url: "" },
          ]
        },
        {
          id: "m2w4", weekNum: 8,
          title: "Google ADK (Month 2 Capstone)",
          goal: "Learn Google's Agent Development Kit. Build a multi-agent Research system with ADK + Gemini.",
          libraries: ["google-adk"],
          project: "Research Agent (Multi-Agent + RAG)",
          capstone: true,
          days: [
            { id: "m2w4d1", day: 1, topic: "ADK Overview", scope: "What ADK is, how it relates to Gemini, why it exists alongside LangGraph. pip install google-adk. Skim architecture overview (30 mins)", resource: "Google ADK Docs", url: "https://google.github.io/adk-docs/" },
            { id: "m2w4d2", day: 2, topic: "ADK Agent Basics", scope: "Agent class, Runner, session management. Build a single ADK agent with one custom Python function tool", resource: "ADK Quickstart", url: "https://google.github.io/adk-docs/get-started/quickstart/" },
            { id: "m2w4d3", day: 3, topic: "ADK Built-in Tools", scope: "google_search (free, no key), code_execution (free sandbox). Add both to an agent and test. These are free because Google-provided", resource: "ADK Built-in Tools guide", url: "https://google.github.io/adk-docs/tools/" },
            { id: "m2w4d4", day: 4, topic: "Multi-Agent in ADK", scope: "Sub-agents, AgentTool, orchestrator pattern. One coordinator agent delegates tasks to specialist sub-agents by query type", resource: "ADK Multi-agent guide", url: "https://google.github.io/adk-docs/agents/multi-agents/" },
            { id: "m2w4d5", day: 5, topic: "ADK + Gemini Models", scope: "gemini-2.0-flash (free tier), gemini-1.5-pro (50 req/day free). Assign lighter models to simple tasks, powerful models to reasoning tasks", resource: "ADK Model configuration", url: "https://google.github.io/adk-docs/agents/llm-agents/" },
            { id: "m2w4d6", day: 6, topic: "LangGraph vs ADK Side-by-Side", scope: "Implement the same 3-tool agent in both LangGraph and ADK. See syntax differences. Know when to use which in interviews", resource: "Both docs open side by side", url: "" },
            { id: "m2w4d7", day: 7, topic: "🚀 Capstone: Research Agent", scope: "Multi-agent: Researcher (web search + RAG), Synthesizer (writes answer), Critic (quality check). All on Gemini free tier. Output saved as markdown", resource: "Build it!", url: "" },
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Month 3",
      subtitle: "APIs · Multi-Agent Systems · Deploy · Portfolio",
      color: "#10b981",
      colorRgb: "16,185,129",
      weeks: [
        {
          id: "m3w1", weekNum: 9,
          title: "APIs & Web Layer (FastAPI)",
          goal: "Wrap your agent in a REST API so real applications can use it. Pydantic finally shows up here.",
          libraries: ["fastapi", "uvicorn", "pydantic"],
          project: "FastAPI Agent API",
          capstone: false,
          days: [
            { id: "m3w1d1", day: 1, topic: "FastAPI Intro", scope: "pip install fastapi uvicorn. @app.get(), @app.post(), run with uvicorn main:app --reload. Hello World API. Open /docs — free Swagger UI comes built in", resource: "FastAPI Tutorial — First Steps", url: "https://fastapi.tiangolo.com/tutorial/first-steps/" },
            { id: "m3w1d2", day: 2, topic: "Pydantic Models", scope: "BaseModel for request/response shapes. Define ChatRequest(BaseModel) with message: str. FastAPI validates and documents this automatically", resource: "FastAPI Tutorial — Request Body", url: "https://fastapi.tiangolo.com/tutorial/body/" },
            { id: "m3w1d3", day: 3, topic: "LLM Endpoint", scope: "POST /chat endpoint that accepts a message, calls your LangGraph agent, returns the response as JSON", resource: "Build it!", url: "" },
            { id: "m3w1d4", day: 4, topic: "Streaming API", scope: "Stream Gemini tokens over HTTP using StreamingResponse. Makes your API feel alive — frontend sees words appear, not wait for full response", resource: "FastAPI StreamingResponse docs", url: "https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse" },
            { id: "m3w1d5", day: 5, topic: "Auth Basics", scope: "API key via X-API-Key header. Header() dependency injection in FastAPI. Never no-auth in production, even demo apps", resource: "FastAPI Security — API Key", url: "https://fastapi.tiangolo.com/tutorial/security/" },
            { id: "m3w1d6", day: 6, topic: "Async FastAPI", scope: "async def endpoints, await your async LLM calls. Why this matters: one sync call blocks all other requests; async serves thousands concurrently", resource: "FastAPI Async docs", url: "https://fastapi.tiangolo.com/async/" },
            { id: "m3w1d7", day: 7, topic: "🏗️ Build Day: Agent API", scope: "FastAPI wrapper around your Month 2 Research Agent. Test with the built-in /docs Swagger UI. Share the local URL with someone", resource: "Build it!", url: "" },
          ]
        },
        {
          id: "m3w2", weekNum: 10,
          title: "Multi-Agent Systems",
          goal: "Architect systems with multiple cooperating agents. Orchestrator/worker patterns, human-in-the-loop, error recovery.",
          libraries: [],
          project: "Custom 3-Agent System",
          capstone: false,
          days: [
            { id: "m3w2d1", day: 1, topic: "Why Multi-Agent?", scope: "Specialization (each agent is an expert), parallelization (run simultaneously), error correction (one agent checks another). Read LangGraph multi-agent docs", resource: "LangGraph Multi-Agent Systems", url: "https://langchain-ai.github.io/langgraph/concepts/multi_agent/" },
            { id: "m3w2d2", day: 2, topic: "Orchestrator / Worker Pattern", scope: "One coordinator routes to specialist workers. Command routing in LangGraph. Use Gemini 2.0 Flash for coordinator, lighter models for workers if needed", resource: "LangGraph Supervisor pattern", url: "https://langchain-ai.github.io/langgraph/tutorials/multi_agent/agent_supervisor/" },
            { id: "m3w2d3", day: 3, topic: "Human in the Loop", scope: "interrupt_before, approval checkpoints, resuming interrupted graphs. The coordinator asks a human before taking irreversible actions", resource: "LangGraph Human-in-the-loop", url: "https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/" },
            { id: "m3w2d4", day: 4, topic: "Agent Communication", scope: "Shared state TypedDict vs. message passing vs. AgentTool calls. Type everything with TypedDict — never pass raw strings between agents", resource: "LangGraph State Management", url: "https://langchain-ai.github.io/langgraph/concepts/low_level/" },
            { id: "m3w2d5", day: 5, topic: "Structured Inter-Agent Output", scope: "Gemini structured output + Pydantic schemas for clean data between agents. response_schema= in Gemini, with_structured_output() in LangChain", resource: "Gemini Structured Output", url: "https://ai.google.dev/gemini-api/docs/structured-output" },
            { id: "m3w2d6", day: 6, topic: "Error Handling & Fallbacks", scope: "Retry logic, fallback from Gemini to Groq if quota is hit, graceful degradation pattern. What happens when a tool fails mid-graph?", resource: "LangGraph Error Handling", url: "https://langchain-ai.github.io/langgraph/how-tos/create-react-agent-error-handling/" },
            { id: "m3w2d7", day: 7, topic: "🏗️ Build Day: Your Own 3-Agent System", scope: "Design and implement a 3-agent system solving a problem you choose. Focus on clean state flow, error paths, and portability across LLM providers", resource: "Build it!", url: "" },
          ]
        },
        {
          id: "m3w3", weekNum: 11,
          title: "Docker, Cloud Run & Observability",
          goal: "Deploy your agent API to GCP Cloud Run (free tier). Monitor it. Keep costs at $0.",
          libraries: [],
          project: "Live Deployed Agent API",
          capstone: false,
          days: [
            { id: "m3w3d1", day: 1, topic: "Docker Basics", scope: "Dockerfile, docker build, docker run, docker ps. Containerize your FastAPI app. Understand: image = recipe, container = running instance", resource: "Docker Get Started (Parts 1 & 2)", url: "https://docs.docker.com/get-started/" },
            { id: "m3w3d2", day: 2, topic: "Docker for Python Apps", scope: "requirements.txt in Docker, .dockerignore, ENV for secrets, exposing ports. Pass GEMINI_API_KEY as environment variable — never bake into image", resource: "Docker Python Language Guide", url: "https://docs.docker.com/language/python/" },
            { id: "m3w3d3", day: 3, topic: "GCP Cloud Run", scope: "gcloud auth login, gcloud run deploy. Deploy Dockerized FastAPI app. Get a live HTTPS URL. Free tier: 2 million requests/month — your portfolio runs free forever", resource: "Cloud Run Python Quickstart", url: "https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-python-service" },
            { id: "m3w3d4", day: 4, topic: "Secrets in Production", scope: "Cloud Run environment variables for GEMINI_API_KEY. Google Secret Manager basics. Security mindset: what lives in env vars vs. what's in code", resource: "Cloud Run env vars docs", url: "https://cloud.google.com/run/docs/configuring/services/environment-variables" },
            { id: "m3w3d5", day: 5, topic: "LangSmith Tracing", scope: "Free tier. Add LANGSMITH_API_KEY to your project. Traces every node in your LangGraph graph. See exactly what happened at each step in a UI", resource: "LangSmith Quickstart", url: "https://docs.smith.langchain.com/" },
            { id: "m3w3d6", day: 6, topic: "GitHub Actions CI/CD", scope: ".github/workflows/deploy.yml — push to main branch → auto-deploy to Cloud Run. Simple pipeline that looks professional and saves time", resource: "GitHub Actions docs", url: "https://docs.github.com/en/actions" },
            { id: "m3w3d7", day: 7, topic: "🚀 Deploy Day", scope: "Deploy your complete agent API to Cloud Run. Get the live HTTPS URL. This URL goes in your resume, README, and portfolio. Test it with curl", resource: "Build it!", url: "" },
          ]
        },
        {
          id: "m3w4", weekNum: 12,
          title: "Portfolio Projects & Job Prep",
          goal: "Three deployable projects. Live demos. Clean READMEs. All running on free infrastructure. You're job-ready.",
          libraries: ["fastapi", "langgraph", "google-adk", "chromadb", "pydantic"],
          project: "3 Live Portfolio Projects",
          capstone: true,
          days: [
            { id: "m3w4d1", day: 1, topic: "Project 1: Customer Support Agent — Build", scope: "FastAPI + LangGraph + ChromaDB + Gemini 2.0 Flash + Cloud Run. FAQ knowledge base, order lookup tool, escalation to human flow", resource: "Build it!", url: "" },
            { id: "m3w4d2", day: 2, topic: "Project 1: Polish", scope: "Add streaming response, human-in-the-loop escalation trigger, clean README with architecture diagram", resource: "Build it!", url: "" },
            { id: "m3w4d3", day: 3, topic: "Project 2: Autonomous Coding Assistant — Build", scope: "Google ADK + Gemini 1.5 Pro + GitHub REST API tools + Cloud Run. Reads repo, understands code, writes tests, explains functions", resource: "GitHub REST API docs", url: "https://docs.github.com/en/rest" },
            { id: "m3w4d4", day: 4, topic: "Project 2: Polish", scope: "Add ADK code_execution built-in tool, proper error handling for GitHub API failures, README with live demo GIF", resource: "ADK code execution tool docs", url: "https://google.github.io/adk-docs/tools/built-in-tools/#code-execution" },
            { id: "m3w4d5", day: 5, topic: "Project 3: Data Analyst Agent — Build", scope: "LangGraph + ADK code_execution + FastAPI + Pydantic. Upload CSV → agent understands schema → writes + runs analysis code → structured insights", resource: "Build it!", url: "" },
            { id: "m3w4d6", day: 6, topic: "Project 3: Polish All Three", scope: "Structured Pydantic output for insights, polish all 3 READMEs, verify all live demos work. Take screenshots for LinkedIn", resource: "Build it!", url: "" },
            { id: "m3w4d7", day: 7, topic: "🎯 Job Prep Day", scope: "Review GitHub portfolio. Practice: take a new business problem, sketch agent architecture in 10 mins, prototype in one day. That's the interview", resource: "You're done. Ship it.", url: "" },
          ]
        }
      ]
    }
  ]
};

// Default resources pre-populated from the roadmap
const DEFAULT_RESOURCES = [
  { id: "r1", title: "Google AI Studio (Free Gemini API Key)", url: "https://aistudio.google.com/", notes: "Get your free Gemini API key here. No credit card needed.", week: "m1w3", type: "tool", tags: ["gemini", "free", "setup"] },
  { id: "r2", title: "Ollama — Run Local LLMs", url: "https://ollama.com/download", notes: "Install Ollama to run Llama, Gemma, Phi locally. Zero cost, zero internet needed.", week: "m1w1", type: "tool", tags: ["ollama", "local", "setup"] },
  { id: "r3", title: "Groq Console (Free API Key)", url: "https://console.groq.com/", notes: "Free fast inference for Llama 3 and Gemma. ~14,400 req/day free.", week: "m1w3", type: "tool", tags: ["groq", "free", "llama"] },
  { id: "r4", title: "CS50P — Harvard Python Course (Free)", url: "https://cs50.harvard.edu/python/", notes: "Free Python course by Harvard. Covers exactly what you need in Weeks 1-2. No fluff.", week: "m1w1", type: "course", tags: ["python", "free", "beginner"] },
  { id: "r5", title: "Gemini API Python Quickstart", url: "https://ai.google.dev/gemini-api/docs/quickstart?lang=python", notes: "Official Google quickstart. Read and code along. 15 minutes to first API call.", week: "m1w3", type: "docs", tags: ["gemini", "python", "api"] },
  { id: "r6", title: "LangGraph Tutorials", url: "https://langchain-ai.github.io/langgraph/tutorials/introduction/", notes: "Official LangGraph tutorial series. Follow Day 1-3 in Week 6. Best agent framework resource.", week: "m2w2", type: "docs", tags: ["langgraph", "agents"] },
  { id: "r7", title: "Google ADK Documentation", url: "https://google.github.io/adk-docs/", notes: "Official ADK docs. Excellent for multi-agent orchestration with Gemini.", week: "m2w4", type: "docs", tags: ["adk", "google", "multi-agent"] },
  { id: "r8", title: "ChromaDB Quickstart", url: "https://docs.trychroma.com/getting-started", notes: "Vector database that runs locally. No server, no account. Perfect for RAG learning.", week: "m2w3", type: "docs", tags: ["chromadb", "rag", "vector"] },
  { id: "r9", title: "FastAPI Tutorial", url: "https://fastapi.tiangolo.com/tutorial/first-steps/", notes: "Best web framework docs in Python. Interactive, complete, with live examples.", week: "m3w1", type: "docs", tags: ["fastapi", "api", "python"] },
  { id: "r10", title: "LangSmith (Free Tier Tracing)", url: "https://docs.smith.langchain.com/", notes: "Visualize every step of your LangGraph agent. Free tier is more than enough.", week: "m3w3", type: "tool", tags: ["langsmith", "debugging", "tracing"] },
  { id: "r11", title: "Cloud Run — Deploy Python Service", url: "https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-python-service", notes: "Deploy your FastAPI agent to GCP. 2M requests/month free. Live HTTPS URL.", week: "m3w3", type: "docs", tags: ["gcp", "deployment", "cloud-run"] },
];
