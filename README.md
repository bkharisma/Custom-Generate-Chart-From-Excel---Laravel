# GraphGen

Aplikasi web untuk mengupload file Excel, mem-parse datanya, dan menghasilkan grafik interaktif dari data spreadsheet. Mendukung kustomisasi grafik dan ekspor ke JPG/PDF.

## Fitur

- **Upload Excel** — Upload file `.xlsx` / `.xls`, auto-detect sheet, kolom, dan tipe data
- **Preview Sheet** — Tampilkan data spreadsheet dengan pagination dan pencarian
- **Generate Grafik** — 7 tipe grafik: Bar, Line, Pie, Scatter, Area, Radar
- **Kustomisasi** — Ubah warna, label, judul, dan legend grafik
- **Ekspor** — Download grafik sebagai JPG atau PDF
- **Manajemen Proyek** — Kelompokkan spreadsheet ke dalam proyek
- **Role-Based Access** — Admin dapat mengelola semua user; user hanya melihat data miliknya
- **Dark Mode** — Toggle dark/light mode dengan menyimpan preferensi pengguna

## Tech Stack

| Layer      | Teknologi                           |
|------------|-------------------------------------|
| Backend    | Laravel 13, PHP 8.3+                |
| Frontend   | React 18, TypeScript, Inertia.js 2  |
| CSS        | Tailwind CSS 4                      |
| Database   | SQLite (default) / MySQL / PostgreSQL |
| Grafik     | Apache ECharts 6 + echarts-for-react |
| Excel      | PhpSpreadsheet 5                    |
| Ekspor     | jsPDF + html2canvas                 |
| Auth       | Laravel Breeze (Inertia + React)    |
| Testing    | PHPUnit 12                          |

## Prasyarat

- PHP 8.3+
- Composer
- Node.js 18+
- npm
- SQLite (default) atau MySQL/PostgreSQL

## Instalasi

```bash
# Clone repository
git clone <repo-url>
cd generate-graph

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Jalankan migrasi & seeder
php artisan migrate
php artisan db:seed
```

Akun default yang dibuat oleh seeder:
- **Admin:** `admin@example.com` (role: admin)
- **User:** `test@example.com` (role: user)

## Menjalankan Aplikasi

```bash
# Development
composer run dev     # menjalankan server, queue, log, dan vite bersamaan

# Atau jalankan terpisah:
php artisan serve    # Laravel development server
npm run dev          # Vite dev server dengan HMR

# Production build
npm run build
```

## Testing

```bash
php artisan test     # 58 test (28 custom + 30 Breeze)
```

## Routes

### Publik
| Method | URI | Deskripsi |
|--------|-----|-----------|
| GET | `/` | Landing page |

### Authenticated
| Method | URI | Deskripsi |
|--------|-----|-----------|
| GET | `/dashboard` | Dashboard user |
| GET/POST | `/projects` | List / Buat proyek |
| GET/PUT/DELETE | `/projects/{id}` | Detail / Edit / Hapus proyek |
| POST | `/projects/{id}/upload` | Upload file Excel |
| GET | `/sheets/{id}` | Preview sheet data |
| GET | `/sheets/{id}/columns` | API: daftar kolom |
| GET | `/sheets/{id}/columns/{col}/values` | API: nilai unik kolom |
| GET/POST | `/charts` | List / Buat grafik |
| GET/PUT/DELETE | `/charts/{id}` | Lihat / Edit / Hapus grafik |

### Admin Only
| Method | URI | Deskripsi |
|--------|-----|-----------|
| GET | `/admin/users` | List semua user |
| POST | `/admin/users` | Buat user baru |
| DELETE | `/admin/users/{id}` | Hapus user |

## License

MIT License.
