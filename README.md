# LiveOps Dashboard

A production-grade real-time operations dashboard built with React, TypeScript, and Server-Sent Events (SSE). This project demonstrates enterprise-level patterns for building resilient, real-time applications.

![Status](https://img.shields.io/badge/status-production--ready-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-blue)

## ✨ Features

### Real-Time Streaming
- **Server-Sent Events (SSE)** for efficient one-way data flow
- **Exponential backoff** with jitter for reconnection (1s → 2s → 4s → ... → 30s max)
- **Automatic reconnection** on network failures
- **Offline detection** pauses reconnection when `navigator.onLine` is false
- **Connection status indicator** in UI (Connected/Reconnecting/Offline)

### Event Management
- **Event deduplication** by ID to handle reconnection gracefully
- **Buffered updates** (250ms batches) prevent render storms during event bursts
- **Bounded event list** (max 500 events) with automatic pruning
- **Pause/Resume** live updates for investigation
- **Mark as read** individual or bulk events

### Advanced Filtering
- **Multi-select filters** by type, severity, and service
- **Search** with debounce (300ms)
- **Unread only** toggle
- **URL state synchronization** for shareable filtered views
- **Clear all filters** quick action

### Notifications
- **Toast notifications** for warning and critical events
- **Customizable muting** by event type and severity
- **Accessible** with ARIA live regions
- **Keyboard dismissal** support
- **Auto-dismiss** or persistent (critical events)

### Dashboard
- **Real-time stats** refreshed every 5 seconds
- **Bar charts** for events by type and severity
- **Unread count** synced with event store

### Settings
- **Notification preferences** with localStorage persistence
- **Mute specific types** (deploy, incident, payment, etc.)
- **Mute specific severities** (info, warning, critical)

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Routing** | React Router 6 |
| **Data Fetching** | TanStack Query |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS |
| **Validation** | Zod |
| **Testing** | Vitest + Testing Library |
| **API Mocking** | MSW |
| **Backend** | Node.js + Express + TypeScript |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

Run both client and server in parallel:

```bash
npm run dev
```

This starts:
- **Vite dev server** at http://localhost:5173
- **Node SSE server** at http://localhost:3001

### Build for Production

```bash
npm run build
npm run preview
```

### Testing

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test -- --watch
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

## 📁 Architecture

### Folder Structure

```
src/
├── app/                     # App shell (Router, Layout)
├── features/               # Feature modules
│   ├── events/            # Event feed, SSE, filters
│   │   ├── components/   # EventList, EventItem, EventFilters
│   │   ├── hooks/        # useEventStream, useEventFilters, useEventActions
│   │   ├── store/        # Zustand store for events
│   │   ├── EventsPage.tsx
│   │   └── EventDetailPage.tsx
│   ├── dashboard/         # Stats and charts
│   │   ├── components/   # StatCard, EventChart
│   │   └── DashboardPage.tsx
│   ├── settings/          # User preferences
│   │   ├── store/        # Settings store with localStorage
│   │   └── SettingsPage.tsx
│   └── auth/              # Fake login
│       └── LoginPage.tsx
├── components/            # Shared UI components
│   └── Toast/            # Toast notification system
├── lib/                   # Core utilities
│   ├── api.ts            # REST client with Zod validation
│   ├── queryClient.ts    # TanStack Query config
│   ├── urlState.ts       # URL sync utilities
│   └── sse/              # SSE client abstraction
│       ├── createSSEClient.ts  # Main SSE client
│       └── reconnection.ts     # Backoff algorithm
├── types/                 # TypeScript types + Zod schemas
│   └── event.ts
├── utils/                 # Helper functions
│   ├── buffer.ts         # Event buffering
│   └── dedup.ts          # Deduplication + bounding
└── test/                  # Test utilities
    └── setup.ts

server/
├── index.ts              # Express server
├── db.ts                 # In-memory database
├── stream.ts             # SSE handler
├── types.ts              # Server types
└── tsconfig.json

tests/
├── unit/                 # Unit tests
│   ├── reconnection.test.ts
│   ├── buffer.test.ts
│   ├── dedup.test.ts
│   └── urlState.test.ts
└── integration/          # Integration tests
    └── eventStore.test.tsx
```

### Real-Time Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       Browser                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  EventsPage                                       │  │
│  │    ↓                                              │  │
│  │  useEventStream() ────► SSE Client                │  │
│  │                           │                       │  │
│  │                           ├─► EventSource         │  │
│  │                           ├─► Reconnection Logic  │  │
│  │                           ├─► Offline Detection   │  │
│  │                           └─► Buffer (250ms)      │  │
│  │                                 │                 │  │
│  │                                 ↓                 │  │
│  │                           Event Store (Zustand)   │  │
│  │                                 │                 │  │
│  │                                 ├─► Deduplication │  │
│  │                                 ├─► Bounding      │  │
│  │                                 └─► Pause/Resume  │  │
│  │                                 │                 │  │
│  │                                 ↓                 │  │
│  │                           EventList (filtered)    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │ SSE Stream (/stream)
                           │
┌─────────────────────────────────────────────────────────┐
│                     Node Server                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Express Server (port 3001)                      │  │
│  │                                                   │  │
│  │  GET /stream ──────► SSE Handler                 │  │
│  │                       │                           │  │
│  │                       ├─► Track clients          │  │
│  │                       ├─► Heartbeat (30s)        │  │
│  │                       └─► Broadcast events       │  │
│  │                                                   │  │
│  │  Event Generator                                 │  │
│  │    ├─► Random events (2-8s)                     │  │
│  │    └─► Burst events (10% chance)                │  │
│  │                                                   │  │
│  │  REST API                                        │  │
│  │    ├─► GET /api/events                          │  │
│  │    ├─► GET /api/stats                           │  │
│  │    └─► POST /api/events/:id/read                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🔌 API Endpoints

### SSE Stream

```bash
# Subscribe to event stream
curl -N http://localhost:3001/stream
```

Receives real-time events as:
```
data: {"id":"evt_123","type":"deploy","severity":"info",...}
```

### REST Endpoints

```bash
# Get paginated events
curl http://localhost:3001/api/events?page=1&limit=50

# Get stats
curl http://localhost:3001/api/stats

# Get single event
curl http://localhost:3001/api/events/evt_123

# Mark event as read
curl -X POST http://localhost:3001/api/events/evt_123/read

# Mark multiple events as read
curl -X POST http://localhost:3001/api/events/read \
  -H "Content-Type: application/json" \
  -d '{"eventIds":["evt_123","evt_124"]}'

# Acknowledge incident
curl -X POST http://localhost:3001/api/events/evt_123/acknowledge

# Resolve incident
curl -X POST http://localhost:3001/api/events/evt_123/resolve

# Health check
curl http://localhost:3001/health
```

## 🎯 Key Design Decisions

### 1. SSE vs WebSocket

**Chose SSE** for several reasons:
- ✅ Simpler protocol (HTTP-based)
- ✅ Automatic reconnection built into EventSource API
- ✅ Perfect for unidirectional data flow (server → client)
- ✅ Works through most corporate firewalls
- ✅ No need for bidirectional communication in this use case

**Tradeoff**: Not suitable if client needs to send frequent updates to server (use WebSocket in that case).

### 2. Pause Behavior

**When paused, incoming events are ignored** (not queued).

**Alternative considered**: Queue events while paused and replay on resume.

**Why this approach**:
- ✅ Simpler mental model
- ✅ No memory unbounded growth during long pauses
- ✅ User explicitly pauses to focus on current view
- ✅ Resume starts fresh with new events

**Tradeoff**: Events arriving during pause are lost (acceptable for real-time monitoring).

### 3. Event Deduplication

**Events are deduplicated by ID**, with newer versions overriding older ones.

**Why this works**:
- ✅ Handles reconnection scenarios gracefully
- ✅ Allows server to send event updates
- ✅ Prevents duplicate UI entries

**Assumption**: Server uses consistent IDs and newer events have more recent data.

### 4. Buffering Strategy

**250ms batch window** for UI updates.

**Alternatives considered**:
- No buffering: Causes jank during bursts
- Longer window (1s): Feels less "real-time"

**Why 250ms**:
- ✅ Imperceptible delay for humans (~200ms threshold)
- ✅ Effectively batches rapid bursts
- ✅ Maintains "real-time" feel
- ✅ Prevents render storms (60fps = ~16ms frame budget)

### 5. Bounded Event List

**Max 500 events in memory**, oldest pruned first.

**Why bounded**:
- ✅ Prevents memory leaks on long-running sessions
- ✅ 500 events is ~2-3 hours at typical rates
- ✅ Older events less relevant for live ops

**Tradeoff**: Historical events pruned (acceptable; use REST API for history).

### 6. Exponential Backoff

**Formula**: `baseDelay * 2^attempt` with jitter and max cap.

**Example sequence**: 0-1s, 0-2s, 0-4s, 0-8s, 0-16s, 0-30s, 0-30s...

**Why this works**:
- ✅ Avoids thundering herd on server recovery
- ✅ Jitter spreads out reconnection attempts
- ✅ Cap prevents excessive delays
- ✅ Industry-standard pattern

## 🧪 Testing Strategy

### Unit Tests
- ✅ Backoff algorithm correctness
- ✅ Event deduplication logic
- ✅ Event buffering behavior
- ✅ URL state serialization

### Integration Tests
- ✅ Event store operations
- ✅ Filter combinations
- ✅ Mark read functionality

### Test Coverage

```bash
npm run test
```

Tests cover:
- Reconnection backoff delays with jitter
- Deduplication with ID conflicts
- Buffer batching within time window
- URL params roundtrip
- Event store state mutations

## 🐛 Known Limitations

1. **No persistence**: Events only in memory (lost on refresh)
2. **No authentication**: Fake login for demo purposes
3. **No real backend**: In-memory Node server (not production-ready)
4. **No virtualization**: List could lag with 500+ visible items
5. **No E2E tests**: Only unit and integration tests included

## 🚦 Performance Considerations

- ✅ **Memoized list rows** prevent unnecessary re-renders
- ✅ **Buffered updates** batch rapid events
- ✅ **Bounded list** prevents memory growth
- ✅ **Debounced search** (300ms) reduces filter recalculations
- ✅ **URL params replace** (not push) prevents history bloat

## 📊 Event Types

| Type | Icon | Description |
|------|------|-------------|
| `deploy` | 🚀 | Deployment events |
| `incident` | 🚨 | System incidents |
| `payment` | 💳 | Payment transactions |
| `signup` | 👤 | User registrations |
| `security` | 🔒 | Security alerts |

## 🎨 Severity Levels

| Severity | Color | Auto-dismiss | Use Case |
|----------|-------|--------------|----------|
| `info` | Blue | Yes (5s) | Normal operations |
| `warning` | Yellow | Yes (7s) | Degraded performance |
| `critical` | Red | **No** | Requires immediate action |

## 🔐 Security Considerations

⚠️ **This is a demo project**. For production:

- [ ] Implement real authentication (OAuth, JWT)
- [ ] Add CORS configuration for specific origins
- [ ] Validate and sanitize all inputs
- [ ] Rate limit API endpoints
- [ ] Use HTTPS only
- [ ] Implement CSP headers
- [ ] Add request signing for SSE streams
- [ ] Use environment variables for sensitive config

## 📱 Browser Compatibility

- ✅ Chrome/Edge 89+
- ✅ Firefox 88+
- ✅ Safari 15+
- ❌ IE 11 (no EventSource support)

## 🤝 Contributing

This is a demo project, but PRs are welcome!

1. Fork the repo
2. Create a feature branch
3. Add tests for new features
4. Ensure `npm run test` passes
5. Submit a PR

## 📝 License

MIT

---

**Built with ❤️ to demonstrate production-grade real-time patterns**

## 📚 Learning Resources

- [Server-Sent Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)
- [React Performance](https://react.dev/learn/render-and-commit)
- [TanStack Query](https://tanstack.com/query/latest)

## 🎓 What This Project Demonstrates

✅ **Production-grade SSE implementation** with resilience  
✅ **Exponential backoff** with jitter for reconnection  
✅ **Offline-aware networking** using `navigator.onLine`  
✅ **Event deduplication** for idempotency  
✅ **Buffered updates** to prevent render storms  
✅ **URL state management** for shareable views  
✅ **Zustand** for lightweight state  
✅ **TanStack Query** for REST endpoints  
✅ **Zod** for runtime validation  
✅ **Vitest** for modern testing  
✅ **TypeScript** end-to-end  
✅ **Accessible UI** with ARIA labels  
✅ **Clean architecture** with feature modules  

Perfect for interviews or as a reference implementation! 🚀