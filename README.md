# CallMissed AI Assistant

A premium, production-grade conversational workspace and multi-modal AI chatbot client built using **Next.js 15 App Router**, **React 19**, **TypeScript**, **Tailwind CSS**, and serverless Edge Route Handlers.

Designed with advanced glassmorphism, responsive mobile-first views, ambient backlighting, and fluid Framer Motion choreography, CallMissed AI Assistant matches the aesthetic standards of leading systems like ChatGPT and Perplexity.

---

## Key Features

1. **Streaming Chat Completions**: Integration with the `kimi-k2.7-code` model via secure streaming edge route handlers. Includes typing indicators, automatic scrolling, generation abort controls, and response regeneration.
2. **Text formatting & Rendering**: Extensive Markdown rendering, LaTeX mathematical expressions (via KaTeX), tables, lists, code block language badges, and clipboard copy commands.
3. **Multi-Modal Vision Capabilities**: Directly upload files, drag & drop images, or paste screenshots from the clipboard to run multi-modal visual queries.
4. **AI Image Generation (Dual-Engine)**: Trigger Google Gemini Imagen 4.0 (`imagen-4.0-generate-001`) or CallMissed `flux-2-klein-9b` text-to-image completions using trigger phrases like *"draw..."* or *"generate an image..."*. View generated outputs with options to copy the image binary to the clipboard, download locally, or open in a portal tab.
5. **MongoDB Server-Side History Sync**: Robust serverless CRUD operations syncing chat logs in real-time to a local MongoDB database or a remote MongoDB Atlas cloud cluster. Includes an offline LocalStorage cache fallback if the database server goes offline.
6. **Keyboard Shortcuts**: Native support for:
   - `Enter` (Send message)
   - `Shift + Enter` (Add newline)
   - `Ctrl + K` (Create new chat thread)
   - `Ctrl + /` (Toggle sidebar navigation)
7. **Robust Error Handling**: Distinct visual error states mapping CallMissed status codes (401 invalid key, 429 rate bounds, 500 server offline) with retry triggers.

---

## Tech Stack & Dependencies

- **Core**: Next.js 15 (App Router), React 19, TypeScript
- **Database**: MongoDB (Official Node Driver)
- **Styling & UI**: Tailwind CSS v3, Glassmorphism design tokens, Lucide Icons
- **Animations**: Framer Motion
- **Markdown & Math**: `react-markdown`, `remark-gfm` (Tables/checklists), `remark-math`, `rehype-katex` (LaTeX parsing)
- **Code Highlighting**: `react-syntax-highlighter` (Prism vscDarkPlus theme styling)
- **Forms & Validation**: `react-hook-form`, `zod`

---

## Folder Architecture

```
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts         # Edge stream wrapper for text completions
│   │   ├── chats/
│   │   │   └── route.ts         # MongoDB Serverless History CRUD routes [NEW]
│   │   ├── image/
│   │   │   └── route.ts         # Gemini Imagen 4.0 / CallMissed Flux Image router [UPDATED]
│   │   └── vision/
│   │       └── route.ts         # Multi-modal visual parser stream
│   ├── globals.css              # Glassmorphic utilities and variables
│   ├── layout.tsx               # Root layout config (Font Inter, Metadata)
│   └── page.tsx                 # Core UI workspace frame
├── components/
│   ├── ChatBubble.tsx           # Renders user query / model responses
│   ├── ChatWindow.tsx           # Scroll feed containing messages or guides
│   ├── ErrorCard.tsx            # Beautiful status alert cards
│   ├── GeneratedImageCard.tsx   # Displays image creations with actions
│   ├── GuideCard.tsx            # In-app setup instructions
│   ├── ImagePreview.tsx         # Pre-send vision file preview
│   ├── LoadingBubble.tsx        # Pulsing thinking skeleton loader
│   ├── MarkdownRenderer.tsx     # Custom MD and code highlighting
│   ├── MessageInput.tsx         # Expanding textarea with drag/drop & paste
│   ├── Navbar.tsx               # Top glass bar with stats and toggles
│   ├── SettingsModal.tsx        # Configure key override & params
│   ├── Sidebar.tsx              # Conversation list panel
│   ├── ThemeToggle.tsx          # Animate theme transitions
│   ├── TypingIndicator.tsx      # Multi-dot bouncing thinking indicator
│   └── UploadImageButton.tsx    # Triggers OS file dialog
├── hooks/
│   ├── useChat.ts               # State engine mapping API and DB sync [UPDATED]
│   ├── useLocalStorage.ts       # SSR-safe persistence hook
│   └── useTheme.ts              # Sync dark/light theme preference
├── lib/
│   ├── mongodb.ts               # Cached MongoDB connection manager [NEW]
│   └── utils.ts                 # Classname merger (cn) & date formatters
├── services/
│   └── api.ts                   # Client-side SSE stream parser and requests
└── types/
    └── chat.ts                  # Type definitions for messages and configs
```

---

## Local Configuration

Create a `.env.local` file in the root directory:

```env
# CallMissed API Credentials
CM_API_KEY=cm_your_key_here

# Alternative Keys (Optional)
ALT_API_KEY=AQ.your_gemini_api_key
GROQ_API_KEY=gsk_your_groq_api_key

# Database Configuration (Local or Atlas)
MONGODB_URI=mongodb://localhost:27017/callmissed
```

### Installation

1. Clone or copy files to your workspace directory.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```
4. Access the assistant at [http://localhost:3000](http://localhost:3000).

---

## Architectural Trade-offs & Improvements

1. **Unified State Management & DB Sync Hook**: Localizing thread lists, message payloads, and generation states within a unified `useChat` custom hook simplifies component boundaries and minimizes unnecessary sub-renders. It automatically synchronizes edits and logs in real-time to MongoDB while keeping LocalStorage active as an offline fallback cache.
2. **Edge Runtimes for Stream Transfers**: The text route handlers utilize standard Web Streams and are set to `runtime = 'edge'` to reduce cold starts and optimize content delivery speeds on serverless environments like Vercel.
3. **Cached DB Connectors**: In development mode, the database helper stores the connection promise globally, avoiding connection pool leakage and exhaustion errors commonly triggered by hot-reloads (HMR) in Next.js development.
4. **Resilient Dual-Engine Fallback**: The `/api/image` handler prioritizes Google Gemini's Imagen 4.0 engine when key setups are present. If billing limits or quota errors occur, it outputs the error explicitly so users understand the account status. If the key is absent, it seamlessly defaults to CallMissed Flux.
5. **SSR-Safe Hydration Guard**: Local storage operations are wrapped inside client-side mounting hooks to ensure standard static layouts generated on the server don't trigger hydration mismatches.
6. **Clipboard Blob Copy**: Rather than just copying the raw Base64 string, the copy tool converts the string into a binary PNG/JPEG blob. This allows standard clipboard pasting directly into graphic utilities.

