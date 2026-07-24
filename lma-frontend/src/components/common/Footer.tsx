import { Crown, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-black/40 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg gold-gradient">
                <Crown size={20} className="text-black" strokeWidth={2.5} />
              </div>
              <span className="font-bold gold-text">Liga Mendocina de Ajedrez</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Temporadas de torneos que fomentan el Ajedrez en la provincia de Mendoza, Argentina.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-amber-500 mb-3 text-sm uppercase tracking-wider">Secciones</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-amber-500 transition-colors">Inicio</Link></li>
              <li><Link to="/ranking" className="hover:text-amber-500 transition-colors">Ranking</Link></li>
              <li><Link to="/ligas" className="hover:text-amber-500 transition-colors">Ligas</Link></li>
              <li><Link to="/torneos" className="hover:text-amber-500 transition-colors">Torneos</Link></li>
              <li><Link to="/clubes" className="hover:text-amber-500 transition-colors">Clubes</Link></li>
              <li><Link to="/jugadores" className="hover:text-amber-500 transition-colors">Jugadores</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-amber-500 mb-3 text-sm uppercase tracking-wider">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://maps.google.com/?q=Av.+San+Martín+100,+Mendoza" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                  <MapPin size={14} className="text-amber-500/70" />
                  Av. San Martín 100, Mendoza
                </a>
              </li>
              <li>
                <a href="mailto:info@ligamendocinaajedrez.org" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                  <Mail size={14} className="text-amber-500/70" />
                  info@ligamendocinaajedrez.org
                </a>
              </li>
              <li>
                <a href="tel:+542614200000" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                  <Phone size={14} className="text-amber-500/70" />
                  +54 261 420-0000
                </a>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/50 hover:bg-amber-600/15 hover:text-amber-500 text-muted-foreground transition-colors" aria-label="Facebook">
                <Facebook size={16} />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/50 hover:bg-amber-600/15 hover:text-amber-500 text-muted-foreground transition-colors" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/50 hover:bg-amber-600/15 hover:text-amber-500 text-muted-foreground transition-colors" aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/50 hover:bg-amber-600/15 hover:text-amber-500 text-muted-foreground transition-colors" aria-label="Sitio web">
                <Globe size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Liga Mendocina de Ajedrez. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
