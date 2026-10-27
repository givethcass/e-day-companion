# ADR 0001: Expo monorepo

- Status: Accepted
- Date: 2026-10-27

## Context

The companion must run on iOS and Android and have a public web demo for the portfolio. It is mostly lists, cards, forms and real-time squad updates; nothing needs native-only performance.

## Decision

One npm-workspaces monorepo. The app is React Native with Expo and Expo Router (one codebase for iOS, Android and web). The API contract, seed data and simulated backend live beside it so types and data stay in sync.

## Consequences

- One language (TypeScript) end to end; types can be generated from the contract.
- Web output is good enough for a demo, not for SEO-heavy pages (not needed here).
- Flutter was the alternative; rejected to keep the web demo and the JS tooling simple.
