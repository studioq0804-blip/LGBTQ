# Rainbow Mail - LGBTQ+ Matching App

A beautiful, inclusive matching app designed specifically for the LGBTQ+ community in Japan, featuring modern UI design and comprehensive accessibility features.

## ✨ Features

### 🌈 Inclusive Design
- **Comprehensive Identity Options**: Separate fields for pronouns, gender identity, and sexual orientation
- **Respectful Language**: Thoughtful Japanese localization with appropriate honorifics
- **Privacy-Focused**: Users can choose what information to share
- **Accessible UI**: Full keyboard navigation, screen reader support, and WCAG compliance

### 💫 Core Functionality
- **Smart Matching**: Profile discovery with like/pass system and match notifications
- **Real-time Chat**: Secure messaging with match-based access
- **Community Spaces**: Join groups, create posts, and interact with the community
- **Profile Management**: Comprehensive profile editing with photo upload
- **KYC Verification**: Identity verification flow for enhanced safety

### 🎨 Design Excellence
- **Mobile-First**: iOS-inspired design optimized for mobile devices
- **Smooth Animations**: Micro-interactions and transitions throughout
- **Rainbow Palette**: Thoughtfully chosen colors representing diversity
- **Professional UI**: Production-ready design with attention to detail

### 🔐 Safety & Privacy
- **Mock Authentication**: Email + verification code system (ready for real integration)
- **KYC Process**: Document verification flow for user safety
- **Report System**: Built-in safety features for community protection
- **Data Protection**: Privacy-conscious design with opt-in information sharing

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Prerequisites
- **Node.js 18+** (Vite 5 requires Node 18 or newer)
- **npm** (v9+ recommended)

