import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface OrderItem {
  itemId: string;
  itemName: string;
  itemType: "product" | "service";
  quantity: number;
  price: number;
  subtotal: number;
}

interface CustomerData {
  customerName: string;
  customerPhone: string;
  vehicleType: string;
  plateNumber: string;
  complaint: string;
}

export default function OrderServis() {
  const [customerData, setCustomerData] = useState<CustomerData>({
    customerName: "",
    customerPhone: "",
    vehicleType: "",
    plateNumber: "",
    complaint: "",
  });

  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedItemType, setSelectedItemType] = useState<"product" | "service">("product");
  const [selectedItemPrice, setSelectedItemPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const products = useQuery(api.items.listProducts) || [];
  const services = useQuery(api.items.listServices) || [];
  const createOrder = useAction(api.orders.createOrder);

  // Combine products and services for the dropdown
  const allItems = [
    ...products.map(p => ({
      id: p.productId,
      name: p.name,
      type: "product" as const,
      price: p.price,
      stock: p.stock,
    })),
    ...services.map(s => ({
      id: s.serviceId,
      name: s.name,
      type: "service" as const,
      price: s.price,
      stock: null,
    })),
  ];

  // Calculate total amount
  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCustomerDataChange = (field: keyof CustomerData, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemSelect = (itemId: string) => {
    const item = allItems.find(i => i.id === itemId);
    if (item) {
      setSelectedItemId(item.id);
      setSelectedItemName(item.name);
      setSelectedItemType(item.type);
      setSelectedItemPrice(item.price);
    }
  };

  const addItemToOrder = () => {
    if (!selectedItemId || !selectedItemName || quantity <= 0) {
      toast.error("Pilih item dan masukkan jumlah yang valid");
      return;
    }

    // Check if product has enough stock
    if (selectedItemType === "product") {
      const product = products.find(p => p.productId === selectedItemId);
      if (product && product.stock < quantity) {
        toast.error(`Stok tidak mencukupi. Stok tersedia: ${product.stock}`);
        return;
      }
    }

    // Check if item already exists in order
    const existingItemIndex = orderItems.findIndex(item => item.itemId === selectedItemId);

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].subtotal = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        itemId: selectedItemId,
        itemName: selectedItemName,
        itemType: selectedItemType,
        quantity,
        price: selectedItemPrice,
        subtotal: quantity * selectedItemPrice,
      };
      setOrderItems(prev => [...prev, newItem]);
    }

    // Reset selection
    setSelectedItemId("");
    setSelectedItemName("");
    setQuantity(1);
    toast.success("Item berhasil ditambahkan");
  };

  const removeItemFromOrder = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
    toast.success("Item berhasil dihapus");
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(index);
      return;
    }

    const updatedItems = [...orderItems];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].subtotal = newQuantity * updatedItems[index].price;
    setOrderItems(updatedItems);
  };

  const handleSubmitOrder = async () => {
    // Validation
    if (!customerData.customerName.trim()) {
      toast.error("Nama pelanggan harus diisi");
      return;
    }
    if (!customerData.customerPhone.trim()) {
      toast.error("Nomor telepon harus diisi");
      return;
    }
    if (!customerData.vehicleType.trim()) {
      toast.error("Jenis kendaraan harus diisi");
      return;
    }
    if (!customerData.plateNumber.trim()) {
      toast.error("Nomor polisi harus diisi");
      return;
    }
    if (!customerData.complaint.trim()) {
      toast.error("Keluhan harus diisi");
      return;
    }
    if (orderItems.length === 0) {
      toast.error("Minimal satu item harus ditambahkan");
      return;
    }

    setIsSubmitting(true);
    try {
      // Map itemType to string literals expected by backend
      const itemsForBackend = orderItems.map(item => ({
        itemId: String(item.itemId),
        itemName: item.itemName,
        itemType: (item.itemType === "product" ? "product" : "service") as "product" | "service",
        quantity: item.quantity,
        price: item.price,
      }));

      const orderId = await createOrder({
        customerName: customerData.customerName,
        customerPhone: customerData.customerPhone,
        vehicleType: customerData.vehicleType,
        plateNumber: customerData.plateNumber,
        complaint: customerData.complaint,
        items: itemsForBackend,
      });

      toast.success("Order berhasil dibuat!");

      // Reset form
      setCustomerData({
        customerName: "",
        customerPhone: "",
        vehicleType: "",
        plateNumber: "",
        complaint: "",
      });
      setOrderItems([]);

      // You can add navigation to receipt page here
      console.log("Order created with ID:", orderId);
    } catch (error) {
      toast.error("Gagal membuat order");
      console.error("Error creating order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[16px] shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Order Servis</h2>
        <p className="text-gray-600">Buat order servis baru untuk pelanggan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Customer Info & Items */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pelanggan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pelanggan *
                </label>
                <input
                  type="text"
                  value={customerData.customerName}
                  onChange={(e) => handleCustomerDataChange("customerName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama pelanggan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon *
                </label>
                <input
                  type="tel"
                  value={customerData.customerPhone}
                  onChange={(e) => handleCustomerDataChange("customerPhone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nomor telepon"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kendaraan *
                </label>
                <input
                  type="text"
                  value={customerData.vehicleType}
                  onChange={(e) => handleCustomerDataChange("vehicleType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Honda Beat, Yamaha Vixion"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Polisi *
                </label>
                <input
                  type="text"
                  value={customerData.plateNumber}
                  onChange={(e) => handleCustomerDataChange("plateNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: B 1234 ABC"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keluhan *
                </label>
                <textarea
                  value={customerData.complaint}
                  onChange={(e) => handleCustomerDataChange("complaint", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jelaskan keluhan atau masalah kendaraan"
                  required
                />
              </div>
            </div>
          </div>
          </div>
				
        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* Add Items */}
          {/* Kartu Tambah Item */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Item</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Produk/Jasa</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => handleItemSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Item --</option>
                    <optgroup label="Produk">
                      {products.map((product) => (
                        <option key={product.productId} value={product.productId}>
                          {product.name} - {formatCurrency(product.price)} (Stok: {product.stock})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Jasa">
                      {services.map((service) => (
                        <option key={service.serviceId} value={service.serviceId}>
                          {service.name} - {formatCurrency(service.price)}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                
                <div className="flex space-x-3 items-end">
                  {/* Kolom Jumlah hanya muncul jika tipe item adalah 'product' */}
                  {selectedItemType === "product" && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <div className={selectedItemType === "product" ? "" : "w-full"}>
                    <button
                      type="button"
                      onClick={addItemToOrder}
                      disabled={!selectedItemId}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      + Tambah ke Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar Item Order</h3>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada item yang ditambahkan
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.itemName}</h4>
                        <p className="text-sm text-gray-500">
                          {item.itemType === "product" ? "Produk" : "Jasa"} - {formatCurrency(item.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItemFromOrder(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Jumlah:</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                          min="1"
													disabled={selectedItemType === "service"}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Total */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Order</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </p>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting || orderItems.length === 0}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Memproses..." : "Buat Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
