import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface OrderNotaProps {
  orderId: string;
  onNavigate: (page: string, orderId?: string) => void;
}

export default function OrderNota({ orderId, onNavigate }: OrderNotaProps) {
  const orderDetails = useQuery(api.orders.getOrderDetails, { orderId: orderId as any });

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

  const handlePrint = () => {
    window.print();
  };

  if (!orderDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data order...</p>
        </div>
      </div>
    );
  }

  const { order, items } = orderDetails;

  return (
    <div className="min-h-screen bg-white">
      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-container {
            margin: 0;
            padding: 20px;
          }
        }
      `}</style>

      {/* Header - Hidden when printing */}
      <div className="no-print bg-gray-50 border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <button
            onClick={() => onNavigate("riwayat-order")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Kembali ke Riwayat Order
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span>⎙</span>
            <span>Cetak Halaman Ini</span>
          </button>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="print-container container mx-auto p-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LANGSPEED MOTOR</h1>
          <p className="text-sm text-gray-500">Email: langspeedmotor.jaktim@gmail.com | Telp: (021) 1234-5678</p>
          <hr className="my-4 border-gray-300" />
          <h2 className="text-xl font-semibold text-gray-800">NOTA SERVIS</h2>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Order</h3>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-gray-600">No. Order:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Tanggal:</span>
                <span>{formatDate(order._creationTime)}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  order.status === "Selesai" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pelanggan</h3>
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-gray-600">Nama:</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Telepon:</span>
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Kendaraan:</span>
                <span>{order.vehicleType}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">No. Polisi:</span>
                <span className="font-medium">{order.plateNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Keluhan</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{order.complaint}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Item</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                    No.
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Nama Item
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Tipe
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900">
                    Jumlah
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-900">
                    Harga Satuan
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-900">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                      {item.itemName}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                      {item.itemType === "product" ? "Produk" : "Jasa"}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 text-center">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td colSpan={5} className="border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                    TOTAL:
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    {formatCurrency(order.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-12 pt-8 border-t border-gray-300">
          <p>Terima kasih atas kepercayaan Anda menggunakan layanan Langspeed Motor</p>
          <p className="mt-2">Nota ini dicetak pada: {formatDate(Date.now())}</p>
        </div>
      </div>
    </div>
  );
}
