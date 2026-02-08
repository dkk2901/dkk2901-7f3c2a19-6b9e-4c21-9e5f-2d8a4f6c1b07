# Secure Task Management System (RBAC) — Nx Monorepo

## Overview
This repository contains a secure Task Management System built with:
- **Backend:** NestJS API (JWT authentication + RBAC + org scoping)
- **Frontend:** Angular dashboard (login, task CRUD UI, audit log UI)
- **Workspace:** Nx

The implementation focuses on correctness of auth/RBAC/org-scoping and a working end-to-end flow (login → tasks → audit log).

> Note on structure: The assessment spec references an `apps/` + `libs/` layout. This submission currently uses a **standalone layout** with `api/` and `dashboard/` at the workspace root. Functionality is implemented, but the folder structure differs.

---

## Quick Start

### Prerequisites
- Node.js (LTS recommended)
- npm
- Git

To the the backend ( API) :
npx nx serve api

Start the dashboard

npx nx serve dashboard

Demo Accounts

password: Password123!

role 

owner  owner@test.com  org1
admin  admin@test.com
Viewer  viewer@test.com

### Install dependencies
From repository root:
```bash
npm install


