You are a senior full-stack mobile engineer and product architect. Build a 
complete, production-ready Progressive Web App (PWA) called **"Snap. Talk. Fit."**
— an AI-powered in-store retail advisory platform for specialty sporting goods,
athletic recovery, and performance apparel shops. The app must feel native on 
mobile (iOS + Android) while running entirely in the browser as a PWA.

════════════════════════════════════════
PRODUCT OVERVIEW
════════════════════════════════════════

A customer:
1. Takes ONE photo of themselves + writes a short prompt 
   ("I need trail shoes for my bad ankle")
2. The AI reads the photo (estimating build/frame/proportions) + prompt, 
   then generates DYNAMIC follow-up questions — no fixed script, fully adaptive
3. After the conversation, the AI returns a RANKED, rationale-backed product 
   list pulled EXCLUSIVELY from that store's live inventory

════════════════════════════════════════
TECH STACK
════════════════════════════════════════

MOBILE FRONTEND (PWA):
- React Native Web (react-native-web) — single codebase renders natively 
  on iOS/Android browser and desktop
- Expo (managed workflow) as the build/dev toolchain — target: web output
- React Navigation (native-stack) for screen routing
- Expo Camera — for in-app photo capture with one-tap shutter
- Expo Image Picker — fallback for photo library selection
- React Native Reanimated 3 — for fluid, native-feeling animations
- Zustand — global client state (session, inventory, auth)
- TanStack Query (React Query) — server state + caching
- NativeWind (Tailwind for React Native) — utility-first styling
- PWA manifest + service worker via expo-pwa or custom webpack config:
    * Installable ("Add to Home Screen") on iOS Safari + Android Chrome
    * Offline shell (cache app shell + last viewed inventory)
    * Background sync for session data
    * Push notifications (optional, for staff alerts)

BACKEND:
- Node.js + Express (TypeScript)
- Prisma ORM
- PostgreSQL (primary DB)
- Redis (session cache + rate limiting)
- Multer + Sharp (image upload + compression)
- Anthropic Claude API — model: claude-sonnet-4-20250514
- JWT authentication (kiosk mode + staff mode)
- OpenAPI 3.0 spec via swagger-jsdoc

════════════════════════════════════════
PWA REQUIREMENTS
════════════════════════════════════════

manifest.json:
  - name: "Snap. Talk. Fit."
  - short_name: "FitAdvisor"
  - display: "standalone"
  - orientation: "portrait"
  - theme_color: "#0A0A0A"
  - background_color: "#0A0A0A"
  - icons: [72, 96, 128, 144, 152, 192, 384, 512]px PNGs

