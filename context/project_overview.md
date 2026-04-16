# DevStash – Project Overview

> **Status:** Early Planning / Draft  
> **Source Notes:** Based on initial brainstorming document fileciteturn0file0  
> ⚠️ This document is a **cleaned and structured version** — not final.

---

# 🧠 Vision

**DevStash** is a centralized, AI-powered knowledge hub for developers to store, organize, and retrieve everything they use daily:

- Code snippets
- AI prompts
- Notes & docs
- Commands
- Files & assets
- Links

### Core Goal
> Reduce context switching and make developer knowledge instantly searchable and reusable.

---

# 🚨 Problem

Developers store knowledge across fragmented tools:

- VS Code
- Notion
- GitHub Gists
- Terminal history
- Bookmarks
- ChatGPT / AI tools

### Result
- Lost knowledge
- Slower workflows
- Poor reuse of past work

---

# 🎯 Target Users

## 👨‍💻 Everyday Developer
Quick access to snippets, commands, and links

## 🤖 AI-first Developer
Stores prompts, system messages, workflows

## 🎓 Content Creator / Educator
Manages teaching material and code examples

## 🧱 Full-stack Builder
Organizes patterns, boilerplates, APIs

---

# 🧩 Core Concepts

## 1. Items

Items are the fundamental unit.

### Types (System - Non-editable)

| Type | Description |
|------|------------|
| snippet | Code blocks |
| prompt | AI prompts |
| note | Markdown notes |
| command | CLI commands |
| link | URLs |
| file (Pro) | Uploaded files |
| image (Pro) | Images |

---

## 2. Collections

Collections group items.

- Many-to-many relationship
- Flexible organization

### Examples
- React Patterns
- Interview Prep
- Context Files

---

## 3. Tags

- Lightweight categorization
- Used in search

---

## 4. Search

Powerful global search across:

- Title
- Content
- Tags
- Types

---

# ⚙️ Feature Breakdown

## 🧱 Core Features

- Create/edit/delete items
- Multi-collection support
- Favorites & pinning
- Recently used items
- Markdown editor
- File uploads (Pro)
- Import/export

## 🤖 AI Features (Pro)

- Auto-tagging
- Summarization
- Code explanation
- Prompt optimization

---

# 🗄️ Data Model (Prisma – Rough Draft ⚠️)

```prisma
model User {
  id                    String   @id @default(cuid())
  email                 String   @unique
  isPro                 Boolean  @default(false)
  stripeCustomerId      String?
  stripeSubscriptionId  String?

  items        Item[]
  collections  Collection[]
  itemTypes    ItemType[]
}

model Item {
  id           String   @id @default(cuid())
  title        String
  contentType  String   // text | file
  content      String?
  fileUrl      String?
  fileName     String?
  fileSize     Int?
  url          String?
  description  String?
  isFavorite   Boolean  @default(false)
  isPinned     Boolean  @default(false)
  language     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  userId       String
  user         User     @relation(fields: [userId], references: [id])

  itemTypeId   String
  itemType     ItemType @relation(fields: [itemTypeId], references: [id])

  collections  ItemCollection[]
  tags         Tag[]
}

model ItemType {
  id        String   @id @default(cuid())
  name      String
  icon      String
  color     String
  isSystem  Boolean  @default(false)

  userId    String?
  user      User?    @relation(fields: [userId], references: [id])

  items     Item[]
}

model Collection {
  id            String   @id @default(cuid())
  name          String
  description   String?
  isFavorite    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId        String
  user          User     @relation(fields: [userId], references: [id])

  items         ItemCollection[]
}

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item         Item       @relation(fields: [itemId], references: [id])
  collection   Collection @relation(fields: [collectionId], references: [id])

  @@id([itemId, collectionId])
}

model Tag {
  id     String @id @default(cuid())
  name   String @unique

  items  Item[]
}
```

---

# 🧭 System Architecture

```mermaid
graph TD

A[Frontend - Next.js] --> B[API Routes]
B --> C[PostgreSQL (Neon)]
B --> D[Cloudflare R2]
B --> E[OpenAI API]
B --> F[Redis Cache]
```

---

# 🛠️ Tech Stack

## Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- ShadCN UI

## Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Neon)

## Infra
- Cloudflare R2 (file storage)
- Redis (optional caching)

## Auth
- NextAuth v5
- GitHub OAuth
- Email/password

## AI
- OpenAI (gpt-5-nano)

---

# 💰 Monetization

## Free Tier
- 50 items
- 3 collections
- No files/images
- No AI

## Pro ($8/mo)
- Unlimited everything
- File uploads
- AI features
- Export tools

---

# 🎨 UI / UX Principles

## Design
- Dark-first
- Minimal
- Developer-focused

## Layout
- Sidebar + Main
- Drawer-based item editing

## Interaction
- Smooth transitions
- Toast feedback
- Keyboard-first (future enhancement 🚀)

---

# 🎨 Type System (Colors & Icons)

| Type | Color | Icon |
|------|------|------|
| Snippet | #3b82f6 | </> |
| Prompt | #8b5cf6 | ✨ |
| Command | #f97316 | ⌘ |
| Note | #fde047 | 📝 |
| File | #6b7280 | 📄 |
| Image | #ec4899 | 🖼️ |
| Link | #10b981 | 🔗 |

---

# 🚀 Future Ideas

- Custom item types
- Public sharing / publishing
- Team collaboration
- Browser extension
- VS Code extension
- Offline mode

---

### Screenshots

Reffer to the scrrenshots below as a base for the dashboard UI. It does not have to be exact. Use it as refferance:

- @context/screenshots/dashboard-ui-drawer.png
- @context/screenshots/dashboard-ui-main.png

---

# ⚠️ Key Decisions

- Single repo (monolith approach)
- Prisma migrations ONLY (no db push)
- Freemium-first architecture

---

# 🧪 Open Questions

- Should tags be global or user-scoped?
- How deep should AI integration go?
- Versioning for items?

---

# 🧾 Summary

DevStash is essentially:

> "Notion + Raycast + AI memory layer — built specifically for developers"

---

**End of Draft**

