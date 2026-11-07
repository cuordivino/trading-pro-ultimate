import sqlite3
import time
from typing import Dict, Any

class TradeJournal:
    def __init__(self, db_path: str = "trade_audit_trail.db"):
        self.db_path = db_path
        with sqlite3.connect(self.db_path) as conn:
            conn.cursor().execute('''
                CREATE TABLE IF NOT EXISTS audit_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp REAL, ticker TEXT, action TEXT, confidence REAL, post_mortem TEXT
                )
            ''')
            conn.commit()

    def log(self, ticker: str, action: str, conf: float) -> int:
        with sqlite3.connect(self.db_path) as conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO audit_log (timestamp, ticker, action, confidence) VALUES (?, ?, ?, ?)", (time.time(), ticker, action, conf))
            conn.commit()
            return cur.lastrowid
