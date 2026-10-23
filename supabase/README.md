# Database (Supabase)

Everything the NexEris database needs lives in this folder.

```
supabase/
├── schema.sql        full current schema — for a NEW, EMPTY project
└── migrations/       incremental changes — for the project you already run
```

## Which one do I use?

| Situation | Use |
|---|---|
| New Supabase project | Paste `schema.sql` into the SQL editor and run it once |
| Existing project that is missing a change | Run only the missing files from `migrations/`, **in filename order** |

> `schema.sql` Part 1 (profiles, allowed_members, profile_likes, avatar/cover storage)
> was reconstructed from the app code. Compare it with your live database
> (`supabase db dump --schema public`) before relying on it. Parts 2–4 mirror the migrations.

## Migrations

| File | Adds |
|---|---|
| `20260815000000_exp_points.sql` | `profiles.exp_points` |
| `20261021000000_roles_and_products.sql` | `super_admin` role, `products`, `product_developers`, `product-logos` bucket |
| `20261022000000_product_previews.sql` | `product_previews` (saved copy of a product's live page) |
| `20261022000100_api_keys.sql` | `api_keys` + usage counter for the public API |

Run them in the SQL editor (Dashboard → SQL Editor), or with the CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Each file is safe to run twice, so applying one that already ran does no harm.

## First Super Admin

After migration 2, promote yourself once (change the username):

```sql
update public.profiles set role = 'super_admin' where username = 'arabiislam46ar';
```

From then on, roles are changed in the app at `/admin/members`.

## Adding a new migration

Create `migrations/<YYYYMMDDHHMMSS>_short_name.sql`, then mirror the change in `schema.sql`
so a fresh project ends up identical to an upgraded one.

## Security model

The app checks the signed-in user's role in code, then writes with the service role key.
Tables that must never be read with the public key (`api_keys`, `product_previews`,
`allowed_members`) have row level security enabled and **no** policies.
