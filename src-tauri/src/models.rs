use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Item {
    pub id: String,
    pub name: String,
    pub price: i64,
    pub category_id: String,
    #[sqlx(rename = "unit")]
    pub unit: String,
    pub is_service: bool,
    pub pinned: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub kind: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct OrderLine {
    pub id: String,
    pub order_id: String,
    pub item_id: String,
    pub name: String,
    pub unit: String,
    pub qty: i64,
    pub unit_price: i64,
    pub note: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Order {
    pub id: String,
    pub total: i64,
    pub status: String,
    pub payment: String,
    pub note: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrderDetail {
    pub id: String,
    pub total: i64,
    pub status: String,
    pub payment: String,
    pub note: String,
    pub created_at: String,
    pub lines: Vec<OrderLine>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateItem {
    pub name: String,
    pub price: i64,
    pub category_id: String,
    #[serde(default = "default_unit")]
    pub unit: String,
    #[serde(default)]
    pub is_service: bool,
    #[serde(default)]
    pub pinned: bool,
}

fn default_unit() -> String {
    "pcs".to_string()
}

#[derive(Debug, Clone, Deserialize)]
#[allow(dead_code)]
pub struct CreateCategory {
    pub name: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateOrderLine {
    pub item_id: String,
    pub name: String,
    pub unit: String,
    pub qty: i64,
    pub unit_price: i64,
    #[serde(default)]
    pub note: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CreateOrderResult {
    pub id: String,
    pub total: i64,
    pub payment: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct PaymentSummary {
    pub tunai: i64,
    pub qris: i64,
    pub transfer: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct TodayStats {
    pub omzet: i64,
    pub count: i64,
    pub omzet_yesterday: i64,
    pub top_item: String,
    pub payments: PaymentSummary,
}

#[derive(Debug, Clone, Serialize)]
pub struct DailyReportItem {
    pub date: String,
    pub hari: String,
    pub omzet: i64,
    pub count: i64,
}
