from langchain_core.documents import Document
from langchain_ollama import ChatOllama
import operator
from typing import Annotated, List, TypedDict
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langgraph.constants import Send
from langgraph.graph import END, START, StateGraph
from langchain_community.document_loaders import PyPDFLoader
import os
from pydantic import BaseModel, Field
import json
import asyncio

dir_path = os.path.dirname(os.path.realpath(__file__))
file_path = os.path.join(dir_path, "assignment.pdf")

loader = PyPDFLoader(file_path)
documents = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=5000, chunk_overlap=1000)
documents = text_splitter.split_documents(documents)


map_template = """
Write some concise facts from the following text:

Text: {context}."""

reduce_template = """
The following is a set of facts:
{docs}

Your task is to consolidate these flashcards into a well-structured deck. Follow these guidelines:

- Each flashcard must have a term and a definition, and they must not be empty.
- If a flashcard contains multiple definitions, create a new flashcard for each definition.
- The term should be a question, phrase, or word, and the definition should be the answer to the question or the meaning of the phrase or word.
- **Self-Correction:** If a term or definition is ambiguous or incorrect, correct it based on the context provided in the text. Ensure that each flashcard accurately reflects the content, and use your own knowledge to verify its correctness.
- Terms and definitions must be correct and must be based on the provided text. Avoid introducing external information or assumptions.
- **Quality Check:** Before finalizing a flashcard, ensure that both the term and the definition are relevant, precise, and clearly linked. If they appear confusing or unclear, revise them to improve their clarity.
- Only use your own knowledge to determine the correctness of a flashcard, never create a flashcard term or definition based on external information or assumptions.
- Only create a flashcard if you have both the term and the phrase that can provide a valid, self-contained learning point.
- Flashcards must not contain information on citations, page numbers, or other extraneous details.
- Flashcards must not reference an image or any other media that the user cannot see. Stick only to text-based information that can be conveyed through questions and answers.

The deck must have a **title** that captures the main topic of the flashcards.

You must only output JSON in the following format, without any explanations:
{{
    "title": "",
    "flashcards": [
        {{"term": "", "definition": ""}}
    ]
}}
"""

map_prompt = ChatPromptTemplate([("human", map_template)])
reduce_prompt = ChatPromptTemplate([("human", reduce_template)])

llm = ChatOllama(
    base_url="http://localhost:11434",
    model="llama3.2",
    format="json"
)

map_chain = map_prompt | llm | StrOutputParser()
reduce_chain = reduce_prompt | llm | StrOutputParser()

class OverallState(TypedDict):
    contents: List[str]
    facts: Annotated[list, operator.add]
    flashcard_deck: str

class SummaryState(TypedDict):
    content: str

async def generate_facts(state: SummaryState):
    response = await map_chain.ainvoke(state["content"])
    return {"facts": [response]}

def map_facts(state: OverallState):
    return [
        Send("generate_facts", {"content": content}) for content in state["contents"]
    ]

async def generate_flashcard_deck(state: OverallState):
    response = await reduce_chain.ainvoke(state["facts"])
    return {"flashcard_deck": response}


# Construct the graph: here we put everything together to construct our graph
graph = StateGraph(OverallState)
graph.add_node("generate_facts", generate_facts)
graph.add_node("generate_flashcard_deck", generate_flashcard_deck)
graph.add_conditional_edges(START, map_facts, ["generate_facts"])
graph.add_edge("generate_facts", "generate_flashcard_deck")
graph.add_edge("generate_flashcard_deck", END)
app = graph.compile()

async def get_flashcard_deck():
    result = await app.ainvoke({"contents": [doc.page_content for doc in documents]})
    print(json.loads(result['flashcard_deck']))

# Run the async function
asyncio.run(get_flashcard_deck())