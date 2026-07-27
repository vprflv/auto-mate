import { CarFluids, FluidItem } from '@/types';

type Props = {
    fluids?: CarFluids;
    onEdit?: () => void;
};

const LABELS: Record<string, string> = {
    engineOil: 'Моторное масло',
    gearboxOil: 'Трансмиссия',
    transferCaseOil: 'Раздатка',
    differentialOil: 'Редуктор',
    coolant: 'Антифриз',
    brakeFluid: 'Тормозная жидкость',
    powerSteeringFluid: 'ГУР',
};

function formatFluid(item?: FluidItem) {
    if (!item) return null;

    const parts = [
        item.spec,
        item.brand,
        item.volume,
    ].filter(Boolean);

    return parts.join(' • ') || item.name;
}

export default function CarFluidsCard({ fluids, onEdit }: Props) {
    const mainItems = [
        { key: 'engineOil', item: fluids?.engineOil },
        { key: 'gearboxOil', item: fluids?.gearboxOil },
        { key: 'transferCaseOil', item: fluids?.transferCaseOil },
        { key: 'differentialOil', item: fluids?.differentialOil },
        { key: 'coolant', item: fluids?.coolant },
        { key: 'brakeFluid', item: fluids?.brakeFluid },
        { key: 'powerSteeringFluid', item: fluids?.powerSteeringFluid },
    ].filter((x) => x.item);

    const hasData = mainItems.length > 0 || (fluids?.other && fluids.other.length > 0);

    return (
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Масла и техжидкости</h2>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="text-sm text-blue-400 hover:text-blue-300 transition"
                    >
                        Изменить
                    </button>
                )}
            </div>

            {!hasData ? (
                <div className="text-center py-6">
                    <p className="text-zinc-500 text-sm mb-1">Пока не указано</p>
                    <p className="text-zinc-600 text-xs">
                        Добавь моторное масло, АКПП, антифриз и другие жидкости
                    </p>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="mt-4 text-sm text-white underline"
                        >
                            Заполнить
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3 text-sm">
                    {mainItems.map(({ key, item }) => (
                        <div key={key} className="flex justify-between gap-4">
              <span className="text-zinc-500 shrink-0">
                {LABELS[key] || item?.name}
              </span>
                            <span className="text-right">
                {formatFluid(item)}
              </span>
                        </div>
                    ))}

                    {fluids?.other?.map((item) => (
                        <div key={item.id} className="flex justify-between gap-4">
                            <span className="text-zinc-500 shrink-0">{item.name}</span>
                            <span className="text-right">{formatFluid(item)}</span>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-zinc-600 mt-5 leading-relaxed">
                Справочная информация. Перед заменой сверьте данные с сервисной книгой
                или уточните у дилера.
            </p>
        </section>
    );
}