import { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { Footer } from '@/components/ui/Footer';

export const metadata: Metadata = {
    title: 'Terms of Service | The Long Game',
    description: 'Terms of Service for The Long Game marathon training app',
};

export default function TermsPage() {
    return (
        <div className="v2-root min-h-screen">
            <SiteHeader />
            <main className="px-6 pt-12 pb-16">
                <article className="v2-container-narrow mx-auto">
                    {/* Back Button */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors mb-8"
                    >
                        ← Back
                    </Link>

                    <h1 className="v2-heading-lg mb-4">Terms of Service</h1>
                    <p className="v2-body-sm mb-12" style={{ color: 'var(--text-muted)' }}>Last updated: January 3, 2026</p>

                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">1. Acceptance of Terms</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            By accessing or using The Long Game (&quot;the Service&quot;), you agree to be bound by these
                            Terms of Service. If you do not agree to these terms, do not use the Service.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">2. Description of Service</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            The Long Game provides personalized marathon and running training plans based on established
                            coaching methodologies. The Service includes training plan generation, pace calculations,
                            and optional integration with fitness tracking platforms.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">3. User Accounts</h2>
                        <ul className="v2-body space-y-2" style={{ color: 'var(--text-muted)', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                            <li>You must provide accurate information when creating an account</li>
                            <li>You are responsible for maintaining the security of your account</li>
                            <li>You must be at least 13 years old to use the Service</li>
                            <li>One person may not maintain more than one account</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">4. Medical Disclaimer</h2>
                        <p className="v2-body mb-4" style={{ color: 'var(--text-muted)' }}>
                            <strong>The Service is not a substitute for professional medical advice.</strong>
                        </p>
                        <ul className="v2-body space-y-2" style={{ color: 'var(--text-muted)', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                            <li>Consult a physician before starting any training program</li>
                            <li>Stop exercising if you experience pain, dizziness, or shortness of breath</li>
                            <li>We are not liable for injuries sustained during training</li>
                            <li>Training recommendations are algorithmic and may not account for all individual factors</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">5. Acceptable Use</h2>
                        <p className="v2-body mb-4" style={{ color: 'var(--text-muted)' }}>You agree not to:</p>
                        <ul className="v2-body space-y-2" style={{ color: 'var(--text-muted)', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                            <li>Use the Service for any unlawful purpose</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Interfere with or disrupt the Service</li>
                            <li>Reverse engineer or decompile any part of the Service</li>
                            <li>Resell or redistribute your access to the Service</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">6. Intellectual Property</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            The Service, including its algorithms, content, and branding, is owned by The Long Game.
                            Training plans generated for you are licensed for your personal use only.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">7. Third-Party Services</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            The Service may integrate with third-party platforms (Garmin, Strava). Your use of these
                            integrations is subject to those platforms&apos; terms of service. We are not responsible for
                            third-party service availability or data accuracy.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">8. Limitation of Liability</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT
                            PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                            CONSEQUENTIAL, OR PUNITIVE DAMAGES.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">9. Termination</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            We may terminate or suspend your account at any time for violation of these terms.
                            You may delete your account at any time through your account settings.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">10. Changes to Terms</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            We reserve the right to modify these terms at any time. Continued use of the Service
                            after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">11. Governing Law</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            These terms shall be governed by and construed in accordance with the laws of the
                            State of California, United States.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">Contact</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            Questions about these terms? Contact us at{' '}
                            <a href="mailto:legal@thelonggame.app" className="v2-accent">
                                legal@thelonggame.app
                            </a>
                        </p>
                    </section>
                </article>
            </main>
            <Footer />
        </div>
    );
}
