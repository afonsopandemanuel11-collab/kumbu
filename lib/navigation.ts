export type NavItem = {
  href: string;
  label: string;
  icon: string;
  mobile?: boolean;
  desktop?: boolean;
};

export const mainNavItems: NavItem[] = [
  { href: "/", label: "Início", icon: "🏠", mobile: true, desktop: true },
  { href: "/diario", label: "Diário", icon: "📒", mobile: true, desktop: true },
  { href: "/carteiras", label: "Carteiras", icon: "💳", desktop: true },
  { href: "/projectos", label: "Projectos", icon: "🚀", desktop: true },
  { href: "/dividas", label: "Dívidas", icon: "🤝", desktop: true },
  { href: "/metas", label: "Metas", icon: "🎯", mobile: true, desktop: true },
  { href: "/orcamentos", label: "Orçamentos", icon: "📊", desktop: true },
  { href: "/relatorios", label: "Relatórios", icon: "📈", desktop: true },
];

export const mobileMoreItems: NavItem[] = [
  { href: "/carteiras", label: "Carteiras", icon: "💳" },
  { href: "/projectos", label: "Projectos", icon: "🚀" },
  { href: "/dividas", label: "Dívidas", icon: "🤝" },
  { href: "/orcamentos", label: "Orçamentos", icon: "📊" },
  { href: "/relatorios", label: "Relatórios", icon: "📈" },
  { href: "/definicoes", label: "Definições", icon: "⚙️" },
];
