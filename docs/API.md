# API Documentation

## Authentication API

### POST /api/auth/register

Register new user

**Request Body:**
\`\`\`json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "organizationId": "uuid"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "role": "viewer"
    },
    "token": "jwt-token"
  }
}
\`\`\`

### POST /api/auth/login

User login

**Request Body:**
\`\`\`json
{
  "email": "string",
  "password": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "role": "analyst"
    },
    "token": "jwt-token"
  }
}
\`\`\`

## Data Source API

### GET /api/datasources

Get data source list

**Query Parameters:**
- \`page\`: number (default: 1)
- \`limit\`: number (default: 10)

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "string",
        "type": "mysql",
        "host": "string",
        "database": "string"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
\`\`\`

### POST /api/datasources

Create data source

**Request Body:**
\`\`\`json
{
  "name": "Hospital DB",
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "database": "hospital",
  "username": "root",
  "password": "password"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Hospital DB",
    "type": "mysql",
    "createdAt": "2026-07-23T10:00:00Z"
  }
}
\`\`\`

### POST /api/datasources/:id/test

Test data source connection

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "connected": true,
    "message": "Connection successful"
  }
}
\`\`\`

### DELETE /api/datasources/:id

Delete data source

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Data source deleted successfully"
}
\`\`\`

## Database Explorer API

### GET /api/explorer/:datasourceId/databases

Get database list

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "databases": ["hospital", "clinic", "research"]
  }
}
\`\`\`

### GET /api/explorer/:datasourceId/tables

Get table list

**Query Parameters:**
- \`database\`: string

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "tables": ["patients", "appointments", "doctors"]
  }
}
\`\`\`

### GET /api/explorer/:datasourceId/table-schema

Get table schema

**Query Parameters:**
- \`database\`: string
- \`table\`: string

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "columns": [
      {
        "name": "id",
        "type": "int",
        "nullable": false,
        "key": "PRI"
      },
      {
        "name": "patient_name",
        "type": "varchar",
        "nullable": false,
        "key": ""
      }
    ]
  }
}
\`\`\`

## Workbench API

### POST /api/workbench/preview

Preview query results

**Request Body:**
\`\`\`json
{
  "dataSourceId": "uuid",
  "query": {
    "tables": ["patients"],
    "fields": ["id", "name", "age"],
    "filters": [
      {
        "field": "age",
        "operator": ">",
        "value": 18
      }
    ],
    "limit": 50
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "rows": [
      {"id": 1, "name": "John", "age": 25},
      {"id": 2, "name": "Jane", "age": 30}
    ],
    "total": 2,
    "sql": "SELECT id, name, age FROM patients WHERE age > 18 LIMIT 50"
  }
}
\`\`\`

### POST /api/workbench/export

Export data

**Request Body:**
\`\`\`json
{
  "dataSourceId": "uuid",
  "query": {
    "tables": ["patients"],
    "fields": ["id", "name", "age"]
  },
  "format": "csv"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "jobId": "uuid"
  }
}
\`\`\`

### GET /api/workbench/jobs/:jobId

Get export job status

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "fileUrl": "https://minio.example.com/exports/file.csv",
    "createdAt": "2026-07-23T10:00:00Z",
    "completedAt": "2026-07-23T10:05:00Z"
  }
}
\`\`\`

## User Management API

### GET /api/users

Get user list (Admin only)

**Query Parameters:**
- \`page\`: number (default: 1)
- \`limit\`: number (default: 10)
- \`role\`: string (optional)

### PUT /api/users/:id

Update user

**Request Body:**
\`\`\`json
{
  "role": "analyst",
  "isActive": true
}
\`\`\`

## Error Codes

| Status Code | Description |
|------------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error |

## Response Format

All API responses follow this standard format:

**Success:**
\`\`\`json
{
  "success": true,
  "data": { ... }
}
\`\`\`

**Error:**
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
\`\`\`
