import { permanentRedirect } from 'next/navigation';
import { buildOutilsUnifiedUrl } from '@/lib/outils/buildOutilsRedirect';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  permanentRedirect(buildOutilsUnifiedUrl('tjm-revenu-net', await searchParams));
}
