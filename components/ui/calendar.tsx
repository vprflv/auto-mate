'use client';

import * as React from 'react';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns';
import { ru } from 'date-fns/locale';

import { cn } from '@/lib/utils';

type CalendarProps = {
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    className?: string;
    initialFocus?: boolean;
};

export function Calendar({
                             selected,
                             onSelect,
                             className,
                         }: CalendarProps) {
    const [month, setMonth] = React.useState(
        selected ?? new Date()
    );

    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    const calendarStart = startOfWeek(
        monthStart,
        { weekStartsOn: 1 }
    );

    const calendarEnd = endOfWeek(
        monthEnd,
        { weekStartsOn: 1 }
    );

    const days = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
    });

    const weekdays = [
        'Пн',
        'Вт',
        'Ср',
        'Чт',
        'Пт',
        'Сб',
        'Вс',
    ];

    return (
        <div
            className={cn(
                'w-[280px] select-none',
                className
            )}
        >
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() =>
                        setMonth((current) =>
                            subMonths(current, 1)
                        )
                    }
                    className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                    aria-label="Предыдущий месяц"
                >
                    <ChevronLeft size={17} />
                </button>

                <span className="text-sm font-semibold capitalize text-[var(--text)]">
                    {format(month, 'LLLL yyyy', {
                        locale: ru,
                    })}
                </span>

                <button
                    type="button"
                    onClick={() =>
                        setMonth((current) =>
                            addMonths(current, 1)
                        )
                    }
                    className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]"
                    aria-label="Следующий месяц"
                >
                    <ChevronRight size={17} />
                </button>
            </div>

            <div className="mb-1 grid grid-cols-7">
                {weekdays.map((day) => (
                    <div
                        key={day}
                        className="flex h-8 items-center justify-center text-[11px] font-medium text-[var(--text-muted)]"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                    const isSelected =
                        selected &&
                        isSameDay(day, selected);

                    const currentMonth =
                        isSameMonth(
                            day,
                            month
                        );

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            onClick={() => {
                                onSelect?.(day);
                            }}
                            className={cn(
                                'flex aspect-square items-center justify-center rounded-lg text-sm transition-colors',
                                currentMonth
                                    ? 'text-[var(--text)]'
                                    : 'text-[var(--text-dim)]',
                                !isSelected &&
                                'hover:bg-[var(--bg-elevated)]',
                                isSelected &&
                                'bg-[var(--link)] font-semibold text-[var(--btn-primary-text)]'
                            )}
                        >
                            {format(day, 'd')}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}