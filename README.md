<p align="center">
  <img src="./assets/images/icon.png" width="120" alt="LUNE app icon" />
</p>

<h1 align="center">LUNE</h1>

<p align="center">
  A premium mobile boutique for discovering and shopping dresses.<br />
  Built with React Native, Expo, and TypeScript.
</p>

## Stack

- **Expo** 57 + **React Native** + **TypeScript**
- **Expo Router** — file-based navigation
- **Supabase** (Postgres, Auth, Storage) + **DressShop API** (ASP.NET) — backend
- **TanStack Query** — server state · **Zustand** — client state

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment

   ```bash
   cp .env.example .env
   ```

   Fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
   Never put `SUPABASE_SERVICE_ROLE_KEY` in the client.

3. Start the app

   ```bash
   npx expo start
   ```

   Open it with a [development build](https://docs.expo.dev/develop/development-builds/introduction/),
   the [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/),
   the [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/),
   or [Expo Go](https://expo.dev/go).

## Scripts

| Command          | What it does              |
| ---------------- | ------------------------- |
| `npm start`      | Start the dev server      |
| `npm run android`| Run on Android            |
| `npm run ios`    | Run on iOS                |
| `npm run web`    | Run on web                |
| `npm run lint`   | Lint with Expo config     |

## Project docs

Detailed documentation lives in [`docs/`](docs/):

- [`docs/PRD.md`](docs/PRD.md) — product requirements
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — technical architecture
- [`docs/DATA.md`](docs/DATA.md) — database and data model
- [`docs/SKILLS.md`](docs/SKILLS.md) — implementation patterns
- [`docs/UI_UX.md`](docs/UI_UX.md) — design and UX rules
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — development phases

Agent working rules: [`AGENTS.md`](AGENTS.md).

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router introduction](https://docs.expo.dev/router/introduction/)
