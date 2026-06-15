import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import FlashMessage from '@/Components/FlashMessage';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

interface Project {
    id: number;
    name: string;
    description: string | null;
    user: { id: number; name: string; email: string };
    created_at: string;
}

export default function Index({
    projects,
    flash,
}: PageProps<{
    projects: {
        data: Project[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    flash?: { success?: string };
}>) {
    const user = usePage().props.auth.user;

    const deleteProject = (project: Project) => {
        if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
            router.delete(route('projects.destroy', project.id));
        }
    };

    const canDelete = (project: Project) =>
        user.role === 'admin' || user.id === project.user.id;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Projects
                    </h2>
                    <Link
                        href={route('projects.create')}
                        className="rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white"
                    >
                        New Project
                    </Link>
                </div>
            }
        >
            <Head title="Projects" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <FlashMessage flash={flash} />

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {projects.data.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    No projects yet.{' '}
                                    <Link
                                        href={route('projects.create')}
                                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                                    >
                                        Create your first project
                                    </Link>
                                </p>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Owner
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Created
                                            </th>
                                            <th className="px-4 py-3"></th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {projects.data.map((project) => (
                                            <tr key={project.id}>
                                                <td className="whitespace-nowrap px-4 py-3">
                                                    <Link
                                                        href={route(
                                                            'projects.show',
                                                            project.id,
                                                        )}
                                                        className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                                                    >
                                                        {project.name}
                                                    </Link>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                    {project.user.name}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(
                                                        project.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                    <Link
                                                        href={route(
                                                            'projects.edit',
                                                            project.id,
                                                        )}
                                                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                                                    >
                                                        Edit
                                                    </Link>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                    {canDelete(project) && (
                                                        <DangerButton
                                                            type="button"
                                                            onClick={() =>
                                                                deleteProject(
                                                                    project,
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </DangerButton>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {projects.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Showing{' '}
                                        {(projects.current_page - 1) *
                                            projects.per_page +
                                            1}{' '}
                                        to{' '}
                                        {Math.min(
                                            projects.current_page *
                                                projects.per_page,
                                            projects.total,
                                        )}{' '}
                                        of {projects.total} projects
                                    </div>
                                    <div className="flex gap-2">
                                        {projects.links.map(
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
            </div>
        </AuthenticatedLayout>
    );
}
