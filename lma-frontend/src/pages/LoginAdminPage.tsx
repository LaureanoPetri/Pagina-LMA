import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, User } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { login } from "@/api/client";

export function LoginAdminPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(usuario, password);
      navigate("/admin/panel");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center animate-fade-in px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>
      <Card className="w-full max-w-md border-amber-600/20 shadow-xl shadow-amber-900/10 relative z-10">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <Logo size="md" showText={false} />
          </div>
          <div>
            <CardTitle className="text-2xl">
              <span className="gold-text">Acceso Administrador</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5">
              Ingrese sus credenciales para acceder al panel de gestión.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="usuario"
                  placeholder="admin"
                  className="pl-9"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button type="submit" className="w-full gold-gradient text-black font-semibold hover:opacity-90" disabled={loading}>
              <Shield size={16} className="mr-2" />
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
            <p className="text-center text-xs text-muted-foreground pt-2">
              <Link to="/" className="hover:text-amber-500 transition-colors">← Volver al inicio</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
