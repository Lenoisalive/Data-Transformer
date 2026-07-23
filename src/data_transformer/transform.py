from typing import Any


class Transformer:
    """Apply no-SQL operations to rows (list of dictionaries)."""

    def apply(self, rows: list[dict[str, Any]], operations: list[dict[str, Any]]) -> list[dict[str, Any]]:
        result = list(rows)

        for operation in operations:
            op = operation["op"]

            if op == "select":
                fields = operation["fields"]
                result = [{k: row.get(k) for k in fields} for row in result]
            elif op == "filter_eq":
                field = operation["field"]
                value = operation["value"]
                result = [row for row in result if row.get(field) == value]
            elif op == "sort":
                field = operation["field"]
                descending = operation.get("descending", False)
                result = sorted(result, key=lambda row: row.get(field), reverse=descending)
            else:
                raise ValueError(f"Unsupported operation: {op}")

        return result
