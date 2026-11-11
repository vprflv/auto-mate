'use client';

import { useRef } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';

import {
    BookOpen,
    CarFront,
    ChevronLeft,
    ChevronRight, ClipboardPlus,
    Component,
    Droplets,
    History, Pencil, Sparkles,
    Trash2,
} from 'lucide-react';

import type { CarSection } from '@/features/garage/car/types/types';

import styles from './CarSectionNav.module.css';

const MENU = [
    {
        id: 'overview',
        label: 'Обзор',
        icon: CarFront,
    },
    {
        id: 'catalog',
        label: 'Мой каталог',
        icon: BookOpen,
    },
    {
        id: 'ai-catalog',
        label: 'ИИ-каталог',
        icon: Sparkles,
    },
    {
        id: 'service',
        label: 'История ТО',
        icon: History,
    },
    {
        id: 'add-service',
        label: 'Добавить ТО',
        icon: ClipboardPlus,
    },
    {
        id: 'edit',
        label: 'Редактировать',
        icon: Pencil,
    },
    {
        id: 'danger',
        label: 'Удаление авто',
        icon: Trash2,
    },
] satisfies {
    id: CarSection;
    label: string;
    icon: typeof CarFront;
}[];
type Props = {
    section: CarSection;
    onChange: (section: CarSection) => void;
    contentId?: string;
};

type TileStyle = CSSProperties & {
    '--section-offset': number;
    '--section-scale': number;
    '--section-drop': string;
    '--section-turn': string;
    '--section-opacity': number;
};

function getOffset(
    index: number,
    activeIndex: number
): number {
    return index - activeIndex;
}

export default function CarSectionNav({
                                          section,
                                          onChange,
                                          contentId = 'car-section-content',
                                      }: Props) {
    const buttons = useRef(
        new Map<CarSection, HTMLButtonElement>()
    );

    const activeIndex = MENU.findIndex(
        (item) => item.id === section
    );

    const move = (
        direction: number,
        focusTab = false
    ) => {
        const nextIndex = Math.max(
            0,
            Math.min(
                MENU.length - 1,
                activeIndex + direction
            )
        );

        if (nextIndex === activeIndex) return;

        const nextSection: CarSection = MENU[nextIndex].id;

        onChange(nextSection);

        const nextButton = buttons.current.get(nextSection);

        if (focusTab && nextButton) {
            nextButton.focus();
        }
    };

    const handleKeyDown = (
        event: KeyboardEvent<HTMLDivElement>
    ) => {
        if (
            event.key !== 'ArrowLeft' &&
            event.key !== 'ArrowRight'
        ) {
            return;
        }

        event.preventDefault();

        const target = event.target;

        const focusTab =
            target instanceof HTMLElement &&
            Boolean(target.closest('[role="tab"]'));

        move(
            event.key === 'ArrowRight' ? 1 : -1,
            focusTab
        );
    };

    return (
        <div
            className={styles.root}
            onKeyDown={handleKeyDown}
        >
            <button
                type="button"
                className={styles.arrow}
                aria-label="Предыдущий раздел"
                onClick={() => move(-1)}
            >
                <ChevronLeft size={48} strokeWidth={1.4} aria-hidden="true" />
            </button>

            <div
                className={styles.viewport}
                role="tablist"
                aria-label="Разделы автомобиля"
                aria-orientation="horizontal"
            >
                {MENU.map((item, index) => {
                    const offset = getOffset(
                        index,
                        activeIndex
                    );

                    const distance = Math.abs(offset);
                    const active = offset === 0;
                    const Icon = item.icon;

                    const tileStyle: TileStyle = {
                        '--section-offset': offset,

                        '--section-scale': active
                            ? 1.08
                            : distance === 1
                                ? 0.8
                                : 0.64,

                        '--section-drop': active
                            ? '0px'
                            : distance === 1
                                ? '13px'
                                : '23px',

                        '--section-turn':
                            offset === 0
                                ? '0deg'
                                : offset < 0
                                    ? '16deg'
                                    : '-16deg',

                        '--section-opacity': active
                            ? 1
                            : distance === 1
                                ? 0.8
                                : 0.46,

                        zIndex: 5 - distance,
                    };

                    return (
                        <button
                            key={item.id}
                            ref={(element: HTMLButtonElement | null) => {
                                if (element) {
                                    buttons.current.set(item.id, element);
                                } else {
                                    buttons.current.delete(item.id);
                                }
                            }}
                            type="button"
                            id={`${contentId}-tab-${item.id}`}
                            role="tab"
                            aria-selected={active}
                            aria-controls={contentId}
                            tabIndex={active ? 0 : -1}
                            data-danger={
                                item.id === 'danger'
                            }
                            className={styles.tab}
                            style={tileStyle}
                            onClick={() =>
                                onChange(item.id)
                            }
                        >
                            <span className={styles.tile}>
                                <Icon
                                    className={styles.icon}
                                    aria-hidden="true"
                                />
                            </span>

                            <span className={styles.label}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <button
                type="button"
                className={styles.arrow}
                aria-label="Следующий раздел"
                onClick={() => move(1)}
            >
                <ChevronRight size={48} strokeWidth={1.4} aria-hidden="true" />
            </button>
        </div>
    );
}