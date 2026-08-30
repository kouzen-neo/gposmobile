use crate::models::{Category, CreateItem, Item};
use sqlx::SqlitePool;
use tauri::State;
use uuid::Uuid;

fn uid() -> String {
    Uuid::new_v4().to_string()
}

fn slug(name: &str) -> String {
    name.trim()
        .to_lowercase()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join("-")
}

// --- CATEGORIES ---

#[tauri::command]
pub async fn list_categories(db: State<'_, SqlitePool>) -> Result<Vec<Category>, String> {
    sqlx::query_as::<_, Category>("SELECT id, name, kind FROM categories ORDER BY name")
        .fetch_all(&*db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_category(
    db: State<'_, SqlitePool>,
    name: String,
) -> Result<Category, String> {
    let cat = Category {
        id: slug(&name),
        name: name.trim().to_string(),
        kind: "umum".into(),
    };
    let res = sqlx::query("INSERT OR IGNORE INTO categories (id, name, kind) VALUES (?,?,?)")
        .bind(&cat.id)
        .bind(&cat.name)
        .bind(&cat.kind)
        .execute(&*db)
        .await
        .map_err(|e| e.to_string())?;

    if res.rows_affected() == 0 {
        return Err("Kategori sudah ada".into());
    }
    Ok(cat)
}

#[tauri::command]
pub async fn update_category(
    db: State<'_, SqlitePool>,
    id: String,
    name: String,
) -> Result<(), String> {
    let res = sqlx::query("UPDATE categories SET name=? WHERE id=?")
        .bind(name.trim())
        .bind(&id)
        .execute(&*db)
        .await
        .map_err(|e| e.to_string())?;

    if res.rows_affected() == 0 {
        return Err("Kategori tidak ditemukan".into());
    }
    Ok(())
}

#[tauri::command]
pub async fn delete_category(db: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    if id == "uncategorized" {
        sqlx::query("DELETE FROM items WHERE category_id='uncategorized'")
            .execute(&*db)
            .await
            .map_err(|e| e.to_string())?;
        sqlx::query("DELETE FROM categories WHERE id='uncategorized'")
            .execute(&*db)
            .await
            .map_err(|e| e.to_string())?;
        return Ok(());
    }

    sqlx::query(
        "INSERT OR IGNORE INTO categories (id, name, kind) VALUES ('uncategorized','Tanpa Kategori','umum')",
    )
    .execute(&*db)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query("UPDATE items SET category_id='uncategorized' WHERE category_id=?")
        .bind(&id)
        .execute(&*db)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM categories WHERE id=?")
        .bind(&id)
        .execute(&*db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

// --- ITEMS ---

#[tauri::command]
pub async fn list_items(db: State<'_, SqlitePool>) -> Result<Vec<Item>, String> {
    sqlx::query_as::<_, Item>(
        "SELECT id, name, price, category_id, unit, is_service, pinned FROM items ORDER BY pinned DESC, name",
    )
    .fetch_all(&*db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_item(
    db: State<'_, SqlitePool>,
    input: CreateItem,
) -> Result<Item, String> {
    let item = Item {
        id: uid(),
        name: input.name.trim().to_string(),
        price: input.price,
        category_id: input.category_id,
        unit: input.unit,
        is_service: input.is_service,
        pinned: input.pinned,
    };

    sqlx::query(
        "INSERT INTO items (id, name, price, category_id, unit, is_service, pinned) VALUES (?,?,?,?,?,?,?)",
    )
    .bind(&item.id)
    .bind(&item.name)
    .bind(item.price)
    .bind(&item.category_id)
    .bind(&item.unit)
    .bind(item.is_service)
    .bind(item.pinned)
    .execute(&*db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(item)
}

#[tauri::command]
pub async fn update_item(
    db: State<'_, SqlitePool>,
    id: String,
    input: CreateItem,
) -> Result<(), String> {
    let res = sqlx::query(
        "UPDATE items SET name=?, price=?, category_id=?, unit=?, is_service=?, pinned=? WHERE id=?",
    )
    .bind(&input.name)
    .bind(input.price)
    .bind(&input.category_id)
    .bind(&input.unit)
    .bind(input.is_service)
    .bind(input.pinned)
    .bind(&id)
    .execute(&*db)
    .await
    .map_err(|e| e.to_string())?;

    if res.rows_affected() == 0 {
        return Err("Item tidak ditemukan".into());
    }
    Ok(())
}

#[tauri::command]
pub async fn delete_item(db: State<'_, SqlitePool>, id: String) -> Result<(), String> {
    let res = sqlx::query("DELETE FROM items WHERE id=?")
        .bind(&id)
        .execute(&*db)
        .await
        .map_err(|e| e.to_string())?;

    if res.rows_affected() == 0 {
        return Err("Item tidak ditemukan".into());
    }
    Ok(())
}
