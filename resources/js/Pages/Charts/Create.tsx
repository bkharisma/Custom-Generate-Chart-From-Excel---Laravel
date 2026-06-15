import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import ColumnSelector from '@/Components/ColumnSelector';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Column {
    id: number;
    name: string;
    data_type: string;
}

interface SheetData {
    id: number;
    name: string;
    columns: Column[];
    spreadsheet: { project: { id: number; name: string } };
}

interface ProjectItem {
    id: number;
    name: string;
    spreadsheets: {
        id: number;
        sheets: { id: number; name: string }[];
    }[];
}

interface Filter {
    column_id: number;
    value: string;
    label: string;
}

interface ExcludeRow {
    column_id: number;
    value: string;
}

export default function Create({
    chartTypes,
    selectedSheet,
    columns,
    projects,
}: PageProps<{
    chartTypes: { name: string; value: string }[];
    selectedSheet: SheetData | null;
    columns: Column[];
    projects: ProjectItem[];
}>) {
    const { data, setData, post, processing, errors } = useForm({
        title: selectedSheet ? `Chart - ${selectedSheet.name}` : '',
        chart_type: 'bar' as string,
        sheet_id: selectedSheet?.id ?? null as number | null,
        x_column_id: null as number | null,
        y_columns: [] as number[],
        filters: [] as Filter[],
        y_labels: {} as Record<number, string>,
        excluded_categories: [] as string[],
        exclude_rows: [] as ExcludeRow[],
    });

    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
        selectedSheet?.spreadsheet?.project?.id ?? null,
    );

    const [loadedColumns, setLoadedColumns] = useState<Column[]>(columns);
    const [uniqueValues, setUniqueValues] = useState<string[]>([]);

    useEffect(() => {
        setLoadedColumns(columns);
    }, [columns]);

    const yColumnsKey = data.y_columns.join(',');

    useEffect(() => {
        if (data.sheet_id && data.y_columns.length > 0) {
            const colId = data.y_columns[0];
            fetch(`/sheets/${data.sheet_id}/columns/${colId}/values`)
                .then((res) => res.json())
                .then((vals) => setUniqueValues(vals))
                .catch(() => setUniqueValues([]));
        } else {
            setUniqueValues([]);
            setData('excluded_categories', []);
        }
    }, [data.sheet_id, yColumnsKey]);

    const availableSheets = selectedProjectId
        ? projects
              .find((p) => p.id === selectedProjectId)
              ?.spreadsheets.flatMap((s) => s.sheets) ?? []
        : [];

    const handleProjectChange = (projectId: number | null) => {
        setSelectedProjectId(projectId);
        setData('sheet_id', null);
        setData('x_column_id', null);
        setData('y_columns', []);
        setLoadedColumns([]);
    };

    const handleSheetChange = (sheetId: number | null) => {
        setData('sheet_id', sheetId);
        setData('x_column_id', null);
        setData('y_columns', []);

        if (sheetId) {
            fetch(`/sheets/${sheetId}/columns`)
                .then((res) => res.json())
                .then((cols) => setLoadedColumns(cols))
                .catch(() => setLoadedColumns([]));
        } else {
            setLoadedColumns([]);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('charts.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Create Chart
                </h2>
            }
        >
            <Head title="Create Chart" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Project
                                    </label>
                                    <select
                                        value={selectedProjectId ?? ''}
                                        onChange={(e) =>
                                            handleProjectChange(
                                                e.target.value
                                                    ? Number(e.target.value)
                                                    : null,
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:text-sm"
                                    >
                                        <option value="">-- Select project --</option>
                                        {projects.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Sheet
                                    </label>
                                    <select
                                        value={data.sheet_id ?? ''}
                                        onChange={(e) =>
                                            handleSheetChange(
                                                e.target.value
                                                    ? Number(e.target.value)
                                                    : null,
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:text-sm"
                                    >
                                        <option value="">-- Select sheet --</option>
                                        {availableSheets.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.sheet_id} className="mt-2" />
                                </div>

                                {data.sheet_id && loadedColumns.length > 0 && (
                                    <>
                                        <ColumnSelector
                                            columns={loadedColumns}
                                            xColumnId={data.x_column_id}
                                            yColumnIds={data.y_columns}
                                            yLabels={data.y_labels || {}}
                                            filters={data.filters || []}
                                            onXColumnChange={(id) =>
                                                setData('x_column_id', id)
                                            }
                                            onYColumnsChange={(ids) =>
                                                setData('y_columns', ids)
                                            }
                                            onYLabelsChange={(l) =>
                                                setData('y_labels', l)
                                            }
                                            onFiltersChange={(f) =>
                                                setData('filters', f)
                                            }
                                        />
                                        <InputError message={errors.y_columns} className="mt-2" />
                                    </>
                                )}

                                {data.y_columns.length > 0 && uniqueValues.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Exclude Categories
                                        </label>
                                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                            Uncheck categories to hide them
                                            from the chart and table.
                                        </p>
                                        <div className="max-h-48 overflow-auto rounded-md border border-gray-200 p-2 dark:border-gray-700">
                                            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                                                {uniqueValues.map((val) => {
                                                    const excluded =
                                                        data.excluded_categories.includes(
                                                            val,
                                                        );
                                                    return (
                                                        <label
                                                            key={val}
                                                            className={`flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-1 text-xs ${
                                                                excluded
                                                                    ? 'text-gray-400 line-through dark:text-gray-500'
                                                                    : 'text-gray-700 dark:text-gray-300'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    !excluded
                                                                }
                                                                onChange={() => {
                                                                    const next =
                                                                        excluded
                                                                            ? data.excluded_categories.filter(
                                                                                  (
                                                                                      c,
                                                                                  ) =>
                                                                                      c !==
                                                                                      val,
                                                                              )
                                                                            : [
                                                                                  ...data.excluded_categories,
                                                                                  val,
                                                                              ];
                                                                    setData(
                                                                        'excluded_categories',
                                                                        next,
                                                                    );
                                                                }}
                                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
                                                            />
                                                            {val}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {data.sheet_id && loadedColumns.length > 0 && (
                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Exclude Rows
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const firstCol =
                                                        loadedColumns[0];
                                                    setData('exclude_rows', [
                                                        ...(data.exclude_rows ||
                                                            []),
                                                        {
                                                            column_id:
                                                                firstCol?.id ??
                                                                0,
                                                            value: '',
                                                        },
                                                    ]);
                                                }}
                                                className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900"
                                            >
                                                + Add Exclude
                                            </button>
                                        </div>
                                        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                                            Remove rows matching conditions
                                            before counting. Useful for
                                            excluding specific sub-groups.
                                        </p>
                                        {(data.exclude_rows || []).map(
                                            (er, i) => (
                                                <div
                                                    key={i}
                                                    className="mb-2 flex flex-wrap items-end gap-2 rounded-md border border-gray-200 p-3 dark:border-gray-700"
                                                >
                                                    <div className="min-w-[140px] flex-1">
                                                        <label className="block text-xs text-gray-500 dark:text-gray-400">
                                                            Where
                                                        </label>
                                                        <select
                                                            value={
                                                                er.column_id
                                                            }
                                                            onChange={(e) => {
                                                                const next = [
                                                                    ...data.exclude_rows,
                                                                ];
                                                                next[i] = {
                                                                    ...next[i],
                                                                    column_id:
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                };
                                                                setData(
                                                                    'exclude_rows',
                                                                    next,
                                                                );
                                                            }}
                                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                        >
                                                            {loadedColumns.map(
                                                                (col) => (
                                                                    <option
                                                                        key={
                                                                            col.id
                                                                        }
                                                                        value={
                                                                            col.id
                                                                        }
                                                                    >
                                                                        {
                                                                            col.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>
                                                    <div className="min-w-[80px] flex-1">
                                                        <label className="block text-xs text-gray-500 dark:text-gray-400">
                                                            Not Equal To
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={er.value}
                                                            onChange={(e) => {
                                                                const next = [
                                                                    ...data.exclude_rows,
                                                                ];
                                                                next[i] = {
                                                                    ...next[i],
                                                                    value: e
                                                                        .target
                                                                        .value,
                                                                };
                                                                setData(
                                                                    'exclude_rows',
                                                                    next,
                                                                );
                                                            }}
                                                            placeholder="ex: SBM Poltekpar"
                                                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setData(
                                                                'exclude_rows',
                                                                data.exclude_rows.filter(
                                                                    (
                                                                        _,
                                                                        j,
                                                                    ) =>
                                                                        j !==
                                                                        i,
                                                                ),
                                                            );
                                                        }}
                                                        className="rounded-md px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
                                                    >
                                                        &#10005;
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Chart Type
                                    </label>
                                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                                        {chartTypes.map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        'chart_type',
                                                        type.value,
                                                    )
                                                }
                                                className={`rounded-md border px-3 py-2 text-sm font-medium capitalize ${
                                                    data.chart_type ===
                                                    type.value
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900 dark:text-indigo-300'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {type.name}
                                            </button>
                                        ))}
                                    </div>
                                    <InputError message={errors.chart_type} className="mt-2" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Chart Title
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 sm:text-sm"
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                <div className="flex gap-3">
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Creating...'
                                            : 'Create Chart'}
                                    </PrimaryButton>
                                    <Link
                                        href={route('charts.index')}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
