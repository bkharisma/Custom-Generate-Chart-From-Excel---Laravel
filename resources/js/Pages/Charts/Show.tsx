import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChartRenderer from '@/Components/ChartRenderer';
import DangerButton from '@/Components/DangerButton';
import FlashMessage from '@/Components/FlashMessage';
import { useChartExport } from '@/Hooks/useChartExport';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import ReactEChartsCore from 'echarts-for-react/esm/core';

interface ChartData {
    id: number;
    title: string;
    chart_type: string;
    project: { id: number; name: string };
    sheet: { id: number; name: string };
    x_column: { id: number; name: string } | null;
    y_columns: number[];
    options: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

interface ColumnItem {
    id: number;
    name: string;
    data_type: string;
}

interface ChartTable {
    columns: string[];
    rows: (string | number | null)[][];
}

export default function Show({
    chart,
    yColumns,
    chartConfig,
    chartTable,
    flash,
}: PageProps<{
    chart: ChartData;
    yColumns: ColumnItem[];
    chartConfig: Record<string, unknown>;
    chartTable: ChartTable;
    flash?: { success?: string; error?: string };
}>) {
    const chartRef = useRef<ReactEChartsCore>(null);
    const dataTableRef = useRef<HTMLDivElement>(null);
    const [showTable, setShowTable] = useState(false);
    const { exportJpg, exportPdf } = useChartExport({ chartRef, title: chart.title, dataTableRef, showTable });
    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());

