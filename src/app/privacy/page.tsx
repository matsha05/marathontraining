import { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { Footer } from '@/components/ui/Footer';

export const metadata: Metadata = {
    title: 'Privacy Policy | The Long Game',
    description: 'Privacy Policy for The Long Game marathon training app',
};

export default function PrivacyPolicyPage() {
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

                    {/* Header */}
                    <header className="mb-12">
                        <h1 className="v2-heading-lg mb-4">Privacy Policy</h1>
                        <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>
                            Effective Date: January 3, 2026 · Last Updated: January 3, 2026
                        </p>
                    </header>

                    {/* Introduction */}
                    <section className="mb-10">
                        <p className="v2-body" style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                            The Long Game (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to
                            protecting your personal data. This policy explains how we collect, use, store, and
                            protect your information in compliance with the General Data Protection Regulation (GDPR),
                            the California Consumer Privacy Act (CCPA), and other applicable privacy laws.
                        </p>
                    </section>

                    {/* Data Controller */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">1. Data Controller</h2>
                        <p className="v2-body mb-4" style={{ color: 'var(--text-muted)' }}>
                            For the purposes of the GDPR, the data controller is:
                        </p>
                        <div className="v2-card">
                            <p className="v2-body">The Long Game</p>
                            <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>
                                Contact: <a href="mailto:privacy@thelonggame.app" className="v2-accent">privacy@thelonggame.app</a>
                            </p>
                        </div>
                    </section>

                    {/* What We Collect */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">2. Information We Collect</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="v2-label mb-2">Account Information</h3>
                                <ul className="v2-body space-y-1" style={{ color: 'var(--text-muted)', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                                    <li>Email address and name (via Google OAuth or email signup)</li>
                                    <li>Age and biological sex (for accurate training calculations)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="v2-label mb-2">Training &amp; Health Data</h3>
                                <ul className="v2-body space-y-1" style={{ color: 'var(--text-muted)', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                                    <li>Current fitness level and running history</li>
                                    <li>Race times, goals, and target events</li>
                                    <li>Injury history and pain information</li>
                                    <li>Training preferences and weekly schedule</li>
                                    <li>VO2max estimates (if provided or imported)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="v2-label mb-2">Connected Services (Optional)</h3>
                                <p className="v2-body mb-2" style={{ color: 'var(--text-muted)' }}>
                                    If you connect Garmin or Strava, we may access:
                                </p>
                                <ul className="v2-body space-y-1" style={{ color: 'var(--text-muted)', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                                    <li>Activity history (runs, workouts, durations, distances)</li>
                                    <li>Health metrics (heart rate zones, VO2max estimates)</li>
                                </ul>
                                <p className="v2-body-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                                    We only request read-only access. We never post to your accounts or share your data with these platforms.
                                </p>
                            </div>

                            <div>
                                <h3 className="v2-label mb-2">Technical Data</h3>
                                <ul className="v2-body space-y-1" style={{ color: 'var(--text-muted)', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                                    <li>Device type and browser information</li>
                                    <li>IP address (anonymized for analytics)</li>
                                    <li>Usage patterns within the application</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Legal Basis (GDPR) */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">3. Legal Basis for Processing (GDPR)</h2>
                        <p className="v2-body mb-4" style={{ color: 'var(--text-muted)' }}>
                            We process your personal data under the following legal bases:
                        </p>

                        <div className="v2-table-wrapper">
                            <table className="v2-table">
                                <thead>
                                    <tr>
                                        <th>Purpose</th>
                                        <th>Legal Basis</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Account creation &amp; authentication</td>
                                        <td>Contract performance</td>
                                    </tr>
                                    <tr>
                                        <td>Training plan generation</td>
                                        <td>Contract performance</td>
                                    </tr>
                                    <tr>
                                        <td>Health &amp; fitness data processing</td>
                                        <td>Explicit consent</td>
                                    </tr>
                                    <tr>
                                        <td>Service improvement &amp; analytics</td>
                                        <td>Legitimate interest</td>
                                    </tr>
                                    <tr>
                                        <td>Marketing communications</td>
                                        <td>Consent</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* How We Use Data */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">4. How We Use Your Information</h2>
                        <ul className="v2-body space-y-2" style={{ color: 'var(--text-muted)', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                            <li>Generate personalized training plans using evidence-based coaching methodologies</li>
                            <li>Calculate training paces and zones based on your fitness data</li>
                            <li>Adjust plans based on your progress, feedback, and imported activities</li>
                            <li>Send training reminders and plan updates (with your consent)</li>
                            <li>Analyze usage patterns to improve our algorithms and user experience</li>
                            <li>Respond to support inquiries</li>
                        </ul>
                    </section>

                    {/* Data Retention */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">5. Data Retention</h2>
                        <ul className="v2-body space-y-2" style={{ color: 'var(--text-muted)', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                            <li><strong>Account data:</strong> Retained while your account is active, deleted within 30 days of account deletion</li>
                            <li><strong>Training plans:</strong> Retained while your account is active</li>
                            <li><strong>Connected service data:</strong> Cached temporarily, refreshed on each sync, deleted on account deletion</li>
                            <li><strong>Analytics data:</strong> Aggregated and anonymized, retained for up to 2 years</li>
                        </ul>
                    </section>

                    {/* Data Sharing */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">6. Data Sharing &amp; Third Parties</h2>
                        <p className="v2-body mb-4" style={{ color: 'var(--text-muted)' }}>
                            We do not sell your personal data. We share data only with:
                        </p>
                        <div className="space-y-3">
                            <div className="v2-card">
                                <p className="v2-label mb-1">Supabase (Database &amp; Auth)</p>
                                <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>Account data, training data · US-based · SOC 2 Type II certified</p>
                            </div>
                            <div className="v2-card">
                                <p className="v2-label mb-1">Vercel (Hosting)</p>
                                <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>Application hosting · US/EU edge locations · SOC 2 certified</p>
                            </div>
                            <div className="v2-card">
                                <p className="v2-label mb-1">Garmin &amp; Strava APIs</p>
                                <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>Only when you connect · Read-only access · Disconnectable anytime</p>
                            </div>
                        </div>
                    </section>

                    {/* International Transfers */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">7. International Data Transfers</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            Your data may be transferred to and processed in the United States. For EU/EEA users,
                            we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs)
                            with our service providers, to protect your data in accordance with GDPR requirements.
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">8. Your Rights</h2>
                        <p className="v2-body mb-4" style={{ color: 'var(--text-muted)' }}>
                            Under GDPR and other privacy laws, you have the right to:
                        </p>
                        <ul className="v2-body space-y-2" style={{ color: 'var(--text-muted)', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                            <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                            <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                            <li><strong>Restriction:</strong> Limit how we process your data</li>
                            <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                            <li><strong>Withdraw Consent:</strong> Revoke consent for health data processing at any time</li>
                        </ul>
                        <p className="v2-body-sm mt-4" style={{ color: 'var(--text-muted)' }}>
                            To exercise these rights, email <a href="mailto:privacy@thelonggame.app" className="v2-accent">privacy@thelonggame.app</a>.
                            We will respond within 30 days.
                        </p>
                    </section>

                    {/* CCPA */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">9. California Privacy Rights (CCPA)</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            California residents have additional rights under the CCPA, including the right to know
                            what personal information we collect, the right to delete, and the right to opt-out of
                            the sale of personal information. <strong>We do not sell personal information.</strong>
                        </p>
                    </section>

                    {/* Cookies */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">10. Cookies &amp; Tracking</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            We use only essential cookies required for authentication and session management.
                            We do not use advertising cookies, tracking pixels, or sell data to third-party advertisers.
                            You can control cookie settings through your browser preferences.
                        </p>
                    </section>

                    {/* Security */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">11. Data Security</h2>
                        <ul className="v2-body space-y-2" style={{ color: 'var(--text-muted)', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                            <li>All data transmitted over HTTPS (TLS 1.3)</li>
                            <li>Data encrypted at rest in our database</li>
                            <li>Access controls and authentication on all systems</li>
                            <li>Regular security reviews and dependency updates</li>
                        </ul>
                    </section>

                    {/* Children */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">12. Children&apos;s Privacy</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            The Long Game is not intended for users under 16 years of age. We do not knowingly
                            collect personal data from children. If we learn we have collected data from a child
                            under 16, we will promptly delete it.
                        </p>
                    </section>

                    {/* Changes */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">13. Changes to This Policy</h2>
                        <p className="v2-body" style={{ color: 'var(--text-muted)' }}>
                            We may update this policy from time to time. Material changes will be communicated
                            via email or in-app notification at least 30 days before taking effect.
                            The &quot;Last Updated&quot; date at the top reflects the most recent revision.
                        </p>
                    </section>

                    {/* Contact & Complaints */}
                    <section className="mb-10">
                        <h2 className="v2-heading-md mb-4">14. Contact &amp; Complaints</h2>
                        <p className="v2-body mb-4" style={{ color: 'var(--text-muted)' }}>
                            For privacy-related questions or to exercise your rights:
                        </p>
                        <div className="v2-card">
                            <p className="v2-body mb-2">
                                Email: <a href="mailto:privacy@thelonggame.app" className="v2-accent">privacy@thelonggame.app</a>
                            </p>
                        </div>
                        <p className="v2-body-sm mt-4" style={{ color: 'var(--text-muted)' }}>
                            EU residents: You have the right to lodge a complaint with your local Data Protection Authority
                            if you believe we have not handled your data in accordance with GDPR.
                        </p>
                    </section>
                </article>
            </main>
            <Footer />
        </div>
    );
}
