import { Metadata } from 'next';
import { MethodologyContent } from './methodology-content';

export const metadata: Metadata = {
    title: 'Our Methodology | The Long Game',
    description: 'Learn about the coaching science and research behind The Long Game training plans. Built on methodologies from Daniels, Pfitzinger, Hansons, and more.',
};

export default function MethodologyPage() {
    return <MethodologyContent />;
}
