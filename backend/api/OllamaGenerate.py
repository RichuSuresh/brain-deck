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
You are a curious learner who wants to test their memory only on the pieces of text you are given.
You will be given a chunk of text on a single topic, and your goal is to create engaging and thought provoking flashcards from the provided information to help you memorise the text on the topic.
 
Objective:
Write some flashcards from the following text using the following guideline:
- Each flashcard must have a term that is a question about the text (which must have a specified answer within the text), and a definition that correctly answers the question. This answer must be known and specified in the text.
- Do not create yes/no questions. Instead, ask "who," "what," "when," "where," or "why" questions that encourage deeper understanding.
- terms must not contain information on citations, page numbers, sections, university details, authors or other metadata that is not important for learning the piece of text
- terms must not reference an image (such as a figure) or any other media that the user cannot see. flashcards must be self contained.
- The term should not be vague, but not overly specific or too obvious.
- The definition should concisely answer the question with relevant details from the provided facts.
- flashcards must be gramatically and factually correct and must be based on the provided text. Avoid introducing external information or assumptions.
- Only use your own knowledge to determine the correctness of a flashcard, never create a flashcard based on external information or assumptions.
- **Generate a maximum of 10 flashcards per chunk**.

Terms must be less than or equal to 200 characters, and definitions must be less than or equal to 100 characters.
Bad flashcards (do not ask questions like these):

Question: Is there a cave system on Tritus that could sustain human life? → (Yes/no question, too specific)
Question: Can Lewy Body Dementia be classified as a type of dementia? → (Yes/no question, redundant)
Question: When was Mudalige et al.'s research published? -> (Refers to a citation, irrelavant)
Question: What is the implication of this design on performance? -> (question uses words like "this" and is not self contained, vague)

You must only output JSON in the following format:
{{
    "flashcards": [
        {{"term": "", "definition": ""}}
    ]
}}

Text: {context}."""

reduce_template = """
Context:
You will be given a collection of flashcards or flashcard decks and your goal is to compile them into a single deck.

Flashcards must be distinct from one another. There must be no repeated terms or definitions.
Give higher priority to flashcards with terms that ask about a word or fact
Do not assume all flashcards belong to the same topic. Identify different subjects and have a balanced amount of flashcards for each topic in the deck.
The deck must not be empty.

The deck must have a **title** that captures the main topic of the facts.
the title must be less than or equal to 70 characters.

You must only output JSON in the following format:
{{
    "title": "",
    "flashcards": [
        {{"term": "", "definition": ""}}
    ]
}}

Flashcards:
{docs}

"""

map_prompt = ChatPromptTemplate([("human", map_template)])
reduce_prompt = ChatPromptTemplate([("human", reduce_template)])

llm = ChatOllama(
    base_url="http://localhost:11434",
    model="mistral",
    format="json",
    num_ctx=8192,
    temperature=0
)

llm2 = ChatOllama(
    base_url="http://localhost:11434",
    model="llama3.2",
    num_ctx=8192,
    temperature=0,
    format="json"
)

map_chain = map_prompt | llm2 | StrOutputParser()
reduce_chain = reduce_prompt | llm | StrOutputParser()

class OverallState(TypedDict):
    contents: List[str]
    flashcards: Annotated[list, operator.add]
    flashcard_deck: str

class SummaryState(TypedDict):
    content: str

async def generate_flashcards(state: SummaryState):
    response = await map_chain.ainvoke(state["content"])
    return {"flashcards": [response]}

def map_flashcards(state: OverallState):
    return [
        Send("generate_flashcards", {"content": content}) for content in state["contents"]
    ]

async def generate_flashcard_deck(state: OverallState):
    flashcards = state["flashcards"]
    
    # Step 1: Split into smaller batches
    batch_size = 50  # Adjust based on your LLM's token limit
    batches = [flashcards[i:i + batch_size] for i in range(0, len(flashcards), batch_size)]

    # Step 2: Process all batches in parallel
    tasks = [reduce_chain.ainvoke({"docs": batch}) for batch in batches]
    reduced_batches = await asyncio.gather(*tasks)  # Run all reduce steps concurrently

    # Step 3: Merge the reduced batches in a final reduce step
    final_response = await reduce_chain.ainvoke({"docs": reduced_batches})

    return {"flashcard_deck": final_response}


# Construct the graph: here we put everything together to construct our graph
graph = StateGraph(OverallState)
graph.add_node("generate_flashcards", generate_flashcards)
graph.add_node("generate_flashcard_deck", generate_flashcard_deck)
graph.add_conditional_edges(START, map_flashcards, ["generate_flashcards"])
graph.add_edge("generate_flashcards", "generate_flashcard_deck")
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
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=7000, chunk_overlap=300)
    chunks = text_splitter.split_documents(documents)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    deck = loop.run_until_complete(get_flashcard_deck(chunks))

    return deck