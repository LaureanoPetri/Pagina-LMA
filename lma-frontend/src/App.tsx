import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DocumentTitle } from "@/components/common/DocumentTitle";
import { Layout } from "@/components/common/Layout";
import { InicioPage } from "@/pages/InicioPage";
import { RankingPage } from "@/pages/RankingPage";
import { LigasPage } from "@/pages/LigasPage";
import { LigaDetallePage } from "@/pages/LigaDetallePage";
import { TorneosPage } from "@/pages/TorneosPage";
import { TorneoDetallePage } from "@/pages/TorneoDetallePage";
import { ClubesPage } from "@/pages/ClubesPage";
import { ClubDetallePage } from "@/pages/ClubDetallePage";
import { JugadoresPage } from "@/pages/JugadoresPage";
import { JugadorDetallePage } from "@/pages/JugadorDetallePage";
import { LoginAdminPage } from "@/pages/LoginAdminPage";
import { PanelAdminPage } from "@/pages/PanelAdminPage";

function App() {
  return (
    <BrowserRouter>
      <DocumentTitle />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<InicioPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/ligas" element={<LigasPage />} />
          <Route path="/ligas/:id" element={<LigaDetallePage />} />
          <Route path="/torneos" element={<TorneosPage />} />
          <Route path="/torneos/:id" element={<TorneoDetallePage />} />
          <Route path="/clubes" element={<ClubesPage />} />
          <Route path="/clubes/:id" element={<ClubDetallePage />} />
          <Route path="/jugadores" element={<JugadoresPage />} />
          <Route path="/jugadores/:id" element={<JugadorDetallePage />} />
          <Route path="/admin/login" element={<LoginAdminPage />} />
          <Route path="/admin/panel" element={<PanelAdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
