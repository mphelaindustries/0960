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
- Products, cart (localStorage) and WhatsApp message building live in src/lib/store.tsx; no backend yet so the store stays static until order management is needed.
- Reuse RotatingProduct for hero and collection 3D displays; lazy-load the R3F scene behind ClientOnly so storefront SSR remains browser-safe.
- Apply product frontArtwork/backArtwork to the CC0 shirt mesh through planar front/back UV unwrapping; keep original photos for fallback and detail views. Source model: https://3dassets.dev/assets/clothing-rail-and-wardrobe-tshirt-on-hanger-c0e0e17d (CC0 verified).