### Available Scripts
- `npm run dev` — Start the Vite dev server (hot reload)
- `npm run build` — Build for production
- `npm run preview` — Preview the production build (default: http://localhost:4173)
- `npm run lint` — Lint the project

## 🖥️ Server Information

### Development Server
- **Framework**: Vite (React + TypeScript)
- **Port**: 5173 (default)
- **Hot Reload**: Enabled for instant development feedback
- **Build Tool**: Vite with optimized bundling

### Backend Architecture
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth with email verification
- **Storage**: Supabase Storage for profile images and documents
- **Edge Functions**: Supabase Edge Functions for serverless API endpoints

### Environment Configuration
```bash
# Required environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Production additional variables
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Setup
1. Create a project at https://supabase.com/ and get your project URL and anon key.
2. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Start the app with `npm run dev`.

### Local Demo Mode (no Supabase)
If `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are not set (or left as placeholders), the app runs in a safe local demo mode:
- Authentication flows simulate success and persist to `localStorage` under `rainbow-match-*` keys.
- Profiles, matching pools, and balances are stored locally for a complete demo experience.
- See `src/lib/supabase.ts` and `src/hooks/useAuth.ts` for fallback logic.

### Database Schema
- **profiles**: User profile information with LGBTQ+ inclusive fields
- **likes**: User interactions and matching system
- **matches**: Mutual like relationships
- **communities**: Community groups and membership
- **community_posts**: User-generated content in communities
- **messages**: Real-time chat functionality

### Security Features
- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication Required**: All operations require valid user session
- **Privacy Controls**: Users control visibility of personal information
- **Content Moderation**: Built-in reporting and blocking system

### Performance Optimizations
- **Image Optimization**: Automatic compression and resizing
- **Lazy Loading**: Components and images load on demand
- **Caching**: Efficient data caching with localStorage fallback
- **Bundle Splitting**: Optimized JavaScript bundles for faster loading

### Deployment Options
- **Vercel**: Recommended for frontend deployment
- **Netlify**: Alternative static hosting option
- **Supabase Hosting**: Full-stack deployment with database
- **Docker**: Containerized deployment for custom infrastructure

## 📱 App Flow

### Authentication
1. **Signup**: Email registration with verification code
2. **Login**: Returning user authentication
3. **KYC**: Identity verification with document upload
4. **Main App**: Access to full functionality

### Main Features
- **Match Tab**: Discover profiles with inclusive identity information
- **Chat Tab**: Message matched users with real-time updates
- **Community Tab**: Join groups and participate in discussions
- **Settings Tab**: Manage profile and app preferences

## 🎯 Demo Data

The app includes representative seed data:
- **5 diverse profiles** with various identity combinations
- **3 community groups** covering art, support, and events
- **Sample conversations** and posts for demonstration
- **Realistic Japanese content** throughout the interface

## 🔧 Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React for consistent iconography
- **State**: React hooks with localStorage persistence
- **i18n**: Japanese/English support with full translations
- **Mobile**: Responsive design with iOS-style interactions

## 🌐 Internationalization

Currently supports:
- **Japanese (ja)**: Primary language with natural expressions
- **English (en)**: Complete translation coverage

To add more languages, extend the `translations` object in `src/lib/i18n.ts`.

## 📚 Architecture

### Component Structure
```
src/
├── components/
│   ├── Auth/          # Login, signup, KYC flows
│   ├── Chat/          # Messaging interface
│   ├── Community/     # Group features
│   ├── Layout/        # Navigation and layout
│   ├── Match/         # Profile discovery
│   └── Settings/      # User preferences
├── hooks/             # Custom React hooks
├── lib/               # Utilities and i18n
├── data/              # Mock data and seed content
└── types/             # TypeScript definitions
```

### Key Design Decisions
- **Separation of Concerns**: Identity fields are separate for user comfort
- **Accessibility First**: ARIA labels, keyboard navigation, focus management
- **Mobile Optimized**: Touch-friendly targets and iOS-style interactions
- **Performance**: Optimized images, lazy loading, and efficient renders

## 🔄 Backend Integration Points

The app is designed for easy backend integration:

### API Endpoints (Mock)
```typescript
// Authentication
POST /api/auth/signup     // Email registration
POST /api/auth/verify     // Code verification
POST /api/auth/login      // User login

// Profiles
GET  /api/profiles        // Discovery feed
GET  /api/profiles/me     // Current user
PUT  /api/profiles/me     // Update profile

// Matching
POST /api/likes           // Like a profile
GET  /api/matches         // User matches

// Messaging
GET  /api/chats           // Chat threads
GET  /api/chats/:id       // Messages
POST /api/chats/:id/messages // Send message

// Communities
GET  /api/communities     // Available groups
POST /api/communities/:id/join   // Join community
GET  /api/communities/:id/posts  // Community posts
POST /api/communities/:id/posts  // Create post
```

### Database Schema (Recommended)
```sql
-- Core user data
users (id, email, verified_at, created_at)
profiles (user_id, display_name, pronouns, gender_identity, sexual_orientation, bio, age, city)

-- Matching system
likes (user_id, target_user_id, created_at)
matches (user_a, user_b, created_at)

-- Messaging
messages (match_id, sender_id, text, created_at)

-- Communities
communities (id, name, description, created_at)
community_members (community_id, user_id, joined_at)
community_posts (id, community_id, author_id, text, created_at)
```

### Applying Database Migrations
Run the SQL files in `supabase/migrations/` on your Supabase project (SQL Editor → Run):
- `20250821220308_rustic_disk.sql`
- `20250822164029_morning_sea.sql`

You can apply them in order using the Supabase SQL editor, or with the Supabase CLI if you already have a config. After applying, ensure RLS policies align with your needs.

## 🎨 Customization

### Color System
The app uses a comprehensive color palette defined in Tailwind:
- **Primary**: Purple (`#8B5CF6`) for main actions
- **Secondary**: Cyan (`#06B6D4`) for secondary elements
- **Accent**: Orange (`#F59E0B`) for highlights
- **Success/Warning/Error**: Standard semantic colors

### Typography
- **Headings**: Bold weights with proper line-height for readability
- **Body**: 150% line-height for comfortable reading
- **Japanese Text**: Optimized spacing and sizing for Japanese characters

## 🤝 Contributing

This app prioritizes inclusive design and accessibility. When contributing:

1. **Inclusive Language**: Use respectful, inclusive terminology
2. **Accessibility**: Ensure all features work with keyboard and screen readers
3. **Testing**: Test with diverse user scenarios and identity combinations
4. **Documentation**: Update docs to reflect changes

## 📄 License

MIT License - see LICENSE file for details

## 💝 Acknowledgments

- **LGBTQ+ Community**: For guidance on inclusive design practices
- **Accessibility Standards**: Following WCAG 2.1 guidelines
- **Japanese Localization**: Culturally appropriate translations and formatting
- **Modern Web Standards**: Using current best practices for React and TypeScript

---

**Rainbow Mail** - Connecting hearts, celebrating diversity 🌈