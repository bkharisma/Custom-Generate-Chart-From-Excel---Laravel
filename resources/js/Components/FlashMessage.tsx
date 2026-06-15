interface FlashMessageProps {
    flash?: { success?: string; error?: string };
}

export default function FlashMessage({ flash }: FlashMessageProps) {
    if (!flash) return null;

    return (
        <>
            {flash.success && (
                <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
                    {flash.success}
                </div>
            )}
            {flash.error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
                    {flash.error}
                </div>
            )}
        </>
    );
}