    const toggleCategory = (cat: string) => {
        setHiddenCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    const selectAll = () => setHiddenCategories(new Set());
    const deselectAll = () => {
        const all = new Set(chartTable.rows.map((r) => String(r[0])));
        setHiddenCategories(all);
    };

    const allCategories = useMemo(
        () => chartTable.rows.map((r) => String(r[0])),
        [chartTable],
    );

    const visibleRows = useMemo(
        () => chartTable.rows.filter((r) => !hiddenCategories.has(String(r[0]))),
        [chartTable, hiddenCategories],
    );

    const totals = useMemo(() => {
        const sums: number[] = new Array(chartTable.columns.length).fill(0);
        for (const row of visibleRows) {
            for (let i = 1; i < row.length; i++) {
                sums[i] += Number(row[i]) || 0;
            }
        }
        return sums;
    }, [visibleRows, chartTable.columns.length]);

    const filteredChartConfig = useMemo(() => {
        if (hiddenCategories.size === 0) return chartConfig;

        const config = JSON.parse(
            JSON.stringify(chartConfig),
        ) as Record<string, unknown>;
        const series = (config.series as Record<string, unknown>[]) ?? [];

        if (chart.chart_type === 'pie') {
            const data = (series[0]?.data as { name: string; value: number }[]) ?? [];
            (series[0] as Record<string, unknown>).data = data.filter(
                (d) => !hiddenCategories.has(d.name),
            );
        } else {
            const xData = (
                (config.xAxis as Record<string, unknown>)?.data as string[]
            ) ?? [];

            const keepIndices = xData
                .map((label, i) => (hiddenCategories.has(String(label)) ? -1 : i))
                .filter((i) => i >= 0);

            (config.xAxis as Record<string, unknown>).data = keepIndices.map(
                (i) => xData[i],
            );

            for (const s of series) {
                const oldData = (s.data as (number | string | null)[]) ?? [];
                (s as Record<string, unknown>).data = keepIndices.map(
                    (i) => oldData[i],
                );
            }
        }

        return config;
    }, [chartConfig, hiddenCategories, chart.chart_type]);

    const deleteChart = () => {
        if (confirm('Are you sure you want to delete this chart?')) {
            router.delete(route('charts.destroy', chart.id));
        }
    };

    const handleExportPdf = async () => {
        setExportingPdf(true);
        setExportError(null);
        try {
            await exportPdf();
        } catch (e) {
            setExportError(e instanceof Error ? e.message : 'Failed to export PDF. Please try again.');
        } finally {
            setExportingPdf(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            {chart.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {chart.project.name} &middot; {chart.sheet.name}{' '}
                            &middot; {chart.chart_type}
                        </p>
                    </div>
                    <Link
                        href={route(
                            'sheets.show',
                            chart.sheet.id,
                        )}
                        className="rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white"
                    >
                        View Sheet
                    </Link>
                </div>
            }
        >
            <Head title={`Chart: ${chart.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <FlashMessage flash={flash} />

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                            <div className="flex flex-wrap items-center gap-3">
                                <Link
                                    href={route('charts.edit', chart.id)}
                                    className="inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={route('charts.index')}
                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Back
                                </Link>
                                <button
                                    type="button"
                                    onClick={exportJpg}
                                    className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-green-500 focus:outline-none"
                                >
                                    Export JPG
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExportPdf}
                                    disabled={exportingPdf}
                                    className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-500 focus:outline-none disabled:opacity-50"
                                >
                                    {exportingPdf ? 'Exporting...' : 'Export PDF'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowTable(!showTable)}
                                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-blue-500 focus:outline-none"
                                >
                                    {showTable ? 'Hide Data' : 'Show Data'}
                                </button>
                                <DangerButton
                                    type="button"
                                    onClick={deleteChart}
                                >
                                    Delete
                                </DangerButton>
                            </div>
                            {exportError && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{exportError}</p>
                            )}
                        </div>

                        <div className="p-6">
                            <ChartRenderer
                                ref={chartRef}
                                option={filteredChartConfig}
                                style={{ minHeight: 450 }}
                            />
                        </div>

                        <div
                            ref={dataTableRef}
                            className={`border-t border-gray-200 p-4 dark:border-gray-700 ${showTable ? '' : 'absolute -left-[9999px]'}`}
                        >
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Data Table
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Showing {visibleRows.length} of{' '}
                                            {allCategories.length} categories
                                        </span>
                                        <button
                                            type="button"
                                            onClick={selectAll}
                                            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={deselectAll}
                                            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                </div>
                                <div className="max-h-96 overflow-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-600">
                                                <th className="w-8 px-2 py-2"></th>
                                                {chartTable.columns.map((col, i) => (
                                                    <th
                                                        key={i}
                                                        className="px-3 py-2 font-medium text-gray-600 dark:text-gray-300"
                                                    >
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chartTable.rows.map((row, ri) => {
                                                const cat = String(row[0]);
                                                const checked = !hiddenCategories.has(cat);
                                                return (
                                                    <tr
                                                        key={ri}
                                                        className="border-b border-gray-100 dark:border-gray-700"
                                                    >
                                                        <td className="px-2 py-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() =>
                                                                    toggleCategory(cat)
                                                                }
                                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
                                                            />
                                                        </td>
                                                        {row.map((cell, ci) => (
                                                            <td
                                                                key={ci}
                                                                className={`px-3 py-2 ${
                                                                    checked
                                                                        ? 'text-gray-700 dark:text-gray-300'
                                                                        : 'text-gray-400 line-through dark:text-gray-500'
                                                                }`}
                                                            >
                                                                {cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-gray-300 font-semibold dark:border-gray-500">
                                                <td className="px-2 py-2"></td>
                                                <td className="px-3 py-2 text-gray-800 dark:text-gray-200">
                                                    TOTAL
                                                </td>
                                                {chartTable.columns.slice(1).map((_, i) => (
                                                    <td
                                                        key={i}
                                                        className="px-3 py-2 text-gray-800 dark:text-gray-200"
                                                    >
                                                        {totals[i + 1]}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Y-Axis Columns
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {yColumns.map((col) => (
                                    <span
                                        key={col.id}
                                        className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                                    >
                                        {col.name}{' '}
                                        <span className="ml-1 text-indigo-500">
                                            ({col.data_type})
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
