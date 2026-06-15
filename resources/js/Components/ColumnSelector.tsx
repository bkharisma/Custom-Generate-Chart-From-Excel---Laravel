interface Column {
    id: number;
    name: string;
    data_type: string;
}

interface Filter {
    column_id: number;
    value: string;
    label: string;
}

interface ColumnSelectorProps {
    columns: Column[];
    xColumnId: number | null;
    yColumnIds: number[];
    yLabels: Record<number, string>;
    filters: Filter[];
    onXColumnChange: (id: number | null) => void;
    onYColumnsChange: (ids: number[]) => void;
    onYLabelsChange: (labels: Record<number, string>) => void;
    onFiltersChange: (filters: Filter[]) => void;
}

export default function ColumnSelector({
    columns,
    xColumnId,
    yColumnIds,
    yLabels,
    filters,
    onXColumnChange,
    onYColumnsChange,
    onYLabelsChange,
    onFiltersChange,
}: ColumnSelectorProps) {
    const toggleYColumn = (id: number) => {
        if (yColumnIds.includes(id)) {
            onYColumnsChange(yColumnIds.filter((y) => y !== id));
        } else {
            onYColumnsChange([...yColumnIds, id]);
        }
    };

    const addFilter = () => {
        const firstCol = columns[0];
        onFiltersChange([
            ...filters,
            { column_id: firstCol?.id ?? 0, value: '', label: '' },
        ]);
    };

    const removeFilter = (index: number) => {
        onFiltersChange(filters.filter((_, i) => i !== index));
    };

    const updateFilter = (index: number, patch: Partial<Filter>) => {
        onFiltersChange(
            filters.map((f, i) => (i === index ? { ...f, ...patch } : f)),
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    X-Axis Column (labels / categories)
                </label>
                <select
                    value={xColumnId ?? ''}
                    onChange={(e) =>
                        onXColumnChange(
                            e.target.value ? Number(e.target.value) : null,
                        )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:text-sm"
                >
                    <option value="">-- Select X column --</option>
                    {columns.map((col) => (
                        <option key={col.id} value={col.id}>
                            {col.name} ({col.data_type})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Y-Axis Columns (values)
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Pick numeric columns for bars, lines, and pies. Text
                    columns will be auto-aggregated into frequency counts.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {columns.map((col) => (
                        <label
                            key={col.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm ${
                                yColumnIds.includes(col.id)
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900 dark:text-indigo-300'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={yColumnIds.includes(col.id)}
                                onChange={() => toggleYColumn(col.id)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
                            />
                            <span>{col.name}</span>
                            <span className="ml-auto text-xs text-gray-400">
                                {col.data_type}
                            </span>
                        </label>
                    ))}
                </div>
                {yColumnIds.length === 0 && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        Select at least one Y-axis column.
                    </p>
                )}
            </div>

            {yColumnIds.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Y-Axis Column Labels
                    </label>
                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                        Customize display names. Leave empty to use the
                        original column name.
                    </p>
                    <div className="space-y-2">
                        {yColumnIds.map((id) => {
                            const col = columns.find((c) => c.id === id);
                            if (!col) return null;
                            return (
                                <div
                                    key={id}
                                    className="flex items-center gap-2"
                                >
                                    <span className="w-1/3 text-sm text-gray-500 dark:text-gray-400">
                                        {col.name}
                                    </span>
                                    <span className="text-gray-400">
                                        &rarr;
                                    </span>
                                    <input
                                        type="text"
                                        value={yLabels[id] ?? ''}
                                        onChange={(e) =>
                                            onYLabelsChange({
                                                ...yLabels,
                                                [id]: e.target.value,
                                            })
                                        }
                                        placeholder={col.name}
                                        className="flex-1 rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Data Filters
                    </label>
                    <button
                        type="button"
                        onClick={addFilter}
                        className="rounded border border-indigo-300 px-2 py-0.5 text-xs text-indigo-600 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-900"
                    >
                        + Add Filter
                    </button>
                </div>
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                    Compare your data against other column values. Creates extra
                    series counting only rows that match.
                </p>

                {filters.map((filter, i) => (
                    <div
                        key={i}
                        className="mb-2 flex flex-wrap items-end gap-2 rounded-md border border-gray-200 p-3 dark:border-gray-700"
                    >
                        <div className="min-w-[120px] flex-1">
                            <label className="block text-xs text-gray-500 dark:text-gray-400">
                                Where
                            </label>
                            <select
                                value={filter.column_id}
                                onChange={(e) =>
                                    updateFilter(i, {
                                        column_id: Number(e.target.value),
                                    })
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            >
                                {columns.map((col) => (
                                    <option key={col.id} value={col.id}>
                                        {col.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="min-w-[80px] flex-1">
                            <label className="block text-xs text-gray-500 dark:text-gray-400">
                                Value
                            </label>
                            <input
                                type="text"
                                value={filter.value}
                                onChange={(e) =>
                                    updateFilter(i, { value: e.target.value })
                                }
                                placeholder="ex: Y"
                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            />
                        </div>

                        <div className="min-w-[100px] flex-1">
                            <label className="block text-xs text-gray-500 dark:text-gray-400">
                                Label
                            </label>
                            <input
                                type="text"
                                value={filter.label}
                                onChange={(e) =>
                                    updateFilter(i, { label: e.target.value })
                                }
                                placeholder="ex: Aktif per Jalur"
                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => removeFilter(i)}
                            className="rounded-md px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
                        >
                            &#10005;
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
