import { invoke } from "@tauri-apps/api/core";

export interface ItemDTO {
  id: string;
  name: string;
  price: number;
  category_id: string;
  unit: "pcs" | "kg" | "service";
  is_service: boolean;
  pinned: boolean;
}

export interface CategoryDTO {
  id: string;
  name: string;
  kind: string;
}

export interface OrderLineDTO {
  item_id: string;
  name: string;
  unit: string;
  qty: number;
  unit_price: number;
  note?: string;
}

export interface OrderDTO {
  id: string;
  total: number;
  status: string;
  payment: string;
  note: string;
  created_at: string;
}

export interface OrderDetailDTO extends OrderDTO {
  lines: {
    id: string;
    item_id: string;
    name: string;
    unit: string;
    qty: number;
    unit_price: number;
    note: string;
  }[];
}

export interface TodayStats {
  omzet: number;
  count: number;
  omzet_yesterday: number;
  top_item: string;
  payments?: { tunai: number; qris: number; transfer: number };
}

export interface DailyReportItem {
  date: string;
  hari: string;
  omzet: number;
  count: number;
}

export const api = {
  listItems: () => invoke<ItemDTO[]>("list_items"),
  createItem: (b: Omit<ItemDTO, "id">) =>
    invoke<ItemDTO>("create_item", { input: b }),
  updateItem: (id: string, b: Omit<ItemDTO, "id">) =>
    invoke<void>("update_item", { id, input: b }),
  deleteItem: (id: string) => invoke<void>("delete_item", { id }),
  listCategories: () => invoke<CategoryDTO[]>("list_categories"),
  createCategory: (name: string) =>
    invoke<CategoryDTO>("create_category", { name }),
  updateCategory: (id: string, name: string) =>
    invoke<void>("update_category", { id, name }),
  deleteCategory: (id: string) => invoke<void>("delete_category", { id }),
  createOrder: (lines: OrderLineDTO[], payment?: string, note?: string) =>
    invoke<{ id: string; total: number; payment: string }>("create_order", {
      lines,
      payment: payment ?? "tunai",
      note: note ?? "",
    }),
  listOrders: () => invoke<OrderDTO[]>("list_orders"),
  getOrder: (id: string) => invoke<OrderDetailDTO>("get_order", { id }),
  ordersToday: () => invoke<TodayStats>("orders_today"),
  dailyReport: () => invoke<DailyReportItem[]>("daily_report"),
  resetAllData: () => invoke<void>("reset_all_data"),
};
