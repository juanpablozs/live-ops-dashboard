# LiveOps Dashboard

A production-grade real-time operations dashboard built with React, TypeScript, and Server-Sent Events (SSE).

## Features

- **Real-time Event Streaming** via Server-Sent Events (SSE)
- **Resilient Connection Management** with exponential backoff and offline detection
- **Event Deduplication** to prevent duplicate events on reconnection
- **Buffered Updates** to prevent render storms during bursts
- **Advanced Filtering** by type, severity, service, and read status
- **URL State Sync** for shareable filtered views
- **Notifications** for critical events with customizable muting
- **Bounded Event List** (max 500 events) with automatic pruning

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** for blazing-fast development
- **React Router** for routing
- **TanStack Query** for REST endpoint caching
- **Zustand** for lightweight state management
- **Tailwind CSS** for styling
- **Zod** for runtime validation
- **Vitest** + **Testing Library** for testing
- **MSW** for API mocking

## Getting Started

### Installation

```bash
npm install
```

### Development

Run both the client and server in parallel:

```bash
npm run dev
```

This starts:
- Vite dev server at http://localhost:5173
- Node SSE server at http://localhost:3001

### Testing

```bash
npm run test
```

## Architecture

### Real-Time Patterns

This dashboard demonstrates production-grade real-time patterns:

1. **SSE Client with Reconnection**
   - Exponential backoff with jitter (1s, 2s, 4s, ..., max 30s)
   - Automatic reconnection on disconnect
   - Offline detection (pauses reconnection when navigator.onLine is false)
   - Connection status indicator in UI

2. **Event Ingestion Pipeline**
   - Deduplication by event ID
   - Buffered updates (250ms batches) to avoid render storms
   - Bounded list (max 500 events) with oldest-first pruning

3. **Pause/Resume**
   - When paused, incoming events are ignored
   - Resume starts receiving events again
   - Useful when investigating specific events

### Folder Structure

```
src/
├── app/                 # App shell, router, layout
├── features/           # Feature modules
│   ├── events/        # Event feed, filters, SSE integration
│   ├── dashboard/     # Stats and charts
│   ├── settings/      # User preferences
│   └── auth/          # Login (fake auth)
├── components/        # Shared UI components
├── lib/               # Core utilities
│   ├── api.ts         # REST client
│   ├── queryClient.ts # TanStack Query config
│   ├── urlState.ts    # URL sync utilities
│   └── sse/           # SSE client abstraction
├── types/             # TypeScript types + Zod schemas
├── utils/             # Helper functions
└── test/              # Test utilities
```

## API Endpoints

### REST Endpoints

```bash
# Get paginated events
GET /api/events?page=1&limit=50

# Get stats
GET /api/stats

# Mark event as read
POST /api/events/:id/read

# Mark multiple events as read
POST /api/events/read
Body: { "eventIds": ["id1", "id2"] }

# Acknowledge incident
POST /api/events/:id/acknowledge

# Resolve incident
POST /api/events/:id/resolve
```

### SSE Endpoint

```bash
# Subscribe to event stream
GET /stream
```

## Key Decisions & Tradeoffs

### 1. SSE vs WebSocket
- **Chose SSE** for simplicity and unidirectional data flow
- SSE is perfect for event feeds (server → client)
- Fallback to polling not implemented (SSE widely supported)

### 2. Pause Behavior
- **Incoming events are ignored when paused**
- Alternative: queue events while paused (more complex)
- Chosen approach is simpler and more predictable

### 3. Deduplication
- Events deduplicated by ID
- New events override existing ones (assumes server sends updates)
- Handles reconnection scenarios gracefully

### 4. Buffering
- 250ms batch window for UI updates
- Prevents frame drops during event bursts
- Small enough for real-time feel, large enough to batch effectively

### 5. Bounded List
- Max 500 events in memory
- Oldest events pruned first
- Prevents memory leaks on long-running sessions

## Development Roadmap

- [x] Project scaffold and configuration
- [ ] Node server with SSE + REST endpoints
- [ ] SSE client with reconnection logic
- [ ] Events feed with filters
- [ ] Notifications and unread tracking
- [ ] Dashboard stats
- [ ] Settings persistence
- [ ] Comprehensive tests
- [ ] Documentation

## License

MIT

---

**Status**: 🚧 Work in Progress