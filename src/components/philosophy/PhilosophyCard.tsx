'use client';

import { PhilosophyMetadata } from '@/domain/philosophy/types';

interface PhilosophyCardProps {
    philosophy: PhilosophyMetadata;
    expanded?: boolean;
    recommended?: boolean;
}

export function PhilosophyCard({ philosophy, expanded = false, recommended = false }: PhilosophyCardProps) {
    return (
        <div
            className={`
                rounded-2xl border transition-all
                ${recommended
                    ? 'bg-white/[0.04] border-white/20'
                    : 'bg-white/[0.02] border-white/10'
                }
            `}
        >
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: philosophy.color }}
                    />
                    <h3 className="text-2xl font-light text-white/90">{philosophy.name}</h3>
                    <span className="text-xs text-white/40 uppercase tracking-wider">
                        {philosophy.tagline}
                    </span>
                    {recommended && (
                        <span className="ml-auto px-2 py-1 text-[10px] bg-[#19e38c]/20 text-[#19e38c] rounded-full uppercase tracking-wider">
                            Recommended
                        </span>
                    )}
                </div>

                {/* Quick stats */}
                <div className="flex gap-6 text-sm">
                    <div>
                        <span className="text-white/40">Run days:</span>{' '}
                        <span className="text-white/70">{philosophy.runDays}</span>
                    </div>
                    <div>
                        <span className="text-white/40">Long run cap:</span>{' '}
                        <span className="text-white/70">{philosophy.longRunCap}</span>
                    </div>
                </div>
            </div>

            {/* Core beliefs */}
            <div className="px-6 pb-4">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Core beliefs</p>
                <ul className="space-y-2">
                    {philosophy.coreBeliefs.map((belief, i) => (
                        <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                            <span className="text-white/30 mt-0.5">•</span>
                            {belief}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Expanded methodology */}
            {expanded && (
                <>
                    {/* Summary */}
                    <div className="px-6 py-4 border-t border-white/5">
                        <p className="text-sm text-white/50 leading-relaxed">
                            {philosophy.methodology.summary}
                        </p>
                    </div>

                    {/* Key principles */}
                    <div className="px-6 py-4 border-t border-white/5">
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                            Key principles
                        </p>
                        <ul className="space-y-3">
                            {philosophy.methodology.keyPrinciples.map((principle, i) => (
                                <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                    <span className="text-white/30 font-mono text-xs mt-0.5">
                                        {i + 1}.
                                    </span>
                                    {principle}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Typical week */}
                    <div className="px-6 py-4 border-t border-white/5">
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                            Typical week
                        </p>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {philosophy.methodology.typicalWeek.map((day, i) => {
                                const [dayName, ...rest] = day.split(': ');
                                const activity = rest.join(': ');
                                const dayLetter = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i];
                                const isRest = activity.toLowerCase().includes('rest');
                                const isLong = activity.toLowerCase().includes('long');
                                const isQuality = activity.toLowerCase().includes('tempo') ||
                                    activity.toLowerCase().includes('speed') ||
                                    activity.toLowerCase().includes('threshold') ||
                                    activity.toLowerCase().includes('vo2');

                                return (
                                    <div
                                        key={i}
                                        className={`
                                            p-2 rounded-lg text-center
                                            ${isRest ? 'bg-white/[0.02]' : 'bg-white/[0.04]'}
                                            ${isLong ? 'bg-[#19e38c]/10' : ''}
                                            ${isQuality ? 'bg-[#3a6bff]/10' : ''}
                                        `}
                                    >
                                        <p className="text-[10px] text-white/30 mb-1">{dayLetter}</p>
                                        <p className={`text-[10px] ${isRest ? 'text-white/30' : 'text-white/60'}`}>
                                            {activity.split(' ').slice(0, 2).join(' ')}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Best for */}
                    <div className="px-6 py-4 border-t border-white/5">
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                            Best for
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {philosophy.methodology.bestFor.map((item, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 text-xs bg-white/[0.05] text-white/60 rounded-full"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Challenges */}
                    <div className="px-6 py-4 border-t border-white/5">
                        <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
                            Challenges to consider
                        </p>
                        <ul className="space-y-2">
                            {philosophy.methodology.challenges.map((challenge, i) => (
                                <li key={i} className="text-sm text-white/50 flex items-start gap-2">
                                    <span className="text-[#f59e0b] mt-0.5">⚠</span>
                                    {challenge}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Always included note */}
                    <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01] rounded-b-2xl">
                        <p className="text-xs text-white/30 leading-relaxed">
                            {philosophy.alwaysIncluded}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
