# Book Club Frontend Implementation Plan

This document outlines the step-by-step implementation plan for the Book Club Frontend application, based on the provided high-level architecture and the API specifications. 

## User Review Required

> [!IMPORTANT]
> Please review the technical stack and phase breakdown below. Specifically, confirm if you want to use **Lucide-React** for icons, and if you want to include the **Groups/Posts** features (from the API docs) in Phase 6 as they were not explicitly mentioned in the original frontend plan markdown.

## Proposed Changes

We will build the frontend using React (Vite), React Router, TanStack Query, Axios, Zustand, and Tailwind CSS. The work will be broken down into 7 consecutive phases mapping to the backend API specs.

---

### Phase 1: Setup & Architecture (Agent 1)
- **Scaffold**: Initialize Vite React template.
- **Dependencies**: Install React Router, React Query, Axios, Zustand, Tailwind CSS, and Lucide React.
- **Configuration**: Setup Tailwind, PostCSS, and Vite configs.
- **Structure**: Create the folder hierarchy (`src/routes`, `src/api`, `src/features`, `src/components`, `src/hooks`, `src/store`, `src/utils`, `src/styles`).
- **Base Layout**: Setup root layout and basic placeholder routes (`/`, `/members`, `/books`, `/lending`, `/search`, `/groups`).

---

### Phase 2: API Layer & Hooks (Agent 2)
- **API Client**: Setup `axios.create` in `src/api/client.js` pointing to `http://localhost:3000/api`.
- **Query Client**: Setup TanStack Query provider in `main.jsx`.
- **Global Store**: Setup Zustand store for managing app-level state (e.g., a "Current System User" mock to bypass full authentication).
- **Core Hooks**: Setup boilerplate reusable hooks for generic API interactions and query invalidations.

---

### Phase 3: Members Feature (Agent 3)
- **API integrations**: Implement Axios calls for `/api/members`.
- **Hooks**: Create `useMembers`, `useMember`, `useCreateMember`, `useUpdateMember`, `useDeleteMember`.
- **Pages**: 
  - `MembersPage`: List all members in the system.
  - `MemberDetailPage`: Show member details and their associated books/groups.
- **Components**: Member cards, forms for creation and editing.

---

### Phase 4: Books Feature (Agent 4)
- **API integrations**: Implement Axios calls for `/api/books`.
- **Hooks**: Create `useBooks`, `useBook`, `useCreateBook`.
- **Pages**:
  - `BooksPage`: Discover all club books.
  - `BookDetailPage`: Book details including its owner and current lending status.
- **Components**: Book display cards, add new book modal/form.

---

### Phase 5: Lending & Transfers (Agent 5 - Core)
- **API integrations**: Implement endpoints for `/api/lend-requests` and `/api/transfers`.
- **Hooks**: Create hooks for requesting to borrow, approving, rejecting, returning, and transferring.
- **Pages**:
  - `LendingDashboard`: Track pending requests, lent books, and borrowed books.
- **Components**: Lend action buttons embedded inside the Book Detail views (Request to Borrow, Approve, Reject, Return), Transfer ownership modal.

---

### Phase 6: Search & Groups (Agent 6)
- **Search API**: Implement `/api/search/books` and `/api/search/who-has`.
- **Groups API**: Implement `/api/groups` and `/api/groups/:groupId/posts` (from backend docs).
- **Pages**:
  - `SearchPage`: Advanced filtering interface for discovering books contextually.
  - `GroupsPage`: Discover and interact with book club groups, allowing users to join and post.
- **Components**: Search bars, filter sidebars, group lists, forum-like post feeds.

---

### Phase 7: UI Polish & Aesthetics (Agent 7)
- **Styling**: Refine the Tailwind design system. Create a premium, dynamic interface with vibrant color palettes, glassmorphism, and sleek light/dark modes.
- **Micro-interactions**: Add responsive hover states, smooth CSS transitions, and loading skeletons to ensure the interface "feels alive".
- **SEO/Accessibility**: Ensure proper semantic HTML usage, contrasting text, and comprehensive page titles.
- **Responsiveness**: Validate the layout adapts flawlessly to mobile, tablet, and desktop viewports.

## Open Questions

> [!WARNING]
> - **Mock Authentication**: The API does not have an authentication layer (login/register). To support creating books/posts that require an `owner_id` or `author_id`, I propose creating a "Select Active User" dropdown or a Mocked "Current User" state in the Zustand store. Is that acceptable?
> - **Design Aesthetics**: Do you have any specific aesthetic preferences (e.g. minimalist light mode, vibrant dark mode) for the polished design?
> - **Groups Module**: Are you okay with formally including the Groups/Posts features into Phase 6 alongside Search?

## Verification Plan

### Automated/Manual Verification
- Execute `npm run dev` to ensure the application compiles cleanly.
- Navigate sequentially through all React Router paths to guarantee functional connectivity.
- Verify TanStack Query accurately fetches and syncs data from `localhost:3000/api`, and visually handles pending, error, and success states.
- Verify lending workflows logically update book statuses without page reloads.
- Verify UI aesthetics via visual inspection against a high-quality "premium design" standard.
