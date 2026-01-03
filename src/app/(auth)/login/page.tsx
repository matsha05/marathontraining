import { redirect } from 'next/navigation';

// Legacy route - redirect to unified auth
export default function LoginPage() {
    redirect('/auth');
}
