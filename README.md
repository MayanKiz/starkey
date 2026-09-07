# Secret Identity Chat

A private, real-time relationship chat application built with React, TypeScript, Vite, Tailwind CSS, and Supabase. Users create a secret identity instead of using an email address, sign in with a simple four-digit PIN, connect to another user with that user’s four-digit connection PIN, and exchange messages in real time.

> **Important:** This project uses a custom PIN-based identity flow. It does **not** use Supabase Auth, email verification, password reset, or email/password accounts. Review the security limitations before deploying it for sensitive data.

## Table of contents

- [Features](#features)
- [How the application works](#how-the-application-works)
- [Create an account](#create-an-account)
- [Sign in](#sign-in)
- [Connect with another user](#connect-with-another-user)
- [Use the chat](#use-the-chat)
- [Settings and privacy features](#settings-and-privacy-features)
- [Vault access](#vault-access)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Supabase setup](#supabase-setup)
- [Database model](#database-model)
- [Available commands](#available-commands)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security considerations](#security-considerations)
- [Known implementation notes](#known-implementation-notes)
- [Contributing](#contributing)
- [License](#license)

## Features

- Secret identity creation with a nickname.
- Simple four-digit PIN sign-in.
- Four-digit connection PINs for starting a private conversation.
- Real-time user presence with online and offline status.
- Real-time message delivery through Supabase Realtime.
- Text messages, heartbeat messages, reactions, read status, and typing indicators.
- Offline message queueing with retry support when the connection returns.
- Browser notifications and a soft in-browser chime for incoming messages.
- Popup-based connection flow instead of an inline expanding panel.
- Full-screen mobile chat layout with the composer held above the keyboard.
- Self-delete action that removes the current identity and its messages.
- Cute, minimal light theme with componentized screens that are easy to edit.
- Progressive Web App support through a service worker and web manifest.

## How the application works

The application is a single-page React application. The root route (`/`) controls the following views:

| View | Purpose |
| --- | --- |
| PIN entry | Signs an existing user in with a four-digit login PIN. |
| Create Secret Identity | Creates a nickname, login PIN, and connection PIN in Supabase. |
| The Hub | Lists other users and shows their current presence. |
| Chat | Displays the real-time conversation with one selected user. |

After the application loads, it registers a service worker for browser notification support. The current user is kept in React state while the page is open; the code does not persist a normal authenticated Supabase session.

### End-to-end flow

1. A visitor opens the application and sees the PIN keypad.
2. The visitor selects **Create Secret Identity** if they do not have an account.
3. The application inserts the new identity into the Supabase `users` table.
4. The visitor returns to the PIN screen and enters the four-digit login PIN.
5. The application looks up the matching row in `users` and opens **The Hub**.
6. The user selects another identity and enters that person’s four-digit connection PIN.
7. The application opens a conversation and subscribes to real-time database changes.
8. Messages are inserted into the `messages` table and delivered to both participants through Supabase Realtime.

## Create an account

In this project, creating an account means creating a **secret identity**.

1. Open the application.
2. Select **Create Secret Identity** below the PIN keypad.
3. Enter a nickname or alias. The current form allows up to 20 characters.
4. Enter a four-digit numeric **Login PIN**. This PIN is used to sign in.
5. Enter a four-digit numeric **Connection PIN**. Share this PIN only with people who should be able to connect to this identity.
6. Select **Create Identity**.
7. If the login PIN is already used, choose a different one.
8. After the identity is created, return to the welcome screen and sign in with the four-digit login PIN.

The login PIN and connection PIN have different purposes. The login PIN identifies the current user. The connection PIN authorizes another user to open a chat with the selected identity.

## Sign in

1. Open the application or return to the welcome screen.
2. Enter the four-digit login PIN using the keypad.
3. The application checks the `users.login_pin` column.
4. When a matching user is found, the application opens **The Hub**.
5. If the PIN is invalid, the keypad shakes, clears, and allows another attempt.

There is no email-based login, password recovery, account recovery, or automatic session restoration in the current implementation. If a user loses the login PIN, the current UI does not provide a recovery flow.

## Connect with another user

1. After signing in, wait for **The Hub** to load the user list.
2. Users are ordered with online users first and recently seen users afterward.
3. Select the identity you want to contact.
4. Enter that identity’s four-digit connection PIN.
5. Select **Connect**.
6. If the PIN matches, the chat opens. If it does not match, the connection form clears after a brief error animation.

The current user is excluded from their own user list. Presence is updated when the Hub opens and is marked offline when the browser page is closed or the user leaves the Hub.

## Use the chat

Inside a conversation, the application provides the following behavior:

| Action | Behavior |
| --- | --- |
| Send text | Inserts a text message into Supabase. |
| Send a heartbeat | Sends a special heartbeat message represented in the UI by a heart. |
| Send voice | Supports the `voice` message type when a voice URL is supplied by the input component. |
| React to a message | Adds or removes a reaction in the message’s `reactions` field. |
| Read messages | Incoming messages are marked as read when displayed. |
| Type | Publishes typing status for the other participant. |
| Go offline | Keeps unsent messages in a local pending queue until delivery can be retried. |
| Receive notifications | Plays a soft two-note chime and can request browser notifications. |

When the browser is offline, the chat displays an offline banner. Queued messages are shown as pending messages and can be retried after connectivity returns.

## Mobile and interaction design

The interface is intentionally designed like a small, friendly messaging app. Each primary screen is a separate component, the Hub opens connection details in a modal popup, and the chat uses a `100dvh` flex layout so the message composer remains above the mobile keyboard. Only the conversation area scrolls; the whole page does not jump while typing.

The Hub’s trash icon is **Delete my space**. It asks for confirmation, deletes messages associated with the current user, deletes the user row, and returns to the welcome screen. This action is permanent.

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | React 18 with TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS, PostCSS, custom CSS |
| UI components | shadcn/ui patterns and Radix UI primitives |
| Routing | React Router DOM |
| Data access | `@supabase/supabase-js` |
| Realtime | Supabase Postgres Changes channels |
| Client state and async utilities | React hooks and TanStack Query provider |
| Icons | Lucide React |
| Date formatting | date-fns |
| Package manager | npm or Bun lockfile-compatible tooling |

## Project structure

```text
.
├── public/                     # Favicon, manifest, service worker, static assets
├── src/
│   ├── components/             # Screens, chat UI, settings, and reusable UI components
│   ├── hooks/                  # Messaging, presence, typing, queue, and notification hooks
│   ├── integrations/supabase/  # Generated Supabase client and database types
│   ├── lib/                    # Supabase exports, notifications, and shared utilities
│   ├── pages/                  # Route-level pages
│   ├── App.tsx                 # Router and application providers
│   ├── App.css                 # Application-specific styles
│   └── index.css               # Global styles and Tailwind layers
├── supabase/config.toml        # Supabase project identifier for local tooling
├── index.html                  # Vite HTML entry point
├── package.json                # Scripts and dependencies
├── tailwind.config.ts          # Tailwind theme configuration
└── vite.config.ts              # Vite configuration
```

## Prerequisites

Install the following before running the project:

- Node.js 18 or newer. Node.js 20 or newer is recommended.
- npm 9 or newer, or Bun.
- A Supabase project with the required tables and Realtime configuration.
- A modern browser with JavaScript enabled.

## Local development

Clone the repository and install dependencies:

```bash
git clone https://github.com/MayanKiz/rao050108.git
cd rao050108
npm install
```

Create a local environment file as described in [Environment variables](#environment-variables), then start the Vite development server:

```bash
npm run dev
```

Vite normally prints a local URL such as `http://localhost:5173`. Open that URL in a browser.

For a production-style local check:

```bash
npm run build
npm run preview
```

## Environment variables

Create a `.env` file in the project root. Do not commit this file when it contains project credentials.

```dotenv
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_or_publishable_key
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
```

Vite exposes variables prefixed with `VITE_` to browser code. Only use a Supabase publishable/anonymous key in this file. Never place a Supabase service-role key or another server secret in frontend environment variables.

The checked-in source currently references a specific Supabase project through its local `.env` file. Replace those values with your own project values when creating a separate deployment.

## Supabase setup

The repository contains generated database types and a Supabase project configuration file, but it does not contain database migration files. Create the required tables in the Supabase project before using the application.

The application expects these public tables:

- `users`
- `messages`
- `typing_status`
- `chat_settings`

Enable Supabase Realtime for at least `users`, `messages`, `typing_status`, and `chat_settings`, because the UI subscribes to Postgres change events for these tables.

For a production deployment, configure Row Level Security (RLS) and policies deliberately. The current frontend queries these tables directly with the browser client, so database policies determine whether users can read, insert, update, or delete data.

## Database model

The generated types describe the following columns. Your actual database schema must match the types and the queries in the source code.

### `users`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | UUID/string | User identity identifier. |
| `nickname` | string | Secret alias displayed in the Hub and chat. |
| `login_pin` | string | Six-digit PIN used by the custom sign-in lookup. |
| `connection_pin` | string | Four-digit PIN used to authorize a connection. |
| `is_online` | boolean | Current presence flag. |
| `last_seen` | timestamp | Last presence update. |
| `created_at` | timestamp | Identity creation time. |

`login_pin` must be unique because the sign-in query expects at most one matching row. The application specifically handles PostgreSQL unique-constraint error code `23505` during identity creation.

### `messages`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | UUID/string | Message identifier. |
| `sender` | string | Legacy display label such as `he`, `she`, or `user`. |
| `sender_id` | UUID/string | User who sent the message. |
| `receiver_id` | UUID/string | User who receives the message. |
| `content` | string/null | Text content. |
| `message_type` | string | `text`, `voice`, or `heartbeat`. |
| `voice_url` | string/null | Optional voice-message URL. |
| `reactions` | JSON/array | Reactions attached to the message. |
| `is_read` | boolean | Whether the receiver has read the message. |
| `created_at` | timestamp | Message creation time. |

The application loads a conversation by matching both directions of `sender_id` and `receiver_id`. It also deletes only the current conversation when **Clear All Messages** is used.

### `typing_status`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | string | Status record identifier. |
| `is_typing` | boolean | Whether a user is currently typing. |
| `updated_at` | timestamp | Last typing-status update. |

### `chat_settings`

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | string | User identifier used as the settings row key. |
| `wallpaper_url` | string/null | Image data URL or CSS gradient string. |
| `updated_at` | timestamp | Last settings update. |

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server with hot reload. |
| `npm run build` | Creates a production build. |
| `npm run build:dev` | Creates a development-mode build. |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | Runs ESLint across the project. |

Run the main validation commands before opening a pull request:

```bash
npm run lint
npm run build
```

## Deployment

Build the project with:

```bash
npm run build
```

Deploy the generated `dist/` directory to a static hosting provider such as Vercel, Netlify, Cloudflare Pages, or any server that can serve a single-page Vite application.

Configure the three `VITE_` environment variables in the hosting provider. Because the application uses browser-side routing, configure a rewrite so unknown paths resolve to `index.html`. The current application primarily uses `/`, but this fallback prevents refresh-related 404 errors if additional routes are added later.

After deployment, verify the following in the browser:

1. The application loads without environment-variable errors.
2. A test identity can be created.
3. A test identity can sign in.
4. Two test identities can connect with the correct connection PIN.
5. A message appears in both browser sessions in real time.
6. Presence, typing status, notifications, and message deletion behave as expected.

## Troubleshooting

### Identity creation fails

Check that the `users` table exists, the required columns are present, and the RLS insert policy allows the browser client to create a row. A duplicate login PIN is rejected by design.

### Sign-in always fails

Confirm that the local environment points to the intended Supabase project and that the value entered is the six-digit `login_pin`, not the four-digit `connection_pin`. Check the browser console and Supabase logs for read-policy errors.

### Users or messages do not update in real time

Confirm that Realtime is enabled for the relevant tables and that the browser is connected to the correct Supabase URL. Also verify that the database policies allow the client to receive the expected changes.

### The app shows a blank or broken page after deployment

Confirm that all `VITE_` variables were configured at build time. Static hosts must serve `index.html` for the root route and any client-side routes.

### Notifications do not appear

Grant notification permission in the browser, disable Ghost Mode, and check the browser’s site notification settings. Notification support is browser-dependent and may be unavailable in private browsing or restricted environments.

## Security considerations

This project should be treated as a prototype until its authentication and authorization model is redesigned.

- Login PINs and connection PINs are queried directly by the browser client. They are not handled by Supabase Auth.
- The source type and insert code indicate that PIN values are stored as ordinary table fields. They are not hashed in the client.
- A six-digit PIN has a small search space. Rate limiting, lockout, abuse monitoring, and server-side verification are not implemented in the frontend.
- The frontend selects user rows and can expose user metadata depending on Supabase RLS policies.
- The hard-coded vault PIN `051009` is present in client-side source and is not a secure administrator credential.
- Uploaded wallpapers are stored as browser-generated data URLs in the database, which can increase row size.
- The clear-history action permanently deletes conversation messages.
- Notification sounds and notification text can reveal that a message arrived to anyone who can hear or see the device.

For a production system, use Supabase Auth or a dedicated server-side authentication service, hash secrets server-side, add rate limiting, enforce least-privilege RLS policies, remove the hard-coded vault path, validate all inputs on the server, and add an account recovery mechanism.

## Known implementation notes

- The project contains both `README.md` and a lowercase `readme.md`. GitHub uses `README.md` as the canonical repository page.
- The `sender` field uses legacy labels. For newly created users, the message logic falls back to `user` unless the user ID matches one of two legacy UUIDs.
- The root application currently uses React state for navigation rather than URL routes for each view.
- `SettingsSheet` receives a functional message-deletion callback from the chat, while the Hub-level settings callback is currently a placeholder that returns success without deleting messages.
- The generated Supabase types are useful documentation, but they do not create or migrate the database.

## Contributing

1. Fork the repository or create a feature branch.
2. Install dependencies with `npm install`.
3. Make a focused change.
4. Run `npm run lint` and `npm run build`.
5. Test the relevant flow with two browser sessions when changing realtime behavior.
6. Open a pull request with a clear description of the change and any database or environment-variable requirements.

## License

No license file is currently included in the repository. All rights remain with the repository owner unless a license is added. Add a `LICENSE` file before distributing or accepting external contributions under defined terms.

## References

[1]: https://react.dev/ "React documentation"
[2]: https://vite.dev/ "Vite documentation"
[3]: https://supabase.com/docs "Supabase documentation"
[4]: https://supabase.com/docs/guides/realtime "Supabase Realtime documentation"
[5]: https://tailwindcss.com/docs "Tailwind CSS documentation"
[6]: https://github.com/MayanKiz/rao050108 "Secret Identity Chat repository"
