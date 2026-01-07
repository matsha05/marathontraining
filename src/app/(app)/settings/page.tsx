"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { createSupabaseBrowserClient } from '@/infrastructure/supabase';
import { usePlan } from '@/domain/plan/context';
import { downloadPlanAsJSON, clearPlan } from '@/domain/plan/service';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, X, Download, RefreshCcw, ChevronRight,
    Calendar, TrendingUp, Target, Zap, Activity, Moon
} from 'lucide-react';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import { AvatarId, DEFAULT_AVATAR_ID, parseAvatarId } from '@/domain/user/avatars';

/**
 * Settings Page - V3 Premium Design
 * 
 * Design principles from globals.css V3:
 * - User profile card with gradient avatar
 * - VDOT as hero metric with accent glow
 * - Rich training plan details with phase and coach info
 * - Icons in list rows for visual scanning
 * - Premium card styling with subtle depth
 * - Destructive actions visually separated
 */

interface ProfileData {
    name: string;
    email: string;
    dateOfBirth: string | null;  // ISO date
    avatar: AvatarId | null;
}

// Helper to calculate age from DOB
function calculateAgeFromDob(dob: string): number {
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return Math.max(0, age);
}

interface PreferencesData {
    notifyTrainingReminders: boolean;
    notifyWeeklySummary: boolean;
    units: 'miles' | 'kilometers';
}



