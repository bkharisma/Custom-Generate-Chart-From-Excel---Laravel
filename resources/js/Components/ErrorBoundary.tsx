import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="rounded-md bg-red-50 p-6 text-center dark:bg-red-900">
                    <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
                        Something went wrong
                    </h2>
                    <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                        {this.state.error?.message ?? 'An unexpected error occurred while rendering this section.'}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
