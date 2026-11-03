export type PartAxle = 'front' | 'rear' | 'both';

export type PartSide = 'left' | 'right' | 'both';

export type PartInstallation = {
    axle?: PartAxle;
    side?: PartSide;
};

export const PART_AXLE_LABELS: Record<PartAxle, string> = {
    front: 'Передняя ось',
    rear: 'Задняя ось',
    both: 'Передняя и задняя оси',
};

export const PART_SIDE_LABELS: Record<PartSide, string> = {
    left: 'Левая сторона',
    right: 'Правая сторона',
    both: 'Левая и правая стороны',
};

export type PartInstallationMap =
    Record<string, PartInstallation[]>;