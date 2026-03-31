import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useCorretor } from "@/contexts/CorretorContext";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: Props) {
  const { prefixLink } = useCorretor();

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1 text-xs text-muted-foreground font-body overflow-x-auto ${className}`}
    >
      <Link
        to={prefixLink("/")}
        className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0"
      >
        <Home className="h-3 w-3" />
        <span>Uhome</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          {item.href ? (
            <Link
              to={prefixLink(item.href)}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
