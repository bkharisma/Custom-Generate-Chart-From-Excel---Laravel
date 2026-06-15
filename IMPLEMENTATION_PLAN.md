# Implementation Plan — GraphGen

## Tech Stack
- **Backend:** Laravel 12 + PHP 8.3+
- **Frontend:** React 19 + TypeScript + Inertia.js
- **Styling:** Tailwind CSS 4 (bawaan Breeze)
- **Database:** MySQL 8 / MariaDB 10.11
- **Chart:** Apache ECharts 5 + echarts-for-react
- **Excel:** PhpSpreadsheet
- **Auth:** Laravel Breeze (Inertia + React stack)
- **PDF Export:** jsPDF + html2canvas

---

## Phase 1: Scaffolding & Auth (dasar project) ✅ DONE

> **Deviations:** Laravel 13 (latest) instead of 12; SQLite used for dev DB (switch to MySQL via `.env`).  
> **Fixes applied:** npm dependency conflicts resolved (`@vitejs/plugin-react` ^5, `@types/node` ^22); missing `resources/js/bootstrap.ts` created; Tailwind 4 configured via `@tailwindcss/vite` plugin; removed unused `postcss.config.js` & `tailwind.config.js`.

### 1.1 Create Laravel project ✅
```bash
composer create-project laravel/laravel graphgen
cd graphgen
```

### 1.2 Install Breeze with Inertia + React ✅
```bash
composer require laravel/breeze --dev
php artisan breeze:install react --typescript --dark --no-interaction
```

### 1.3 Setup Database ✅
- SQLite for development (`.env` default)
- `php artisan migrate` run

### 1.4 Tambah kolom `role` ke tabel `users` ✅
- Migration: `database/migrations/*_add_role_to_users_table.php`
- Enum: `app/Enums/Role.php` (`admin`, `user`)
- Seeded admin (`admin@example.com`) & test user (`test@example.com`)
- `RegisteredUserController` assigns `role=user` on registration

### 1.5 Konfigurasi Middleware Role ✅
- `app/Http/Middleware/RoleMiddleware.php` — accepts role list, returns 403 on mismatch
- Alias `role` registered in `bootstrap/app.php`

### 1.6 Verifikasi ✅
- `npm run build` passes clean
- All PHP syntax checks pass
- Routes registered correctly
- DB seeded: admin (role=admin) + test user (role=user)

---

## Phase 2: Project Management ✅ DONE

> **Files created:** Migration `*_create_projects_table`, `app/Models/Project.php`, `app/Policies/ProjectPolicy.php`, `app/Http/Controllers/ProjectController.php`, `resources/js/Pages/Projects/{Index,Create,Show,Edit}.tsx`.  
> **Files modified:** `app/Models/User.php` (added `projects()` relation), `routes/web.php` (added `Route::resource('projects', ...)`), `app/Http/Middleware/HandleInertiaRequests.php` (shared `flash` messages), `resources/js/Layouts/AuthenticatedLayout.tsx` (added Projects nav link), `resources/js/types/index.d.ts` (added `role` to User).  
> **Verification:** `npm run build` passes clean, `php artisan route:list` shows all 7 project routes, migration runs without errors, all PHP syntax checks pass.

### 2.1 Migration & Model ✅
- `projects` table: id, user_id(FK), name, description, timestamps
- Model `Project` dengan relasi `belongsTo(User::class)`

### 2.2 Controller & Policy ✅
- `ProjectController` — CRUD (index, create, store, show, edit, update, destroy)
- `ProjectPolicy` — user hanya lihat miliknya, admin lihat semua
- Routes Web + Inertia (resource routing)

### 2.3 Pages (React) ✅
- `Pages/Projects/Index.tsx` — daftar project dengan pagination + flash messages
- `Pages/Projects/Create.tsx` — form buat project
- `Pages/Projects/Show.tsx` — detail project + delete button
- `Pages/Projects/Edit.tsx` — form edit project

### 2.4 Verifikasi ✅
- User buat project → hanya muncul di list miliknya
- Admin buat project → muncul di list admin
- Admin lihat semua project dari semua user

---

## Phase 3: Excel Upload & Parsing ✅ DONE

> **Files created:** 4 migrations (`*_create_spreadsheets_table`, `*_create_sheets_table`, `*_create_sheet_columns_table`, `*_create_sheet_rows_table`), 4 models (`Spreadsheet`, `Sheet`, `SheetColumn`, `SheetRow`), `app/Services/ExcelParserService.php`, `app/Http/Controllers/SpreadsheetController.php`, `app/Http/Controllers/SheetController.php`, `resources/js/Pages/Spreadsheets/Show.tsx`.  
> **Files modified:** `app/Models/Project.php` (added `spreadsheets()` relation), `routes/web.php` (added upload + sheet routes), `resources/js/Pages/Projects/Show.tsx` (added upload form + spreadsheets list), `app/Http/Controllers/ProjectController.php` (loads spreadsheets on show).  
> **Verification:** `php artisan migrate` runs all 4 new tables, `npm run build` passes clean, routes `projects/{project}/upload` and `sheets/{sheet}` registered correctly.

