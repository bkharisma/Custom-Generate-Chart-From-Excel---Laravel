import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlashMessage from '@/Components/FlashMessage';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Column {
    id: number;
    name: string;
    data_type: string;
    original_index: number;
}

interface SheetData {
    id: number;
    name: string;
    row_count: number;
    col_count: number;
    columns: Column[];
}

interface SpreadsheetData {
    id: number;
    original_filename: string;
    project: { id: number; name: string };
}

interface SheetItem {
    id: number;
    name: string;
    row_count: number;
    col_count: number;
}

interface RowData {
    id: number;
    row_index: number;
    data: Record<string, unknown>;
}

export default function Show({
    sheet,
    sheets,
    spreadsheet,
    rows,
    flash,
}: PageProps<{
    sheet: SheetData;
    sheets: SheetItem[];
    spreadsheet: SpreadsheetData;
    rows: {
        data: RowData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    flash?: { success?: string; error?: string };
}>) {
    const [search, setSearch] = useState('');

    const filteredRows = search
        ? rows.data.filter((row) =>
              JSON.stringify(row.data)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
          )
        : rows.data;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Sheet: {sheet.name}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {spreadsheet.original_filename} &middot;{' '}
                            {sheet.row_count} rows &times; {sheet.col_count}{' '}
                            columns
                        </p>
                    </div>
                    <Link
                        href={route('projects.show', spreadsheet.project.id)}
                        className="rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white"
                    >
                        Back to Project
                    </Link>
                </div>
            }
        >
            <Head title={`Sheet: ${sheet.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <FlashMessage flash={flash} />

                    {sheets.length > 1 && (
                        <div className="mb-4 overflow-x-auto rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                            <div className="flex gap-2">
                                {sheets.map((s) => (
                                    <Link
                                        key={s.id}
                                        href={route('sheets.show', s.id)}
                                        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                                            s.id === sheet.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {s.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                            <input
                                type="text"
                                placeholder="Search rows..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 sm:text-sm"
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                            #
                                        </th>
                                        {sheet.columns.map((col) => (
                                            <th
                                                key={col.id}
                                                className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                            >
                                                <div>{col.name}</div>
                                                <span className="font-normal lowercase text-gray-400 dark:text-gray-500">
                                                    {col.data_type}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                    {filteredRows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-750"
                                        >
                                            <td className="sticky left-0 z-10 whitespace-nowrap bg-white px-4 py-2 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                {row.row_index}
                                            </td>
                                            {sheet.columns.map((col) => (
                                                <td
                                                    key={col.id}
                                                    className="whitespace-nowrap px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
                                                >
                                                    {String(
                                                        row.data[col.name] ?? '',
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {filteredRows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={
                                                    sheet.columns.length + 1
                                                }
                                                className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                                            >
                                                {search
                                                    ? 'No rows match your search.'
                                                    : 'No data rows available.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {!search && rows.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing{' '}
                                    {(rows.current_page - 1) * rows.per_page +
                                        1}{' '}
                                    to{' '}
                                    {Math.min(
                                        rows.current_page * rows.per_page,
                                        rows.total,
                                    )}{' '}
                                    of {rows.total} rows
                                </div>
                                <div className="flex gap-2">
                                    {rows.links.map(
                                        (link, i) =>
                                            link.url && (
                                                <Link
                                                    key={i}
                                                    href={link.url}
                                                    preserveScroll
                                                    className={`rounded-md px-3 py-1 text-sm ${
                                                        link.active
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                                    }`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
