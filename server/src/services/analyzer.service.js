/**
 * İdeal bütçe oranları — varsayılan değerler (%)
 * Kullanıcı ayarlarından override edilebilir.
 */
export const DEFAULT_IDEAL_RATIOS = {
  kira: 35,
  yemek: 22,
  ulasim: 12,
  faturalar: 8,
  eglence: 10,
  egitim: 8,
  diger: 5,
};

export const CATEGORY_LABELS = {
  kira: 'Kira / Konut',
  yemek: 'Yemek',
  ulasim: 'Ulaşım',
  faturalar: 'Faturalar',
  eglence: 'Eğlence',
  egitim: 'Eğitim',
  diger: 'Diğer',
};

/**
 * Uyarı eşikleri — ideal oranın üzerinde kaç puan fazla olunca uyarı verilir.
 */
const WARNING_THRESHOLD = 5;   // sarı uyarı
const CRITICAL_THRESHOLD = 10; // kırmızı uyarı

/**
 * Kategoriye özel tasarruf önerileri.
 */
const SAVINGS_TIPS = {
  kira: [
    'Ev arkadaşı ile paylaşımlı yaşamayı değerlendir.',
    'Şehir merkezinden biraz uzak, ulaşımı kolay semtlere bak.',
  ],
  yemek: [
    'Haftada 2 gün dışarıda yemekten kaçın — aylık ~600 TL tasarruf.',
    'Haftalık yemek planı yaparak market alışverişini optimize et.',
    'Öğrenci yemekhanelerinden faydalanmayı dene.',
  ],
  ulasim: [
    'Toplu taşıma abonmanı daha ekonomik olabilir.',
    'Bisiklet veya yürüyüş ile kısa mesafeleri karşıla.',
    'Yolculuk paylaşım uygulamalarını arkadaşlarınla kullan.',
  ],
  faturalar: [
    'Kullanmadığın cihazları bekleme konumundan çıkar.',
    'Mobil paketini gözden geçir, daha uygun tarife olabilir.',
  ],
  eglence: [
    'Bu ay için eğlence limiti belirle ve takip et.',
    'Ücretsiz etkinlikleri (sergi, festival, kampüs etkinlikleri) değerlendir.',
    'Abonelik hizmetlerini arkadaşlarınla paylaş.',
  ],
  egitim: [
    'İkinci el kitap platformlarını kullan.',
    'Kütüphane kaynaklarını ve e-kaynaklarını daha fazla değerlendir.',
  ],
  diger: [
    'Bu kategorideki harcamaları detaylı takip etmeye başla.',
    'Gerçekten ihtiyaç duyduğun alışverişleri 24 saat bekleyerek değerlendir.',
  ],
};

/**
 * Tek bir kategorinin durumunu analiz eder.
 */
const analyzeCategory = (category, spent, income, idealRatios) => {
  const idealPercent = idealRatios[category] ?? DEFAULT_IDEAL_RATIOS[category] ?? 5;
  const actualPercent = income > 0 ? (spent / income) * 100 : 0;
  const diff = actualPercent - idealPercent;

  let status = 'normal'; // 'normal' | 'warning' | 'critical'
  if (diff > CRITICAL_THRESHOLD) status = 'critical';
  else if (diff > WARNING_THRESHOLD) status = 'warning';

  const tips = status !== 'normal' ? (SAVINGS_TIPS[category] ?? []) : [];
  const estimatedSaving = income * (diff / 100);

  return {
    category,
    label: CATEGORY_LABELS[category] ?? category,
    spent,
    idealPercent,
    actualPercent: parseFloat(actualPercent.toFixed(1)),
    diff: parseFloat(diff.toFixed(1)),
    status,
    tips,
    estimatedSaving: status !== 'normal' ? parseFloat(estimatedSaving.toFixed(2)) : 0,
  };
};

/**
 * Tüm bütçeyi analiz eder.
 * @param {number} income  - Aylık gelir
 * @param {Object} spentByCategory  - { kira: 3000, yemek: 1500, ... }
 * @param {Object} idealRatios  - Kullanıcının özelleştirilmiş ideal oranları
 * @returns Analiz sonucu
 */
export const analyzeBudget = (income, spentByCategory, idealRatios = {}) => {
  const mergedRatios = { ...DEFAULT_IDEAL_RATIOS, ...idealRatios };
  const categories = Object.keys(CATEGORY_LABELS);

  const categoryAnalysis = categories.map((cat) =>
    analyzeCategory(cat, spentByCategory[cat] ?? 0, income, mergedRatios)
  );

  const totalSpent = categoryAnalysis.reduce((sum, c) => sum + c.spent, 0);
  const remainingBalance = income - totalSpent;
  const savingsRate = income > 0 ? ((remainingBalance / income) * 100).toFixed(1) : '0.0';

  const alerts = categoryAnalysis.filter((c) => c.status !== 'normal');
  const overallStatus =
    alerts.some((a) => a.status === 'critical')
      ? 'critical'
      : alerts.length > 0
        ? 'warning'
        : 'healthy';

  return {
    income,
    totalSpent,
    remainingBalance,
    savingsRate: parseFloat(savingsRate),
    overallStatus,
    categoryAnalysis,
    alerts,
  };
};
