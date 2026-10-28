# ADR 0002: Contract-first simulated backend

- Status: Accepted
- Date: 2026-10-27

## Context

An official app would read player data from Xbox services and PlayFab. There is no public E-Day API and no real partnership, so the backend has to be simulated while still looking like the real integration would.

## Decision

Write the API as an OpenAPI 3.1 contract first (`contract/openapi.yaml`). A simulated backend serves exactly that contract from seed data (Supabase was the first plan; see ADR 0004). The app only talks to the contract. "Sign in with Xbox" and "Deploy" (open the game) are simulated and labelled as such.

## Consequences

- Swapping the simulated backend for a real one would not change the app.
- Every seed record is validated against the contract in CI.
- The contract is illustrative: field names and shapes are plausible, not official.
