import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getStore } from '@/lib/store';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ sku: string }> }) {
  const session = await requireSession();
  if (!session) redirect('/admin/login');

  const { sku } = await params;
  const store = await getStore();
  const product = await store.get(sku);
  if (!product) notFound();

  return (
    <main>
      <h1 className="adm-h1">
        {product.name} <span className="adm-muted text-small">{product.sku}</span>
      </h1>
      <ProductForm mode="edit" initial={product} />
    </main>
  );
}
