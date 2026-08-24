import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import ImportForm from '@/components/admin/ImportForm';

export default async function ImportPage() {
  const session = await requireSession();
  if (!session) redirect('/admin/login');
  return (
    <main>
      <h1 className="adm-h1">Bulk import</h1>
      <p className="text-small adm-muted" style={{ maxWidth: '68ch', marginBottom: 28 }}>
        Upload the filled Excel/CSV template. Every row is validated exactly like the product
        form; the report below names each row that needs fixing. Images and spec-PDFs are
        attached per product afterwards.{' '}
        <a href="/orkay-product-import-template.csv" download style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>
          Download the template
        </a>
        .
      </p>
      <ImportForm />
    </main>
  );
}
