use crate::models::DailyReportItem;
use chrono::Datelike;
use sqlx::{Row, SqlitePool};
use tauri::State;

#[tauri::command]
pub async fn daily_report(db: State<'_, SqlitePool>) -> Result<Vec<DailyReportItem>, String> {
    let rows = sqlx::query(
        "SELECT substr(created_at,1,10) AS day, SUM(total) AS total, COUNT(*) AS cnt \
         FROM orders WHERE created_at >= datetime('now','-6 days') \
         GROUP BY day ORDER BY day ASC",
    )
    .fetch_all(&*db)
    .await
    .map_err(|e| e.to_string())?;

    let hari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    let out: Vec<DailyReportItem> = rows
        .into_iter()
        .map(|r| {
            let day: String = r.get("day");
            let total: i64 = r.get("total");
            let cnt: i64 = r.get("cnt");
            let parsed =
                chrono::NaiveDate::parse_from_str(&day, "%Y-%m-%d").unwrap_or_default();
            let wd = hari[parsed.weekday().num_days_from_sunday() as usize];
            DailyReportItem {
                date: day,
                hari: wd.to_string(),
                omzet: total,
                count: cnt,
            }
        })
        .collect();

    Ok(out)
}

#[tauri::command]
pub async fn reset_all_data(db: State<'_, SqlitePool>) -> Result<(), String> {
    let mut tx = db.begin().await.map_err(|e| e.to_string())?;
    sqlx::query("DELETE FROM order_lines").execute(&mut *tx).await.map_err(|e| e.to_string())?;
    sqlx::query("DELETE FROM orders").execute(&mut *tx).await.map_err(|e| e.to_string())?;
    sqlx::query("DELETE FROM items").execute(&mut *tx).await.map_err(|e| e.to_string())?;
    sqlx::query("DELETE FROM categories").execute(&mut *tx).await.map_err(|e| e.to_string())?;
    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}
