"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/ui/AppHeader';
import { Toggle } from '@/components/ui/Toggle';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';

/**
 * Settings Page
 * 
 * Uses standardized components and design tokens
 */

export default function SettingsPage() {
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(true);
    const [garminStatus, setGarminStatus] = useState<{
        connected: boolean;
        garminUserId?: string | null;
        lastActivityAt?: string | null;
        lastHealthDate?: string | null;
    } | null>(null);
    const [garminBusy, setGarminBusy] = useState(false);
    const [garminMessage, setGarminMessage] = useState<string | null>(null);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [importBusy, setImportBusy] = useState(false);
    const [importMessage, setImportMessage] = useState<string | null>(null);
    const [stravaStatus, setStravaStatus] = useState<{
        connected: boolean;
        stravaAthleteId?: number | null;
        lastActivityAt?: string | null;
    } | null>(null);
    const [stravaBusy, setStravaBusy] = useState(false);
    const [stravaMessage, setStravaMessage] = useState<string | null>(null);
    const [stravaWebhookUrl, setStravaWebhookUrl] = useState('');
    const [garminAuthRequired, setGarminAuthRequired] = useState(false);
    const [stravaAuthRequired, setStravaAuthRequired] = useState(false);
    const authRequired = garminAuthRequired || stravaAuthRequired;
    const stravaConnected = Boolean(stravaStatus?.connected);
    const hasHealthData = Boolean(garminStatus?.lastHealthDate);
    const setupComplete = stravaConnected && hasHealthData;
    const garminApiConnected = Boolean(garminStatus?.connected);
    const [signOutBusy, setSignOutBusy] = useState(false);

    useEffect(() => {
        setWebhookUrl(`${window.location.origin}/api/garmin/webhook`);
        setStravaWebhookUrl(`${window.location.origin}/api/strava/webhook`);
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

    const handleGarminConnect = () => {
        window.location.href = '/api/garmin/connect';
    };

    const handleGarminDisconnect = async () => {
        setGarminBusy(true);
        setGarminMessage(null);
        try {
            const response = await fetch('/api/garmin/disconnect', {
                method: 'POST',
            });
            if (response.status === 401) {
                setGarminAuthRequired(true);
                setGarminStatus(null);
                return;
            }
            if (!response.ok) throw new Error('Disconnect failed');
            const payload = await response.json().catch(() => null) as { warning?: string | null } | null;
            if (payload?.warning) {
                setGarminMessage(`Disconnected locally. Garmin deregistration warning: ${payload.warning}`);
            }
            await refreshGarminStatus();
        } catch (error) {
            setGarminMessage(error instanceof Error ? error.message : 'Disconnect failed');
        } finally {
            setGarminBusy(false);
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
        window.location.href = '/api/strava/connect';
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
            router.push('/login');
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
        <div className="min-h-screen landing-shell">
            <AppHeader backHref="/dashboard" title="Settings" />

            <main className="container-narrow py-10">
                {/* Profile */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">Profile</h2>
                    <div className="card p-6 space-y-8">
                        <div>
                            <label className="text-label block mb-2">Name</label>
                            <input type="text" defaultValue="Matt" className="input" />
                        </div>
                        <div>
                            <label className="text-label block mb-2">Email</label>
                            <input type="email" defaultValue="matt@example.com" className="input" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-label block mb-2">Weight (kg)</label>
                                <input type="number" defaultValue="75" className="input" />
                            </div>
                            <div>
                                <label className="text-label block mb-2">Age</label>
                                <input type="number" defaultValue="35" className="input" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Fitness */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">Fitness</h2>
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="font-semibold">Current VDOT</p>
                                <p className="text-body-sm text-[var(--text-muted)]">Based on your 10K time trial</p>
                            </div>
                            <p className="text-display-md text-data text-[var(--color-accent)]">48</p>
                        </div>

                        <button className="btn btn-secondary w-full">
                            Update VDOT from Race
                        </button>
                    </div>
                </section>

                {/* Integrations */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">Integrations</h2>
                    <div className="space-y-6">
                        <div className="card p-6 space-y-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <p className="text-heading-sm">Garmin data setup</p>
                                    <p className="text-body-sm text-[var(--text-muted)]">
                                        Activities sync automatically via Strava. Health metrics come from a Garmin export until Garmin API access is approved.
                                    </p>
                                </div>
                                <span className={`badge ${setupComplete ? 'badge-accent' : 'badge-warning'}`}>
                                    {authRequired ? 'Sign in required' : setupComplete ? 'Ready' : 'Finish setup'}
                                </span>
                            </div>

                            {authRequired && (
                                <div className="text-body-sm text-[var(--text-muted)]">
                                    Sign in to connect integrations and view sync status.
                                </div>
                            )}

                            <div className="grid gap-4">
                                <div className="flex items-start gap-4 rounded-xl border border-[var(--border-base)] bg-[var(--bg-muted)] p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-data">
                                        1
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-semibold">Link Garmin → Strava</p>
                                        <p className="text-body-sm text-[var(--text-muted)]">
                                            Garmin Connect app → Settings → Connected Apps → Strava → Enable.
                                        </p>
                                        <p className="text-caption">We can’t verify this step yet—just do it once.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 rounded-xl border border-[var(--border-base)] p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-muted)] text-data">
                                        2
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold">Connect Strava to The Long Game</p>
                                                <p className="text-body-sm text-[var(--text-muted)]">
                                                    Runs will appear automatically after each sync.
                                                </p>
                                            </div>
                                            <span className={`badge ${stravaConnected ? 'badge-accent' : 'badge-error'}`}>
                                                {stravaAuthRequired ? 'Sign in required' : stravaConnected ? 'Connected' : 'Not connected'}
                                            </span>
                                        </div>
                                        <div className="text-body-sm text-[var(--text-muted)]">
                                            {stravaConnected
                                                ? `Strava athlete: ${stravaStatus?.stravaAthleteId ?? 'linked'}`
                                                : 'Connect Strava to enable automatic activity sync.'}
                                        </div>
                                        {stravaStatus?.lastActivityAt && (
                                            <p className="text-body-sm text-[var(--text-muted)]">
                                                Last activity sync: {new Date(stravaStatus.lastActivityAt).toLocaleString()}
                                            </p>
                                        )}
                                        <p className="text-caption">
                                            Missing runs? Use “Sync now” to pull the last 90 days from Strava.
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleStravaConnect}
                                                disabled={stravaBusy || authRequired || stravaConnected}
                                            >
                                                Connect Strava
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={handleStravaSyncNow}
                                                disabled={stravaBusy || authRequired || !stravaConnected}
                                            >
                                                Sync now
                                            </button>
                                            <button
                                                className="btn btn-ghost"
                                                onClick={handleStravaDisconnect}
                                                disabled={stravaBusy || authRequired || !stravaConnected}
                                            >
                                                Disconnect
                                            </button>
                                        </div>
                                        {stravaMessage && (
                                            <p className="text-body-sm text-[var(--text-muted)]">{stravaMessage}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 rounded-xl border border-[var(--border-base)] p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-muted)] text-data">
                                        3
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold">Import Garmin health data (ZIP)</p>
                                                <p className="text-body-sm text-[var(--text-muted)]">
                                                    This fills sleep, HRV, stress, and Body Battery history.
                                                </p>
                                            </div>
                                            <span className={`badge ${hasHealthData ? 'badge-accent' : 'badge-warning'}`}>
                                                {hasHealthData ? 'Imported' : 'Needed'}
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            accept=".zip,application/zip"
                                            className="input"
                                            disabled={authRequired || importBusy}
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (file) {
                                                    void handleGarminExportImport(file);
                                                    event.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <p className="text-caption">
                                            Garmin Connect web → Account Settings → Export Data.
                                        </p>
                                        {garminStatus?.lastHealthDate && (
                                            <p className="text-body-sm text-[var(--text-muted)]">
                                                Last health import: {garminStatus.lastHealthDate}
                                            </p>
                                        )}
                                        {garminStatus?.lastActivityAt && (
                                            <p className="text-body-sm text-[var(--text-muted)]">
                                                Last Garmin activity: {new Date(garminStatus.lastActivityAt).toLocaleString()}
                                            </p>
                                        )}
                                        {importMessage && (
                                            <p className="text-body-sm text-[var(--text-muted)]">{importMessage}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-[var(--border-base)] bg-[var(--bg-muted)] p-4 text-body-sm text-[var(--text-muted)]">
                                Tip: After each workout, open Garmin Connect to sync your watch. Strava forwards new activities automatically.
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="card card-muted p-4 space-y-2">
                                    <p className="text-label">Activities (automatic)</p>
                                    <p className="text-body-sm text-[var(--text-muted)]">
                                        Distance, pace, splits, and heart rate from Strava.
                                    </p>
                                    <p className="text-body-sm">
                                        {stravaConnected ? 'Strava connected and listening for syncs.' : 'Connect Strava to enable auto sync.'}
                                    </p>
                                </div>
                                <div className="card card-muted p-4 space-y-2">
                                    <p className="text-label">Health metrics</p>
                                    <p className="text-body-sm text-[var(--text-muted)]">
                                        Sleep, HRV, stress, and Body Battery from Garmin export.
                                    </p>
                                    <p className="text-body-sm">
                                        {hasHealthData
                                            ? `Health data imported through ${garminStatus?.lastHealthDate ?? 'recent export'}.`
                                            : 'Upload a Garmin export ZIP to backfill health data.'}
                                    </p>
                                </div>
                            </div>

                            <details className="rounded-xl border border-[var(--border-base)] p-4">
                                <summary className="font-semibold cursor-pointer">Advanced & troubleshooting</summary>
                                <div className="mt-4 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">Garmin API (official)</p>
                                                <p className="text-body-sm text-[var(--text-muted)]">If Garmin approves full API access.</p>
                                            </div>
                                            <span className={`badge ${garminApiConnected ? 'badge-accent' : 'badge-error'}`}>
                                                {garminAuthRequired ? 'Sign in required' : garminApiConnected ? 'Connected' : 'Not connected'}
                                            </span>
                                        </div>
                                        <div className="text-body-sm text-[var(--text-muted)]">
                                            {garminApiConnected
                                                ? `Garmin user: ${garminStatus?.garminUserId ?? 'linked'}`
                                                : 'Optional. Most users will rely on Strava + Garmin export instead.'}
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                className="btn btn-secondary"
                                                onClick={handleGarminConnect}
                                                disabled={garminBusy || authRequired || garminApiConnected}
                                            >
                                                Connect Garmin API
                                            </button>
                                            <button
                                                className="btn btn-ghost"
                                                onClick={handleGarminDisconnect}
                                                disabled={garminBusy || authRequired || !garminApiConnected}
                                            >
                                                Disconnect
                                            </button>
                                        </div>
                                        {garminMessage && (
                                            <p className="text-body-sm text-[var(--text-muted)]">{garminMessage}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-label block mb-2">Manual FIT upload</label>
                                        <input
                                            type="file"
                                            accept=".fit"
                                            className="input"
                                            disabled={authRequired}
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (file) {
                                                    void handleFitUpload(file);
                                                    event.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <p className="text-caption">Use this if an activity doesn’t show up automatically.</p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-label mb-2">Garmin webhook URL</p>
                                            <div className="text-body-sm font-mono bg-[var(--bg-muted)] rounded-lg px-3 py-2">
                                                {webhookUrl || '...'}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-label mb-2">Strava webhook URL</p>
                                            <div className="text-body-sm font-mono bg-[var(--bg-muted)] rounded-lg px-3 py-2">
                                                {stravaWebhookUrl || '...'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </section>

                {/* Appearance */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">Appearance</h2>
                    <div className="card p-6">
                        <Toggle
                            checked={darkMode}
                            onChange={setDarkMode}
                            label="Dark Mode"
                            description="Use dark theme"
                        />
                    </div>
                </section>

                {/* Equipment */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">Equipment</h2>
                    <div className="card p-6">
                        <p className="text-body-sm text-[var(--text-muted)] mb-4">
                            We'll customize strength workouts based on your equipment.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Barbell', 'Dumbbells', 'Kettlebells', 'Pull-up Bar'].map((eq) => (
                                <span
                                    key={eq}
                                    className="badge"
                                    style={{
                                        backgroundColor: 'var(--domain-strength-tint)',
                                        color: 'var(--color-strength)'
                                    }}
                                >
                                    {eq}
                                </span>
                            ))}
                            <button className="badge hover:bg-[var(--bg-subtle)]">
                                + Add
                            </button>
                        </div>
                    </div>
                </section>

                {/* Account */}
                <section className="mb-10">
                    <h2 className="text-heading-md mb-4">Account</h2>
                    <div className="card p-6 space-y-3">
                        <p className="text-body-sm text-[var(--text-muted)]">
                            Sign out on this device if you are done with setup.
                        </p>
                        <button
                            className={`btn btn-secondary w-full ${signOutBusy ? 'btn-loading' : ''}`}
                            onClick={handleSignOut}
                            disabled={signOutBusy}
                        >
                            {signOutBusy ? 'Signing out...' : 'Sign out'}
                        </button>
                    </div>
                </section>

                {/* Danger Zone */}
                <section>
                    <h2 className="text-heading-md mb-4 text-[var(--color-error)]">Danger Zone</h2>
                    <div className="card p-6" style={{ borderColor: 'var(--color-error)' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Delete Account</p>
                                <p className="text-body-sm text-[var(--text-muted)]">Permanently delete your account and data</p>
                            </div>
                            <button className="btn btn-sm btn-destructive">
                                Delete
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
