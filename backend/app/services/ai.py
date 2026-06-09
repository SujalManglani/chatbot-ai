import os
from pathlib import Path

from dotenv import load_dotenv
from openai import AsyncOpenAI
from tavily import TavilyClient

from app.prompts.system_prompt import DEADPOOL_SYSTEM_PROMPT


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH, override=True)

groq_api_key = os.getenv("GROQ_API_KEY")
tavily_api_key = os.getenv("TAVILY_API_KEY")

print("ENV PATH:", ENV_PATH)
print("GROQ KEY EXISTS:", bool(groq_api_key))
print("GROQ KEY START:", groq_api_key[:4] if groq_api_key else "None")
print("GROQ KEY LENGTH:", len(groq_api_key) if groq_api_key else 0)

client = AsyncOpenAI(
    api_key=groq_api_key,
    base_url="https://api.groq.com/openai/v1"
)

tavily = TavilyClient(
    api_key=tavily_api_key
)


def needs_live_search(message: str) -> bool:
    text = message.lower()

    keywords = [
        "current",
        "latest",
        "today",
        "now",
        "news",
        "president",
        "prime minister",
        "weather",
        "stock",
        "score",
        "price",
        "recent",
        "who is",
        "what is happening",
        "2025",
        "2026"
    ]

    return any(keyword in text for keyword in keywords)


def build_search_query(message: str) -> str:
    text = message.lower()

    if "president" in text and (
        "usa" in text
        or "united states" in text
        or "america" in text
        or "us " in text
    ):
        return "current president of the United States official White House"

    if "prime minister" in text:
        return f"current {message}"

    if "weather" in text:
        return f"current weather {message}"

    if "stock" in text or "share price" in text:
        return f"current stock price {message}"

    if "score" in text:
        return f"latest score {message}"

    if "news" in text or "latest" in text:
        return f"latest news {message}"

    return f"current {message}"


def search_web(message: str) -> str:
    if not tavily_api_key:
        print("SEARCH SKIPPED: Tavily key missing")
        return ""

    try:
        query = build_search_query(message)

        result = tavily.search(
            query=query,
            search_depth="advanced",
            max_results=8,
            include_answer=True
        )

        answer = result.get("answer", "")

        sources = []

        if answer:
            sources.append(
                f"Search Answer: {answer}"
            )

        for item in result.get("results", []):
            title = item.get("title", "")
            content = item.get("content", "")
            url = item.get("url", "")

            sources.append(
                f"Title: {title}\nContent: {content}\nURL: {url}"
            )

        return "\n\n".join(sources)

    except Exception as e:
        print("SEARCH ERROR:", str(e))
        return ""


async def ask_ai(message: str):
    try:
        if not groq_api_key:
            return "ERROR: GROQ_API_KEY is missing. Check your .env file or Render environment variables."

        live_context = ""

        if needs_live_search(message):
            live_context = search_web(message)

        if live_context:
            user_prompt = f"""
User question:
{message}

Current verified context:
{live_context}

Answer the user naturally.
Do not mention the context or sources unless the user asks.
"""
        else:
            user_prompt = message

        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": DEADPOOL_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            temperature=0.75
        )

        return response.choices[0].message.content

    except Exception as e:
        print("REAL ERROR:", str(e))
        return f"ERROR: {str(e)}"