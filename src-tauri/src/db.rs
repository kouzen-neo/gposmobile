use sqlx::sqlite::SqlitePool;

const SEED: &str = r#"
INSERT OR IGNORE INTO categories (id, name, kind) VALUES
  ('minuman','Minuman','umum'),
  ('makanan','Makanan','umum'),
  ('snack','Snack','umum'),
  ('perlengkapan','Perlengkapan','umum');

INSERT OR IGNORE INTO items (id, name, price, category_id, unit, is_service, pinned) VALUES
  ('kpi','Kopi Susu',18000,'minuman','pcs',0,1),
  ('teh','Teh Manis',8000,'minuman','pcs',0,1),
  ('esp','Es Presso',15000,'minuman','pcs',0,0),
  ('air','Air Mineral',4000,'minuman','pcs',0,1),
  ('jus','Jus Buah',12000,'minuman','pcs',0,0),
  ('roti','Roti Bakar',15000,'makanan','pcs',0,1),
  ('nasi','Nasi Goreng',22000,'makanan','pcs',0,1),
  ('mie','Mie Goreng',18000,'makanan','pcs',0,0),
  ('kue','Kue Harian',12000,'makanan','pcs',0,0),
  ('gorengan','Gorengan',5000,'snack','pcs',0,1),
  ('biskuit','Biskuit',8000,'snack','pcs',0,0),
  ('sabun','Sabun Cuci',6000,'perlengkapan','pcs',0,0);

INSERT OR IGNORE INTO orders (id, total, status, created_at) VALUES
  ('o-1', 96000, 'paid', datetime('now','-6 days','+09 hours')),
  ('o-2', 72000, 'paid', datetime('now','-6 days','+13 hours')),
  ('o-3', 54000, 'paid', datetime('now','-5 days','+10 hours')),
  ('o-4', 88000, 'paid', datetime('now','-5 days','+15 hours')),
  ('o-5', 61000, 'paid', datetime('now','-4 days','+09 hours')),
  ('o-6', 103000, 'paid', datetime('now','-4 days','+14 hours')),
  ('o-7', 47000, 'paid', datetime('now','-3 days','+11 hours')),
  ('o-8', 92000, 'paid', datetime('now','-3 days','+16 hours')),
  ('o-9', 68000, 'paid', datetime('now','-2 days','+10 hours')),
  ('o-10', 115000, 'paid', datetime('now','-2 days','+13 hours')),
  ('o-11', 53000, 'paid', datetime('now','-1 days','+09 hours')),
  ('o-12', 99000, 'paid', datetime('now','-1 days','+15 hours')),
  ('o-13', 76000, 'paid', datetime('now','+10 hours')),
  ('o-14', 84000, 'paid', datetime('now','+14 hours'));

INSERT OR IGNORE INTO order_lines (id, order_id, item_id, name, unit, qty, unit_price, note) VALUES
  ('ol-1','o-1','kpi','Kopi Susu','pcs',3,18000,''),
  ('ol-2','o-1','roti','Roti Bakar','pcs',2,15000,''),
  ('ol-3','o-2','teh','Teh Manis','pcs',4,8000,''),
  ('ol-4','o-2','nasi','Nasi Goreng','pcs',4,22000,''),
  ('ol-5','o-3','air','Air Mineral','pcs',6,4000,''),
  ('ol-6','o-3','kue','Kue Harian','pcs',3,12000,''),
  ('ol-7','o-4','esp','Es Presso','pcs',2,15000,''),
  ('ol-8','o-4','mie','Mie Goreng','pcs',4,18000,''),
  ('ol-9','o-5','jus','Jus Buah','pcs',3,12000,''),
  ('ol-10','o-5','gorengan','Gorengan','pcs',5,5000,''),
  ('ol-11','o-6','kpi','Kopi Susu','pcs',4,18000,''),
  ('ol-12','o-6','nasi','Nasi Goreng','pcs',1,22000,''),
  ('ol-13','o-6','roti','Roti Bakar','pcs',2,15000,''),
  ('ol-14','o-7','teh','Teh Manis','pcs',3,8000,''),
  ('ol-15','o-7','mie','Mie Goreng','pcs',3,18000,''),
  ('ol-16','o-8','kpi','Kopi Susu','pcs',3,18000,''),
  ('ol-17','o-8','nasi','Nasi Goreng','pcs',2,22000,''),
  ('ol-18','o-8','gorengan','Gorengan','pcs',4,5000,''),
  ('ol-19','o-9','air','Air Mineral','pcs',8,4000,''),
  ('ol-20','o-9','kue','Kue Harian','pcs',2,12000,''),
  ('ol-21','o-10','esp','Es Presso','pcs',3,15000,''),
  ('ol-22','o-10','roti','Roti Bakar','pcs',3,15000,''),
  ('ol-23','o-10','nasi','Nasi Goreng','pcs',1,22000,''),
  ('ol-24','o-11','teh','Teh Manis','pcs',5,8000,''),
  ('ol-25','o-11','jus','Jus Buah','pcs',1,12000,''),
  ('ol-26','o-12','kpi','Kopi Susu','pcs',3,18000,''),
  ('ol-27','o-12','mie','Mie Goreng','pcs',2,18000,''),
  ('ol-28','o-12','gorengan','Gorengan','pcs',3,5000,''),
  ('ol-29','o-13','roti','Roti Bakar','pcs',2,15000,''),
  ('ol-30','o-13','teh','Teh Manis','pcs',4,8000,''),
  ('ol-31','o-14','nasi','Nasi Goreng','pcs',2,22000,''),
  ('ol-32','o-14','kpi','Kopi Susu','pcs',2,18000,'');
"#;

pub async fn init(path: &str) -> SqlitePool {
    let url = if path.contains("mode=") {
        format!("sqlite://{}", path)
    } else {
        format!("sqlite://{}?mode=rwc", path)
    };

    let pool = SqlitePool::connect(&url)
        .await
        .expect("failed to connect to sqlite");

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            kind TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            category_id TEXT NOT NULL,
            unit TEXT NOT NULL DEFAULT 'pcs',
            is_service INTEGER NOT NULL DEFAULT 0,
            pinned INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            total INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'paid',
            payment TEXT NOT NULL DEFAULT 'tunai',
            note TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS order_lines (
            id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            item_id TEXT NOT NULL,
            name TEXT NOT NULL,
            unit TEXT NOT NULL,
            qty INTEGER NOT NULL,
            unit_price INTEGER NOT NULL,
            note TEXT NOT NULL DEFAULT '',
            FOREIGN KEY (order_id) REFERENCES orders(id)
        );
        "#,
    )
    .execute(&pool)
    .await
    .expect("failed to create tables");

    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM items")
        .fetch_one(&pool)
        .await
        .unwrap_or(0);

    if count == 0 {
        for stmt in SEED.split(';') {
            let s = stmt.trim();
            if !s.is_empty() {
                let _ = sqlx::query(s).execute(&pool).await;
            }
        }
    }

    pool
}
