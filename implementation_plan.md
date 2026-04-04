# Student Budget Optimizer — Geliştirme Planı

## Proje Özeti

Üniversite öğrencilerini hedef alan, mikroiktisat prensiplerine dayanan bir bütçe optimizasyon web uygulaması. Kullanıcılar aylık gelir ve harcamalarını kategorilere ayırarak sisteme girecek; uygulama bu verileri analiz edip ideal bütçe oranlarıyla kıyaslayacak ve aksiyon odaklı tasarruf önerileri sunacak.

---

## Tech Stack

| Katman | Teknoloji | Açıklama |
|---|---|---|
| Frontend | **Vue.js 3** (Composition API) | SPA, reaktif UI — sadece sunum katmanı |
| Backend | **Node.js + Express.js** | REST API — tüm iş mantığı burada |
| DB Driver | **Firebase Admin SDK** | Server-side Firestore erişimi |
| Veritabanı | **Firebase Firestore** | NoSQL cloud DB |
| Auth | **Firebase Authentication** | Email/Password + Google OAuth |
| Grafik | **Chart.js** (vue-chartjs) | Pasta & bar grafikler |
| Build Tool | **Vite** | Vue projesi için hızlı build |
| Stil | **Vanilla CSS** + CSS Variables | Glassmorphism dark theme |
| State Mgmt | **Pinia** | Vue 3 store yönetimi (UI state) |
| HTTP Client | **Axios** | Frontend → Express API iletişimi |
| Deploy (FE) | **Netlify** | Vue static build |
| Deploy (BE) | **Railway** | Express.js sunucusu |
| Deploy (DB) | **Firebase** | Auth + Firestore (Spark — ücretsiz) |

---

## Mimari Karar: Repository Pattern + Service Layer

> **Tüm CRUD işlemleri Express.js API üzerinden geçer.** Frontend hiçbir zaman Firestore'a doğrudan bağlanmaz. Firebase sadece Auth token üretir; geri kalan her şey backend'de yaşar.

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Vue.js 3)                          │
│  Sadece UI render eder. Veriyi Axios ile API'den alır.  │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTP (Axios)
┌───────────────────▼─────────────────────────────────────┐
│  API LAYER (Express.js)                                  │
│  Routes → Middleware → Controllers                       │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│  SERVICE LAYER                                           │
│  BudgetService, ExpenseService — iş mantığı burada      │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│  REPOSITORY LAYER                                        │
│  FirestoreRepository — Firebase'e özgü kod buraya       │
└───────────────────┬─────────────────────────────────────┘
                    │ Firebase Admin SDK
