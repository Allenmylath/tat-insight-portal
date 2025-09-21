import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ClerkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Clerk Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Auth unavailable</span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={this.handleRetry}
            className="h-6 px-2"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}