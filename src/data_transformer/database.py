import re
import sqlite3
from typing import Any

_TABLE_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


class SQLiteSource:
    """Minimal SQLite data source wrapper."""

    def __init__(self, db_path: str):
        self._conn = sqlite3.connect(db_path)
        self._conn.row_factory = sqlite3.Row

    def fetch_rows(self, table: str, limit: int = 100) -> list[dict[str, Any]]:
        if not _TABLE_RE.match(table):
            raise ValueError("Invalid table name")

        query = f"SELECT * FROM {table} LIMIT ?"
        rows = self._conn.execute(query, (limit,)).fetchall()
        return [dict(row) for row in rows]

    def close(self) -> None:
        self._conn.close()
