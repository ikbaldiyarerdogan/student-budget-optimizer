# Student Budget Optimizer — Görev Listesi

## Faz 1 — Proje Kurulumu ✅
- [x] Root `package.json` oluştur (concurrently)
- [x] `client/` — Vue 3 + Vite init
- [x] `server/` — Express.js init
- [x] Bağımlılıkları kur (client + server)
- [x] `.env` dosyaları oluştur (Firebase)
- [x] Design system — CSS variables, tipografi, renk paleti (glassmorphism dark)
- [x] `vite.config.js` — @ alias + dev proxy

## Faz 2 — Authentication ✅
- [x] Firebase Auth kurulumu (client) → `services/firebase.js`
- [x] Axios API client → `services/api.client.js`
- [x] Firebase Admin SDK (server) → `config/firebase.config.js`
- [x] `auth.middleware.js` — token doğrulama
- [x] Pinia `auth.store.js`
- [x] Pinia `budget.store.js` + `expense.store.js`
- [x] `LoginView.vue`
- [x] `RegisterView.vue` (2-step)
- [x] `LandingView.vue`
- [x] Vue Router + route guard'lar
- [x] `AppSidebar.vue` + `AppNavbar.vue`

## Faz 3 — Core Features ✅
- [x] Repository + Service katmanları (server-side)
- [x] `DashboardView.vue` — ay navigasyonu + tüm bileşenler
- [x] `BudgetOverview.vue` — gelir/gider/kalan/tasarruf kartları
- [x] `CategoryCard.vue` — progress bar + oran karşılaştırma
- [x] `AlertBanner.vue` — aşım uyarıları + tasarruf önerileri
- [x] `ExpensesView.vue` — harcama listesi, filtreleme, silme
- [x] `AddExpenseForm.vue` — harcama ekleme modal formu

## Faz 4 — Grafikler & Raporlar ✅
- [x] Chart.js entegrasyonu
- [x] `PieChart.vue` — kategori dağılımı
- [x] `BarChart.vue` — aylık trend
- [x] `ReportsView.vue`

## Faz 5 — Polish & Deploy Hazırlığı ✅
- [x] `SettingsView.vue` — gelir güncelleme + ideal oran özelleştirme + tema ayarı
- [x] Animasyonlar ve geçişler (iyileştirme)
- [x] Responsive tasarım (sidebar toggle)
- [x] `.env.production` + Netlify/Railway config
