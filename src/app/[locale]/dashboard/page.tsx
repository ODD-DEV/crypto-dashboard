import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard/portfolio`);
}
