import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; name: string };

export class ErrorBoundary extends Component<Props, { error?: Error }> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <p className="text-destructive-foreground text-sm">
          {this.props.name} failed to render: {this.state.error.message}
        </p>
      );
    }
    return this.props.children;
  }
}
