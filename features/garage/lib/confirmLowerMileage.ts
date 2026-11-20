export function confirmLowerMileage(
    mileage: number | undefined,
    previousMileage: number | undefined,
): boolean {
    if (mileage === undefined || previousMileage === undefined || mileage >= previousMileage) {
        return true;
    }

    const format = new Intl.NumberFormat('ru-RU');
    return window.confirm(
        `Введённый пробег (${format.format(mileage)} км) ниже сохранённого (${format.format(previousMileage)} км). ` +
        'Проверьте значение. Сохранить меньший пробег?',
    );
}
