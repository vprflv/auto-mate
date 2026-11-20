export function formatFluidVolume(value?: string): string {
    const text = value?.trim() ?? '';
    const number = /^(\d+)(?:[.,](\d+))?$/.exec(text);

    return number ? `${number[1]},${number[2] ?? '0'}` : text;
}
