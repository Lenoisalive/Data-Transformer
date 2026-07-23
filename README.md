# Data-Transformer

Super-basic infrastructure for getting data from databases and manipulating it **without writing SQL**.

## What is included

- `SQLiteSource`: reads rows from a SQLite table.
- `DoctorDataService`: high-level facade for data access.
- `Transformer`: supports no-SQL operations on rows:
  - `filter_eq` (exact value filter)
  - `sort`
  - `select` (pick fields)

## Quick example

```python
from src.data_transformer import DoctorDataService, SQLiteSource

source = SQLiteSource("clinic.db")
service = DoctorDataService(source)

rows = service.get_data(
    "patients",
    operations=[
        {"op": "filter_eq", "field": "condition", "value": "diabetes"},
        {"op": "sort", "field": "age", "descending": True},
        {"op": "select", "fields": ["name", "age"]},
    ],
)
```

## Run tests

```bash
python -m unittest discover -s tests -p 'test_*.py' -v
```
