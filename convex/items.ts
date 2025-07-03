import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// --- Item Management Functions (REVISED) ---

// Add a new item (product or service)
export const addItem = mutation({
  args: {
    type: v.union(v.literal("product"), v.literal("service")),
    name: v.string(),
    price: v.number(),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.type === "product") {
      const productId = `P-${Date.now()}`;
      return await ctx.db.insert("products", {
        productId,
        name: args.name,
        price: args.price,
        stock: args.stock ?? 0,
      });
    } else {
      const serviceId = `J-${Date.now()}`;
      return await ctx.db.insert("services", {
        serviceId,
        name: args.name,
        price: args.price,
      });
    }
  },
});

// PERBAIKAN: Fungsi update spesifik untuk produk
export const updateProduct = mutation({
    args: {
        id: v.id("products"), // Validator ID yang benar
        name: v.string(),
        price: v.number(),
        stock: v.number(),
    },
    handler: async (ctx, args) => {
        const { id, ...rest } = args;
        await ctx.db.patch(id, rest); // Aman tanpa 'as any'
    },
});

// PERBAIKAN: Fungsi update spesifik untuk jasa
export const updateService = mutation({
    args: {
        id: v.id("services"), // Validator ID yang benar
        name: v.string(),
        price: v.number(),
    },
    handler: async (ctx, args) => {
        const { id, ...rest } = args;
        await ctx.db.patch(id, rest); // Aman tanpa 'as any'
    },
});

// PERBAIKAN: Fungsi delete spesifik untuk produk
export const deleteProduct = mutation({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// PERBAIKAN: Fungsi delete spesifik untuk jasa
export const deleteService = mutation({
    args: { id: v.id("services") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// Query untuk mengambil data (tidak ada perubahan)
export const listProducts = query({
  handler: async (ctx) => await ctx.db.query("products").order("desc").collect(),
});

export const listServices = query({
  handler: async (ctx) => await ctx.db.query("services").order("desc").collect(),
});