┌───────────────────▼─────────────────────────────────────┐
│  Firebase Firestore (Cloud DB)                           │
└─────────────────────────────────────────────────────────┘
```

## Proje Klasör Yapısı

```
StudentBudgetPlannerApp/
├── client/                          # Vue.js 3 — Sunum Katmanı
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppNavbar.vue
│   │   │   │   └── AppSidebar.vue
│   │   │   ├── dashboard/
│   │   │   │   ├── BudgetOverview.vue
│   │   │   │   ├── CategoryCard.vue
│   │   │   │   └── AlertBanner.vue
│   │   │   ├── charts/
│   │   │   │   ├── PieChart.vue
│   │   │   │   └── BarChart.vue
│   │   │   └── forms/
│   │   │       ├── AddExpenseForm.vue
│   │   │       └── BudgetSetupForm.vue
│   │   ├── views/
│   │   │   ├── LandingView.vue
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── ExpensesView.vue
│   │   │   ├── ReportsView.vue
│   │   │   └── SettingsView.vue
│   │   ├── stores/              # Pinia — sadece UI state
│   │   │   ├── auth.store.js
│   │   │   ├── budget.store.js
│   │   │   └── expense.store.js
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── services/
│   │   │   ├── firebase.js      # Auth token init
│   │   │   └── api.client.js    # Axios instance (baseURL, interceptors)
│   │   └── App.vue
│   ├── index.html
│   └── vite.config.js
│
├── server/                          # Express.js — İş Mantığı
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.config.js   # Firebase Admin SDK init
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # Token doğrulama
│   │   │   └── error.middleware.js  # Global hata yönetimi
│   │   ├── routes/
│   │   │   ├── expense.routes.js
│   │   │   ├── budget.routes.js
│   │   │   └── user.routes.js
│   │   ├── controllers/             # İstek/yanıt yönetimi
│   │   │   ├── expense.controller.js
│   │   │   ├── budget.controller.js
│   │   │   └── user.controller.js
│   │   ├── services/                # İş mantığı (domain logic)
│   │   │   ├── expense.service.js
│   │   │   ├── budget.service.js    # İdeal oran analizi burada
│   │   │   └── analyzer.service.js  # Uyarı + öneri motoru
│   │   └── repositories/            # DB erişim katmanı
│   │       ├── expense.repository.js
│   │       └── user.repository.js
│   ├── server.js
│   └── package.json
│
└── package.json                     # Root (concurrently ile dev)
```

---

## Sayfalar ve Özellikler

### 1. Landing Page (Giriş Sayfası)
- Hero section — animasyonlu tanıtım
- Özellikler bölümü (3 kart)
- CTA butonları (Kayıt Ol / Giriş Yap)

### 2. Auth Sayfaları
- **Login:** Email/Password + Google ile giriş
- **Register:** Email/Password + Google ile kayıt
- Form doğrulama (validasyon)
- Firebase Auth entegrasyonu

### 3. Dashboard (Ana Sayfa)
- Aylık bütçe özet kartları (Toplam Gelir, Toplam Gider, Kalan)
- **Pasta grafiği** — harcama kategorilerine göre dağılım
- Kategori kartları — ideal oran vs. gerçek oran (progress bar)
- **Uyarı paneli** — aşılan kategoriler için renkli alert'lar
- **Tasarruf önerileri** kartları — dinamik, kategoriye özel tavsiyeler

### 4. Expenses (Harcamalar)
- Yeni harcama ekleme formu (tarih, kategori, tutar, açıklama)
- Harcama listesi (filtreleme, sıralama)
- Harcama silme / düzenleme
- Aylık gezinme (önceki ay / sonraki ay)

### 5. Reports (Raporlar)
- Aylık trend grafikleri (Bar chart — aylık karşılaştırma)
- Kategori bazlı analiz
- İdeal bütçe vs. gerçek bütçe kıyaslama tablosu
- PDF rapor indirme (opsiyonel)

### 6. Settings (Ayarlar)
- Aylık bütçe (gelir) güncelleme
- Kategori ideal oranlarını özelleştirme
- Profil bilgileri güncelleme
- Hesap silme

---

## Bütçe Analiz Mantığı (İktisat Katmanı)

### İdeal Bütçe Oranları (Varsayılan)
```
Kira/Konut:    %35
Yemek:         %22
Ulaşım:        %12
Faturalar:     %8
Eğlence:       %10
Eğitim:        %8
Diğer:         %5
```

### Uyarı Seviyeleri
| Durum | Eşik | Renk |
|---|---|---|
| Normal | ≤ ideal oran | 🟢 Yeşil |
| Dikkat | +%5'e kadar fazla | 🟡 Sarı |
| Kritik | +%5 üzeri fazla | 🔴 Kırmızı |

### Tasarruf Önerileri (Dinamik)
Her kategori için aşım durumunda özel öneri metni gösterilecek:
- **Yemek fazla:** "Haftada 2 gün dışarıda yemek yemekten kaçın → aylık ~500 TL tasarruf"
- **Ulaşım fazla:** "Toplu taşıma abonmanı değerlendir → aylık ~300 TL tasarruf"
- **Eğlence fazla:** "Bu ay için eğlence limiti belirle → bütçene %X katkı"
- vb.

---

## Firebase Yapısı (Firestore)

```
users/
  {userId}/                        ← document
    name: string
    email: string
    university: string
    monthlyIncome: number
    idealRatios: {                  ← özelleştirilebilir oranlar
      kira: 35,
      yemek: 22,
      ulasim: 12,
      faturalar: 8,
      eglence: 10,
      egitim: 8,
      diger: 5
    }
    createdAt: timestamp

