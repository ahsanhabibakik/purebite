import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the default locale (Bengali)
  redirect('/bn');
}

