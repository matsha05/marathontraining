import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | The Long Game',
    description: 'Terms of Service for The Long Game marathon training app',
};

export default function TermsPage() {
    return (
        <main className="min-h-screen landing-shell px-6 py-16">
            <article className="max-w-3xl mx-auto prose prose-invert">
                <h1>Terms of Service</h1>
                <p className="text-[var(--text-muted)]">Last updated: January 3, 2026</p>

                <section>
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using The Long Game (&quot;the Service&quot;), you agree to be bound by these
                        Terms of Service. If you do not agree to these terms, do not use the Service.
                    </p>
                </section>

                <section>
                    <h2>2. Description of Service</h2>
                    <p>
                        The Long Game provides personalized marathon and running training plans based on established
                        coaching methodologies. The Service includes training plan generation, pace calculations,
                        and optional integration with fitness tracking platforms.
                    </p>
                </section>

                <section>
                    <h2>3. User Accounts</h2>
                    <ul>
                        <li>You must provide accurate information when creating an account</li>
                        <li>You are responsible for maintaining the security of your account</li>
                        <li>You must be at least 13 years old to use the Service</li>
                        <li>One person may not maintain more than one account</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Medical Disclaimer</h2>
                    <p>
                        <strong>The Service is not a substitute for professional medical advice.</strong>
                    </p>
                    <ul>
                        <li>Consult a physician before starting any training program</li>
                        <li>Stop exercising if you experience pain, dizziness, or shortness of breath</li>
                        <li>We are not liable for injuries sustained during training</li>
                        <li>Training recommendations are algorithmic and may not account for all individual factors</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Acceptable Use</h2>
                    <p>You agree not to:</p>
                    <ul>
                        <li>Use the Service for any unlawful purpose</li>
                        <li>Attempt to gain unauthorized access to our systems</li>
                        <li>Interfere with or disrupt the Service</li>
                        <li>Reverse engineer or decompile any part of the Service</li>
                        <li>Resell or redistribute your access to the Service</li>
                    </ul>
                </section>

                <section>
                    <h2>6. Intellectual Property</h2>
                    <p>
                        The Service, including its algorithms, content, and branding, is owned by The Long Game.
                        Training plans generated for you are licensed for your personal use only.
                    </p>
                </section>

                <section>
                    <h2>7. Third-Party Services</h2>
                    <p>
                        The Service may integrate with third-party platforms (Garmin, Strava). Your use of these
                        integrations is subject to those platforms&apos; terms of service. We are not responsible for
                        third-party service availability or data accuracy.
                    </p>
                </section>

                <section>
                    <h2>8. Limitation of Liability</h2>
                    <p>
                        THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT
                        PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                        CONSEQUENTIAL, OR PUNITIVE DAMAGES.
                    </p>
                </section>

                <section>
                    <h2>9. Termination</h2>
                    <p>
                        We may terminate or suspend your account at any time for violation of these terms.
                        You may delete your account at any time through your account settings.
                    </p>
                </section>

                <section>
                    <h2>10. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Continued use of the Service
                        after changes constitutes acceptance of the new terms.
                    </p>
                </section>

                <section>
                    <h2>11. Governing Law</h2>
                    <p>
                        These terms shall be governed by and construed in accordance with the laws of the
                        State of California, United States.
                    </p>
                </section>

                <section>
                    <h2>Contact</h2>
                    <p>
                        Questions about these terms? Contact us at{' '}
                        <a href="mailto:legal@thelonggame.app" className="text-[var(--color-accent)]">
                            legal@thelonggame.app
                        </a>
                    </p>
                </section>
            </article>
        </main>
    );
}
