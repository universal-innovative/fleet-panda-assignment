import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Icons } from '../ui/Icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center mb-4">
            <Icons.AlertTriangle size={24} className="text-danger-500" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900 mb-1">Something went wrong</h3>
          <p className="text-sm text-surface-500 max-w-md mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-primary btn-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
