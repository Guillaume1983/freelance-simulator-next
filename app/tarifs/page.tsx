import { redirect } from 'next/navigation';

// Page tarifs désactivée — sera activée lors du lancement des offres payantes
export default function TarifsPage() {
  redirect('/');
}
