"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Toggle } from '@/components/ui/Toggle';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';
import { usePlan } from '@/domain/plan/context';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Settings Page V2
 * Week aesthetic: Dark, atmospheric, light typography
 * 
 * Features:
 * - Profile editing (name, age)
 * - Notification preferences (persisted to DB)
 * - Units preference (persisted to DB)
 * - Strava integration
 * - Account deletion with confirmation modal
 */

interface ProfileData {
    name: string;
    email: string;
    age: number | null;
}

interface PreferencesData {
    notifyTrainingReminders: boolean;
    notifyWeeklySummary: boolean;
    units: 'miles' | 'kilometers';
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

    // Preferences state
    const [preferences, setPreferences] = useState<PreferencesData>({
        notifyTrainingReminders: true,
        notifyWeeklySummary: true,
        units: 'miles',
    });
    const [prefSaving, setPrefSaving] = useState(false);

    // Strava state
    const [stravaStatus, setStravaStatus] = useState<{
        connected: boolean;
        stravaAthleteId?: number | null;
        lastActivityAt?: string | null;
    } | null>(null);
    const [stravaBusy, setStravaBusy] = useState(false);
    const [stravaMessage, setStravaMessage] = useState<string | null>(null);
    const [stravaAuthRequired, setStravaAuthRequired] = useState(false);
    const [isLocalhost, setIsLocalhost] = useState(false);
    const stravaConnected = Boolean(stravaStatus?.connected);
    const [signOutBusy, setSignOutBusy] = useState(false);

    // Deletion state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const currentVdot = plan?.vdot || null;

