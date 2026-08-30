import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import KasirPage from "./pages/KasirPage";
import ItemPage from "./pages/ItemPage";
import LaporanPage from "./pages/LaporanPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/kasir" element={<KasirPage />} />
        <Route path="/item" element={<ItemPage />} />
        <Route path="/laporan" element={<LaporanPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
