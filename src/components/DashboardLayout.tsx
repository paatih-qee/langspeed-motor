import { SignOutButton } from "../SignOutButton";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string, orderId?: string) => void;
  user: any;
}

export default function DashboardLayout({ children, currentPage, onNavigate, user }: DashboardLayoutProps) {
  const navItems = [
    { id: "dashboard", label: "Dasbor", href: "#" },
    { id: "order-servis", label: "Order Servis", href: "#" },
    { id: "riwayat-order", label: "Riwayat Order", href: "#" },
    { id: "produk-jasa", label: "Produk dan Jasa", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <nav className="bg-white shadow-sm border-b py-[20px]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <img className="h-[64px]" src="assets\img\logo langspeed.png" alt="" />

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Logout */}
            <div className="flex items-center space-x-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
