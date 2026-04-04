# 📘 Frontend Implementation Plan — Book Club App

## 🧭 High-Level Architecture

**Tech Stack**
- React (Vite)
- React Router
- TanStack Query (React Query)
- Axios
- Zustand (optional)
- Tailwind CSS

---

## 🏗️ Project Structure

```
src/
├── main.jsx
├── App.jsx
├── routes/
├── api/
├── features/
├── components/
├── hooks/
├── store/
├── utils/
└── styles/
```

---

## 🧩 API Layer

### client.js
```js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});
```

---

## 🔁 Hooks Layer

Example:
```js
useQuery({
  queryKey: ["books"],
  queryFn: getBooks
});
```

---

## 🧠 Global Store

```js
import { create } from "zustand";
```

---

## 🧭 Routing

- `/`
- `/members`
- `/books`
- `/lending`
- `/search`

---

## 🧩 Feature Modules

### Members
- List
- Detail
- CRUD

### Books
- List
- Detail
- Status

### Lending (Core)
- Request
- Approve
- Return

### Search
- Filters
- Who-has feature

---

## 🔄 Data Flow

UI → Hooks → API → Backend → Cache → UI

---

## ⚡ Task Breakdown

### Agent 1 — Setup
- Vite
- Routing
- Tailwind

### Agent 2 — API + Hooks

### Agent 3 — Members

### Agent 4 — Books

### Agent 5 — Lending

### Agent 6 — Search

### Agent 7 — Polish

---

## 🧪 Testing

- React Testing Library
- API mocking

---

## 🚀 Deliverables

- Fully working frontend
- Clean architecture
- Modular codebase
