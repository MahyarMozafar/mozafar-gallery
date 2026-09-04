-- ساختار پایگاه داده گالری مظفر
-- الان SQLite است. برای PostgreSQL فقط همین فایل عوض می‌شود، بقیه کد دست نمی‌خورد.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  slug     TEXT NOT NULL UNIQUE,
  name_fa  TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'WOMEN',  -- WOMEN | MEN | KIDS | ALL
  sort     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL UNIQUE,
  sku             TEXT NOT NULL UNIQUE,
  name_fa         TEXT NOT NULL,
  type            TEXT NOT NULL,            -- JEWELRY | COIN | BAR | SILVER
  category_id     INTEGER REFERENCES categories(id),
  audience        TEXT NOT NULL DEFAULT 'WOMEN',
  karat           INTEGER,                  -- ۱۸ / ۲۱ / ۲۴
  weight_grams    REAL,                     -- وزن به گرم
  size_label      TEXT,                     -- سایز انگشتر / طول زنجیر
  color           TEXT,                     -- YELLOW | WHITE | ROSE
  stone           TEXT,                     -- نگین، اگر دارد
  ojrat_percent   REAL,                     -- اجرت این قطعه
  profit_percent  REAL,                     -- سود این قطعه
  fixed_price     INTEGER,                  -- برای نقره: قیمت ثابت تومان
  coin_market     INTEGER,                  -- برای سکه: نرخ بازار تومان
  brand           TEXT,
  description_fa  TEXT,
  stock           INTEGER NOT NULL DEFAULT 1,
  featured        INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_cat    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- عکس‌ها جدا نگه داشته می‌شوند تا مدیر بتواند بدون دست زدن به کد عوضشان کند
CREATE TABLE IF NOT EXISTS product_images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt_fa     TEXT,
  sort       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);

CREATE TABLE IF NOT EXISTS gold_price_snapshots (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  gram18         INTEGER NOT NULL,
  change_percent REAL NOT NULL DEFAULT 0,
  source         TEXT NOT NULL,
  fetched_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  phone      TEXT NOT NULL UNIQUE,
  name       TEXT,
  role       TEXT NOT NULL DEFAULT 'CUSTOMER',  -- CUSTOMER | ADMIN
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- کدهای ورود پیامکی. کد خام ذخیره نمی‌شود، فقط هش آن.
CREATE TABLE IF NOT EXISTS otp_codes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  phone       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  expires_at  TEXT NOT NULL,
  consumed_at TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);

-- نشست‌های ورود. توکن هم هش می‌شود تا اگر پایگاه داده لو رفت، کسی نتواند وارد شود.
CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS carts (
  id         TEXT PRIMARY KEY,            -- شناسه نشست مهمان یا کاربر
  user_id    INTEGER REFERENCES users(id),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cart_items (
  cart_id    TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  code                TEXT NOT NULL UNIQUE,
  user_id             INTEGER REFERENCES users(id),
  status              TEXT NOT NULL DEFAULT 'AWAITING_PAYMENT',
  gram18_used         INTEGER NOT NULL,
  subtotal            INTEGER NOT NULL,
  vat_total           INTEGER NOT NULL,
  shipping            INTEGER NOT NULL DEFAULT 0,
  total               INTEGER NOT NULL,
  delivery_method     TEXT NOT NULL DEFAULT 'PICKUP',
  address             TEXT,
  tracking_code       TEXT,
  priced_at           TEXT NOT NULL DEFAULT (datetime('now')),
  payment_deadline_at TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- قیمت‌ها اینجا «منجمد» می‌شوند. بعد از ثبت سفارش هرگز عوض نمی‌شوند،
-- حتی اگر نرخ طلا بالا و پایین برود. فاکتور ماه‌ها بعد هم همین را نشان می‌دهد.
CREATE TABLE IF NOT EXISTS order_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INTEGER REFERENCES products(id),
  name_fa      TEXT NOT NULL,
  weight_grams REAL,
  karat        INTEGER,
  gram_rate    INTEGER NOT NULL,
  gold_value   INTEGER NOT NULL,
  ojrat        INTEGER NOT NULL,
  profit       INTEGER NOT NULL,
  vat          INTEGER NOT NULL,
  line_total   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_reservations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  order_id   INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reservations_exp ON stock_reservations(expires_at);

CREATE TABLE IF NOT EXISTS payment_receipts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_path  TEXT NOT NULL,     -- بیرون از پوشه public — فقط با احراز هویت دیده می‌شود
  amount     INTEGER,
  ref_number TEXT,
  status     TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING | APPROVED | REJECTED
  note       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS wishlist (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  title_fa     TEXT NOT NULL,
  excerpt_fa   TEXT,
  body_fa      TEXT NOT NULL,
  cover_url    TEXT,
  published_at TEXT
);
