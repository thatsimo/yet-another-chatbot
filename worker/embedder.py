import os
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(
    api_key=os.getenv("PINECONE_API_KEY")
)
_index = pc.Index(os.getenv("PINECONE_INDEX"))
_embedder = OpenAIEmbeddings(model=os.getenv("EMBEDDING_MODEL"))
_namespace_prefix = os.getenv("PINECONE_NAMESPACE")

def upload_to_pinecone(texts: list[str], metadatas: list[dict], session_id: str):
    """Generate embeddings and upsert into Pinecone under given namespace."""
    namespace = f"{_namespace_prefix}-{session_id}"
    embeddings = _embedder.embed_documents(texts)
    vectors = [(str(i), emb, metadatas[i]) for i, emb in enumerate(embeddings)]
    _index.upsert(vectors=vectors, namespace=namespace)