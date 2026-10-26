<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Products, stock, orders and settings live in Lovable Cloud; public reads go through src/lib/catalog.functions.ts (publishable client) so SSR works.
- Orders are created only via the place_order database function, which re-prices from the DB and decrements stock atomically; never insert orders from the client.
- The first account ever created gets the admin role (handle_new_user trigger); roles live in user_roles and are checked with has_role.
- Product photos go in the private product-images bucket and are stored as long-lived signed URLs, because public buckets are blocked in this workspace.
- Cart stays in localStorage (src/lib/store.tsx) holding only slug/size/qty; prices always come from live product data.