// Format pace from seconds to min:sec
function formatPace(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = Math.round(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function SettingsPage() {
    const router = useRouter();
    const { plan, refreshPlan } = usePlan();

    // Profile state
    const [profile, setProfile] = useState<ProfileData>({ name: '', email: '', dateOfBirth: null, avatar: null });
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileEditing, setProfileEditing] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    // Preferences state
    const [preferences, setPreferences] = useState<PreferencesData>({
        notifyTrainingReminders: true,
        notifyWeeklySummary: true,
        units: 'miles',
    });
    const [prefSaving, setPrefSaving] = useState(false);

    // Strava state
    const [stravaStatus, setStravaStatus] = useState<{ connected: boolean } | null>(null);
    const [stravaBusy, setStravaBusy] = useState(false);
    const [isLocalhost, setIsLocalhost] = useState(false);
    const stravaConnected = Boolean(stravaStatus?.connected);

    const [signOutBusy, setSignOutBusy] = useState(false);
    const [resetBusy, setResetBusy] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const currentVdot = plan?.vdot || null;

    // Load profile
    useEffect(() => {
        const fetchData = async () => {
            try {
                const supabase = createSupabaseBrowserClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { setProfileLoading(false); return; }

                const email = user.email || '';
                const { data: athlete } = await supabase
                    .from('athletes')
                    .select('name, date_of_birth, age, avatar, notify_training_reminders, notify_weekly_summary, units')
                    .eq('id', user.id)
                    .single() as { data: { name?: string; date_of_birth?: string; age?: number; avatar?: string; notify_training_reminders?: boolean; notify_weekly_summary?: boolean; units?: string } | null };

                setProfile({
                    name: athlete?.name || user.user_metadata?.name || email.split('@')[0] || '',
                    email,
                    dateOfBirth: athlete?.date_of_birth || null,
                    avatar: athlete?.avatar ? parseAvatarId(athlete.avatar) : null,
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
        const host = window.location.hostname;
        setIsLocalhost(host === 'localhost' || host === '127.0.0.1');
        fetch('/api/strava/status').then(r => r.ok ? r.json() : null).then(d => d && setStravaStatus(d)).catch(() => { });
    }, []);

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Calculate age from DOB for backwards compatibility
                const calculatedAge = profile.dateOfBirth ? calculateAgeFromDob(profile.dateOfBirth) : null;
                await supabase.from('athletes').upsert({
                    id: user.id,
                    name: profile.name,
                    date_of_birth: profile.dateOfBirth,
                    age: calculatedAge,  // Keep age synced for backwards compat
                    avatar: profile.avatar,
                }, { onConflict: 'id' });
            }
            setProfileEditing(false);
        } catch (error) {
            console.error('Profile save error:', error);
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePreferenceChange = async (key: keyof PreferencesData, value: boolean | string) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
        setPrefSaving(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const updateData: Record<string, unknown> = {};
                if (key === 'notifyTrainingReminders') updateData.notify_training_reminders = value;
                if (key === 'notifyWeeklySummary') updateData.notify_weekly_summary = value;
                if (key === 'units') updateData.units = value;
                await supabase.from('athletes').update(updateData).eq('id', user.id);
            }
        } catch (error) { console.error('Preference save error:', error); }
        finally { setPrefSaving(false); }
    };

    const handleStravaConnect = () => { window.location.href = '/api/strava/connect?from=settings'; };
    const handleStravaDisconnect = async () => {
        setStravaBusy(true);
        try {
            await fetch('/api/strava/disconnect', { method: 'POST' });
            const r = await fetch('/api/strava/status');
            if (r.ok) setStravaStatus(await r.json());
        } catch { } finally { setStravaBusy(false); }
    };

    const handleSignOut = async () => {
        setSignOutBusy(true);
        try {
            const supabase = createSupabaseBrowserClient();
            await supabase.auth.signOut();
            router.push('/auth');
        } catch { } finally { setSignOutBusy(false); }
    };

    const handleResetPlan = async () => {
        setResetBusy(true);
        try {
            await clearPlan();
            await refreshPlan();
            setShowResetModal(false);
            router.push('/regenerate');  // Quick regeneration flow
        } catch (error) { console.error('Reset failed:', error); }
        finally { setResetBusy(false); }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        setDeleteBusy(true);
        setDeleteError(null);
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.rpc('delete_user_account');
            if (error) { setDeleteError('Failed to delete account'); return; }
            await supabase.auth.signOut();
            router.push('/');
        } catch { setDeleteError('An error occurred'); }
        finally { setDeleteBusy(false); }
    };

    // Plan details
    const currentPhase = plan?.weeks?.[0]?.phase || 'base';
    const phaseLabels: Record<string, string> = { base: 'Foundation', build: 'Build', peak: 'Peak', taper: 'Taper' };
    const distanceLabels: Record<string, string> = { '5k': '5K', '10k': '10K', half: 'Half Marathon', marathon: 'Marathon', general: 'General Fitness' };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
            <SiteHeader backHref="/dashboard" title="Settings" />

            <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
                {/* ============================================================
                    HERO PROFILE CARD
                    ============================================================ */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl p-6"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-base)',
                    }}
                >
                    {profileLoading ? (
                        <div className="flex items-center gap-4">
                            <div className="skeleton w-16 h-16 rounded-full" />
                            <div className="flex-1">
                                <div className="skeleton h-5 w-32 mb-2" />
                                <div className="skeleton h-4 w-48" />
                            </div>
                        </div>
                    ) : profileEditing ? (
                        <div className="space-y-4">
                            {/* Avatar Selection - using shared component */}
                            <AvatarPicker
                                value={profile.avatar}
                                onChange={(id) => setProfile({ ...profile, avatar: id })}
                                columns={6}
                                size="sm"
                                label="Avatar"
                            />
                            <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-subtle)' }}>Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="input"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-subtle)' }}>Date of Birth</label>
                                <input
                                    type="date"
                                    value={profile.dateOfBirth || ''}
                                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value || null })}
                                    className="input"
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                                    style={{
                                        colorScheme: 'dark',
                                    }}
                                />
                                {profile.dateOfBirth && (
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                        Age: {calculateAgeFromDob(profile.dateOfBirth)} years old
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setProfileEditing(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button onClick={handleSaveProfile} disabled={profileSaving} className="btn btn-primary flex-1">
                                    {profileSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="flex items-center gap-4 cursor-pointer group"
                            onClick={() => setProfileEditing(true)}
                        >
                            {/* Avatar - using shared component */}
                            <div className="transition-transform group-hover:scale-105">
                                <AvatarDisplay
                                    avatarId={profile.avatar}
                                    name={profile.name}
                                    size={64}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-semibold truncate">{profile.name || 'Add name'}</h2>
                                <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{profile.email}</p>
                            </div>
                            <ChevronRight size={20} style={{ color: 'var(--text-subtle)' }} />
                        </div>
                    )}
                </motion.section>

                {/* ============================================================
                    VDOT HERO METRIC
                    ============================================================ */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="rounded-2xl p-6 relative overflow-hidden"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-base)',
                    }}
                >
                    {/* Subtle accent glow */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle at 80% 20%, color-mix(in srgb, var(--color-accent) 4%, transparent), transparent 60%)',
                        }}
                    />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-subtle)' }}>
                                Current VDOT
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Update every 4-6 weeks
                            </p>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span
                                className="text-5xl font-light tabular-nums"
                                style={{ color: 'var(--color-accent)', letterSpacing: '-0.02em' }}
                            >
                                {currentVdot || '—'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/onboarding')}
                        className="btn btn-secondary w-full mt-4"
                    >
                        Recalibrate VDOT
                    </button>
                </motion.section>

                {/* ============================================================
                    TRAINING PLAN (RICH DETAILS)
                    ============================================================ */}
                {plan && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="rounded-2xl overflow-hidden"
                        style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--color-accent)',
                        }}
                    >
                        {/* Plan header with accent */}
                        <div
                            className="px-6 py-4 flex items-center justify-between"
                            style={{
                                background: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
                                borderBottom: '1px solid var(--border-base)',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <Activity size={20} style={{ color: 'var(--color-accent)' }} />
                                <span className="font-semibold">Training Plan</span>
                            </div>
                            <Badge variant="accent">Active</Badge>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Plan overview */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{distanceLabels[plan.goalDistance] || plan.goalDistance}</h3>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        {plan.totalWeeks} weeks • Peak: {Math.round(plan.peakMileage)} mi
                                    </p>
                                </div>
                                <div
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                    style={{
                                        background: 'var(--color-accent-subtle)',
                                        color: 'var(--color-accent)',
                                    }}
                                >
                                    {phaseLabels[currentPhase] || currentPhase}
                                </div>
                            </div>

                            {/* Plan stats grid */}
                            <div
                                className="grid grid-cols-3 gap-3 py-4"
                                style={{ borderTop: '1px solid var(--border-base)', borderBottom: '1px solid var(--border-base)' }}
                            >
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Calendar size={14} style={{ color: 'var(--text-subtle)' }} />
                                    </div>
                                    <p className="text-lg font-semibold tabular-nums">{plan.totalWeeks}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Weeks</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <TrendingUp size={14} style={{ color: 'var(--text-subtle)' }} />
                                    </div>
                                    <p className="text-lg font-semibold tabular-nums">{Math.round(plan.peakMileage)}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Peak Miles</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Zap size={14} style={{ color: 'var(--text-subtle)' }} />
                                    </div>
                                    <p className="text-lg font-semibold tabular-nums">{Math.round(plan.totalMiles)}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Miles</p>
                                </div>
                            </div>

                            {/* Training paces */}
                            {plan.paces && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>
                                        Training Paces
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2.5 py-1 rounded-md text-xs" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                                            Easy: {formatPace(plan.paces.easy.min)}-{formatPace(plan.paces.easy.max)}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md text-xs" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                                            Tempo: {formatPace(plan.paces.threshold)}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md text-xs" style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
                                            Interval: {formatPace(plan.paces.interval)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={async () => await downloadPlanAsJSON()}
                                    className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2"
                                >
                                    <Download size={16} />
                                    Export
                                </button>
                                <button
                                    onClick={() => setShowResetModal(true)}
                                    className="btn btn-sm flex-1 flex items-center justify-center gap-2"
                                    style={{
                                        background: 'color-mix(in srgb, var(--color-warning) 15%, transparent)',
                                        color: 'var(--color-warning)',
                                        border: '1px solid var(--color-warning)',
                                    }}
                                >
                                    <RefreshCcw size={16} />
                                    Reset
                                </button>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* No plan state */}
                {!plan && !profileLoading && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="rounded-2xl p-6 text-center"
                        style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-base)',
                        }}
                    >
                        <Target size={32} className="mx-auto mb-3" style={{ color: 'var(--text-subtle)' }} />
                        <h3 className="font-semibold mb-1">No Training Plan</h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                            Create a personalized plan based on your goals
                        </p>
                        <button onClick={() => router.push('/onboarding')} className="btn btn-primary">
                            Start Training
                        </button>
                    </motion.section>
                )}

                {/* ============================================================
                    INTEGRATIONS
                    ============================================================ */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-base)',
                    }}
                >
                    <div
                        className="px-4 py-3.5 flex items-center justify-between"
                        style={{ borderBottom: stravaConnected ? '1px solid var(--border-base)' : 'none' }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: stravaConnected ? '#FC4C02' : 'var(--bg-muted)' }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill={stravaConnected ? 'white' : 'var(--text-muted)'}>
                                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116z" />
                                    <path d="M10.233 13.828L7.186 7.665l-3.046 6.163H0l7.186-14.16 7.187 14.16h-4.14z" opacity={stravaConnected ? "0.6" : "0.4"} />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-sm">Strava</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {isLocalhost ? 'Production only' : stravaConnected ? 'Connected' : 'Sync your runs'}
                                </p>
                            </div>
                        </div>
                        {stravaConnected ? (
                            <button
                                onClick={handleStravaDisconnect}
                                disabled={stravaBusy}
                                className="text-xs font-medium"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Disconnect
                            </button>
                        ) : !isLocalhost ? (
                            <button
                                onClick={handleStravaConnect}
                                disabled={stravaBusy}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg"
                                style={{ background: '#FC4C02', color: 'white' }}
                            >
                                Connect
                            </button>
                        ) : (
                            <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>Unavailable</span>
                        )}
                    </div>
                </motion.section>

                {/* ============================================================
                    PREFERENCES
                    ============================================================ */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-base)',
                    }}
                >
                    {/* Training Reminders */}
                    <div
                        className="px-4 py-3.5 flex items-center justify-between"
                        style={{ borderBottom: '1px solid var(--border-base)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-muted)' }}>
                                <Zap size={16} style={{ color: 'var(--color-accent)' }} />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Training Reminders</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Daily workout notifications</p>
                            </div>
                        </div>
                        <Toggle
                            checked={preferences.notifyTrainingReminders}
                            onChange={(checked) => handlePreferenceChange('notifyTrainingReminders', checked)}
                            disabled={prefSaving}
                        />
                    </div>

                    {/* Weekly Summary */}
                    <div
                        className="px-4 py-3.5 flex items-center justify-between"
                        style={{ borderBottom: '1px solid var(--border-base)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-muted)' }}>
                                <Calendar size={16} style={{ color: 'var(--color-strength)' }} />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Weekly Summary</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Recap every Monday</p>
                            </div>
                        </div>
                        <Toggle
                            checked={preferences.notifyWeeklySummary}
                            onChange={(checked) => handlePreferenceChange('notifyWeeklySummary', checked)}
                            disabled={prefSaving}
                        />
                    </div>

                    {/* Distance Units */}
                    <div className="px-4 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-muted)' }}>
                                <Target size={16} style={{ color: 'var(--color-durability)' }} />
                            </div>
                            <p className="font-medium text-sm">Distance Units</p>
                        </div>
                        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
                            <button
                                onClick={() => handlePreferenceChange('units', 'miles')}
                                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                                style={{
                                    background: preferences.units === 'miles' ? 'var(--bg-elevated)' : 'transparent',
                                    color: preferences.units === 'miles' ? 'var(--text-base)' : 'var(--text-muted)',
                                    boxShadow: preferences.units === 'miles' ? 'var(--shadow-sm)' : 'none',
                                }}
                            >
                                mi
                            </button>
                            <button
                                onClick={() => handlePreferenceChange('units', 'kilometers')}
                                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                                style={{
                                    background: preferences.units === 'kilometers' ? 'var(--bg-elevated)' : 'transparent',
                                    color: preferences.units === 'kilometers' ? 'var(--text-base)' : 'var(--text-muted)',
                                    boxShadow: preferences.units === 'kilometers' ? 'var(--shadow-sm)' : 'none',
                                }}
                            >
                                km
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* ============================================================
                    ACCOUNT ACTIONS
                    ============================================================ */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-base)',
                    }}
                >
                    <button
                        onClick={handleSignOut}
                        disabled={signOutBusy}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-[var(--bg-muted)] transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-muted)' }}>
                            <Moon size={16} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <span className="font-medium text-sm">{signOutBusy ? 'Signing out...' : 'Sign Out'}</span>
                    </button>
                </motion.section>

                {/* ============================================================
                    DANGER ZONE
                    ============================================================ */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--color-error)',
                    }}
                >
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-[color-mix(in_srgb,var(--color-error)_5%,transparent)] transition-colors"
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'color-mix(in srgb, var(--color-error) 15%, transparent)' }}
                        >
                            <AlertTriangle size={16} style={{ color: 'var(--color-error)' }} />
                        </div>
                        <div>
                            <p className="font-medium text-sm" style={{ color: 'var(--color-error)' }}>Delete Account</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Permanently remove all data</p>
                        </div>
                    </button>
                </motion.section>

                <div className="h-8" />
            </main>

            {/* Reset Plan Modal */}
            <AnimatePresence>
                {showResetModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
                        style={{ background: 'rgba(0, 0, 0, 0.6)' }}
                        onClick={() => setShowResetModal(false)}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="max-w-sm w-full card p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--v3-warning-subtle)' }}>
                                    <RefreshCcw size={20} style={{ color: 'var(--color-warning)' }} />
                                </div>
                                <h3 className="text-heading-sm">Reset Training Plan?</h3>
                            </div>
                            <p className="text-body-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                                This will clear your current plan. You&apos;ll answer a few quick questions to build a new one.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowResetModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button onClick={handleResetPlan} disabled={resetBusy} className="btn btn-primary flex-1">
                                    {resetBusy ? 'Resetting...' : 'Reset'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Account Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
                        style={{ background: 'rgba(0, 0, 0, 0.6)' }}
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="max-w-sm w-full card p-6"
                            style={{ borderColor: 'var(--color-error)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--v3-error-subtle)' }}>
                                        <AlertTriangle size={20} style={{ color: 'var(--color-error)' }} />
                                    </div>
                                    <h3 className="text-heading-sm">Delete Account</h3>
                                </div>
                                <button onClick={() => setShowDeleteModal(false)} className="p-1"><X size={20} style={{ color: 'var(--text-muted)' }} /></button>
                            </div>
                            <p className="text-body-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                                This permanently deletes all your data including plans, workouts, and preferences.
                            </p>
                            <p className="text-body-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                                Type <strong style={{ color: 'var(--color-error)' }}>DELETE</strong> to confirm:
                            </p>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="input mb-4"
                                placeholder="Type DELETE"
                                autoComplete="off"
                            />
                            {deleteError && <p className="text-body-sm mb-4" style={{ color: 'var(--color-error)' }}>{deleteError}</p>}
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmText !== 'DELETE' || deleteBusy}
                                    className="btn flex-1"
                                    style={{
                                        background: deleteConfirmText === 'DELETE' ? 'var(--color-error)' : 'var(--bg-muted)',
                                        color: deleteConfirmText === 'DELETE' ? 'white' : 'var(--text-muted)',
                                    }}
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
