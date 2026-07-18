interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <div className="mb-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        {icon && <div className="text-amber-500">{icon}</div>}
        <div className="h-px flex-1 bg-gradient-to-r from-amber-600/50 to-transparent" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
        <span className="gold-text">{title}</span>
      </h1>
      <p className="mt-3 text-muted-foreground max-w-2xl text-base leading-relaxed">{subtitle}</p>
    </div>
  );
}
