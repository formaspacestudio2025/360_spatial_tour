# Spatial Tours Backend API

Enterprise Spatial Operations Platform - Backend Server

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:3000
```

## API Endpoints

### Walkthroughs
- `GET /api/walkthroughs` - List all walkthroughs
- `GET /api/walkthroughs/:id` - Get walkthrough details
- `POST /api/walkthroughs` - Create walkthrough
- `PUT /api/walkthroughs/:id` - Update walkthrough
- `DELETE /api/walkthroughs/:id` - Delete walkthrough

### Scenes
- `GET /api/walkthroughs/:id/scenes` - List scenes
- `POST /api/walkthroughs/:id/scenes` - Upload scene (multipart/form-data)
- `GET /api/scenes/:id` - Get scene details
- `PUT /api/scenes/:id` - Update scene
- `DELETE /api/scenes/:id` - Delete scene

## Test the API

```bash
# Health check
curl http://localhost:3000/health

# Create walkthrough
curl -X POST http://localhost:3000/api/walkthroughs \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Building","description":"My first walkthrough"}'

# List walkthroughs
curl http://localhost:3000/api/walkthroughs

# Upload scene (replace {id} with actual walkthrough ID)
curl -X POST http://localhost:3000/api/walkthroughs/{id}/scenes \
  -F "image=@/path/to/360-image.jpg" \
  -F "room_name=Entrance"
```

## Tech Stack
- Express.js
- SQLite (better-sqlite3)
- Multer (file uploads)
- Sharp (image processing)
- TypeScript
