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
    placeholder = 'Select date',
    className = '',
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        if (value) return parseDateLocal(value);
        if (minDate) return parseDateLocal(minDate);
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
            const isDisabled = minDateObj ? date < minDateObj : false;
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
                        {/* Month Header */}
                        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-base)' }}>
                            <button
                                type="button"
                                onClick={goToPrevMonth}
                                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-base)' }}>
                                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </span>
                            <button
                                type="button"
                                onClick={goToNextMonth}
                                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

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
                                    className="aspect-square flex items-center justify-center text-sm rounded-lg transition-all"
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
                                    const today = new Date();
                                    if (!minDateObj || today >= minDateObj) {
                                        // Format in LOCAL time (not UTC) to avoid timezone shift
                                        const year = today.getFullYear();
                                        const month = String(today.getMonth() + 1).padStart(2, '0');
                                        const day = String(today.getDate()).padStart(2, '0');
                                        onChange(`${year}-${month}-${day}`);
                                        setIsOpen(false);
                                    }
                                }}
                                className="text-xs transition-colors hover:underline"
                                style={{ color: 'var(--color-accent)' }}
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
