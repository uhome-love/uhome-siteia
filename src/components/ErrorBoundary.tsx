import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function isChunkError(error: Error): boolean {
  const msg = error.message || "";
  return (
    msg.includes("Loading chunk") ||
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("error loading dynamically imported module")
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
    // Evita que o Google indexe a página de erro como sitelink.
    if (typeof document !== "undefined") {
      document.title = "Uhome Imóveis | Apartamentos e Casas à Venda em Porto Alegre";
      let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      if (!robots) {
        robots = document.createElement("meta");
        robots.name = "robots";
        document.head.appendChild(robots);
      }
      robots.content = "noindex, nofollow";
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isChunk = this.state.error && isChunkError(this.state.error);

      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            {isChunk ? "Atualização disponível" : "Recarregue a página"}
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {isChunk
              ? "Uma nova versão do site foi publicada. Recarregue a página para continuar."
              : "Não foi possível carregar este conteúdo. Recarregue a página para tentar novamente."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Recarregar página
            </button>
            {!isChunk && (
              <button
                onClick={this.handleRetry}
                className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Tentar novamente
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
