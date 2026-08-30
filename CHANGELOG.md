# Changelog

All notable changes to gPOS Mobile are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.1.0] - 2026-08-30

### Added

- **Offline-First SQLite Native Engine**:
  - Embedded SQLx + SQLite database (`gpos.db`) directly on Android via Tauri v2.
  - Complete schema migrations and auto-seeding for items, categories, and sample orders.
  - Sub-millisecond local query performance for offline order creation and reporting.
- **Kasir & Point of Sale (POS)**:
  - Fast product catalog browsing with instant search and category filter tabs.
  - Dynamic interactive cart with item note support, unit customization, and quick item quantity increment/decrement.
  - Quick-cash shortcut buttons (Uang Pas, Rp 20rb, Rp 50rb, Rp 100rb) with real-time change calculation.
  - Payment method support: Tunai, QRIS, and Transfer Bank.
  - Mobile sticky floating cart bar for streamlined touch interaction.
- **Thermal Receipt Printing (Android Native PrintManager)**:
  - Dedicated 58mm / 80mm thermal receipt layout with store header, itemized breakdown, and footer.
  - Custom Android JavaScript Bridge connecting WebView directly to `android.print.PrintManager`.
  - Seamless support for Bluetooth thermal printers, Wi-Fi network printers, and Save to PDF.
- **Katalog Produk & Kategori**:
  - Full CRUD for products and categories (product / service items).
  - Pinned items toggle for prioritizing best-seller products on cashier screen.
  - Interactive multi-column table sorting and search.
- **Dashboard & Analitik Penjualan**:
  - Financial summary metrics: Today's Revenue, Total Orders, Best Selling Item, and Shift status.
  - Revenue breakdown by payment method (Tunai, QRIS, Transfer).
  - 7-day daily revenue trend interactive bar chart via Recharts.
  - Interactive order detail modal on transaction row tap.
- **Laporan & CSV Export**:
  - Filterable transaction history by date range and payment method.
  - Financial performance indicators: Total Revenue, Total Count, and Average Order Value (AOV).
  - Native CSV Report Export with automatic Android FileProvider and Share Sheet integration (WhatsApp, Email, Drive).
  - Subtle Reset Database action at bottom right with safety confirmation dialog.
- **Cashier Shift Management**:
  - Cash drawer float initial balance entry.
  - Shift closing summary and cash balance tracking.
- **Offline Sync Queue**:
  - Client-side offline queue that persists transactions during network disconnection and syncs seamlessly when back online.
- **High-Resolution Android Launcher & Typography**:
  - Bundled local offline Space Grotesk (display & numbers) and Public Sans (body text) fonts.
  - Custom adaptive launcher icons across all Android screen densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi).

### Changed

- **Android Window Insets & System Status Bar**:
  - Configured non-immersive status bar with light status bar background (`#f7f4ee`) and dark contrast icons.
  - Added dynamic top margin (`pt-10`) and bottom scroll clearance (`pb-24`) to eliminate overlap with Android status bar, camera notch, and gesture navigation bar.
- **Seamless Bottom Navigation Bar**:
  - Polished mobile bottom navigation bar (`h-16 pb-2.5`) with unified brand green (`#2f6b4f`) background and sharp active tab typography.

### Fixed

- **Status Bar Clipping**: resolved issue where screen title headers collided with Android status bar clocks and notch icons.
- **Thermal Print Execution**: fixed `window.print()` no-op inside Android WebView by introducing native Kotlin print adapter.