expenses/
  {expenseId}/                     ← her harcama ayrı document
    userId: string                 ← server-side filtreleme için
    category: string
    amount: number
    description: string
    date: string (YYYY-MM-DD)
    month: string (YYYY-MM)        ← aylık sorgular için index
    createdAt: timestamp
```

> **Not:** Koleksiyon-document flat yapısı, Firestore'un güçlü `where` sorgularına uygun. Alt koleksiyon yerine flat yapı seçildi çünkü cross-user sorgu gereksinimi olmadığından daha basit ve KISS prensibine uygun.

---

## Geliştirme Aşamaları

### 🔵 Faz 1 — Proje Kurulumu (Gün 1)
- [ ] Monorepo yapısı oluştur (`client/` + `server/`)
- [ ] Vue 3 + Vite projesi init
- [ ] Express.js server kurulumu
- [ ] Firebase projesi oluştur (Console'dan)
- [ ] Firebase config entegrasyonu
- [ ] Temel CSS design system (renk paleti, tipografi, değişkenler)

### 🔵 Faz 2 — Authentication (Gün 2)
- [ ] Firebase Auth kurulumu (Email + Google)
- [ ] Pinia Auth store
- [ ] Login / Register sayfaları
- [ ] Route guard (auth protected routes)
- [ ] Express middleware — token doğrulama

### 🔵 Faz 3 — Core Features (Gün 3-4)
- [ ] Dashboard tasarımı ve bileşenleri
- [ ] Harcama ekleme / listeleme
- [ ] Firestore CRUD operasyonları
- [ ] Bütçe analiz mantığı (`budgetAnalyzer.js`)
- [ ] Uyarı sistemi

### 🔵 Faz 4 — Grafikler ve Raporlar (Gün 5)
- [ ] Chart.js entegrasyonu
- [ ] Pasta grafiği (kategori dağılımı)
- [ ] Bar grafiği (aylık trend)
- [ ] Reports sayfası

### 🔵 Faz 5 — Polish & UX (Gün 6)
- [ ] Animasyonlar ve geçişler
- [ ] Responsive tasarım
- [ ] Settings sayfası
- [ ] Landing page
- [ ] Son testler

---

## Kullanıcı Akışı

```
Landing Page
    │
    ├── Kayıt Ol → Register → Dashboard
    └── Giriş Yap → Login → Dashboard
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
               Expenses    Reports     Settings
```

---

## Kararlaştırılan Seçimler

| Konu | Karar |
|---|---|
| Firebase kurulumu | Paralelde oluşturuluyor; config `.env` ile entegre edilecek |
| Deployment | Frontend → **Netlify**, Backend → **Railway**, DB → **Firebase** |
| Arayüz dili | **Türkçe** |
| CRUD yaklaşımı | **Repository Pattern** — tüm veri işlemi Express.js üzerinden |

---

## Deployment Notları

### Netlify (Frontend)
- `client/` klasörü deploy edilir
- Build command: `npm run build`
- Environment variable: `VITE_API_BASE_URL=https://your-railway-app.railway.app`

### Railway (Backend)
- `server/` klasörü deploy edilir
- Environment variables: Firebase Admin SDK service account JSON
- `PORT` Railway tarafından otomatik atanır

### CORS Ayarı
- Express'te Netlify domain'i whitelist'e alınacak
- Development'ta `localhost:5173` izinli
