# ORKAY Tiles International — Next.js

The ORKAY homepage and collection pages, ported from the static build in `../site/`
to Next.js 15 (App Router) + React 19 + TypeScript, structured so a CMS and the
GoHighLevel lead engine drop in without touching the design.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
```

## Folder map

| Path | What lives there |
|---|---|
| `app/page.tsx` | The homepage — 16 sections, all reading from `content/` |
| `app/collections/[slug]/page.tsx` | Collection detail pages, statically generated per collection |
| `app/api/inquiry/route.ts` | B2B inquiry intake → forwards to GoHighLevel |
| `app/globals.css` | The whole design system (ported unchanged from the static build) |
| `components/Motion.tsx` | Every animation: Lenis, GSAP pins, logo zebra, steppers, counters |
| `components/SiteChrome.tsx` | Fixed logo + nav + menu + scrollbar, and the shared `Footer` |
| `components/InquiryForm.tsx` | The B2B lead form in the Partner section |
| `components/GHLChat.tsx` | LeadConnector AI chat widget mount |
| `content/` | **The CMS seam** — all copy, collections, formats, stats, imagery |
| `public/img`, `public/fonts`, `public/video` | Assets |

## Where the CMS plugs in

Everything editable lives in two typed modules:

- `content/collections.ts` — the 6 collections (name, slug, image, finish, look, sizes, body, description)
- `content/site.ts` — formats, journey slides, services, stats, day-cycle, gallery, and global site copy

Both export plain typed arrays. To go headless, replace the exported constant with a
fetch (Sanity, Payload, Contentful, Strapi…) that returns the **same shape** — every
component keeps working, because none of them hardcode content. `getCollection(slug)`
and `generateStaticParams()` are the only two functions a CMS adapter must satisfy.

Adding a collection is one object in `content/collections.ts`; its detail page,
static route, homepage card and metadata all appear automatically.

## Wiring GoHighLevel

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where it comes from | Effect |
|---|---|---|
| `GHL_WEBHOOK_URL` | GHL → Automation → Workflow → Trigger **Inbound Webhook** → copy URL | Inquiries POST here as JSON |
| `NEXT_PUBLIC_GHL_CHAT_WIDGET_ID` | GHL → Sites → Chat Widget → widget id | Renders the AI chat widget site-wide |
| `SITE_URL` | Your production domain | Absolute URLs for OG/social images |

**Inquiry payload** sent to the webhook:

```json
{ "name": "", "company": "", "email": "", "country": "",
  "phone": "", "interest": "", "message": "",
  "source": "orkaytiles.com — website inquiry" }
```

`interest` is one of *Import · Distribution · OEM & Private Label · Project Supply* —
map it to a GHL pipeline so each buyer type gets its own follow-up sequence.

With no webhook configured the route validates normally and logs the payload to the
server console, so the form is fully testable before the client's GHL account exists.

## Hero video

`content/site.ts` → `site.heroVideo`. Set to a path under `public/video/` to run the
cinematic hero, or `null` to fall back to the still (`site.heroImage`). The current
file is a 720p draft; drop a 4K master in at the same path to upgrade it.

## Deploy

Vercel, zero config: push the repo, import it, set the env vars above. Static pages
(homepage + all collections) prerender; only `/api/inquiry` runs on demand.

## Notes

- Images use plain `<img>`, not `next/image` — the design system sizes everything with
  `object-fit` inside fixed-height figures and the reveals animate `clip-path`;
  `next/image` adds no value here and fights both.
- Reveals use a position check rather than IntersectionObserver: Chrome reports zero
  intersection for elements hidden by their own `clip-path`, so IO never fires.
- Pinned sections use explicit `refreshPriority` so their scroll ranges resolve in
  document order (gallery → journey → collections → formats). Removing those values
  makes the pinned chapters overlap.
