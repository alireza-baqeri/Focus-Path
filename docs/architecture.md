# Process Tracker - System Architecture

## Overview
Process Tracker is a full-stack Next.js application designed to help users track their daily learning, course progress, goals, and daily habits. It leverages a modern tech stack to provide a fast, responsive, and highly interactive user experience.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: NextAuth.js (v4)
- **Styling**: Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion

## Core Architectural Concepts

### 1. Server Components vs Client Components
The application strictly separates Server and Client boundaries to optimize performance:
- **Server Components (Default)**: Used for data fetching directly from the database (e.g., `src/app/page.tsx`). This ensures database credentials are never exposed and initial page loads are blazing fast (SSR).
- **Client Components (`"use client"` directive)**: Used wherever interactivity is required (e.g., `CourseTrackerContainer`, widgets handling user state, animations).

### 2. State Management
State management is localized to prevent unnecessary re-renders:
- **Local UI State**: Managed via React `useState` and `useReducer` (e.g., expanding/collapsing sections in course tracker, toggling settings).
- **Global State**: NextAuth's `useSession` is used for global user identity. User preferences (like Weather City or News Country) are fetched on the server and passed down as props to client widgets.
- **Optimistic Updates**: Core UI components (like marking a video as watched) use optimistic UI updates. The state is updated instantly in the browser, and the API request is sent in the background. If the request fails, the state is refreshed from the server.

### 3. Caching and Revalidation
Next.js aggressively caches data. To ensure widgets (like News and Weather) update immediately when the user changes their settings:
- The `/api/settings` route utilizes Next.js `revalidatePath("/")` upon successful saves.
- Client-side forms call `router.refresh()` to force the browser to fetch the newly rendered Server Components.

### 4. Layout Structure
- **Root Layout (`src/app/layout.tsx`)**: Wraps the entire application with NextAuth `<SessionProvider>`, Theme `<ThemeProvider>`, and renders the global `<Header>` and `<Footer>`.
- **Page Layouts**: Specific pages like `/courses` or `/settings` have their own nested layouts.
- **Motion Wrapper (`src/components/ui/motion-wrapper.tsx`)**: A reusable client component that wraps server-rendered children to provide Framer Motion staggered entrance animations without converting the entire page to a client component.
