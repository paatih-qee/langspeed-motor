import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./components/DashboardHome";
import { ProdukJasa } from "./components/ProdukJasa";
import OrderServis from "./components/OrderServis";
import RiwayatOrder from "./components/RiwayatOrder";
import OrderDetail from "./components/OrderDetail";
import OrderNota from "./components/OrderNota";

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const user = useQuery(api.auth.loggedInUser);

  const handleNavigate = (page: string, orderId?: string) => {
    setCurrentPage(page);
    if (orderId) {
      setSelectedOrderId(orderId);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardHome onNavigate={handleNavigate} />;
      case "order-servis":
        return <OrderServis />;
      case "riwayat-order":
        return <RiwayatOrder onNavigate={handleNavigate} />;
      case "order-detail":
        return selectedOrderId ? <OrderDetail orderId={selectedOrderId} onNavigate={handleNavigate} /> : <DashboardHome onNavigate={handleNavigate} />;
      case "order-nota":
        return selectedOrderId ? <OrderNota orderId={selectedOrderId} onNavigate={handleNavigate} /> : <DashboardHome onNavigate={handleNavigate} />;
      case "produk-jasa":
        return <ProdukJasa />;
      default:
        return <DashboardHome onNavigate={handleNavigate} />;
    }
  };

	if (currentPage === "order-nota") {
    // Jika halaman adalah nota, render hanya komponen nota tanpa layout.
    return selectedOrderId 
      ? <OrderNota orderId={selectedOrderId} onNavigate={handleNavigate} /> 
      : <DashboardHome onNavigate={handleNavigate} />; // Fallback jika ID tidak ada, kembali ke dasbor.
  }

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={handleNavigate} user={user}>
      {renderPage()}
    </DashboardLayout>
  );
}
