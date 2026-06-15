import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import FlashMessage from '@/Components/FlashMessage';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';

interface Project {
    id: number;
    name: string;
    description: string | null;
    user: { id: number; name: string; email: string };
    spreadsheets: {
        id: number;
        original_filename: string;
        created_at: string;
        sheets: { id: number; name: string; row_count: number; col_count: number }[];
    }[];
    created_at: string;
    updated_at: string;
}

export default function Show({
    project,
    flash,
}: PageProps<{ project: Project; flash?: { success?: string; error?: string } }>) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
    });

    const deleteProject = () => {
        if (confirm('Are you sure you want to delete this project?')) {
            router.delete(route('projects.destroy', project.id));
        }
    };

    const submitUpload = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('projects.upload', project.id), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {project.name}
                </h2>
            }
        >
            <Head title={project.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <FlashMessage flash={flash} />

                    <div className="space-y-6">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Description
                                        </h3>
                                        <p className="mt-1">
                                            {project.description || (
                                                <span className="italic text-gray-400 dark:text-gray-500">
                                                    No description
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Owner
                                        </h3>
                                        <p className="mt-1">{project.user.name}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Created
                                        </h3>
                                        <p className="mt-1">
                                            {new Date(
                                                project.created_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Updated
                                        </h3>
                                        <p className="mt-1">
                                            {new Date(
                                                project.updated_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <Link
                                        href={route('projects.edit', project.id)}
                                        className="inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href={route('projects.index')}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Back
                                    </Link>
                                    <DangerButton
                                        type="button"
                                        onClick={deleteProject}
                                    >
                                        Delete
                                    </DangerButton>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                <h3 className="text-lg font-semibold">
                                    Upload Excel File
                                </h3>
                                <form
                                    onSubmit={submitUpload}
                                    className="mt-4 space-y-4"
                                >
                                    <div>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={(e) =>
                                                setData('file', e.target.files?.[0] ?? null)
                                            }
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:text-gray-400 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
                                        />
                                        <InputError
                                            message={errors.file}
                                            className="mt-2"
                                        />
                                    </div>
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Uploading...'
                                            : 'Upload & Parse'}
                                    </PrimaryButton>
                                </form>
                            </div>
                        </div>

                        {project.spreadsheets.length > 0 ? (
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className="p-6 text-gray-900 dark:text-gray-100">
                                    <h3 className="text-lg font-semibold">
                                        Uploaded Files
                                    </h3>
                                    <div className="mt-4 space-y-4">
                                        {project.spreadsheets.map(
                                            (spreadsheet) => (
                                                <div
                                                    key={spreadsheet.id}
                                                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                                                >
                                                    <p className="font-medium">
                                                        {
                                                            spreadsheet.original_filename
                                                        }
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(
                                                            spreadsheet.created_at,
                                                        ).toLocaleString()}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {spreadsheet.sheets.map(
                                                            (s) => (
                                                                <Link
                                                                    key={s.id}
                                                                    href={route(
                                                                        'sheets.show',
                                                                        s.id,
                                                                    )}
                                                                    className="inline-flex items-center rounded-md bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                                                                >
                                                                    {s.name} (
                                                                    {s.row_count}{' '}
                                                                    rows &times;{' '}
                                                                    {s.col_count}{' '}
                                                                    cols)
                                                                </Link>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                                    <p>No files uploaded yet. Upload an Excel file above to get started.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
