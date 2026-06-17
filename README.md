# realAI - AI-Powered Semantic Search Engine

A production-ready fullstack AI search platform that lets users upload documents and ask questions in natural language. The system retrieves relevant document chunks using vector embeddings and generates intelligent answers using RAG (Retrieval-Augmented Generation) technology.

## 🚀 Features

### 🤖 AI-Powered Search
- Semantic search with vector embeddings
- RAG pipeline using LangChain + FAISS
- Streaming AI responses via Groq/HuggingFace
- Context-aware document retrieval

### 📄 Document Management
- Support for PDF, DOCX, TXT files
- Drag-and-drop upload interface
- Automatic text extraction and chunking
- File indexing progress tracking

### 💬 Intelligent Chat
- ChatGPT-like conversational interface
- Streaming responses with Markdown
- Conversation history and management
- Source citations for answers

### 🔐 Authentication & Security
- Email/password registration
- Google OAuth integration
- JWT-based session management
- Protected routes and API endpoints

### 💳 Subscription System
- Free plan with limited usage
- Pro plan with unlimited access
- Stripe payment integration
- Usage tracking and limits

### 🎨 Modern UI/UX
- Dark mode with AI-futuristic theme
- Glassmorphism effects and animations
- Fully responsive design
- Real-time loading states

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom design system
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion
- **Auth:** NextAuth.js (Google OAuth + Credentials)
- **Payments:** Stripe

### Backend
- **Framework:** Python FastAPI
- **AI/ML:** LangChain, Sentence Transformers, FAISS
- **LLM:** Groq API (Llama 3 70B)
- **Database:** MongoDB Atlas (via Motor/Beanie)
- **Auth:** JWT with python-jose
- **File Processing:** PyPDF2, python-docx

## 📦 Project Structure

```
realAI/
├── frontend/                # Next.js 15 Application
│   ├── src/
│   │   ├── app/            # App Router pages & API routes
│   │   ├── components/     # Reusable React components
│   │   │   ├── ui/         # Design system components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── landing/    # Landing page sections
│   │   │   ├── auth/       # Auth forms
│   │   │   ├── dashboard/  # Dashboard widgets
│   │   │   ├── chat/       # Chat interface
│   │   │   └── files/      # File manager
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   ├── store/          # Zustand state stores
│   │   └── types/          # TypeScript type definitions
│   ├── public/
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                 # Python FastAPI Server
│   ├── app/
│   │   ├── api/            # API route handlers
│   │   ├── core/           # Config, security, database
│   │   ├── models/         # MongoDB document models
│   │   ├── services/       # Business logic services
│   │   └── schemas/        # Pydantic request/response schemas
│   ├── requirements.txt
│   ├── .env
│   └── main.py
│
├── README.md
└── deployment.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account
- Groq API key (or HuggingFace)
- Stripe account (for subscriptions)
- Google OAuth credentials

### Frontend Setup

```bash
# Navigate to frontend directory
cd realAI/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Fill in your environment variables

# Run development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd realAI/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Fill in your environment variables

# Run the server
python -m app.main
```

### Environment Variables

#### Frontend (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/realai
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_pro_monthly
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/realai
DATABASE_NAME=realai
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
STRIPE_SECRET_KEY=sk_test_your-stripe-secret
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRO_PRICE_ID=price_pro_monthly
GROQ_API_KEY=your-groq-api-key
EMBEDDING_MODEL=all-MiniLM-L6-v2
LLM_MODEL=llama3-70b-8192
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List documents
- `DELETE /api/documents/{id}` - Delete document

### Search
- `POST /api/search` - Semantic search
- `GET /api/search/history` - Search history

### Chat
- `POST /api/chat/stream` - Streaming AI chat
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/conversations/{id}` - Get conversation
- `DELETE /api/chat/conversations/{id}` - Delete conversation

### Stripe
- `POST /api/stripe/create-checkout-session` - Upgrade to Pro
- `POST /api/stripe/create-portal-session` - Manage subscription
- `POST /api/stripe/webhook` - Stripe webhook

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - User management

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd realAI/frontend
vercel --prod
```

### Backend (Render)
1. Push to GitHub
2. Create new Web Service on Render
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. Add environment variables in Render dashboard

## 📄 License
MIT
