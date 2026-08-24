import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const session = await requireSession();
  if (!session) redirect('/admin/login');
  return (
    <main>
      <h1 className="adm-h1">Add product</h1>
      <ProductForm mode="create" />
    </main>
  );
}