Service Worker (Workbox):
  - Cache-first strategy for static assets + product images
  - Network-first for /api/* calls
  - Offline fallback screen when fully disconnected
  - Background sync queue for incomplete sessions

════════════════════════════════════════
SCREEN ARCHITECTURE (React Navigation)
════════════════════════════════════════

Stack Navigator screens:

1. HomeScreen          → Brand intro, "Start Session" CTA, store selector
2. CaptureScreen       → Full-screen Expo Camera view, shutter button, 
                         prompt text input below camera preview, 
                         "Analyze" submit button
3. ConsultScreen       → Chat-style interface; AI question bubbles animate in,
                         customer types or taps quick-reply chips to answer;
                         progress indicator (e.g. "2 of ~4 questions")
4. ResultsScreen       → Ranked product cards with match score, rationale,
                         size/color selectors, "Find on shelf" CTA
5. ProductDetailScreen → Full product detail, tech specs, in-stock status
6. StaffDashboard      → Inventory CRUD, session analytics (JWT-gated)

════════════════════════════════════════
DATABASE SCHEMA (Prisma)
════════════════════════════════════════

model Store {
  id        String    @id @default(cuid())
  name      String
  address   String
  timezone  String
  products  Product[]
  sessions  Session[]
  createdAt DateTime  @default(now())
}

model Product {
  id             String   @id @default(cuid())
  storeId        String
  store          Store    @relation(fields: [storeId], references: [id])
  sku            String   @unique
  name           String
  brand          String
  category       String   // "footwear" | "apparel" | "recovery" | "accessories"
  description    String
  price          Float
  inStock        Boolean  @default(true)
  stockQty       Int
  sizes          Json     // ["7","7.5","8","8.5","9","10","11","12"]
  colors         Json     // [{ name: "Midnight", hex: "#1a1a2e" }]
  tags           Json     // ["ankle-support","wide-toe-box","trail","waterproof"]
  imageUrl       String
  technicalSpecs Json     // { drop: "8mm", weight: "280g", waterproof: true }
  recommendations Recommendation[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Session {
  id                  String   @id @default(cuid())
  storeId             String
  store               Store    @relation(fields: [storeId], references: [id])
  status              String   @default("ACTIVE") // ACTIVE | COMPLETED | ABANDONED
  photoUrl            String
  initialPrompt       String
  bodyEstimate        Json     // { build: "athletic", frame: "medium", height: "~5'10" }
  conversationHistory Json     // [{ role: "assistant"|"user", content: "..." }]
  recommendationResult Json?
  recommendations     Recommendation[]
  createdAt           DateTime @default(now())
  completedAt         DateTime?
}

model Recommendation {
  id         String   @id @default(cuid())
  sessionId  String
  session    Session  @relation(fields: [sessionId], references: [id])
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  rank       Int
  rationale  String
  matchScore Float
  createdAt  DateTime @default(now())
}

════════════════════════════════════════
REST API ENDPOINTS  (/api/v1)
════════════════════════════════════════

AUTH
  POST  /auth/kiosk-token     → { storeId } → short-lived JWT for kiosk
  POST  /auth/staff-login     → { email, password } → staff JWT

INVENTORY
  GET   /inventory            → ?storeId=&category=&inStock=&search=&page=&limit=
  GET   /inventory/:id        → single product
  POST  /inventory            → create (staff only)
  PUT   /inventory/:id        → update (staff only)
  DELETE /inventory/:id       → soft delete (staff only)

SESSIONS (core AI flow)
  POST  /sessions
    body:  { storeId, photoBase64, prompt }
    returns: { sessionId, bodyEstimate, firstQuestion: string }

  POST  /sessions/:id/answer
    body:  { answer: string }
    returns: { nextQuestion: string | null, isComplete: boolean, questionsAsked: number }

  POST  /sessions/:id/recommend
    returns: {
      recommendations: [{
        rank: number,
        product: Product,
        rationale: string,
        matchScore: number
      }]
    }

  GET   /sessions/:id         → full session state
  PATCH /sessions/:id/status  → { status: "ABANDONED" } (kiosk reset)
  GET   /sessions             → ?storeId=&status=&page= (staff only)

ANALYTICS (staff only)
  GET   /analytics/top-products      → ?storeId=&days=30
  GET   /analytics/sessions-summary  → ?storeId=&days=30

════════════════════════════════════════
AI LOGIC — CLAUDE INTEGRATION
════════════════════════════════════════

The backend orchestrates THREE Claude calls per session:

CALL 1 — Photo + Prompt Analysis (POST /sessions)
  System: "You are a retail fit advisor. Analyze the customer photo and their 
  request. Estimate their physical build (frame size, proportions). Then 
  generate the single most important follow-up question to refine the 
  recommendation. Return JSON only:
  { bodyEstimate: { build, frame, heightEstimate }, firstQuestion: string }"

  User content: [image (base64), prompt text]

CALL 2 — Dynamic Follow-up (POST /sessions/:id/answer)
  System: "You are a retail fit advisor mid-consultation. Review the full 
  conversation history. Determine if you have enough information to make 
  confident recommendations. If yes, return { nextQuestion: null, isComplete: true }.
  If not, return the single most valuable next question.
  JSON only: { nextQuestion: string | null, isComplete: boolean }"

  User content: full conversationHistory array

CALL 3 — Ranked Recommendations (POST /sessions/:id/recommend)
  System: "You are a retail fit advisor. Based on this consultation, rank 
  the top 3 products from the provided inventory that best match this customer.
  Prioritize technical fit first, then aesthetics. For each, write a 2-sentence 
  rationale in second person ('This shoe will...'). 
  JSON only: { recommendations: [{ sku, rank, rationale, matchScore }] }"

  User content: { bodyEstimate, conversationHistory, inventory: Product[] }

════════════════════════════════════════
FOLDER STRUCTURE
════════════════════════════════════════

/
├── apps/
│   └── mobile/                  ← Expo React Native Web (PWA)
│       ├── app.json             ← Expo config (web output enabled)
│       ├── public/
│       │   ├── manifest.json
│       │   └── service-worker.js
│       └── src/
│           ├── screens/         ← HomeScreen, CaptureScreen, ConsultScreen,
│           │                       ResultsScreen, ProductDetailScreen, StaffDashboard
│           ├── components/      ← QuestionBubble, ProductCard, MatchBadge,
│           │                       CameraCapture, QuickReplyChips, Rationale
│           ├── store/           ← Zustand slices (session, auth, inventory)
│           ├── hooks/           ← useSession, useInventory, useCamera
│           ├── api/             ← TanStack Query + axios client
│           └── navigation/      ← React Navigation stack config
│
└── apps/
    └── api/                     ← Express backend
        ├── src/
        │   ├── routes/          ← auth, inventory, sessions, analytics
        │   ├── controllers/
        │   ├── services/
        │   │   ├── claude.service.ts   ← all 3 AI calls
        │   │   └── inventory.service.ts
        │   ├── middleware/      ← auth, rateLimiter, errorHandler
        │   ├── prisma/          ← schema.prisma + seed.ts
        │   └── utils/
        └── openapi.yaml         ← auto-generated API spec

════════════════════════════════════════
SEED DATA
════════════════════════════════════════

Seed the DB with:
- 1 store: "Peak Performance — Montreal"
- 20 products across categories: trail footwear, recovery sandals, 
  compression apparel, orthotics, training shoes
- Each product must have realistic technicalSpecs and at least 5 tags
- Mix of inStock: true/false

════════════════════════════════════════
DELIVERABLES
════════════════════════════════════════

Generate ALL of the following:
1. Full Expo PWA frontend (all 6 screens, fully functional)
2. Full Express API (all endpoints, Claude integration, auth middleware)
3. Prisma schema + migration + seed script
4. manifest.json + service-worker.js (Workbox)
5. openapi.yaml spec
6. .env.example for both apps
7. Root package.json with "dev", "build", "db:seed" scripts

Start with the Prisma schema and seed, then the Express API layer, then the 
Expo PWA frontend. Add inline comments explaining every non-obvious decision.