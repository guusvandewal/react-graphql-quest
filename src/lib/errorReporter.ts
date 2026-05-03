export interface ErrorReport {
  message: string;
  context: string;
  error?: unknown;
  componentStack?: string;
}

/**
 * Central error reporter. Swap the body for Sentry.captureException(),
 * Datadog RUM, or any other provider — callers don't change.
 */
export function reportError({ message, context, error, componentStack }: ErrorReport): void {
  console.error('[error]', {
    message,
    context,
    error,
    componentStack,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    timestamp: new Date().toISOString(),
  });
}
