import os
import logging
from typing import Optional
from pathlib import Path
from llama_index.core import PromptTemplate
from llama_index.llms.ollama import Ollama
from vector_store import build_index

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "mistral:latest"

def check_ollama_available() -> bool:
    """Check if Ollama server is running and model is available"""
    try:
        import requests
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            models = response.json().get('models', [])
            return any(model['name'].startswith(OLLAMA_MODEL.split(':')[0]) for model in models)
    except Exception as e:
        logger.warning(f"Ollama check failed: {e}")
    return False

def answer_question(question: str) -> str:
    """Answer a question using RAG with local models
    
    Args:
        question: The question to answer
        
    Returns:
        str: The generated answer
    """
    if not question or not question.strip():
        return "Please provide a valid question."
        
    try:
        # Check if Ollama is available
        if not check_ollama_available():
            error_msg = (
                "Ollama server is not running or model is not available. "
                f"Please ensure Ollama is running and you have the '{OLLAMA_MODEL}' model downloaded."
            )
            logger.error(error_msg)
            return error_msg
        
        logger.info(f"Processing question: {question}")
        
        # Build or load the index
        logger.info("Building/loading index...")
        index = build_index()
        
        # Initialize the LLM with Ollama
        logger.info("Initializing LLM...")
        llm = Ollama(
            model=OLLAMA_MODEL,
            base_url=OLLAMA_BASE_URL,
            request_timeout=300,  # Increased timeout for local processing
            temperature=0.1,  # More focused and deterministic responses
            stream=False
        )
        
        # Create query engine with optimized parameters
        logger.info("Creating query engine...")
        
        # Define the QA template
        qa_template = PromptTemplate(
            "Context information is below.\n"
            "---------------------$\n"
            "{context_str}\n"
            "---------------------$\n"
            "Given the context information and not prior knowledge, "
            "answer the query in a clear and concise manner.\n"
            "Query: {query_str}\n"
            "Answer: "
        )
        
        query_engine = index.as_query_engine(
            llm=llm,
            similarity_top_k=3,  # Limit to top 3 most relevant chunks
            response_mode="compact",  # More concise responses
            text_qa_template=qa_template
        )
        
        # Execute the query
        logger.info("Executing query...")
        response = query_engine.query(question)
        
        # Log the response
        logger.info(f"Generated response: {response.response[:200]}..." if response and hasattr(response, 'response') else "No response generated")
        
        return response.response if response and hasattr(response, 'response') else "Sorry, I couldn't generate a response."
        
    except Exception as e:
        error_msg = f"Error processing your question: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return error_msg