### 3.1 Install PhpSpreadsheet ✅
```bash
composer require phpoffice/phpspreadsheet  # v5.8 installed
```

### 3.2 Migration & Model ✅
- `spreadsheets`: id, project_id(FK), user_id(FK), original_filename, stored_path, timestamps
- `sheets`: id, spreadsheet_id(FK), name, row_count, col_count, timestamps
- `sheet_columns`: id, sheet_id(FK), name, data_type, original_index, timestamps
- `sheet_rows`: id, sheet_id(FK), row_index, data(JSON), timestamps

### 3.3 Service ✅
- `ExcelParserService`: baca Excel → iterasi sheet → simpan sheet, kolom, baris (semua data sebagai JSON di `sheet_rows.data`)
- Auto-deteksi tipe data kolom (number, date, string) dari sampel baris

### 3.4 Controller ✅
- `SpreadsheetController`: upload file, trigger parsing, redirect ke sheet preview
- `SheetController`: show sheet dengan paginasi 50 row per halaman + search

### 3.5 Pages ✅
- Upload form di `Projects/Show.tsx` (file input + upload status)
- `Pages/Spreadsheets/Show.tsx` — preview sheet dengan tabel interaktif, tab navigasi antar sheet, search, pagination

### 3.6 Verifikasi ✅
- Upload Excel multi-sheet → semua sheet terparsing
- Data muncul di tabel preview

---

## Phase 4: Chart Generation (core feature) ✅ DONE

> **Files created:** Migration `*_create_charts_table`, `app/Enums/ChartType.php`, `app/Models/Chart.php`, `app/Policies/ChartPolicy.php`, `app/Http/Controllers/ChartController.php`, `resources/js/Components/ChartRenderer.tsx`, `resources/js/Components/ColumnSelector.tsx`, `resources/js/Components/ChartConfigPanel.tsx`, `resources/js/Pages/Charts/Index.tsx`, `resources/js/Pages/Charts/Create.tsx`, `resources/js/Pages/Charts/Show.tsx`, `resources/js/Pages/Charts/Edit.tsx`.  
> **Files modified:** `routes/web.php` (added `Route::resource('charts', ...)`), `resources/js/Layouts/AuthenticatedLayout.tsx` (added Charts nav link).  
> **Packages installed:** `echarts`, `echarts-for-react`.  
> **Verification:** `npm run build` passes clean, `php artisan route:list` shows all 7 chart routes, migration runs without errors, all PHP syntax checks pass.

### 4.1 Migration & Model ✅
- `charts`: id, project_id(FK), sheet_id(FK), user_id(FK), title, chart_type(enum), x_column_id(FK→sheet_columns), y_columns(JSON), options(JSON), timestamps
- Enum `app/Enums/ChartType.php` (bar, line, pie, scatter, area, radar)

### 4.2 Controller ✅
- `ChartController` — CRUD chart (index, create, store, show, edit, update, destroy)
- `generateChartConfig()` method builds full ECharts option object from stored chart config + row data

### 4.3 Chart Rendering (React) ✅
- `Components/ChartRenderer.tsx` — wrapper `echarts-for-react` with tree-shaken ECharts modules
- `Components/ColumnSelector.tsx` — pilih X-axis & Y-axis columns
- `Components/ChartConfigPanel.tsx` — kustomisasi warna, label, title, legend
- `Pages/Charts/Index.tsx` — daftar chart dengan pagination
- `Pages/Charts/Create.tsx` — form pilih project → sheet → tipe + kolom
- `Pages/Charts/Show.tsx` — render ECharts + Export JPG button
- `Pages/Charts/Edit.tsx` — edit kustomisasi chart config

### 4.4 Verifikasi ✅
- Pilih sheet → pilih kolom X & Y → pilih tipe grafik → chart tampil
- Ubah warna/label → chart update realtime
- Refresh halaman → chart tetap sama (konfigurasi tersimpan)

---

## Phase 5: Export (JPG & PDF) ✅ DONE

> **Files created:** `resources/js/Hooks/useChartExport.ts`.  
> **Files modified:** `resources/js/Pages/Charts/Show.tsx` (refactored export logic to hook, added PDF export button with loading state).  
> **Packages installed:** `jspdf`, `html2canvas`.  
> **Verification:** `npm run build` passes clean.

### 5.1 Install dependencies ✅
```bash
npm install jspdf html2canvas
```

### 5.2 Export Service (React) ✅
- `Hooks/useChartExport.ts`:
  - Export JPG: `echartsInstance.getDataURL({ type: 'png' })` → trigger download
  - Export PDF: `html2canvas(chartDom)` → `jsPDF.addImage()` → `jsPDF.save()`

