# API Documentation

This API uses OpenAPI 3.0 specification with Swagger UI for interactive documentation.

## Accessing the Documentation

Once the API server is running, you can access:

- **Swagger UI**: `http://localhost:8787/ui` - Interactive API documentation and testing interface
- **OpenAPI JSON**: `http://localhost:8787/doc` - Raw OpenAPI specification in JSON format

## Authentication

All `/v1/*` endpoints require authentication via Supabase JWT token.

### How to Authenticate in Swagger UI

1. Click the **Authorize** button at the top of the Swagger UI
2. Enter your Supabase JWT token in the format: `Bearer <your-token>`
   - Or just enter the token without "Bearer" prefix
3. Click **Authorize** and then **Close**

The token will be included in all subsequent API requests.

### Getting Your Token

From the frontend, you can get your token using:

```typescript
import { getSupabaseClient } from "@/lib/supabase-client";

const supabase = getSupabaseClient();
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

## API Endpoints

### Health Check
- **GET** `/health` - Check if the API server is running
- No authentication required

### Documents

#### Upload Document
- **POST** `/v1/upload`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file` (optional): File to upload (PDF, TXT, MD)
  - `text` (optional): Text content to upload
  - `title` (optional): Document title
- **Response**: Document ID and number of chunks created

#### Get Documents
- **GET** `/v1/documents`
- **Response**: List of all documents for the authenticated user

### Search

#### Semantic Search
- **POST** `/v1/search`
- **Body**:
  ```json
  {
    "query": "your search query",
    "topK": 5  // optional, default: 5
  }
  ```
- **Response**: Search results with AI-generated summary

### Chat

#### Chat with Knowledge Base
- **POST** `/v1/chat`
- **Body**:
  ```json
  {
    "query": "your question",
    "topK": 5  // optional, default: 5
  }
  ```
- **Response**: Streaming text response (text/plain)

## Testing with Swagger UI

1. Start the API server: `npm run dev:api`
2. Open `http://localhost:8787/ui` in your browser
3. Click **Authorize** and enter your JWT token
4. Expand any endpoint to see details
5. Click **Try it out** to test the endpoint
6. Fill in the parameters and click **Execute**

## Example cURL Commands

### Upload Document
```bash
curl -X POST "http://localhost:8787/v1/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "title=My Document"
```

### Search
```bash
curl -X POST "http://localhost:8787/v1/search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the main topic?", "topK": 5}'
```

### Chat
```bash
curl -X POST "http://localhost:8787/v1/chat" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain the key points"}'
```

### Get Documents
```bash
curl -X GET "http://localhost:8787/v1/documents" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

