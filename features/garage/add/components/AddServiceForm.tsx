'use client';

import Link from 'next/link';

import ServiceFormHeader from './ServiceFormHeader';
import ServiceMainFields from './ServiceMainFields';
import ServicePartsSection from './ServicePartsSection';

import { useAddService } from '@/features/garage/add/hooks/useAddService';

import ServicePhotosSection from '@/features/garage/add/components/ServicePhotosSection';

type Props = {
    carId: string;
};

export default function AddServiceForm({
                                           carId,
                                       }: Props) {
    const {
        car,
        loading,
        saving,
        title,
        setTitle,
        date,
        setDate,
        mileage,
        setMileage,
        description,
        setDescription,
        cost,
        setCost,
        parts,
        addPart,
        updatePart,
        removePart,
        submit,
        photos,
        setPhotos,
    } = useAddService(carId);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-[var(--text-muted)]">
                    Загрузка...
                </p>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <p className="text-[var(--text-muted)]">
                    Автомобиль не найден
                </p>

                <Link
                    href="/garage"
                    className="text-[var(--link)] underline transition-colors hover:text-[var(--btn-primary-hover)]"
                >
                    Вернуться в гараж
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <ServiceFormHeader carId={carId} />

            <main className="mx-auto max-w-2xl px-6 py-10">
                <h1 className="mb-2 text-3xl font-bold text-[var(--text)]">
                    Добавить ТО
                </h1>

                <p className="mb-8 text-[var(--text-muted)]">
                    {car.make} {car.model} • {car.year}
                </p>

                <form
                    onSubmit={submit}
                    className="space-y-6"
                >
                    <ServiceMainFields
                        title={title}
                        date={date}
                        mileage={mileage}
                        description={description}
                        cost={cost}
                        onTitleChange={setTitle}
                        onDateChange={setDate}
                        onMileageChange={setMileage}
                        onDescriptionChange={
                            setDescription
                        }
                        onCostChange={setCost}
                    />

                    <ServicePartsSection
                        parts={parts}
                        onAdd={addPart}
                        onChange={updatePart}
                        onRemove={removePart}
                    />

                    <ServicePhotosSection
                        photos={photos}
                        onChange={setPhotos}
                    />

                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 rounded-2xl bg-[var(--btn-primary)] py-4 font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] disabled:opacity-50"
                        >
                            {saving
                                ? 'Сохраняем...'
                                : 'Сохранить запись'}
                        </button>

                        <Link
                            href={`/garage/${carId}`}
                            className="flex-1 rounded-2xl bg-[var(--bg-elevated)] py-4 text-center font-medium text-[var(--text)] transition-colors hover:border-[var(--border)] hover:bg-[var(--border)]"
                        >
                            Отмена
                        </Link>
                    </div>
                </form>
            </main>
        </div>
    );
}