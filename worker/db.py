import sqlite3
from datetime import datetime,timezone
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()
DB_PATH = os.getenv("DATABASE_URL").replace("sqlite:///", "")
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
conn = sqlite3.connect(DB_PATH, check_same_thread=False)
cursor = conn.cursor()

# Create tables
cursor.execute("""
CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    created_at TEXT
)
""")
cursor.execute("""
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    filename TEXT,
    uploaded_at TEXT,
    FOREIGN KEY(session_id) REFERENCES sessions(session_id)
)
""")
cursor.execute("""
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    question TEXT,
    answer TEXT,
    timestamp TEXT,
    FOREIGN KEY(session_id) REFERENCES sessions(session_id)
)
""")
conn.commit()

def create_session(session_id: str):
    """Register a new session in DB."""
    cursor.execute(
        "INSERT INTO sessions(session_id, created_at) VALUES (?, ?)",
        (session_id, datetime.now(timezone.utc).isoformat())
    )
    conn.commit()


def log_file(session_id: str, filename: str):
    """Log uploaded file for session."""
    cursor.execute(
        "INSERT INTO files(session_id, filename, uploaded_at) VALUES (?, ?, ?)",
        (session_id, filename, datetime.now(timezone.utc).isoformat())
    )
    conn.commit()


def log_message(session_id: str, question: str, answer: str):
    """Log a Q&A message for session."""
    cursor.execute(
        "INSERT INTO messages(session_id, question, answer, timestamp) VALUES (?, ?, ?, ?)",
        (session_id, question, answer, datetime.now(timezone.utc).isoformat())
    )
    conn.commit()


def get_files(session_id: str) -> list[str]:
    """Return list of filenames uploaded for a session."""
    cursor.execute(
        "SELECT filename FROM files WHERE session_id = ? ORDER BY uploaded_at",
        (session_id,)
    )
    return [row[0] for row in cursor.fetchall()]


def get_messages(session_id: str) -> list[dict]:
    """Return list of Q&A messages for a session."""
    cursor.execute(
        "SELECT question, answer, timestamp FROM messages WHERE session_id = ? ORDER BY id",
        (session_id,)
    )
    return [
        {"question": q, "answer": a, "timestamp": ts}
        for q, a, ts in cursor.fetchall()
    ]


def get_sessions() -> list[dict]:
    """Return list of all sessions with creation timestamp."""
    cursor.execute("SELECT session_id, created_at FROM sessions ORDER BY created_at")
    return [{"session_id": sid, "created_at": ts} for sid, ts in cursor.fetchall()]