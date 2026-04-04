# 📚 Book Club API Documentation

**Base URL:** `http://localhost:3000`

---

## Table of Contents

- [Health Check](#health-check)
- [Members](#members)
- [Books](#books)
- [Lend Requests](#lend-requests)
- [Transfers](#transfers)
- [Search](#search)
- [Groups](#groups)
- [Posts](#posts)
- [Error Responses](#error-responses)

---

## Health Check

### `GET /api/health`

Returns server status.

**Response** `200`
```json
{
  "status": "ok",
  "timestamp": "2026-03-29T18:00:00.000Z"
}
```

---

## Members

### `POST /api/members`

Create a new member.

**Request Body**
| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | 1–100 characters |
| `email` | string | ✅ | Valid email, must be unique |
| `phone` | string | ❌ | Up to 20 characters |

**Example Request**
```json
{
  "name": "Alice Johnson",
  "email": "alice@bookclub.com",
  "phone": "555-0101"
}
```

**Response** `201`
```json
{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@bookclub.com",
  "phone": "555-0101",
  "created_at": "2026-03-29 18:00:00"
}
```

**Errors:** `400` Validation failed · `409` Email already exists

---

### `GET /api/members`

List all members, ordered by name.

**Response** `200` — Array of member objects.

---

### `GET /api/members/:id`

Get a single member by ID.

**Response** `200` — Member object.
**Errors:** `404` Member not found

---

### `PUT /api/members/:id`

Update a member. At least one field is required.

**Request Body** — Any combination of `name`, `email`, `phone`.

**Response** `200` — Updated member object.
**Errors:** `400` Validation · `404` Not found · `409` Email conflict

---

### `DELETE /api/members/:id`

Delete a member and all related data (cascading).

**Response** `200`
```json
{
  "message": "Member deleted",
  "member": { ... }
}
```

**Errors:** `404` Member not found

---

### `GET /api/members/:id/books`

List all books owned by a member.

**Response** `200` — Array of book objects.
**Errors:** `404` Member not found

---

### `GET /api/members/:id/groups`

List all groups a member belongs to (includes role and join date).

**Response** `200`
```json
[
  {
    "id": 1,
    "name": "Sci-Fi Enthusiasts",
    "description": "For fans of science fiction",
    "created_by": 2,
    "created_at": "2026-03-29 18:00:00",
    "role": "member",
    "joined_at": "2026-03-29 18:00:00"
  }
]
```

**Errors:** `404` Member not found

---

## Books

### `POST /api/books`

Add a new book to a member's collection.

**Request Body**
| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | 1–200 characters |
| `author` | string | ✅ | 1–200 characters |
| `isbn` | string | ❌ | Up to 30 characters |
| `genre` | string | ❌ | Up to 50 characters |
| `owner_id` | integer | ✅ | Must reference an existing member |

**Example Request**
```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "isbn": "978-0-44-117271-9",
  "genre": "Sci-Fi",
  "owner_id": 2
}
```

**Response** `201` — Created book object (status defaults to `"available"`).
**Errors:** `400` Validation · `404` Owner not found

---

### `GET /api/books`

List all books in the club. Includes `owner_name` via join.

**Response** `200`
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0-7432-7356-5",
    "genre": "Classic",
    "owner_id": 1,
    "status": "available",
    "created_at": "2026-03-29 18:00:00",
    "owner_name": "Alice Johnson"
  }
]
```

---

### `GET /api/books/:id`

Get a single book with owner name.

**Response** `200` — Book object with `owner_name`.
**Errors:** `404` Book not found

---

### `PUT /api/books/:id`

Update book info. At least one field required.

**Request Body** — Any combination of `title`, `author`, `isbn`, `genre`.

**Response** `200` — Updated book object.
**Errors:** `400` Validation · `404` Not found

---

### `DELETE /api/books/:id`

Remove a book.

**Response** `200`
```json
{ "message": "Book deleted", "book": { ... } }
```

**Errors:** `404` Book not found

---

## Lend Requests

Book statuses: `available` → `lent` → `available`
Request statuses: `pending` → `approved` / `rejected` → `returned`

### `POST /api/lend-requests`

Request to borrow a book.

**Request Body**
| Field | Type | Required | Description |
|---|---|---|---|
| `book_id` | integer | ✅ | Book to borrow |
| `borrower_id` | integer | ✅ | Member requesting |

**Example Request**
```json
{
  "book_id": 3,
  "borrower_id": 7
}
```

**Response** `201` — Created lend request (status: `"pending"`).

**Errors:**
- `400` Can't borrow own book · Book not available
- `404` Book / Borrower not found
- `409` Duplicate pending request

---

### `GET /api/lend-requests`

List lend requests with optional filters.

**Query Parameters**
| Param | Description |
|---|---|
| `status` | Filter by: `pending`, `approved`, `rejected`, `returned` |
| `borrower_id` | Filter by borrower |
| `owner_id` | Filter by book owner |

**Response** `200` — Array with `book_title`, `borrower_name`, `owner_name` joins.

---

### `PATCH /api/lend-requests/:id/approve`

Approve a pending request. **Also sets the book's status to `"lent"`.**

**Response** `200` — Updated request (status: `"approved"`, `approved_at` set).
**Errors:** `400` Not pending · `404` Not found

---

### `PATCH /api/lend-requests/:id/reject`

Reject a pending request.

**Response** `200` — Updated request (status: `"rejected"`).
**Errors:** `400` Not pending · `404` Not found

---

### `PATCH /api/lend-requests/:id/return`

Mark a borrowed book as returned. **Also sets the book's status back to `"available"`.**

**Response** `200` — Updated request (status: `"returned"`, `returned_at` set).
**Errors:** `400` Not approved · `404` Not found

---

## Transfers

Permanently transfer ownership of a book to another member.

### `POST /api/transfers`

**Request Body**
| Field | Type | Required | Description |
|---|---|---|---|
| `book_id` | integer | ✅ | Book to transfer |
| `from_member_id` | integer | ✅ | Current owner |
| `to_member_id` | integer | ✅ | New owner |

**Example Request**
```json
{
  "book_id": 12,
  "from_member_id": 5,
  "to_member_id": 2
}
```

**Response** `201` — Transfer record with `book_title`, `from_member_name`, `to_member_name`.

**Errors:**
- `400` Self-transfer · Book currently lent
- `403` Not the current owner
- `404` Book / Member not found

---

### `GET /api/transfers`

List transfer history.

**Query Parameters**
| Param | Description |
|---|---|
| `member_id` | Filter by sender or receiver |

**Response** `200` — Array with member/book name joins.

---

## Search

### `GET /api/search/books`

Search books with filters. All filters can be combined.

**Query Parameters**
| Param | Description |
|---|---|
| `q` | Search across title, author, ISBN, genre |
| `owner_id` | Filter by owner |
| `status` | `available` or `lent` |
| `genre` | Filter by genre |

**Example:** `GET /api/search/books?q=Dune&status=available`

**Response** `200`
```json
{
  "count": 1,
  "results": [
    {
      "id": 4,
      "title": "Dune",
      "author": "Frank Herbert",
      "status": "available",
      "owner_name": "Bob Martinez"
    }
  ]
}
```

---

### `GET /api/search/who-has`

Find who currently has a specific book (owner or active borrower).

**Query Parameters**
| Param | Required | Description |
|---|---|---|
| `title` | ✅ | Book title (partial match) |

**Example:** `GET /api/search/who-has?title=Mockingbird`

**Response** `200`
```json
{
  "count": 1,
  "results": [
    {
      "id": 2,
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "status": "lent",
      "owner_id": 1,
      "owner_name": "Alice Johnson",
      "currently_with": {
        "member_id": 3,
        "name": "Charlie Lee",
        "since": "2026-02-11 09:00:00"
      }
    }
  ]
}
```

---

## Groups

### `POST /api/groups`

Create a group. Creator automatically becomes admin.

**Request Body**
| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ | 1–100 characters |
| `description` | string | ❌ | Up to 500 characters |
| `created_by` | integer | ✅ | Creator member ID |

**Response** `201` — Created group object.
**Errors:** `404` Creator not found

---

### `GET /api/groups`

List all groups with member counts.

**Response** `200`
```json
[
  {
    "id": 1,
    "name": "Sci-Fi Enthusiasts",
    "description": "For fans of science fiction",
    "created_by": 2,
    "created_by_name": "Bob Martinez",
    "member_count": 4
  }
]
```

---

### `GET /api/groups/:id`

Get group details including full member list.

**Response** `200` — Group object with `members` array (each has `id`, `name`, `email`, `role`, `joined_at`).
**Errors:** `404` Group not found

---

### `PUT /api/groups/:id?admin_id=`

Update group info. **Admin only** — pass `admin_id` as query parameter.

**Request Body** — Any combination of `name`, `description`.

**Response** `200` — Updated group.
**Errors:** `403` Not admin · `404` Not found

---

### `DELETE /api/groups/:id?admin_id=`

Delete a group. **Admin only** — pass `admin_id` as query parameter.

**Response** `200`
```json
{ "message": "Group deleted", "group": { ... } }
```

**Errors:** `403` Not admin · `404` Not found

---

### `POST /api/groups/:id/members`

Add a member to a group.

**Request Body**
| Field | Type | Required |
|---|---|---|
| `member_id` | integer | ✅ |

**Response** `201`
```json
{ "message": "Bob Martinez added to the group" }
```

**Errors:** `404` Group/Member not found · `409` Already in group

---

### `DELETE /api/groups/:id/members/:memberId`

Remove a member from a group.

**Response** `200`
```json
{ "message": "Member removed from group" }
```

**Errors:** `404` Group not found / Not in group

---

## Posts

All post endpoints are scoped to a group: `/api/groups/:groupId/posts`

### `POST /api/groups/:groupId/posts`

Create a post. **Author must be a group member.**

**Request Body**
| Field | Type | Required | Description |
|---|---|---|---|
| `author_id` | integer | ✅ | Must be group member |
| `title` | string | ✅ | 1–200 characters |
| `body` | string | ✅ | Post content |

**Response** `201` — Post object with `author_name`.
**Errors:** `403` Not a group member · `404` Group not found

---

### `GET /api/groups/:groupId/posts`

List all posts in a group, newest first.

**Response** `200` — Array of post objects with `author_name`.
**Errors:** `404` Group not found

---

### `GET /api/groups/:groupId/posts/:id`

Get a single post.

**Response** `200` — Post object with `author_name`.
**Errors:** `404` Post not found

---

### `PUT /api/groups/:groupId/posts/:id?editor_id=`

Edit a post. **Author only** — pass `editor_id` as query parameter.

**Request Body** — Any combination of `title`, `body`.

**Response** `200` — Updated post (with `updated_at` refreshed).
**Errors:** `403` Not the author · `404` Not found

---

### `DELETE /api/groups/:groupId/posts/:id?deleter_id=`

Delete a post. **Author or group admin** — pass `deleter_id` as query parameter.

**Response** `200`
```json
{ "message": "Post deleted", "post": { ... } }
```

**Errors:** `403` Not author or admin · `404` Not found

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": ["field-level detail 1", "field-level detail 2"]
}
```

> `details` is only present for `400` validation errors.

| Code | Meaning |
|---|---|
| `400` | Validation failed or invalid operation |
| `403` | Permission denied (not owner/admin/author) |
| `404` | Resource not found |
| `409` | Conflict (duplicate email, duplicate request, already in group) |
| `500` | Internal server error |
