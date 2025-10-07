# Karate Tournament System — v1 (archived)


![status: archived](https://img.shields.io/badge/status-archived-lightgrey)
![license: MIT](https://img.shields.io/badge/license-MIT-blue)

**Summary:** Archived **v1 prototype** used in 4 club tournaments; **~60% less admin time** and **~90% less paper** vs. manual protocols.

**Stack:** Node.js / Express · server-rendered UI · file-based storage (v1) .

> V1 was a prototype to replace spreadsheet protocols for small tournaments. A production **v2** is planned (React + TypeScript + ASP.NET + MySQL) with auth, roles, and tests.

---

## Features
- **Kumite**: entries & match execution with alternating selection to mirror manual protocol logic.
- **Kata (bracket)**: alternating matches with **double-elimination** bracket.
- **Kata (points)**: fast point entry with automatic totals.

## Quick start (v1)
```bash
# Requirements: Node 18+
npm install
npm start
```

## Known limitations (v1)
- File-based storage → no transactions/concurrency; data lives on disk.
- Bracket edge cases need work (brackets with 3 or fewer participants, for some participant amounts logic is not equivalent to manual protocol).
- No authentication/authorization; minimal validation.
- Basic error handling and UI states.

## Why archived
V1 proved that the concept works in real events, but is not production level quality. I'm keeping it public to show the outcome, and to outline the planned improvements.

## V2 plan (high level)
- React + TypeScript front end; accessible UI.
- ASP.NET Core API with DTO validation.
- MySQL + ORM; seed data and migrations.
- Role-based access (admin, desk); auth flows; logs.
- Robust bracket engine; printable protocols & exports.
- Tests

## Changelog
- **v1-archived** - prototype used in real events; see release notes for impact.
  See **Releases** for details
