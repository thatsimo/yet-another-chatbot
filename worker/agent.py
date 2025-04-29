import os
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.chains.retrieval import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# More detailed prompt template
prompt_template = ChatPromptTemplate.from_messages([
    ("system", """You are an assistant tasked with answering questions based on the retrieved documents.
    
Context information is below:
{context}

Given the context information and not prior knowledge, answer the question: {input}""")
])

# Initialize Pinecone and other components
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
embeddings = OpenAIEmbeddings(model=os.getenv("EMBEDDING_MODEL"))
index = pc.Index(os.getenv("PINECONE_INDEX"))
llm = ChatOpenAI(model_name="gpt-4", temperature=0)
namespace_prefix = os.getenv("PINECONE_NAMESPACE")

def get_qa_chain(session_id: str):
    """Create and return a retrieval chain using the session namespace."""
    namespace = f"{namespace_prefix}-{session_id}"
    
    # Debug prints to verify namespace
    print(f"Using namespace: {namespace}")
    
    # Build a Pinecone vector store wrapper
    vector_store = PineconeVectorStore(
        index=index,
        embedding=embeddings,
        text_key="text",
    )
    
    # Configure retriever with more specific parameters
    retriever = vector_store.as_retriever(
        search_kwargs={
            "namespace": namespace,
            "k": 3,
        }
    )
    
    # Create the document chain
    combine_docs_chain = create_stuff_documents_chain(
        llm=llm,
        prompt=prompt_template,
    )
    
    # Create the retrieval chain
    qa_chain = create_retrieval_chain(
        retriever=retriever,
        combine_docs_chain=combine_docs_chain,
    )
    
    return qa_chain

def answer_query(session_id: str, query: str) -> str:
    """Run the RetrievalQA chain for a given session and query."""
    qa_chain = get_qa_chain(session_id)
    
    print(f"Processing query: {query}")
    
    query_embedding = embeddings.embed_query(query)
    print(f"Query embedding generated (first 3 values): {query_embedding[:3]}")
    
    response = qa_chain.invoke({"input": query})
    
    print(f"Retrieved documents: {len(response.get('context', []))}")
    if 'context' in response and response['context']:
        for i, doc in enumerate(response['context']):
            print(f"Document {i+1} snippet: {doc.page_content[:100]}...")
    
    print(f"Answer: {response['answer']}")
    return response['answer']

def verify_namespace(session_id: str):
    """Verify that documents exist in the specified namespace."""
    namespace = f"{namespace_prefix}-{session_id}"
    try:
        stats = index.describe_index_stats()
        namespaces = stats.get('namespaces', {})
        doc_count = namespaces.get(namespace, {}).get('vector_count', 0)
        print(f"Namespace {namespace} contains {doc_count} documents")
        return doc_count > 0
    except Exception as e:
        print(f"Error checking namespace: {e}")
        return False

def run_query_with_verification(session_id: str, query: str) -> str:
    if not verify_namespace(session_id):
        return "No documents found in the specified namespace. Please check your session ID or ensure documents have been uploaded."
    return answer_query(session_id, query)