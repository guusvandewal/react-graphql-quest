import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '@/lib/errorReporter';

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError({
      message: error.message,
      context: 'ErrorBoundary',
      error,
      componentStack: info.componentStack ?? undefined,
    });
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="p-6 text-center">
            <p className="text-destructive mb-3">Something went wrong: {error.message}</p>
            <button
              type="button"
              className="text-sm underline text-muted-foreground"
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
