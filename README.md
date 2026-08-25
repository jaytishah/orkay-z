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
| `app/api/dealers/`, `app/api/digio/` | Module 10: dealer applications and the Digio e-Sign callback |
| `app/admin/(panel)/dealers/` | The approval queue, application detail and audit trail |
| `lib/dealers.ts` | The dealer seam — schema, status ladder, territory key, code format |
| `lib/digio.ts` | Aadhaar-OTP e-Sign client, with a dev stub and webhook verification |
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

**Lead payload** sent to the webhook by all three contact forms:

```json
{ "name": "", "company": "", "email": "", "country": "",
  "phone": "", "interest": "", "message": "",
  "source": "orkaytiles.com — general enquiry",
  "submissionId": "" }
```

`source` is one of *general enquiry · dealer onboarding · dealer support programme*, and
`interest` on a general enquiry is one of *Import · Distribution · OEM & Private Label ·
Project Supply · Something else* — map both to GHL pipelines so each type gets its own
follow-up sequence. `submissionId` traces a lead back to the record in the admin panel.

Every form writes its own record **before** forwarding, so GHL is a copy and never the
system of record: enquiries and dealer-support tickets land in `/admin/inbox`, dealership
applications in `/admin/dealers`. With no webhook configured the routes validate and store
normally and log the payload to the server console, so all three forms are fully testable
before the client's GHL account exists.

## Verifying locally before AWS

With `DYNAMO_TABLE` unset the app runs `FileStore` (a JSON file) and writes media to
`public/uploads/`. That is convenient, and it is also a trap: every check can pass
without `lib/store/dynamo.ts` ever executing, leaving the key design, the GSIs and the
conditional writes unproven until deploy day. Point the same code at a local DynamoDB
instead:

```bash
npm run dynamo:local        # terminal 1 — downloads DynamoDB Local once, needs Java
npm run dynamo:provision    # terminal 2 — the SAME scripts/aws/provision.mjs AWS runs
npm run admin:dynamo -- admin@orkaytiles.com '<password>' 'Orkay Admin'
npm run dev:dynamo          # dev server on the local table
```

Then run both suites and compare against a plain `npm run dev` run. **The results must be
identical** — that equivalence is the test of the seam (hard rule 8). If they diverge,
swapping the file store for DynamoDB has changed behaviour, which is precisely what must
not happen at deploy time.

```bash
npm run check                              # unit, no server
BASE=http://localhost:3000 npm run check:catalog   # 37 checks
BASE=http://localhost:3000 npm run check:dealers   # 20 checks
```

Set `BASE` to whatever port Next actually chose — it falls back past a busy 3000 and the
suites default to 3000, so a stale process on that port will silently point them at the
wrong server.

Two things DynamoDB Local cannot tell you, which stay for the AWS run: point-in-time
recovery (the provisioning script warns and continues) and anything about S3 — with
`S3_BUCKET` unset, `lib/media.ts` writes derivatives to disk, so `s3Sink` is still
unexercised.

Do not run `npm run build` while a dev server is up: it overwrites the `.next` directory
underneath the running server and every dynamic route starts throwing
`Cannot find module './vendor-chunks/...'` until you restart it.

## Dealer onboarding (Module 10)

Apply → verify → e-Sign → dealer code, all in this app. Four things are worth
knowing before touching it:

- **Uniqueness is a conditional write, never check-then-write.** Both the dealer
  code and the One District, One Dealer territory go through
  `DealerStore.reserve`. The availability check on the public form is advice for
  the applicant; the constraint is the write that happens when Orkay approves.
- **The status ladder is enforced server-side** from `ALLOWED_TRANSITIONS`, so
  nothing reaches `active` — and no dealer code is issued — without passing
  through a real signature. The panel's buttons are convenience, not the fence.
- **Without Digio credentials the e-Sign step runs in stub mode**, so the whole
  flow is testable locally. The stub is refused when `NODE_ENV=production`: a
  convincing fake signature on a legally binding agreement is worse than an outage.
- **The Digio endpoint paths and webhook header in `lib/digio.ts` are unverified**
  against a live account. Confirm them against Digio's current docs when Orkay's
  credentials arrive — they are read in one place each, on purpose.

```bash
npm run check           # unit checks, no server needed
npm run dev             # then, in another shell:
npm run check:dealers   # 21 end-to-end checks against http://localhost:3000
```

`check:dealers` writes real records — point it at dev, never production. The public
route is throttled at 8 applications per IP per 15 minutes and one run spends 7, so
two runs back to back will (correctly) hit the 429.

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
