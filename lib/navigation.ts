export type NavItem = {
  href: string;
  label: string;
  icon: string;
  mobile?: boolean;
  desktop?: boolean;
};

export const mainNavItems: NavItem[] = [
  { href: "/", label: "Inicio", icon: "home", mobile: true, desktop: true },
  { href: "/diario", label: "Diario", icon: "book", mobile: true, desktop: true },
  { href: "/carteiras", label: "Carteiras", icon: "wallet", desktop: true },
  { href: "/projectos", label: "Projectos", icon: "folder", desktop: true },
  { href: "/dividas", label: "Dividas", icon: "handshake", desktop: true },
  { href: "/metas", label: "Metas", icon: "target", mobile: true, desktop: true },
  { href: "/orcamentos", label: "Orcamentos", icon: "chart", desktop: true },
  { href: "/relatorios", label: "Relatorios", icon: "report", desktop: true },
];

export const mobileMoreItems: NavItem[] = [
  { href: "/carteiras", label: "Carteiras", icon: "wallet" },
  { href: "/projectos", label: "Projectos", icon: "folder" },
  { href: "/dividas", label: "Dividas", icon: "handshake" },
  { href: "/orcamentos", label: "Orcamentos", icon: "chart" },
  { href: "/relatorios", label: "Relatorios", icon: "report" },
  { href: "/definicoes", label: "Definicoes", icon: "settings" },
];