use crate::models::{
    CreateOrderLine, CreateOrderResult, Item, Order, OrderDetail, OrderLine, PaymentSummary,
    TodayStats,
};
use sqlx::{Row, SqlitePool};
use tauri::State;
use uuid::Uuid;

fn uid() -> String {
    Uuid::new_v4().to_string()
}

#[tauri::command]
pub async fn create_order(
    db: State<'_, SqlitePool>,
    lines: Vec<CreateOrderLine>,
    payment: String,
    note: String,
) -> Result<CreateOrderResult, String> {
    if lines.is_empty() {
        return Err("Baris pesanan tidak boleh kosong".into());
    }

    let mut total: i64 = 0;
    let mut validated_lines = Vec::with_capacity(lines.len());

    let mut tx = db.begin().await.map_err(|e| e.to_string())?;

    for line in &lines {
        if line.qty <= 0 {
            return Err("Kuantitas barang harus lebih dari 0".into());
        }

        let db_item = sqlx::query_as::<_, Item>(
            "SELECT id, name, price, category_id, unit, is_service, pinned FROM items WHERE id = ?",
        )
        .bind(&line.item_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;

        let (unit_price, item_name, unit) = match db_item {
            Some(it) => (it.price, it.name, it.unit),
            None => {
                if line.unit_price < 0 {
                    return Err("Harga satuan tidak boleh negatif".into());
                }
                (line.unit_price, line.name.clone(), line.unit.clone())
            }
        };

        total += line.qty * unit_price;
        validated_lines.push((
            line.item_id.clone(),
            item_name,
            unit,
            line.qty,
            unit_price,
            line.note.clone(),
        ));
    }

    let order_id = uid();
    let now = chrono::Local::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO orders (id, total, status, payment, note, created_at) VALUES (?,?,?,?,?,?)",
    )
    .bind(&order_id)
    .bind(total)
    .bind("paid")
    .bind(&payment)
    .bind(&note)
    .bind(&now)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    for (item_id, name, unit, qty, unit_price, line_note) in validated_lines {
        sqlx::query(
            "INSERT INTO order_lines (id, order_id, item_id, name, unit, qty, unit_price, note) VALUES (?,?,?,?,?,?,?,?)",
        )
        .bind(uid())
        .bind(&order_id)
        .bind(&item_id)
        .bind(&name)
        .bind(&unit)
        .bind(qty)
        .bind(unit_price)
        .bind(&line_note)
        .execute(&mut *tx)
        .await
        .map_err(|e| e.to_string())?;
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(CreateOrderResult {
        id: order_id,
        total,
        payment,
    })
}

#[tauri::command]
pub async fn list_orders(db: State<'_, SqlitePool>) -> Result<Vec<Order>, String> {
    sqlx::query_as::<_, Order>(
        "SELECT id, total, status, payment, note, created_at FROM orders ORDER BY created_at DESC",
    )
    .fetch_all(&*db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_order(db: State<'_, SqlitePool>, id: String) -> Result<OrderDetail, String> {
    let order = sqlx::query_as::<_, Order>(
        "SELECT id, total, status, payment, note, created_at FROM orders WHERE id = ?",
    )
    .bind(&id)
    .fetch_optional(&*db)
    .await
    .map_err(|e| e.to_string())?
    .ok_or_else(|| "Order tidak ditemukan".to_string())?;

    let lines = sqlx::query_as::<_, OrderLine>(
        "SELECT id, order_id, item_id, name, unit, qty, unit_price, note FROM order_lines WHERE order_id = ?",
    )
    .bind(&id)
    .fetch_all(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(OrderDetail {
        id: order.id,
        total: order.total,
        status: order.status,
        payment: order.payment,
        note: order.note,
        created_at: order.created_at,
        lines,
    })
}

#[tauri::command]
pub async fn orders_today(db: State<'_, SqlitePool>) -> Result<TodayStats, String> {
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let yesterday = (chrono::Local::now() - chrono::Duration::days(1))
        .format("%Y-%m-%d")
        .to_string();

    let rows = sqlx::query(
        "SELECT substr(created_at,1,10) AS day, SUM(total) AS omzet, COUNT(*) AS cnt \
         FROM orders WHERE substr(created_at,1,10) IN (?,?) \
         GROUP BY day",
    )
    .bind(&today)
    .bind(&yesterday)
    .fetch_all(&*db)
    .await
    .map_err(|e| e.to_string())?;

    let mut omzet: i64 = 0;
    let mut count: i64 = 0;
    let mut omzet_yesterday: i64 = 0;
    for r in &rows {
        let day: String = r.get("day");
        if day == today {
            omzet = r.get("omzet");
            count = r.get("cnt");
        } else {
            omzet_yesterday = r.get("omzet");
        }
    }

    let top: Option<String> = sqlx::query(
        "SELECT ol.name AS name, SUM(ol.qty) AS q \
         FROM order_lines ol \
         JOIN orders o ON o.id = ol.order_id \
         WHERE substr(o.created_at,1,10) = ? \
         GROUP BY ol.name ORDER BY q DESC LIMIT 1",
    )
    .bind(&today)
    .fetch_optional(&*db)
    .await
    .map_err(|e| e.to_string())?
    .map(|r| r.get::<String, _>("name"));

    let pay_rows = sqlx::query(
        "SELECT payment, SUM(total) AS sum \
         FROM orders WHERE substr(created_at,1,10) = ? \
         GROUP BY payment",
    )
    .bind(&today)
    .fetch_all(&*db)
    .await
    .map_err(|e| e.to_string())?;

    let mut tunai: i64 = 0;
    let mut qris: i64 = 0;
    let mut transfer: i64 = 0;

    for r in &pay_rows {
        let p: String = r.get("payment");
        let s: i64 = r.get("sum");
        match p.to_lowercase().as_str() {
            "tunai" => tunai = s,
            "qris" => qris = s,
            "transfer" => transfer = s,
            _ => {}
        }
    }

    Ok(TodayStats {
        omzet,
        count,
        omzet_yesterday,
        top_item: top.unwrap_or_else(|| "-".into()),
        payments: PaymentSummary {
            tunai,
            qris,
            transfer,
        },
    })
}
