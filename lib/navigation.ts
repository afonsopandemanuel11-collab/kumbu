export type NavItem = {
  href: string;
  label: string;
  icon: string;
  mobile?: boolean;
  desktop?: boolean;
};

// Sidebar nav groups (desktop)
export const navPrincipal: NavItem[] = [
  { href: "/", label: "Início", icon: "home" },
  { href: "/diario", label: "Diário", icon: "book" },
];

export const navGestao: NavItem[] = [
  { href: "/carteiras", label: "Carteiras", icon: "wallet" },
  { href: "/rendimentos", label: "Rendimentos", icon: "trending-up" },
  { href: "/planeamento", label: "Planeamento", icon: "calendar" },
  { href: "/projectos", label: "Projectos", icon: "folder" },
  { href: "/dividas", label: "Dívidas", icon: "handshake" },
  { href: "/metas", label: "Metas", icon: "target" },
];

export const navAnalise: NavItem[] = [
  { href: "/orcamentos", label: "Orçamentos", icon: "chart" },
  { href: "/relatorios", label: "Relatórios", icon: "report" },
];

// Mobile bottom nav (first 4 slots — FAB is slot 3)
export const mainNavItems: NavItem[] = [
  { href: "/", label: "Início", icon: "home", mobile: true, desktop: true },
  { href: "/diario", label: "Diário", icon: "book", mobile: true, desktop: true },
  { href: "/carteiras", label: "Carteiras", icon: "wallet", desktop: true },
  { href: "/rendimentos", label: "Rendimentos", icon: "trending-up", desktop: true },
  { href: "/projectos", label: "Projectos", icon: "folder", desktop: true },
  { href: "/metas", label: "Metas", icon: "target", mobile: true, desktop: true },
  { href: "/orcamentos", label: "Orçamentos", icon: "chart", desktop: true },
  { href: "/relatorios", label: "Relatórios", icon: "report", desktop: true },
];

export const mobileMoreItems: NavItem[] = [
  { href: "/carteiras", label: "Carteiras", icon: "wallet" },
  { href: "/rendimentos", label: "Rendimentos", icon: "trending-up" },
  { href: "/planeamento", label: "Planeamento", icon: "calendar" },
  { href: "/projectos", label: "Projectos", icon: "folder" },
  { href: "/dividas", label: "Dívidas", icon: "handshake" },
  { href: "/orcamentos", label: "Orçamentos", icon: "chart" },
  { href: "/relatorios", label: "Relatórios", icon: "report" },
  { href: "/definicoes", label: "Definições", icon: "settings" },
];