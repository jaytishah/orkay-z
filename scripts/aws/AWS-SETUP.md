# Moving the CMS from the local store to Orkay's AWS

The admin CMS runs today on a local JSON store (`.data/catalog.json`) and local
uploads (`public/uploads/`). Nothing in the app changes when it moves to AWS —
the store is selected by environment variables (the seam in `lib/catalog.ts`).

## What Orkay provides (launch kit)

- An AWS account **in Orkay's name with a billing method attached** (quotation,
  Client Responsibilities). Region: **ap-south-1 (Mumbai)**.
- An IAM user or role for provisioning with rights to create one DynamoDB table
  and one S3 bucket.

## Steps

1. **Provision** (idempotent — safe to re-run):

   ```bash
   AWS_REGION=ap-south-1 AWS_PROFILE=orkay node scripts/aws/provision.mjs
   ```

   Creates `orkay-catalog` (on-demand, PITR on, GSIs `byCategory` + `byStatus`
   per INSTRUCTIONS §5a) and `orkay-media` (private bucket, public read on
   `products/*` only, CORS for the site). Prints the app's least-privilege IAM
   policy — attach it to the Amplify service role.

2. **Environment** (Amplify console → App settings → Environment variables;
   server-side only, never `NEXT_PUBLIC_*`):

   | Var | Value |
   |---|---|
   | `AWS_REGION` | `ap-south-1` |
   | `DYNAMO_TABLE` | `orkay-catalog` |
   | `S3_BUCKET` | `orkay-media` |
   | `S3_PUBLIC_BASE` | the CDN host once Cloudflare fronts the bucket (optional) |
   | `SESSION_SECRET` | `openssl rand -hex 32` |
   | `GHL_WEBHOOK_URL` | GHL → Automation → Inbound Webhook |

3. **First admin login:**

   ```bash
   AWS_REGION=ap-south-1 DYNAMO_TABLE=orkay-catalog node scripts/create-admin.mjs admin@orkaytiles.com '<password>' 'Name'
   ```

4. **Catalog data:** issue `public/orkay-product-import-template.csv` to Orkay
   (Module 9), then Admin → Import. Go-live is not blocked by completeness.

## Still to build on AWS (flagged, not forgotten)

- **Presigned browser→S3 upload + Lambda derivative pipeline** for 4K masters
  (§5b). Today the admin routes generate derivatives server-side at upload —
  correct behaviour, different transport. The Lambda arrives with the Amplify
  deployment.
- **CloudWatch alarms + AWS Budgets** thresholds (Module 12) — set at
  Orkay-defined amounts during Amplify setup.
- **Amplify CI/CD** from the GitHub repo with one-click rollback (Module 4).
