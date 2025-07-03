interface DashboardHomeProps {
  onNavigate: (page: string, orderId?: string) => void;
}

export default function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const cards = [
    {
      id: "order-servis",
      title: "Tambah Order Servis Baru",
      icon: "🔧",
      color: "bg-blue-500",
    },
    {
      id: "riwayat-order",
      title: "Daftar Riwayat Order",
      icon: "📋",
      color: "bg-green-500",
    },
    {
      id: "produk-jasa",
      title: "Kelola Produk & Jasa",
      icon: "📦",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-[16px] shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
        <p className="text-gray-600">Kelola bengkel Anda dengan mudah</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="bg-white rounded-[16px] shadow-sm hover:shadow-md transition-shadow p-6 text-left group"
          >
            <div className="mb-4">
              <div className="rounded-lg flex text-white text-[40px] mr-4 mb-[24px]">
                {card.icon}
              </div>
							<br/>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {card.title}
              </h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
