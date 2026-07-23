from typing import Any

from .database import SQLiteSource
from .transform import Transformer


class DoctorDataService:
    """Facade used by apps so doctors don't have to write SQL."""

    def __init__(self, source: SQLiteSource, transformer: Transformer | None = None):
        self._source = source
        self._transformer = transformer or Transformer()

    def get_data(
        self,
        table: str,
        *,
        limit: int = 100,
        operations: list[dict[str, Any]] | None = None,
    ) -> list[dict[str, Any]]:
        rows = self._source.fetch_rows(table, limit=limit)
        return self._transformer.apply(rows, operations or [])
