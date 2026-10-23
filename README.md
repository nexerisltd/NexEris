This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
## NexErisTM

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/nexerisltd/NexErisTM/blob/main/assets/cover.png" />
</div>

## Getting Started

# Step: 1 (Download Or Clode & Extract)

- [Download The Repository](https://github.com/nexerisltd/NexErisTM/archive/refs/heads/main.zip) - Or Clone
- Extract the zip
# Step: 2 (Preview with development server)

- First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Step: 3 (Rebranding Or Modify)

- You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deployment & configuration

Live site: <https://nexeris.vercel.app>

Copy `.env.example` to `.env.local` and fill it in (Supabase URL, anon key, service-role key, and
`NEXT_PUBLIC_SITE_URL`). The same variables go into the Vercel project settings.

## Database

SQL lives in [`supabase/`](supabase/README.md): `schema.sql` for a new project and
`migrations/` for incremental changes.

## Public API

Super Admins create API keys in the admin panel (`/admin/api-keys`). Anyone holding a key can read
team and product data — see the guide at <https://nexeris.vercel.app/docs/api>.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"# NexErisTM" 
