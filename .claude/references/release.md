# Moti release checklist

How V1 goes to production: a Supabase project for the data, Vercel for the app. Claude writes
config and SQL; every command below is run by the user.

## 1. Tests pass locally first

One-time setup (Docker must be running):

```bash
supabase init          # creates supabase/config.toml; answer "no" to the VS Code prompts
supabase start         # local stack; applies every migration and seed.sql
```

Every release:

```bash
supabase db reset      # rebuild the local DB from the migrations
supabase test db       # runs supabase/tests/*.test.sql: tenant isolation, role access, stock ledger
yarn build && yarn lint
```

Each test file builds its own shops and users and rolls back, so it leaves nothing behind.
Never point `supabase test db` at the production project.

## 2. Production Supabase project

1. Create a new project at supabase.com (region nearest the shops, e.g. Singapore). Keep the
   database password in a password manager.
2. Link and push the schema:

   ```bash
   supabase link --project-ref <prod-ref>
   supabase db push                    # applies supabase/migrations/*.sql
   supabase functions deploy manage-staff
   ```

3. **Never run `seed.sql` on production.** It holds demo shops and stock.
4. Authentication → Sign In / Providers:
   - Email provider on, **"Allow new users to sign up" off**. Accounts come only from the
     superadmin or an owner through the Users screen (`manage-staff`).
   - "Confirm email" can stay as it is: `manage-staff` creates accounts already confirmed, with
     a temporary password, not an invite.
5. Authentication → URL Configuration: Site URL = the production app URL; add it (and any
   preview URL you use) to Redirect URLs.
6. Create the superadmin once:
   - Authentication → Users → Add user (email + password, "Auto confirm" on).
   - SQL editor:

     ```sql
     insert into public.profiles (id, shop_id, role, full_name)
     values ('<auth user id>', null, 'superadmin', '<your name>');
     ```

   Every shop, owner and employee after that is created from the app.
7. Project Settings → API: copy the project URL and the **anon** key for step 3. The
   `service_role` key stays in Supabase (the Edge Function reads it there) and never goes
   into Vercel or the repo.

## 3. Vercel

1. Import the Git repository. `vercel.json` sets the Vite preset, `yarn build` and `dist`.
2. Environment variables (Production):
   - `VITE_SUPABASE_URL` = the prod project URL
   - `VITE_SUPABASE_ANON_KEY` = the prod anon key
3. Deploy. `vercel.json` also:
   - sends every path to `index.html`, so deep links like `/inventory/<id>` load;
   - serves `sw.js`, `index.html` and the manifest uncached, so the update prompt sees a new
     version; hashed files under `/assets/` are cached for a year;
   - adds nosniff, referrer and no-framing headers.
4. Add the Vercel URL (or the custom domain) to Supabase's Site URL / Redirect URLs (step 2.5).

## 4. Smoke test on production

On a phone, over the production URL:

- [ ] Sign in as the superadmin; create a shop and its owner (note the temporary password).
- [ ] Sign in as that owner on another device; change the password in Settings.
- [ ] Add a category and an item with opening stock; add an employee.
- [ ] As the employee: search, record a sale; confirm Add stock and Movements are absent.
- [ ] Airplane mode: record a sale, see the offline banner and pending count; reconnect and
      see it sync once.
- [ ] Install to the home screen (Android prompt, iOS Share → Add to Home Screen).
- [ ] Deploy again and confirm the "new version" prompt appears.
- [ ] Lighthouse (mobile) on the production URL: Accessibility and Best Practices with no red items.

## 5. Later releases

```bash
supabase test db                       # locally, against the new migrations
supabase db push                       # prod, after linking
supabase functions deploy manage-staff # only if the function changed
```

Then push to the production branch; Vercel builds and deploys.
