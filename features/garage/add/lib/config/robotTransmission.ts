export const ROBOT_TRANSMISSION = 'Робот';

export function normalizeRobotTransmission(value: string): string {
    const key = value.trim().toLowerCase();
    return key === 'dct' || key === ROBOT_TRANSMISSION.toLowerCase()
        ? ROBOT_TRANSMISSION
        : value;
}