    // Load profile and preferences
    useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createSupabaseBrowserClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setProfileLoading(false);
                    return;
                }

                const email = user.email || '';

                // Query includes new columns - cast to any until types are regenerated
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: athleteData } = await supabase
                    .from('athletes')
                    .select('name, age, notify_training_reminders, notify_weekly_summary, units')
                    .eq('id', user.id)
                    .single();

                const athlete = athleteData as {
                    name?: string;
                    age?: number | null;
                    notify_training_reminders?: boolean;
                    notify_weekly_summary?: boolean;
                    units?: string;
                } | null;

                setProfile({
                    name: athlete?.name || user.user_metadata?.name || email.split('@')[0] || '',
                    email,
                    age: athlete?.age || null,
                });

                if (athlete) {
                    setPreferences({
                        notifyTrainingReminders: athlete.notify_training_reminders ?? true,
                        notifyWeeklySummary: athlete.notify_weekly_summary ?? true,
                        units: (athlete.units as 'miles' | 'kilometers') || 'miles',
                    });
                }
            } catch (error) {
                console.warn('Failed to load profile:', error);
            } finally {
                setProfileLoading(false);
            }
        };

        fetchData();
    }, []);

    // Strava status check
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
        void refreshStravaStatus();
    }, []);

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

    const handlePreferenceChange = async (key: keyof PreferencesData, value: boolean | string) => {
        // Optimistic update
        setPreferences(prev => ({ ...prev, [key]: value }));
        setPrefSaving(true);

        try {
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const updateData: Record<string, unknown> = {};
            if (key === 'notifyTrainingReminders') updateData.notify_training_reminders = value;
            if (key === 'notifyWeeklySummary') updateData.notify_weekly_summary = value;
            if (key === 'units') updateData.units = value;

            await supabase
                .from('athletes')
                .update(updateData)
                .eq('id', user.id);
        } catch (error) {
            console.error('Failed to save preference:', error);
            // Revert on error would go here
        } finally {
            setPrefSaving(false);
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
            console.error('Sign out failed:', error);
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

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        setDeleteBusy(true);
        setDeleteError(null);

        try {
            const supabase = createSupabaseBrowserClient();

            // Call the transaction-safe RPC function
            const { error } = await supabase.rpc('delete_user_account');

            if (error) {
                setDeleteError('Failed to delete account. Please try again.');
                console.error('Delete account error:', error);
                return;
            }

            // Sign out and redirect
            await supabase.auth.signOut();
            router.push('/');
        } catch (error) {
            setDeleteError('An error occurred. Please try again.');
            console.error('Delete account error:', error);
        } finally {
            setDeleteBusy(false);
        }
    };

    return (
        <div className="v2-root min-h-screen">
            {/* Header */}
            <header className="v2-nav sticky top-0 z-50">
                <div className="v2-container flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>
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
                                <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>Update every 4-6 weeks or after a race.</p>
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

                {/* Strava Integration */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <h2 className="v2-heading-md mb-4">Strava Integration</h2>
                    <div className="v2-card p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="v2-heading-sm">Connect Strava</p>
                                <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>
                                    Sync your runs automatically. Connect Garmin → Strava first in the Garmin Connect app.
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
                                disabled={stravaBusy || stravaAuthRequired || stravaConnected || isLocalhost}
                            >
                                Connect Strava
                            </button>
                            <button
                                className="v2-btn v2-btn-secondary v2-btn-sm"
                                onClick={handleStravaSyncNow}
                                disabled={stravaBusy || stravaAuthRequired || !stravaConnected}
                            >
                                Sync now
                            </button>
                            <button
                                className="v2-btn v2-btn-ghost v2-btn-sm"
                                onClick={handleStravaDisconnect}
                                disabled={stravaBusy || stravaAuthRequired || !stravaConnected}
                            >
                                Disconnect
                            </button>
                        </div>
                        {stravaMessage && (
                            <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>{stravaMessage}</p>
                        )}
                        {isLocalhost && (
                            <p className="v2-mono" style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                                Strava OAuth only works on production. Deploy to connect.
                            </p>
                        )}
                    </div>
                </motion.section>

                {/* Preferences */}
                <motion.section
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                >
                    <h2 className="v2-heading-md mb-4">Preferences</h2>
                    <div className="v2-card p-6 space-y-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="v2-heading-sm">Training Reminders</p>
                                <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>
                                    Get notified about upcoming workouts
                                </p>
                            </div>
                            <Toggle
                                checked={preferences.notifyTrainingReminders}
                                onChange={(checked) => handlePreferenceChange('notifyTrainingReminders', checked)}
                                disabled={prefSaving}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="v2-heading-sm">Weekly Progress Summary</p>
                                <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>
                                    Receive a recap every Monday
                                </p>
                            </div>
                            <Toggle
                                checked={preferences.notifyWeeklySummary}
                                onChange={(checked) => handlePreferenceChange('notifyWeeklySummary', checked)}
                                disabled={prefSaving}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="v2-heading-sm">Units</p>
                                <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>
                                    Distances and paces displayed in
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className={`v2-btn v2-btn-sm ${preferences.units === 'miles' ? 'v2-btn-primary' : 'v2-btn-ghost'}`}
                                    onClick={() => handlePreferenceChange('units', 'miles')}
                                    disabled={prefSaving}
                                >
                                    Miles
                                </button>
                                <button
                                    className={`v2-btn v2-btn-sm ${preferences.units === 'kilometers' ? 'v2-btn-primary' : 'v2-btn-ghost'}`}
                                    onClick={() => handlePreferenceChange('units', 'kilometers')}
                                    disabled={prefSaving}
                                >
                                    Kilometers
                                </button>
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
                        <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>
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
                                <p className="v2-body-sm" style={{ color: 'var(--text-muted)' }}>Permanently delete your account and all data</p>
                            </div>
                            <button
                                className="v2-btn v2-btn-sm"
                                style={{ background: 'var(--v2-error)', color: 'white' }}
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </motion.section>
            </main>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0, 0, 0, 0.8)' }}
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="v2-card p-6 max-w-md w-full"
                            style={{ borderColor: 'var(--v2-error)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--v2-error-subtle)' }}>
                                        <AlertTriangle size={20} style={{ color: 'var(--v2-error)' }} />
                                    </div>
                                    <h3 className="v2-heading-md">Delete Account</h3>
                                </div>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="p-1 rounded hover:bg-white/10"
                                >
                                    <X size={20} style={{ color: 'var(--text-muted)' }} />
                                </button>
                            </div>

                            <p className="v2-body-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                                This will permanently delete:
                            </p>
                            <ul className="v2-body-sm mb-6 space-y-1" style={{ color: 'var(--text-muted)' }}>
                                <li>• All your training plans and workouts</li>
                                <li>• Your durability assessments</li>
                                <li>• Your VDOT history and progress</li>
                                <li>• All connected integrations</li>
                            </ul>

                            <p className="v2-body-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                                Type <strong style={{ color: 'var(--v2-error)' }}>DELETE</strong> to confirm:
                            </p>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="v2-input mb-4"
                                placeholder="Type DELETE"
                                autoComplete="off"
                            />

                            {deleteError && (
                                <p className="v2-body-sm mb-4" style={{ color: 'var(--v2-error)' }}>{deleteError}</p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    className="v2-btn v2-btn-secondary flex-1"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="v2-btn flex-1"
                                    style={{
                                        background: deleteConfirmText === 'DELETE' ? 'var(--v2-error)' : 'var(--bg-elevated)',
                                        color: deleteConfirmText === 'DELETE' ? 'white' : 'var(--text-muted)',
                                        cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                                    }}
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmText !== 'DELETE' || deleteBusy}
                                >
                                    {deleteBusy ? 'Deleting...' : 'Delete Forever'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
