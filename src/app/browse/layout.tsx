import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Training Plan Library | The Long Game',
    description: 'Browse marathon and running plans by coach and distance.',
};

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
    return children;
}
