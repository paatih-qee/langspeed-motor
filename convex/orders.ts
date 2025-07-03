import { query, mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Create a new order with items
export const createOrder = action({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    vehicleType: v.string(),
    plateNumber: v.string(),
    complaint: v.string(),
    items: v.array(v.object({
      itemId: v.string(),
      itemName: v.string(),
      itemType: v.union(v.literal("product"), v.literal("service")),
      quantity: v.number(),
      price: v.number(),
    })),
  },
  handler: async (ctx, args): Promise<Id<"orders">> => {
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Calculate total amount
    let totalAmount = 0;
    for (const item of args.items) {
      totalAmount += item.price * item.quantity;
    }
    
    // Create the order
    const orderId: Id<"orders"> = await ctx.runMutation(internal.orders.insertOrder, {
      orderNumber,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      vehicleType: args.vehicleType,
      plateNumber: args.plateNumber,
      complaint: args.complaint,
      totalAmount,
      status: "Diproses" as const,
    });
    
    // Create order items and update product stock
    for (const item of args.items) {
      // Insert order item
      await ctx.runMutation(internal.orders.insertOrderItem, {
        orderId,
        itemId: item.itemId,
        itemName: item.itemName,
        itemType: item.itemType,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      });
      
      // Update product stock if it's a product
      if (item.itemType === "product") {
        await ctx.runMutation(internal.orders.decreaseProductStock, {
          itemId: item.itemId,
          quantity: item.quantity,
        });
      }
    }
    
    return orderId;
  },
});

// Internal mutation to insert order
export const insertOrder = internalMutation({
  args: {
    orderNumber: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    vehicleType: v.string(),
    plateNumber: v.string(),
    complaint: v.string(),
    totalAmount: v.number(),
    status: v.union(v.literal("Diproses"), v.literal("Selesai")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", args);
  },
});

// Internal mutation to insert order item
export const insertOrderItem = internalMutation({
  args: {
    orderId: v.id("orders"),
    itemId: v.string(),
    itemName: v.string(),
    itemType: v.union(v.literal("product"), v.literal("service")),
    quantity: v.number(),
    price: v.number(),
    subtotal: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("order_items", args);
  },
});

// Internal mutation to decrease product stock
export const decreaseProductStock = internalMutation({
  args: {
    itemId: v.string(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_product_id", (q) => q.eq("productId", args.itemId))
      .unique();
    
    if (!product) {
      throw new Error(`Product with ID ${args.itemId} not found`);
    }
    
    const newStock = Math.max(0, product.stock - args.quantity);
    await ctx.db.patch(product._id, { stock: newStock });
    
    return product._id;
  },
});

// Get all orders sorted by creation time (newest first)
export const listOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

// Get order details with all associated items
export const getOrderDetails = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    // Get the order
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Get all order items
    const orderItems = await ctx.db
      .query("order_items")
      .withIndex("by_order_id", (q) => q.eq("orderId", args.orderId))
      .collect();
    
    return {
      order,
      items: orderItems,
    };
  },
});

// Update order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(v.literal("Diproses"), v.literal("Selesai")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { status: args.status });
    return args.orderId;
  },
});
