import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface RiwayatOrderProps {
  onNavigate: (page: string, orderId?: string) => void;
}

export default function RiwayatOrder({ onNavigate }: RiwayatOrderProps) {
  const orders = useQuery(api.orders.listOrders) || [];
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = async (orderId: string, newStatus: "Diproses" | "Selesai") => {
    try {
      await updateOrderStatus({ orderId: orderId as any, status: newStatus });
      toast.success(`Status order berhasil diubah menjadi ${newStatus}`);
    } catch (error) {
      toast.error("Gagal mengubah status order");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Diproses") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Diproses
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Selesai
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-[40px]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Riwayat Order Servis</h2>
            <p className="text-gray-600">Lihat dan kelola semua order servis</p>
          </div>
          <button
            onClick={() => onNavigate("order-servis")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Tambah Order Baru
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kendaraan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order._creationTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.vehicleType}</div>
                    <div className="text-sm text-gray-500">{order.plateNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {order.status === "Diproses" ? (
                      <>
                        <button
                          onClick={() => handleStatusChange(order._id, "Selesai")}
                          className="text-green-600 hover:text-green-900"
                        >
                          Selesaikan
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => onNavigate("order-detail", order._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Detail
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onNavigate("order-nota", order._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Lihat Nota
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => onNavigate("order-detail", order._id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Detail
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">Belum ada order servis</div>
              <p className="text-sm">Klik "Tambah Order Baru" untuk membuat order pertama</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
