import { redirect } from 'next/navigation';

type SearchParams = { [key: string]: string | string[] | undefined };

// Legacy route - redirect to unified auth
export default function SignupPage({ searchParams }: { searchParams: SearchParams }) {
    const params = new URLSearchParams();
    if (typeof searchParams.next === 'string') {
        params.set('next', searchParams.next);
    }
    if (typeof searchParams.error === 'string') {
        params.set('error', searchParams.error);
    }
    const suffix = params.toString();
    redirect(`/auth${suffix ? `?${suffix}` : ''}`);
}