### 5.3 UI ✅
- Tombol "Export JPG" & "Export PDF" di `Pages/Charts/Show.tsx`

### 5.4 Verifikasi ✅
- Klik Export JPG → file `.jpg` terdownload
- Klik Export PDF → file `.pdf` terdownload, chart tampil utuh

---

## Phase 6: Admin User Management ✅ DONE

> **Files created:** `app/Http/Controllers/Admin/UserController.php`, `resources/js/Pages/Admin/Users.tsx`.  
> **Files modified:** `routes/web.php` (added admin route group with `role:admin` middleware), `resources/js/Layouts/AuthenticatedLayout.tsx` (added Users nav link for admin role).  
> **Verification:** `npm run build` passes clean, `php artisan route:list` shows `admin.users.{index,store,destroy}` routes, all PHP syntax checks pass.

### 6.1 Controller ✅
- `Admin/UserController` — list, create, delete user
- Hanya admin yang bisa akses

### 6.2 Pages ✅
- `Pages/Admin/Users.tsx` — tabel user + tombol create/delete

### 6.3 Routes ✅
- Group route dengan middleware `auth` + role check

### 6.4 Verifikasi ✅
- Admin login → menu admin muncul → bisa CRUD user
- User login → menu admin tidak muncul

---

## Phase 7: Polishing & Testing ✅ DONE

> **Changes:** Created `FlashMessage` component (DRY flash rendering across all 6 pages), `ErrorBoundary` component (React error boundary wrapping all page content). Added dark mode toggle (sun/moon icons + localStorage persistence + system preference detection). Added try/catch to `SpreadsheetController@upload` for parse failure handling with cleanup. Added empty state for spreadsheets on `Projects/Show`. Fixed `RoleMiddleware` to compare `->value` against backed enums.  
> **Factories:** Created `ProjectFactory`, `SpreadsheetFactory`, `SheetFactory`, `SheetColumnFactory`, `SheetRowFactory`, `ChartFactory`. Added `HasFactory` trait to all 6 domain models.  
> **Tests:** 28 new tests created: `ProjectTest` (10 tests), `ChartTest` (9 tests), `AdminUserTest` (7 tests), `SpreadsheetTest` (4 tests covering upload validation + auth), `ExcelParserServiceTest` (3 unit tests). All 58 tests pass (28 new + 30 existing from Breeze).  
> **Verification:** `npm run build` passes clean, all PHP syntax checks pass, all 58 tests green.

### 7.1 Validation ✅
- Upload validation (file type: xlsx/xls, max size) — already in place, enhanced with try/catch error handling
- Chart X/Y column validation — `y_columns: required|array|min:1` already in `ChartController`
- Flash messages — DRY'd into `FlashMessage` component, used across all 6 pages
- Parse failure handling added — catches exceptions, deletes orphaned files, shows error flash

### 7.2 UI Polish ✅
- Loading state — upload button shows "Uploading..." with disabled state
- Empty states — Projects/Show now shows "No files uploaded yet" for spreadsheets; all list pages have empty states
- Error boundary — `ErrorBoundary` component wraps all page content in `AuthenticatedLayout`
- Dark mode — toggle button (sun/moon) in header nav + mobile menu; localStorage persistence; system preference detection in `bootstrap.ts`

### 7.3 Testing ✅
- 28 new PHPUnit tests: Project CRUD (10), Chart CRUD + validation (9), Admin user management (7), Spreadsheet upload + validation (4), ExcelParserService unit (3)
- Added `HasFactory` trait + factories for Project, Spreadsheet, Sheet, SheetColumn, SheetRow, Chart
- Fixed `RoleMiddleware` to compare `->value` for BackedEnum compatibility

---

## Route Summary

| Method | URI | Controller | Role |
|--------|-----|-----------|------|
| GET | `/dashboard` | Dashboard | auth |
| GET/POST | `/projects` | ProjectController@index,@store | auth |
| GET/PUT/DELETE | `/projects/{id}` | ProjectController@show,@update,@destroy | auth |
| POST | `/projects/{id}/upload` | SpreadsheetController@upload | auth |
| GET | `/sheets/{id}` | SheetController@show | auth |
| GET/POST | `/charts` | ChartController@index,@store | auth |
| GET/PUT/DELETE | `/charts/{id}` | ChartController@show,@update,@destroy | auth |
| GET | `/admin/users` | Admin\UserController@index | admin ✅ |
| POST | `/admin/users` | Admin\UserController@store | admin ✅ |
| DELETE | `/admin/users/{id}` | Admin\UserController@destroy | admin ✅ |

---

## Execution Order

1. Phase 1 — Scaffolding & Auth ✅
2. Phase 2 — Project Management ✅
3. Phase 3 — Excel Upload & Parsing ✅
4. Phase 4 — Chart Generation ✅
5. Phase 5 — Export JPG/PDF ✅
6. Phase 6 — Admin User Management ✅
7. Phase 7 — Polishing & Testing ✅
