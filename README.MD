# Mumble — Real-Time Cross-Platform Chat

> A full-stack messaging platform built with React, React Native (Expo), Node.js, Socket.IO,
> and MongoDB. Designed to explore real-time system architecture, optimistic UI patterns,
> and cross-platform delivery across web and mobile from a shared backend.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active_Development-blue?style=flat-square)

---

## Live Demo

| Platform | Link |
|---|---|
| Web App | [Live](https://mumble-xi.vercel.app/) |
| Backend API | [Backend](https://mumble-2in9.onrender.com/api) |

> **Note:** The backend runs on Render's free tier and may take 30–60 seconds to respond
> after a period of inactivity (cold start). This is a known infrastructure limitation
> of the free deployment tier, not an application bug.

---

## About The Project

Mumble is a real-time messaging application that serves both a React web client and a
React Native (Expo) mobile app from a single Express/Bun backend. The project was built
to deeply explore several engineering problems that appear simple on the surface but
become non-trivial at implementation:

- **Real-time state synchronization** between server and multiple clients using WebSockets
- **Optimistic UI** — making message sending feel instantaneous despite network latency
- **Cross-platform delivery** — one backend, two clients, consistent behavior
- **Ephemeral vs. persistent state separation** — using Zustand for WebSocket state and
  TanStack Query for server cache, and correctly merging them

The architecture is production-inspired rather than production-ready. It implements
patterns used in real messaging systems — room-based broadcasting, personal user channels,
optimistic cache mutations — while being honest about the scalability constraints of a
single-instance deployment.

---

## Project Status

**Active Development** — Core messaging functionality is complete and deployed.
Known limitations around horizontal scaling (in-memory presence tracking, no message
pagination) are documented and represent the next engineering iteration.

---

## Why I Built This

Most tutorials build chat apps that demonstrate WebSocket syntax. This project was an
attempt to go further: to understand what it actually takes to make a chat application
feel fast, consistent, and correct under real network conditions.

Specific engineering questions I wanted to answer:

1. How do you reconcile optimistic UI mutations with authoritative server state without
   creating race conditions or ghost messages?
2. How should real-time ephemeral state (typing, online status) be separated from
   cached server state (messages, chat history) at the architecture level?
3. What does cross-platform delivery actually require when the mobile and web clients
   have different networking constraints and lifecycle behaviors?

---

## Features

### Core Messaging
- One-on-one real-time chat via WebSocket
- Instant message delivery with sub-100ms perceived latency (optimistic UI)
- Persistent message history backed by MongoDB
- Chat list with last message preview and relative timestamps

### Real-Time Presence
- Live online/offline status indicators
- Per-chat typing indicators with 2-second debounce
- Unread message tracking per chat (mobile)
- Personal user channels for sidebar updates without full room join

### Authentication
- Google OAuth and Apple Sign-In via Clerk
- Secure JWT verification on both HTTP and WebSocket connections
- Automatic user profile sync between Clerk and application database
- Session persistence across app restarts (Expo SecureStore)

### Application Features
- Profile editing with first/last name update
- In-app support ticket system (bug, feature request, help, other)
- App rating and feedback collection
- Animated auth screen with gradient orbs

### Engineering Features
- Optimistic message updates with automatic rollback on socket error
- Room-based broadcast architecture (`chat:${id}` + `user:${id}` personal rooms)
- TanStack Query cache mutations driven by socket events
- Graceful reconnection handling in Socket.IO client

---

## Tech Stack

### Frontend — Web

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI rendering and component model |
| Vite | 7 | Build tool and dev server |
| TanStack Query | 5 | Server state caching and synchronization |
| Zustand | 5 | Ephemeral real-time state (socket, presence) |
| Tailwind CSS | v4 | Utility-first styling |
| DaisyUI | 5 | Component primitives over Tailwind |
| Socket.IO Client | 4.8 | WebSocket abstraction with fallbacks |
| Axios | 1.13 | HTTP client with interceptor support |
| Clerk React | 5 | Authentication and OAuth UI |
| React Router | 7 | Client-side routing |

### Frontend — Mobile

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.81 | Cross-platform mobile UI |
| Expo | 54 | Managed workflow, native modules |
| Expo Router | 6 | File-based navigation |
| NativeWind | 4 | Tailwind CSS for React Native |
| TanStack Query | 5 | Same server state pattern as web |
| Zustand | 5 | Same socket store pattern as web |
| Clerk Expo | 2 | OAuth (Google + Apple) for mobile |
| Expo SecureStore | 15 | Encrypted token persistence |
| Sentry React Native | 7 | Crash reporting and performance monitoring |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Bun | Latest | JavaScript runtime (faster than Node for I/O) |
| Express | 5 | HTTP server and routing |
| Socket.IO | 4.8 | WebSocket server with rooms and namespaces |
| Mongoose | 9 | MongoDB ODM with schema validation |
| Clerk Express | 1.7 | JWT verification middleware |
| CORS | 2.8 | Cross-origin resource sharing |

---

## Architecture

### System Overview

# System Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                           Clients                            │
│                                                              │
│   ┌─────────────────┐         ┌──────────────────────┐       │
│   │   React Web     │         │   React Native App   │       │
│   │  (Vite + SPA)   │         │   (Expo Router)      │       │
│   │                 │         │                      │       │
│   │ TanStack Query  │         │ TanStack Query       │       │
│   │ Zustand Store   │         │ Zustand Store        │       │
│   └────────┬────────┘         └──────────┬───────────┘       │
│            │ HTTP + WebSocket            │ HTTP + WebSocket  │
└────────────┼─────────────────────────────┼──────────────────-┘
             │                             │
             ▼                             ▼
┌──────────────────────────────────────────────────────────────┐
│                  Express + Bun Backend                       │
│                                                              │
│ clerkMiddleware() → protectRoute[] → Controllers             │
│                                                              │
│ Socket.IO Server                                             │
│ ├── io.use() — JWT verify + User lookup                      │
│ ├── Rooms: chat:{id}, user:{id}                              │
│ └── Events: send-message, typing, join-chat                  │
│                                                              │
│ REST API                                                     │
│ ├── /api/auth                                                │
│ ├── /api/chats                                               │
│ ├── /api/messages                                            │
│ ├── /api/users                                               │
│ ├── /api/support                                             │
│ └── /api/ratings                                             │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  MongoDB Atlas  │
                   │                 │
                   │  Users          │
                   │  Chats          │
                   │  Messages       │
                   │  Support        │
                   │  Ratings        │
                   └─────────────────┘
                            ▲
                            │
                   ┌─────────────────┐
                   │ Clerk Platform  │
                   │   (Auth/JWT)    │
                   └─────────────────┘
```

---

# Real-Time Message Flow

```text
User sends message
│
▼
sendMessage(chatId, text, currentUser)
│
├──► Optimistic update:
│     Inject tempId message into TanStack Query cache
│     [Perceived latency: 0ms]
│
├──► socket.emit("send-message", { chatId, text })
│
│    Backend receives:
│    ├── Chat.findOne({ _id, participants })
│    │     → verify membership
│    │
│    ├── Message.create({ chat, sender, text })
│    │
│    ├── Chat.findByIdAndUpdate({
│    │      lastMessage,
│    │      lastMessageAt
│    │   })
│    │
│    └── message.populate("sender")
│
├──► io.to(chat:${chatId}).emit("new-message", message)
│     [Delivers to chat participants]
│
└──► io.to(user:${participantId}).emit("new-message", message)
      [Updates sidebar chat list]

Client receives "new-message":
├── Filter temp- messages from cache
├── Inject real message (dedup by _id)
└── Update chat.lastMessage in chats cache
```

---

# Authentication Flow

## Mobile OAuth Flow

```text
startSSOFlow("oauth_google")
    ↓
Expo AuthSession
    ↓
Clerk OAuth
    ↓
setActive({ session })
    ↓
Clerk JWT stored in SecureStore
```

---

## API Authentication Flow

```text
getToken()
    ↓
Authorization: Bearer <clerk_jwt>
    ↓
clerkMiddleware() verifies signature
    ↓
requireAuth() enforces presence
    ↓
User.findOne({ clerkId })
    ↓
req.userId
```

---

## Socket Authentication Flow

```text
socket.handshake.auth.token
    ↓
verifyToken()
    ↓
User.findOne({ clerkId })
    ↓
socket.data.userId
```

---

# Folder Structure

```text
mumble/
├── backend/
│   ├── index.ts
│   └── src/
│       ├── config/
│       │   └── database.ts
│       │
│       ├── controllers/
│       │   ├── authControllers.ts
│       │   ├── chatController.ts
│       │   ├── messageController.ts
│       │   ├── userController.ts
│       │   ├── supportController.ts
│       │   └── ratingController.ts
│       │
│       ├── middleware/
│       │   ├── auth.ts
│       │   └── errorHandler.ts
│       │
│       ├── models/
│       │   ├── User.ts
│       │   ├── Chat.ts
│       │   ├── Message.ts
│       │   ├── Support.ts
│       │   └── Rating.ts
│       │
│       ├── routes/
│       │
│       ├── scripts/
│       │   └── seed.ts
│       │
│       └── utils/
│           └── socket.ts
│
├── web/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       │   ├── axios.js
│       │   ├── socket.js
│       │   └── utils.js
│       │
│       └── pages/
│           ├── HomePage.jsx
│           └── ChatPage.jsx
│
├── mobile/
│   ├── app/
│   │   ├── (auth)/index.tsx
│   │   ├── (tabs)/
│   │   │   ├── index.tsx
│   │   │   └── profile.tsx
│   │   │
│   │   ├── chat/[id].tsx
│   │   └── new-chat/index.tsx
│   │
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   │   ├── axios.ts
│   │   └── socket.ts
│   │
│   └── types/index.ts
│
└── Dockerfile
```

---

---

## Installation

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Node.js](https://nodejs.org) >= 18 (for Expo tooling)
- MongoDB Atlas cluster (or local MongoDB)
- Clerk account and application

### Backend

```bash
cd backend
bun install

# Create .env
cp .env.example .env
# Fill in: MONGODB_URI, CLERK_SECRET_KEY, FRONTEND_URL, PORT

bun run dev
```

### Web Frontend

```bash
cd web
bun install

# Create .env
echo "VITE_CLERK_PUBLISHABLE_KEY=pk_test_..." > .env
echo "VITE_API_URL=http://localhost:3000" >> .env

bun run dev
```

### Mobile

```bash
cd mobile
bun install

# Create .env.local
echo "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_..." > .env.local

npx expo start
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>
CLERK_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:5173
```

### Web (`web/.env`)

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000
```

### Mobile (`mobile/.env.local`)

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SENTRY_DSN=https://...
```

> The mobile `socket.ts` currently contains a hardcoded production URL.
> This is a known issue tracked in the technical debt section below.

---

## API Documentation

All endpoints require `Authorization: Bearer <clerk_jwt>` unless noted.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/auth/me` | Required | Get current user profile |
| `POST` | `/api/auth/callback` | Public | Sync Clerk user to database |

### Chats

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/chats` | List all chats for authenticated user |
| `POST` | `/api/chats/with/:participantId` | Get or create 1:1 chat |

### Messages

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/messages/chat/:chatId` | Fetch all messages for a chat |

> Message sending is handled exclusively over WebSocket (`send-message` event),
> not via REST. This is an intentional architectural decision for real-time delivery.

### Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List all users (excluding self) |
| `PUT` | `/api/users/profile` | Update authenticated user's name/avatar |

### Support

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/support` | Create support ticket |
| `GET` | `/api/support` | List user's own tickets |
| `GET` | `/api/support/:ticketId` | Get specific ticket |

### WebSocket Events

**Client → Server**

| Event | Payload | Description |
|---|---|---|
| `join-chat` | `chatId: string` | Join a chat room to receive messages |
| `leave-chat` | `chatId: string` | Leave a chat room |
| `send-message` | `{ chatId, text }` | Send a message (persisted server-side) |
| `typing` | `{ chatId, isTyping }` | Broadcast typing indicator |

**Server → Client**

| Event | Payload | Description |
|---|---|---|
| `new-message` | `Message` | A new message in a joined chat |
| `online-users` | `{ userIds: string[] }` | Initial list of online users on connect |
| `user-online` | `{ userId }` | A user connected |
| `user-offline` | `{ userId }` | A user disconnected |
| `typing` | `{ userId, chatId, isTyping }` | Typing state update |
| `socket-error` | `{ message }` | Server-side socket error |

---

## Screenshots

> Screenshots to be added. The following views exist in the application:

| View | Description |
|---|---|
| <img width="1914" height="867" alt="Screenshot 2026-05-26 212051 - Copy (2)" src="https://github.com/user-attachments/assets/0f87c67a-6f89-40ff-aec5-ef3bf11a54f0" /> | Landing page with auth buttons |
| <img width="1918" height="858" alt="image" src="https://github.com/user-attachments/assets/c4294ae8-eece-4d42-9334-2116e38e9f35" /> | Web chat interface with sidebar |
| <img width="356" height="738" alt="image" src="https://github.com/user-attachments/assets/c4fec999-9b8d-41ab-bb01-45d68be70f49" /> | Mobile OAuth screen with animated background |
| <img width="367" height="737" alt="image" src="https://github.com/user-attachments/assets/26f7e767-2f52-4f23-90c2-aedf9385704c" /> | Mobile chat |

---

## Performance Considerations

### Implemented

- **Optimistic UI**: Messages appear in the UI before server acknowledgment.
  On socket error, the optimistic entry is rolled back via TanStack Query cache mutation.
- **Debounced typing events**: Typing indicators use a 2-second debounce to prevent
  socket flooding on every keystroke.
- **Selective broadcasting**: Messages are emitted to specific Socket.IO rooms
  (`chat:${id}`) rather than broadcasting to all connected clients.
- **Personal user rooms**: Each user has a personal room (`user:${id}`) for chat list
  updates, avoiding the need for all users to join every chat room.
- **TanStack Query deduplication**: Identical queries within the active window share
  a single network request.

### Known Bottlenecks

- **No message pagination**: All messages for a chat are fetched in a single query.
  A chat with thousands of messages will cause slow load times and high memory usage.
- **Missing index on `Chat.participants`**: Chat list queries perform a collection scan.
  At scale, this becomes a critical performance bottleneck.
- **Set/Map recreation in Zustand**: Online user state recreates a new `Set` on every
  presence event, triggering re-renders in all subscribed components.

---

## Tradeoffs & Limitations

| Decision | Tradeoff Made | Alternative |
|---|---|---|
| Socket.IO over raw WebSockets | Transport fallbacks and rooms at the cost of ~40KB client overhead | `ws` library with custom room logic |
| MongoDB over PostgreSQL | Flexible schema, faster initial iteration; weaker consistency guarantees | PostgreSQL + Prisma for ACID compliance |
| Clerk over custom auth | Zero auth maintenance; vendor lock-in and cost at scale | Auth.js, Supabase Auth, custom JWT |
| In-memory presence tracking | Simple implementation; breaks with multiple server instances | Redis with `@socket.io/redis-adapter` |
| TanStack Query + Zustand | Clean separation of concerns; `queryClient` reference in Zustand store is architecturally awkward | Server-side state fully in TanStack Query with socket as side-effect driver |
| Bun runtime | Faster installs and I/O; known DNS SRV issues on Windows requiring the fallback logic in `database.ts` | Node.js for broader compatibility |

---

## Known Issues

- **Cold start latency**: Backend on Render free tier cold-starts after 15 minutes of
  inactivity. First request may take up to 60 seconds.
- **Hardcoded backend URL**: `mobile/lib/socket.ts` contains a hardcoded production
  URL. Should be driven by `EXPO_PUBLIC_API_URL` environment variable.
- **Error handler bug**: `errorHandler.ts` logs `"Error: , err.message"` with the
  comma inside the string literal — the actual error is not logged in production.
- **No message pagination**: All messages in a chat are fetched at once.
- **Optimistic update edge case**: Sending two messages in rapid succession can cause
  a race where `socket.once("socket-error")` only handles one failure.

---

## Challenges Faced

**Merging real-time socket events with TanStack Query's cache**

The most non-trivial engineering challenge was deciding where real-time state lived.
Messages need to be in the TanStack Query cache (so they persist across navigations
and benefit from automatic refetch). But Socket.IO events arrive outside React's
rendering cycle. The solution — storing a `queryClient` reference inside the Zustand
socket store and calling `setQueryData()` inside socket event handlers — works correctly
but creates an architectural dependency that is worth documenting as a design smell.

**Optimistic updates with reconciliation**

The naive optimistic update pattern (inject fake message, wait for server) breaks when
the server response identifies the real message differently from the temp entry. The
`startsWith("temp-")` filter-and-replace approach works but has edge cases with rapid
sequential sends, which required careful analysis.

**Cross-platform authentication lifecycle**

Clerk's Expo SDK uses SecureStore for token persistence but has a different token
refresh lifecycle than the browser SDK. Ensuring the mobile app re-authenticates
correctly after background/foreground transitions required understanding Expo's app
lifecycle and Clerk's `useAuth` hook behavior in React Native.

**Bun DNS SRV resolution on Windows**

The `database.ts` fallback mechanism was a direct response to Bun's known failure to
resolve `_mongodb._tcp.` SRV records on Windows. The fix — shelling out to `dig` or
`nslookup`, parsing their output, and constructing a standard `mongodb://` URI — is
well-documented in the codebase and demonstrates understanding of the MongoDB
connection string format at a lower level than typical tutorials cover.

---

## What I Learned

- **WebSocket room architecture**: How to structure Socket.IO rooms for both active-chat
  delivery and background chat-list updates without requiring every client to join every room
- **Optimistic UI reconciliation**: The mechanics of injecting, tracking, and rolling back
  client-side state before server confirmation arrives
- **State category separation**: The practical difference between server state (TanStack Query),
  ephemeral real-time state (Zustand), and local UI state (useState), and why conflating them
  creates bugs
- **Cross-platform delivery constraints**: How Expo's managed workflow affects native module
  availability, token storage, and OAuth flow differences between iOS and Android
- **Production deployment realities**: Cold starts, environment variable management, CORS
  configuration differences between Socket.IO and Express, and free-tier infrastructure limits
- **Scalability-first thinking**: Identifying that the in-memory presence Map, while simple,
  is an architectural ceiling that must be replaced with Redis before horizontal scaling is possible

---

## Future Scope

### Near-Term Engineering

- **Message pagination** — cursor-based, 50 messages per scroll, infinite scroll on mobile
- **Redis integration** — `@socket.io/redis-adapter` for horizontal scaling, Redis for presence
- **Message delivery status** — sent, delivered, read receipts using Socket.IO acknowledgements
- **Push notifications** — Expo Push Notifications for background message delivery on mobile

### Medium-Term Features

- **Media messages** — image sharing via S3/Cloudflare R2 with presigned URLs
- **Group chats** — extend the `participants` array beyond 2, update broadcast logic
- **Message search** — full-text search index on MongoDB or Elasticsearch integration
- **Message reactions** — emoji reactions on messages

### Architectural Evolution

- **Shared types package** — `packages/shared` with TypeScript interfaces and socket event enums
- **Service extraction** — separate the notification service and support service from the
  monolithic backend
- **Read-replica MongoDB** — separate read/write concerns for message history queries

---

## Repository Philosophy

This project was built with a **production-inspired, learning-first** mindset.
The architecture intentionally uses patterns that appear in real messaging systems —
WebSocket rooms, optimistic updates, cache-socket integration — rather than simplified
tutorial patterns. The documented limitations and technical debt are a deliberate
part of the project: understanding *why* something needs Redis, pagination, or indexing
is more valuable than not needing them because the project never had real traffic.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

## Contact

**Heramb Chaudhari**

[![GitHub](https://img.shields.io/badge/GitHub-Heramb1221-black?style=for-the-badge&logo=github)](https://github.com/Heramb1221)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Heramb%20Chaudhari-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/heramb-chaudhari)

[![Email](https://img.shields.io/badge/Email-hchaudhari1221%40gmail.com-red?style=for-the-badge&logo=gmail)](mailto:hchaudhari1221@gmail.com)
