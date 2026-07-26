import React from 'react';

type Props = { children: React.ReactNode };
type State = { error: Error | null; info: string | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error) {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] caught render error:', error, info.componentStack);
    this.setState({ error, info: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen grid place-items-center bg-stone-50 p-6">
          <div className="max-w-2xl w-full rounded-lg border border-red-300 bg-white shadow-lg overflow-hidden">
            <div className="bg-red-600 px-5 py-3 text-white font-bold">Something went wrong</div>
            <div className="p-5 space-y-3">
              <p className="text-sm font-semibold text-red-700">{this.state.error.message}</p>
              {this.state.error.stack && (
                <pre className="max-h-64 overflow-auto rounded bg-stone-900 p-3 text-xs text-red-200 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              )}
              {this.state.info && (
                <details className="text-xs text-stone-600">
                  <summary className="cursor-pointer font-semibold">Component stack</summary>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap">{this.state.info}</pre>
                </details>
              )}
              <button
                className="mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => this.setState({ error: null, info: null })}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
