"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toggle } from '@/components/ui/Toggle';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';
import { usePlan } from '@/domain/plan/context';
import { motion } from 'framer-motion';

/**
 * Settings Page V2
 * Week aesthetic: Dark, atmospheric, light typography
 */

interface ProfileData {
    name: string;
    email: string;
    age: number | null;
}

export default function SettingsPage() {
    const router = useRouter();
    const { plan } = usePlan();

    // Profile state
    const [profile, setProfile] = useState<ProfileData>({
        name: '',
        email: '',
        age: null,
    });
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState<string | null>(null);

    const [garminStatus, setGarminStatus] = useState<{
        connected: boolean;
        garminUserId?: string | null;
        lastActivityAt?: string | null;
        lastHealthDate?: string | null;
    } | null>(null);
    const [garminBusy, setGarminBusy] = useState(false);
    const [garminMessage, setGarminMessage] = useState<string | null>(null);
    const [importBusy, setImportBusy] = useState(false);
    const [importMessage, setImportMessage] = useState<string | null>(null);
    const [stravaStatus, setStravaStatus] = useState<{
        connected: boolean;
        stravaAthleteId?: number | null;
        lastActivityAt?: string | null;
    } | null>(null);
    const [stravaBusy, setStravaBusy] = useState(false);
    const [stravaMessage, setStravaMessage] = useState<string | null>(null);
    const [garminAuthRequired, setGarminAuthRequired] = useState(false);
    const [stravaAuthRequired, setStravaAuthRequired] = useState(false);
    const [isLocalhost, setIsLocalhost] = useState(false);
    const authRequired = garminAuthRequired || stravaAuthRequired;
    const stravaConnected = Boolean(stravaStatus?.connected);
    const hasHealthData = Boolean(garminStatus?.lastHealthDate);
    const setupComplete = stravaConnected && hasHealthData;
    const [signOutBusy, setSignOutBusy] = useState(false);

    const currentVdot = plan?.vdot || null;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const supabase = createSupabaseBrowserClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setProfileLoading(false);
                    return;
                }

                const email = user.email || '';

                const { data: athlete } = await supabase
                    .from('athletes')
                    .select('name, age')
                    .eq('id', user.id)
                    .single();

                setProfile({
                    name: athlete?.name || user.user_metadata?.name || email.split('@')[0] || '',
                    email,
                    age: athlete?.age || null,
                });
            } catch (error) {
                console.warn('Failed to load profile:', error);
            } finally {
                setProfileLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        setProfileMessage(null);

        try {
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setProfileMessage('Not signed in');
                return;
            }

            const { error } = await supabase
                .from('athletes')
                .upsert({
                    id: user.id,
                    name: profile.name,
                    age: profile.age,
                }, { onConflict: 'id' });

            if (error) {
                setProfileMessage('Failed to save profile');
                console.error('Profile save error:', error);
            } else {
                setProfileMessage('Profile saved!');
                setTimeout(() => setProfileMessage(null), 3000);
            }
        } catch (error) {
            setProfileMessage('Failed to save profile');
            console.error('Profile save error:', error);
        } finally {
            setProfileSaving(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const connect = params.get('connect');
        const error = params.get('error');
        const status = params.get('status');
        const host = window.location.hostname;
        setIsLocalhost(host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local'));
        if (connect && error) {
            const message = formatConnectError(connect, error);
            if (connect === 'strava') {
                setStravaMessage(message);
            }
        }
        if (connect === 'strava' && status === 'connected') {
            setStravaMessage('Strava connected.');
        }
        void refreshGarminStatus();
        void refreshStravaStatus();
    }, []);

    const refreshGarminStatus = async () => {
        try {
            setGarminAuthRequired(false);
            const response = await fetch('/api/garmin/status');
            if (response.status === 401) {
                setGarminAuthRequired(true);
                setGarminStatus(null);
                return;
            }
            if (!response.ok) throw new Error('Unable to load Garmin status');
            const data = await response.json() as { connected: boolean; garminUserId?: string | null; lastActivityAt?: string | null; lastHealthDate?: string | null; };
            setGarminStatus(data);
        } catch (error) {
            setGarminMessage(error instanceof Error ? error.message : 'Garmin status failed');
        }
    };

    const handleFitUpload = async (file: File) => {
        setGarminBusy(true);
        setGarminMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/garmin/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.status === 401) {
                setGarminAuthRequired(true);
                setGarminStatus(null);
                return;
            }
            if (!response.ok) throw new Error('FIT upload failed');
            setGarminMessage('FIT uploaded and processed.');
            await refreshGarminStatus();
        } catch (error) {
            setGarminMessage(error instanceof Error ? error.message : 'Upload failed');
        } finally {
            setGarminBusy(false);
        }
    };

    const handleGarminExportImport = async (file: File) => {
        setImportBusy(true);
        setImportMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/garmin/import', {
                method: 'POST',
                body: formData,
            });

            if (response.status === 401) {
                setGarminAuthRequired(true);
                setGarminStatus(null);
                return;
            }
            if (!response.ok) throw new Error('Garmin export import failed');
            const payload = await response.json().catch(() => null) as { result?: { activitiesImported?: number; healthDaysImported?: number } } | null;
            if (payload?.result) {
                setImportMessage(`Imported ${payload.result.activitiesImported ?? 0} activities and ${payload.result.healthDaysImported ?? 0} health days.`);
            } else {
                setImportMessage('Garmin export imported.');
            }
            await refreshGarminStatus();
        } catch (error) {
            setImportMessage(error instanceof Error ? error.message : 'Garmin export import failed');
        } finally {
            setImportBusy(false);
        }
    };

    const refreshStravaStatus = async () => {
        try {
            setStravaAuthRequired(false);
            const response = await fetch('/api/strava/status');
            if (response.status === 401) {
                setStravaAuthRequired(true);
                setStravaStatus(null);
                return;
            }
            if (!response.ok) throw new Error('Unable to load Strava status');
            const data = await response.json() as { connected: boolean; stravaAthleteId?: number | null; lastActivityAt?: string | null };
            setStravaStatus(data);
        } catch (error) {
            setStravaMessage(error instanceof Error ? error.message : 'Strava status failed');
        }
    };

    const handleStravaConnect = () => {
        window.location.href = '/api/strava/connect?from=settings';
    };

    const handleStravaDisconnect = async () => {
        setStravaBusy(true);
        setStravaMessage(null);
        try {
            const response = await fetch('/api/strava/disconnect', {
                method: 'POST',
            });
            if (response.status === 401) {
                setStravaAuthRequired(true);
                setStravaStatus(null);
                return;
            }
            if (!response.ok) throw new Error('Disconnect failed');
            const payload = await response.json().catch(() => null) as { warning?: string | null } | null;
            if (payload?.warning) {
                setStravaMessage(`Disconnected locally. Strava deauthorization warning: ${payload.warning}`);
            }
            await refreshStravaStatus();
        } catch (error) {
            setStravaMessage(error instanceof Error ? error.message : 'Disconnect failed');
        } finally {
            setStravaBusy(false);
        }
    };

    const handleSignOut = async () => {
        setSignOutBusy(true);
        try {
            const supabase = createSupabaseBrowserClient();
            await supabase.auth.signOut();
            router.push('/auth');
        } catch (error) {
            setGarminMessage(error instanceof Error ? error.message : 'Sign out failed');
        } finally {
            setSignOutBusy(false);
        }
    };

    const handleStravaSyncNow = async () => {
        setStravaBusy(true);
        setStravaMessage(null);
        try {
            const response = await fetch('/api/strava/sync', {
                method: 'POST',
            });
            if (response.status === 401) {
                setStravaAuthRequired(true);
                setStravaStatus(null);
                return;
            }
            if (!response.ok) throw new Error('Strava sync failed');
            const payload = await response.json().catch(() => null) as { imported?: number; total?: number; days?: number } | null;
            if (payload) {
                setStravaMessage(`Synced ${payload.imported ?? 0} of ${payload.total ?? 0} activities from the last ${payload.days ?? 0} days.`);
            } else {
                setStravaMessage('Strava sync complete.');
            }
            await refreshStravaStatus();
        } catch (error) {
            setStravaMessage(error instanceof Error ? error.message : 'Strava sync failed');
        } finally {
            setStravaBusy(false);
        }
    };

    return (
        <div className="v2-root min-h-screen">
            {/* Header */}
            <header className="v2-nav sticky top-0 z-50">
                <div className="v2-container flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                            ← Back
                        </Link>
                        <span className="v2-heading-sm">Settings</span>
                    </div>
                    <Link href="/" className="v2-nav-logo">The Long Game</Link>
                </div>
            </header>

            <main className="v2-container-narrow py-10">
                {/* Profile */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="v2-heading-md mb-4">Profile</h2>
                    <div className="v2-card p-6 space-y-6">
                        {profileLoading ? (
                            <div className="space-y-4">
                                <div className="v2-skeleton" style={{ height: '40px' }} />
                                <div className="v2-skeleton" style={{ height: '40px' }} />
                            </div>
                        ) : (
                            <>
                                <div className="v2-form-group">
                                    <label className="v2-form-label">Name</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="v2-input"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="v2-form-group">
                                    <label className="v2-form-label">Email</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="v2-input v2-input-disabled"
                                    />
                                    <span className="v2-form-hint">Email cannot be changed here</span>
                                </div>
                                <div className="v2-form-group">
                                    <label className="v2-form-label">Age</label>
                                    <input
                                        type="number"
                                        value={profile.age || ''}
                                        onChange={(e) => setProfile({ ...profile, age: e.target.value ? Number(e.target.value) : null })}
                                        className="v2-input"
                                        placeholder="—"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={profileSaving}
                                        className="v2-btn v2-btn-secondary w-full"
                                    >
                                        {profileSaving ? 'Saving...' : 'Save Profile'}
                                    </button>
                                    {profileMessage && (
                                        <p className={`v2-body-sm mt-2 text-center ${profileMessage.includes('saved') ? 'v2-accent' : ''}`} style={profileMessage.includes('saved') ? {} : { color: 'var(--v2-error)' }}>
                                            {profileMessage}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </motion.section>

                {/* Fitness */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <h2 className="v2-heading-md mb-4">Fitness</h2>
                    <div className="v2-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="v2-heading-sm">Current VO2max (VDOT)</p>
                                <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>Update every 4-6 weeks or after a race.</p>
                            </div>
                            <p className="v2-heading-lg v2-mono v2-accent">{currentVdot || '—'}</p>
                        </div>

                        <button
                            className="v2-btn v2-btn-secondary w-full"
                            onClick={() => router.push('/onboarding')}
                        >
                            Recalibrate VO2max (rebuild plan)
                        </button>
                    </div>
                </motion.section>

                {/* Integrations */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <h2 className="v2-heading-md mb-4">Integrations</h2>
                    <div className="v2-card p-6 space-y-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-2">
                                <p className="v2-heading-sm">Recommended data setup</p>
                                <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                    Activities sync automatically via Strava. Health metrics come from a Garmin export ZIP.
                                </p>
                            </div>
                            <span className={`v2-badge ${setupComplete ? 'v2-badge-accent' : ''}`}>
                                {authRequired ? 'Sign in required' : setupComplete ? 'Ready' : 'Recommended'}
                            </span>
                        </div>

                        {/* Step 1: Garmin → Strava */}
                        <div className="v2-card p-4 flex items-start gap-4" style={{ background: 'var(--v2-bg-elevated)' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center v2-mono" style={{ background: 'var(--v2-bg-hover)' }}>1</div>
                            <div className="space-y-1">
                                <p className="v2-heading-sm">Link Garmin → Strava</p>
                                <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                    Garmin Connect app → Settings → Connected Apps → Strava → Enable.
                                </p>
                            </div>
                        </div>

                        {/* Step 2: Strava */}
                        <div className="v2-card p-4 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center v2-mono" style={{ background: 'var(--v2-bg-elevated)' }}>2</div>
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="v2-heading-sm">Connect Strava to The Long Game</p>
                                        <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                            Runs will appear automatically after each sync.
                                        </p>
                                    </div>
                                    <span className={`v2-badge ${stravaConnected ? 'v2-badge-accent' : ''}`} style={!stravaConnected ? { background: 'var(--v2-error-subtle)', color: 'var(--v2-error)' } : {}}>
                                        {stravaAuthRequired ? 'Sign in required' : stravaConnected ? 'Connected' : 'Not connected'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        className="v2-btn v2-btn-primary v2-btn-sm"
                                        onClick={handleStravaConnect}
                                        disabled={stravaBusy || authRequired || stravaConnected || isLocalhost}
                                    >
                                        Connect Strava
                                    </button>
                                    <button
                                        className="v2-btn v2-btn-secondary v2-btn-sm"
                                        onClick={handleStravaSyncNow}
                                        disabled={stravaBusy || authRequired || !stravaConnected}
                                    >
                                        Sync now
                                    </button>
                                    <button
                                        className="v2-btn v2-btn-ghost v2-btn-sm"
                                        onClick={handleStravaDisconnect}
                                        disabled={stravaBusy || authRequired || !stravaConnected}
                                    >
                                        Disconnect
                                    </button>
                                </div>
                                {stravaMessage && (
                                    <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>{stravaMessage}</p>
                                )}
                            </div>
                        </div>

                        {/* Step 3: Garmin Health */}
                        <div className="v2-card p-4 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center v2-mono" style={{ background: 'var(--v2-bg-elevated)' }}>3</div>
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="v2-heading-sm">Import Garmin health data (ZIP)</p>
                                        <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                                            This fills sleep, HRV, stress, and Body Battery history.
                                        </p>
                                    </div>
                                    <span className={`v2-badge ${hasHealthData ? 'v2-badge-accent' : ''}`}>
                                        {hasHealthData ? 'Imported' : 'Needed'}
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    accept=".zip,application/zip"
                                    className="v2-input"
                                    disabled={authRequired || importBusy}
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            void handleGarminExportImport(file);
                                            event.currentTarget.value = '';
                                        }
                                    }}
                                />
                                {importMessage && (
                                    <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>{importMessage}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Account */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <h2 className="v2-heading-md mb-4">Account</h2>
                    <div className="v2-card p-6 space-y-3">
                        <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>
                            Sign out on this device if you are done with setup.
                        </p>
                        <button
                            className="v2-btn v2-btn-secondary w-full"
                            onClick={handleSignOut}
                            disabled={signOutBusy}
                        >
                            {signOutBusy ? 'Signing out...' : 'Sign out'}
                        </button>
                    </div>
                </motion.section>

                {/* Danger Zone */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <h2 className="v2-heading-md mb-4" style={{ color: 'var(--v2-error)' }}>Danger Zone</h2>
                    <div className="v2-card p-6" style={{ borderColor: 'var(--v2-error)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="v2-heading-sm">Delete Account</p>
                                <p className="v2-body-sm" style={{ color: 'var(--v2-text-muted)' }}>Permanently delete your account and data</p>
                            </div>
                            <button className="v2-btn v2-btn-sm" style={{ background: 'var(--v2-error)', color: 'white' }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </motion.section>
            </main>
        </div>
    );
}

function formatConnectError(provider: string, error: string) {
    const label = provider === 'strava' ? 'Strava' : 'Device';
    if (error === 'missing_config') {
        return `${label} isn't configured yet. Add the ${label.toUpperCase()} client ID, secret, and redirect URL, then try again.`;
    }
    if (error === 'unauthorized') {
        return `Sign in to connect ${label}, then try again.`;
    }
    if (error === 'invalid_state' || error === 'expired_state') {
        return `${label} connection expired. Try connecting again.`;
    }
    if (error === 'connect_failed') {
        return `We couldn't start the ${label} connection. Try again in a moment.`;
    }
    return `We couldn't start the ${label} connection.`;
}
