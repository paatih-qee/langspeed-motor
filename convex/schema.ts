import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  products: defineTable({
    productId: v.string(),
    name: v.string(),
    price: v.number(),
    stock: v.number(),
  }).index("by_product_id", ["productId"]),

  services: defineTable({
    serviceId: v.string(),
    name: v.string(),
    price: v.number(),
  }).index("by_service_id", ["serviceId"]),

  orders: defineTable({
    orderNumber: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    vehicleType: v.string(),
    plateNumber: v.string(),
    complaint: v.string(),
    totalAmount: v.number(),
    status: v.union(v.literal("Diproses"), v.literal("Selesai")),
  }).index("by_order_number", ["orderNumber"])
    .index("by_status", ["status"]),

  order_items: defineTable({
    orderId: v.id("orders"),
    itemId: v.string(),
    itemName: v.string(),
    itemType: v.union(v.literal("product"), v.literal("service")),
    quantity: v.number(),
    price: v.number(),
    subtotal: v.number(),
  }).index("by_order_id", ["orderId"])
    .index("by_item_id", ["itemId"]),


};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
