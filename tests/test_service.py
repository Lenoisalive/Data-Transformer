import os
import sqlite3
import tempfile
import unittest

from src.data_transformer import DoctorDataService, SQLiteSource


class DoctorDataServiceTests(unittest.TestCase):
    def setUp(self):
        fd, self.db_path = tempfile.mkstemp(suffix=".db")
        os.close(fd)

        conn = sqlite3.connect(self.db_path)
        conn.execute("CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, condition TEXT)")
        conn.executemany(
            "INSERT INTO patients (name, age, condition) VALUES (?, ?, ?)",
            [
                ("Alice", 60, "diabetes"),
                ("Bob", 45, "hypertension"),
                ("Carol", 52, "diabetes"),
            ],
        )
        conn.commit()
        conn.close()

        self.source = SQLiteSource(self.db_path)
        self.service = DoctorDataService(self.source)

    def tearDown(self):
        self.source.close()
        os.remove(self.db_path)

    def test_get_data_applies_operations_without_sql(self):
        rows = self.service.get_data(
            "patients",
            operations=[
                {"op": "filter_eq", "field": "condition", "value": "diabetes"},
                {"op": "sort", "field": "age", "descending": True},
                {"op": "select", "fields": ["name", "age"]},
            ],
        )

        self.assertEqual(rows, [{"name": "Alice", "age": 60}, {"name": "Carol", "age": 52}])

    def test_invalid_table_name_is_rejected(self):
        with self.assertRaises(ValueError):
            self.service.get_data("patients; DROP TABLE patients;")


if __name__ == "__main__":
    unittest.main()
