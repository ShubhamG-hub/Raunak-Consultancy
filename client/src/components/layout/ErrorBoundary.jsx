import React from 'react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4 text-center">
                    <h1 className="text-3xl font-bold text-red-700 mb-4">Something went wrong.</h1>
                    <p className="text-slate-600 mb-6 max-w-md">
                        The application encountered an unexpected error.
                    </p>
                    <div className="bg-white p-4 rounded-md shadow-sm border border-red-200 text-left overflow-auto max-w-2xl w-full mb-6">
                        <code className="text-red-600 text-sm font-mono block mb-2">
                            {this.state.error && this.state.error.toString()}
                        </code>
                        <details className="text-xs text-slate-500 cursor-pointer">
                            <summary>Stack Trace</summary>
                            <pre className="mt-2 whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    </div>
                    <Button onClick={() => window.location.href = '/'}>Go back to Home</Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
