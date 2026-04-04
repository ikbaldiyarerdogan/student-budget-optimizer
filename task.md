# Student Budget Optimizer — Görev Listesi

## Faz 1 — Proje Kurulumu
- [x] Root `package.json` oluştur (concurrently)
- [x] `client/` — Vue 3 + Vite init
- [x] `server/` — Express.js init
- [x] Bağımlılıkları kur (client + server)
- [x] `.env` dosyaları oluştur (Firebase placeholders)
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

## Faz 3 — Core Features
- [ ] Repository + Service katmanları (server-side) → kontrol: mevcut
- [ ] `DashboardView.vue` — bütçe özet kartları
- [ ] `BudgetOverview.vue` — gelir/gider/kalan kartları
- [ ] `CategoryCard.vue` — progress bar + oran karşılaştırma
- [ ] `AlertBanner.vue` — aşım uyarıları
- [ ] `ExpensesView.vue` — harcama listesi + filtreleme
- [ ] `AddExpenseForm.vue` — harcama ekleme formu
- [ ] Tasarruf önerileri bölümü (analyzer.service entegrasyonu)

## Faz 4 — Grafikler & Raporlar
- [ ] Chart.js entegrasyonu
- [ ] `PieChart.vue`
- [ ] `BarChart.vue`
- [ ] `ReportsView.vue`

## Faz 5 — Polish & Deploy Hazırlığı
- [ ] `SettingsView.vue` — gelir güncelleme + ideal oran özelleştirme
- [ ] Animasyonlar ve geçişler
- [ ] Responsive tasarım (sidebar toggle)
- [ ] `.env.production` + Netlify/Railway config
