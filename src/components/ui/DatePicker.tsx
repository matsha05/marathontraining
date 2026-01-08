'use client';

/**
 * THE LONG GAME - Custom Date Picker
 * 
 * V2 Design System date picker that:
 * - Entire input box is clickable to open calendar
 * - Matches dark theme with green accent
 * - Custom calendar dropdown (no native browser popup)
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

/**
 * Parse a YYYY-MM-DD string as LOCAL time (not UTC).
 * This avoids the timezone bug where "2026-05-25" becomes May 24th
 * in timezones behind UTC.
 */
function parseDateLocal(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

interface DatePickerProps {
    value: string; // YYYY-MM-DD format
    onChange: (date: string) => void;
    minDate?: string; // YYYY-MM-DD format
    maxDate?: string; // YYYY-MM-DD format
    /** Default year to show when opening calendar with no value (e.g., 1990 for DOB) */
    defaultViewYear?: number;
    placeholder?: string;
    className?: string;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePicker({
    value,
    onChange,
    minDate,
    maxDate,
    defaultViewYear,
    placeholder = 'Select date',
    className = '',
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'days' | 'months' | 'years'>('days');
    const [viewDate, setViewDate] = useState(() => {
        if (value) return parseDateLocal(value);
        // Use defaultViewYear if provided (for DOB pickers - starts at reasonable birth year)
        if (defaultViewYear) {
            return new Date(defaultViewYear, 0, 1); // January of that year
        }
        // For future dates (race dates), prefer minDate (today) to show current month
        if (minDate) return parseDateLocal(minDate);
        // Fallback to today
        return new Date();
    });
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen]);

    const minDateObj = minDate ? parseDateLocal(minDate) : null;
    const maxDateObj = maxDate ? parseDateLocal(maxDate) : null;

    const goToPrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const goToNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const selectDate = (day: number) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Format as YYYY-MM-DD in LOCAL time (not UTC) to avoid timezone shift
        const year = selected.getFullYear();
        const month = String(selected.getMonth() + 1).padStart(2, '0');
        const dayStr = String(selected.getDate()).padStart(2, '0');
        const formatted = `${year}-${month}-${dayStr}`;
        onChange(formatted);
        setIsOpen(false);
    };

    // Generate calendar days
    const getDaysInMonth = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days: { day: number; isCurrentMonth: boolean; isDisabled: boolean; isSelected: boolean; isToday: boolean }[] = [];

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: daysInPrevMonth - i,
                isCurrentMonth: false,
                isDisabled: true,
                isSelected: false,
                isToday: false,
            });
        }

        // Current month days
        const today = new Date();
        const selectedDate = value ? parseDateLocal(value) : null;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isDisabled = (minDateObj ? date < minDateObj : false)
                || (maxDateObj ? date > maxDateObj : false);
            const isSelected = selectedDate
                ? date.toDateString() === selectedDate.toDateString()
                : false;
            const isToday = date.toDateString() === today.toDateString();

            days.push({
                day,
                isCurrentMonth: true,
                isDisabled,
                isSelected,
                isToday,
            });
        }

        // Next month days to fill the grid
        const remaining = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remaining; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                isDisabled: true,
                isSelected: false,
                isToday: false,
            });
        }

        return days;
    };

    const today = new Date();
    const isTodayAllowed = (!minDateObj || today >= minDateObj)
        && (!maxDateObj || today <= maxDateObj);

    // Format display value - parse as local to avoid timezone shift
    const displayValue = value
        ? parseDateLocal(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : null;

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Input trigger - entire box is clickable */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="v3-input w-full flex items-center justify-between gap-3 cursor-pointer text-left"
                style={{ fontSize: '16px' }}
            >
                <span style={{ color: displayValue ? 'var(--text-base)' : 'var(--text-muted)' }}>
                    {displayValue || placeholder}
                </span>
                <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            </button>

            {/* Calendar Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
                        className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl overflow-hidden"
                        style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-base)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        }}
                    >
                        {/* Header - clickable to switch views */}
                        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-base)' }}>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (view === 'days') {
                                        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
                                    } else if (view === 'years') {
                                        // Go back 12 years
                                        setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1));
                                    }
                                }}
                                className="p-2 rounded-lg transition-colors hover:bg-white/10 touch-target-sm"
                                style={{ color: 'var(--text-muted)', visibility: view === 'months' ? 'hidden' : 'visible' }}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Cycle: days → years → months → days
                                    if (view === 'days') setView('years');
                                    else if (view === 'years') setView('months');
                                    else setView('days');
                                }}
                                className="text-sm font-medium hover:underline cursor-pointer"
                                style={{ color: 'var(--text-base)' }}
                            >
                                {view === 'days' && `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`}
                                {view === 'months' && `${viewDate.getFullYear()}`}
                                {view === 'years' && `${Math.floor(viewDate.getFullYear() / 12) * 12} - ${Math.floor(viewDate.getFullYear() / 12) * 12 + 11}`}
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (view === 'days') {
                                        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
                                    } else if (view === 'years') {
                                        // Go forward 12 years
                                        setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1));
                                    }
                                }}
                                className="p-2 rounded-lg transition-colors hover:bg-white/10 touch-target-sm"
                                style={{ color: 'var(--text-muted)', visibility: view === 'months' ? 'hidden' : 'visible' }}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Years Grid */}
                        {view === 'years' && (
                            <div className="grid grid-cols-4 gap-2 p-4">
                                {Array.from({ length: 12 }, (_, i) => {
                                    const baseYear = Math.floor(viewDate.getFullYear() / 12) * 12;
                                    const year = baseYear + i;
                                    const isSelected = value && parseDateLocal(value).getFullYear() === year;
                                    const isDisabled = (minDateObj ? year < minDateObj.getFullYear() : false)
                                        || (maxDateObj ? year > maxDateObj.getFullYear() : false);
                                    return (
                                        <button
                                            key={year}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewDate(new Date(year, viewDate.getMonth(), 1));
                                                setView('months');
                                            }}
                                            className="py-3 rounded-lg text-sm transition-all"
                                            style={{
                                                color: isSelected ? '#04110b' : isDisabled ? 'var(--text-subtle)' : 'var(--text-base)',
                                                background: isSelected ? 'var(--color-accent)' : 'transparent',
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {year}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Months Grid */}
                        {view === 'months' && (
                            <div className="grid grid-cols-3 gap-2 p-4">
                                {MONTHS.map((month, i) => {
                                    const isSelected = value && parseDateLocal(value).getFullYear() === viewDate.getFullYear() && parseDateLocal(value).getMonth() === i;
                                    const testDate = new Date(viewDate.getFullYear(), i, 1);
                                    const isDisabled = (minDateObj ? testDate < new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1) : false)
                                        || (maxDateObj ? testDate > new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), 1) : false);
                                    return (
                                        <button
                                            key={month}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewDate(new Date(viewDate.getFullYear(), i, 1));
                                                setView('days');
                                            }}
                                            className="py-3 rounded-lg text-sm transition-all"
                                            style={{
                                                color: isSelected ? '#04110b' : isDisabled ? 'var(--text-subtle)' : 'var(--text-base)',
                                                background: isSelected ? 'var(--color-accent)' : 'transparent',
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {month.slice(0, 3)}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Days View */}
                        {view === 'days' && (
                            <>
                                {/* Day Labels */}
                                <div className="grid grid-cols-7 gap-1 px-3 pt-3">
                                    {DAYS.map((day) => (
                                        <div
                                            key={day}
                                            className="text-[10px] uppercase tracking-wider text-center py-1"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1 p-3">
                                    {getDaysInMonth().map((dayInfo, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            disabled={dayInfo.isDisabled}
                                            onClick={() => dayInfo.isCurrentMonth && !dayInfo.isDisabled && selectDate(dayInfo.day)}
                                            className="aspect-square min-h-[44px] min-w-[44px] flex items-center justify-center text-sm rounded-lg transition-all touch-target-sm"
                                            style={{
                                                color: dayInfo.isSelected
                                                    ? '#04110b'
                                                    : dayInfo.isCurrentMonth
                                                        ? dayInfo.isDisabled
                                                            ? 'var(--text-subtle)'
                                                            : 'var(--text-base)'
                                                        : 'var(--text-subtle)',
                                                background: dayInfo.isSelected
                                                    ? 'var(--color-accent)'
                                                    : dayInfo.isToday && !dayInfo.isSelected
                                                        ? 'rgba(25, 227, 140, 0.15)'
                                                        : 'transparent',
                                                cursor: dayInfo.isDisabled ? 'not-allowed' : 'pointer',
                                                fontWeight: dayInfo.isToday ? 600 : 400,
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!dayInfo.isDisabled && !dayInfo.isSelected && dayInfo.isCurrentMonth) {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!dayInfo.isSelected) {
                                                    e.currentTarget.style.background = dayInfo.isToday
                                                        ? 'rgba(25, 227, 140, 0.15)'
                                                        : 'transparent';
                                                }
                                            }}
                                        >
                                            {dayInfo.day}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Quick Actions */}
                        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border-base)' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('');
                                    setIsOpen(false);
                                }}
                                className="text-xs transition-colors hover:underline"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isTodayAllowed) return;
                                    // Format in LOCAL time (not UTC) to avoid timezone shift
                                    const todayDate = new Date();
                                    const year = todayDate.getFullYear();
                                    const month = String(todayDate.getMonth() + 1).padStart(2, '0');
                                    const day = String(todayDate.getDate()).padStart(2, '0');
                                    onChange(`${year}-${month}-${day}`);
                                    setIsOpen(false);
                                }}
                                disabled={!isTodayAllowed}
                                className={`text-xs transition-colors ${isTodayAllowed ? 'hover:underline' : 'opacity-50 cursor-not-allowed'}`}
                                style={{ color: isTodayAllowed ? 'var(--color-accent)' : 'var(--text-subtle)' }}
                            >
                                Today
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
