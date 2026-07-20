import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Shield } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/ranking", label: "Ranking" },
  { to: "/ligas", label: "Ligas" },
  { to: "/torneos", label: "Torneos" },
  { to: "/clubes", label: "Clubes" },
  { to: "/jugadores", label: "Jugadores" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <Logo size="md" />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "text-xs font-medium uppercase tracking-[0.15em] transition-colors",
                    isActive
                      ? "text-amber-400"
                      : "text-zinc-400 hover:text-white"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            <Link to="/admin/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:bg-transparent hover:text-amber-400"
              >
                <Shield size={15} className="mr-1.5" />
                Admin
              </Button>
            </Link>
          </div>

          <button
            className="lg:hidden text-muted-foreground hover:text-amber-500"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "text-amber-500 bg-amber-600/10"
                        : "text-muted-foreground hover:text-amber-500/80 hover:bg-amber-600/5"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/admin/login"
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                  location.pathname.startsWith("/admin")
                    ? "text-amber-500 bg-amber-600/10"
                    : "text-muted-foreground hover:text-amber-500/80"
                )}
              >
                <Shield size={16} />
                Admin
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
