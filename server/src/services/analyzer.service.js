/**
 * İdeal bütçe oranları — varsayılan değerler (%)
 * Kullanıcı ayarlarından override edilebilir.
 */
export const DEFAULT_IDEAL_RATIOS = {
  kira: 25,
  yemek: 22,
  ulasim: 12,
  faturalar: 8,
  eglence: 10,
  egitim: 8,
  birikim: 10,
  diger: 5,
};

export const CATEGORY_LABELS = {
  kira: 'Kira / Konut',
  yemek: 'Yemek',
  ulasim: 'Ulaşım',
  faturalar: 'Faturalar',
  eglence: 'Eğlence',
  egitim: 'Eğitim',
  birikim: 'Birikim',
  diger: 'Diğer',
};

/**
 * Uyarı eşikleri — ideal oranın üzerinde kaç puan fazla olunca uyarı verilir.
 */
const WARNING_THRESHOLD = 5;   // sarı uyarı
const CRITICAL_THRESHOLD = 10; // kırmızı uyarı

export const CATEGORY_ICONS = {
  kira: '🏠',
  yemek: '🍽️',
  ulasim: '🚌',
  faturalar: '💡',
  eglence: '🎮',
  egitim: '📚',
  birikim: '📈',
  diger: '📦',
};

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Kategorilere özel varsayılan (AI kapalıysa) öneriler (Fallback)
 */
const FALLBACK_TIPS = {
  kira: ['Ev arkadaşı bulmayı değerlendir.', 'Daha uygun fiyatlı alternatiflere göz at.'],
  yemek: ['Dışarıda yemeyi azaltıp evde pişirmeyi dene.', 'Aylık market alışverişine tavan bütçe koy.'],
  ulasim: ['Aylık öğrenci abonman kartını aktif kullan.', 'Kısa mesafeleri yürüyerek veya bisikletle geç.'],
  faturalar: ['Gereksiz abonelikleri iptal et.', 'Enerji tasarruflu kullanıma dikkat et.'],
  eglence: ['Ücretsiz üniversite etkinliklerini değerlendir.', 'Eğlence bütçeni haftalık olarak sınırla.'],
  egitim: ['İkinci el kitap veya kütüphane kullan.', 'Dijital kaynaklara yönel.'],
  birikim: ['Tasarruf hedeflerini tekrar gözden geçir.'],
  diger: ['Bilinçsiz harcamaları 24 saat kuralı ile önle.']
};

/**
 * Tek bir kategorinin durumunu analiz eder (AI önerileri hariç).
 */
const analyzeCategory = (category, spent, income, idealRatios) => {
  const idealPercent = idealRatios[category] ?? DEFAULT_IDEAL_RATIOS[category] ?? 5;
  const actualPercent = income > 0 ? (spent / income) * 100 : 0;
  const diff = actualPercent - idealPercent;

  let status = 'normal'; // 'normal' | 'warning' | 'critical'
  if (diff > CRITICAL_THRESHOLD) status = 'critical';
  else if (diff > WARNING_THRESHOLD) status = 'warning';

  const estimatedSaving = income * (diff / 100);

  return {
    category,
    icon: CATEGORY_ICONS[category] ?? '💸',
    label: CATEGORY_LABELS[category] ?? category,
    spent,
    idealPercent,
    actualPercent: parseFloat(actualPercent.toFixed(1)),
    diff: parseFloat(diff.toFixed(1)),
    status,
    tips: [], // To be populated by AI or Fallback
    estimatedSaving: status !== 'normal' ? parseFloat(estimatedSaving.toFixed(2)) : 0,
  };
};

/**
 * Tüm bütçeyi analiz eder ve AI önerilerini dahil eder.
 */
export const analyzeBudget = async (income, spentByCategory, idealRatios = {}) => {
  const mergedRatios = { ...DEFAULT_IDEAL_RATIOS, ...idealRatios };
  // Sadece labels içindeki değil, mergedRatios içindeki tüm kategorileri alalım (örn. birikim)
  const categories = Object.keys(mergedRatios);

  let categoryAnalysis = categories.map((cat) =>
    analyzeCategory(cat, spentByCategory[cat] ?? 0, income, mergedRatios)
  );
  
  // Sıralama (en çok aşılanlar üstte, normal olanlar altta)
  categoryAnalysis.sort((a, b) => {
    const sMap = { 'critical': 3, 'warning': 2, 'normal': 1 };
    if (sMap[b.status] !== sMap[a.status]) return sMap[b.status] - sMap[a.status];
    return b.diff - a.diff;
  });

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

  // Fetch AI tips if there are alerts and API key is set
  if (alerts.length > 0 && process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Sen bir öğrenci bütçe danışmanısın. Kullanıcı şu kategorilerde limitini aştı:
${alerts.map(a => `- ${a.category}: (İdeal: %${a.idealPercent}, Gerçekleşen: %${a.actualPercent})`).join('\n')}

Lütfen bu kategoriler için 1 kısa (en fazla 10-15 kelime) tasarruf önerisi sun.
Sadece geçerli bir JSON döndür. Başka bir metin veya markdown formatı (örn. \`\`\`json) KESİNLİKLE Ekleme.
Format: { "kategoriadi": ["öneri"] }`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      
      // Temizleme (Markdown bloklarını kaldırır)
      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

      const aiTips = JSON.parse(responseText);
      
      categoryAnalysis = categoryAnalysis.map(cat => ({
        ...cat,
        tips: aiTips[cat.category] ? aiTips[cat.category] : (cat.status !== 'normal' ? (FALLBACK_TIPS[cat.category] ?? []) : [])
      }));
    } catch (error) {
      console.error('[Gemini API] Öneriler alınamadı, fallback kullanılıyor:', error);
      categoryAnalysis = categoryAnalysis.map(cat => ({
        ...cat,
        tips: cat.status !== 'normal' ? (FALLBACK_TIPS[cat.category] ?? []) : []
      }));
    }
  } else {
    categoryAnalysis = categoryAnalysis.map(cat => ({
      ...cat,
      tips: cat.status !== 'normal' ? (FALLBACK_TIPS[cat.category] ?? []) : []
    }));
  }

  return {
    income,
    totalSpent,
    remainingBalance,
    savingsRate: parseFloat(savingsRate),
    overallStatus,
    categoryAnalysis,
    alerts: categoryAnalysis.filter((c) => c.status !== 'normal'),
  };
};
