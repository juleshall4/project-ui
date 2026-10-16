import { CircleAlertIcon } from "lucide-react";
import { Component, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Props = { children: ReactNode; name: string };

export class ErrorBoundary extends Component<Props, { error?: Error }> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Alert variant="error">
          <CircleAlertIcon />
          <AlertTitle>{this.props.name} failed to render</AlertTitle>
          <AlertDescription>{this.state.error.message}</AlertDescription>
        </Alert>
      );
    }
    return this.props.children;
  }
}
