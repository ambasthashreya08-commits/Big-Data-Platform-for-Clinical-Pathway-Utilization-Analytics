from pathlib import Path
from sentence_transformers import SentenceTransformer
import numpy as np


# ============================================================
# PATHS
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parents[1]

KNOWLEDGE_BASE_DIR = BACKEND_DIR / "knowledge_base"


# ============================================================
# EMBEDDING MODEL
# ============================================================

print("Loading CAREBRIDGE RAG embedding model...")

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("CAREBRIDGE RAG embedding model loaded.")


# ============================================================
# KNOWLEDGE STORAGE
# ============================================================

documents = []
embeddings = []


# ============================================================
# TEXT CHUNKING
# ============================================================

def chunk_text(text: str, chunk_size: int = 500):

    words = text.split()

    chunks = []

    for i in range(0, len(words), chunk_size):

        chunk = " ".join(
            words[i:i + chunk_size]
        )

        if chunk.strip():
            chunks.append(chunk)

    return chunks


# ============================================================
# LOAD KNOWLEDGE BASE
# ============================================================

def load_knowledge_base():

    global documents
    global embeddings

    documents = []
    embeddings = []

    if not KNOWLEDGE_BASE_DIR.exists():

        print(
            "WARNING: knowledge_base directory does not exist."
        )

        return

    for file_path in KNOWLEDGE_BASE_DIR.glob("*.txt"):

        try:

            text = file_path.read_text(
                encoding="utf-8"
            )

            chunks = chunk_text(text)

            for chunk in chunks:

                documents.append({
                    "source": file_path.name,
                    "text": chunk
                })

            print(
                f"Loaded {file_path.name}: "
                f"{len(chunks)} chunks"
            )

        except Exception as e:

            print(
                f"Could not load {file_path.name}: {e}"
            )


    if not documents:

        print("WARNING: No documents found.")

        return


    texts = [
        document["text"]
        for document in documents
    ]


    embeddings = embedding_model.encode(
        texts,
        normalize_embeddings=True
    )


    embeddings = np.array(
        embeddings
    )


    print(
        f"RAG knowledge base loaded: "
        f"{len(documents)} chunks"
    )


# ============================================================
# RETRIEVE RELEVANT KNOWLEDGE
# ============================================================

def retrieve_relevant_context(
    query: str,
    top_k: int = 3
):

    if not documents:

        return []


    query_embedding = embedding_model.encode(
        [query],
        normalize_embeddings=True
    )[0]


    scores = np.dot(
        embeddings,
        query_embedding
    )


    top_indices = np.argsort(
        scores
    )[::-1][:top_k]


    results = []


    for index in top_indices:

        results.append({
            "source": documents[index]["source"],
            "text": documents[index]["text"],
            "score": float(scores[index])
        })


    return results


# ============================================================
# FORMAT RAG CONTEXT
# ============================================================

def get_rag_context(
    query: str,
    top_k: int = 3
):

    results = retrieve_relevant_context(
        query,
        top_k
    )


    if not results:

        return (
            "No relevant information was found "
            "in the CAREBRIDGE knowledge base."
        )


    context_parts = []


    for result in results:

        context_parts.append(
            f"""
SOURCE: {result["source"]}

{result["text"]}
"""
        )


    return "\n".join(
        context_parts
    )


# ============================================================
# INITIAL LOAD
# ============================================================

load_knowledge_base()