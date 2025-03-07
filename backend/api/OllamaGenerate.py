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
from langchain_community.document_loaders.merge import MergedDataLoader
import os
from pydantic import BaseModel, Field
import json
import asyncio

map_template = """
Context:
You are a robot that creates fun facts from a given text to help students learn about a topic.

Objective:
Write some facts from the following text using the following guideline:
- Facts must not contain information on citations, page numbers, sections or other metadata that is not important for learning
- Facts must not reference an image (such as a figure) or any other media that the user cannot see. Facts must be self contained.
- Facts must be gramatically and factually correct and must be based on the provided text. Avoid introducing external information or assumptions.
- If a fact describes a concept with multiple components (e.g. a method composed of multiple steps or parts), create additional facts that test knowledge of each component individually.  
- Only use your own knowledge to determine the correctness of a fact, never create a fact based on external information or assumptions.

Do not output any text other than the facts. No explanations or notes.
Text: {context}."""

reduce_template = """
Context:
You are a curious learner who wants to expand your knowledge using only the provided facts.
You will be given a collection of facts on one or multiple topics, and your goal is to turn them into engaging, thought-provoking flashcards into a single deck.

Each flashcard must have a term that is an open-ended question, and a definition that correctly answers the question.
Do not assume all facts belong to the same topic. Identify different subjects and generate a balanced amount of flashcards for each topic.
Do not create yes/no questions. Instead, ask "who," "what," "when," "where," or "why" questions that encourage deeper understanding.
Only use the given facts—do not make assumptions or generate questions about missing information. If the fact does not provide enough context to form a meaningful question, skip it.
The term should be broad enough to be useful for learning, rather than being overly specific or too obvious.
The definition should concisely answer the question with relevant details from the provided facts.
Ensure grammatical correctness and clarity in all flashcards.
The deck must not be empty.

Bad flashcards (do not ask questions like these):

Question: Is there a cave system on Tritus that could sustain human life? → (Yes/no question, too specific)
Question: Can Lewy Body Dementia be classified as a type of dementia? → (Yes/no question, redundant)

The deck must have a **title** that captures the main topic of the facts.

You must only output JSON in the following format:
{{
    "title": "",
    "flashcards": [
        {{"term": "", "definition": ""}}
    ]
}}


Facts:
{docs}

"""

map_prompt = ChatPromptTemplate([("human", map_template)])
reduce_prompt = ChatPromptTemplate([("human", reduce_template)])

llm = ChatOllama(
    base_url="http://localhost:11434",
    model="llama3.2",
    format="json",
    num_ctx=8192,
    temperature=0
)

llm2 = ChatOllama(
    base_url="http://localhost:11434",
    model="llama3.2",
    num_ctx=1024,
)

map_chain = map_prompt | llm2 | StrOutputParser()
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

async def get_flashcard_deck(documents):
    result = await app.ainvoke({"contents": [doc.page_content for doc in documents]})
    return json.loads(result['flashcard_deck'])

def generateFlashcardDeck(files):
    
    loaderDict = {
        "application/pdf": PyPDFLoader

    }
    loaders = []
    for file in files:
        loader = loaderDict[file.content_type](file.temporary_file_path())
        loaders.append(loader)

    loader = MergedDataLoader(loaders)
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=6000)
    chunks = text_splitter.split_documents(documents)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    deck = loop.run_until_complete(get_flashcard_deck(chunks))

    return deck