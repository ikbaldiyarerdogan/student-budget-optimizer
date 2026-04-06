import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExpenseService } from './expense.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AppError } from '../middleware/error.middleware.js';

export const AIService = {
  async chatWithUser(uid, message, history) {
    if (!process.env.GEMINI_API_KEY) {
      throw new AppError('Gemini API anahtarı yapılandırılmamış.', 500);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Kullanıcının güncel ayını bulalım
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    // Kullanıcının tüm finansal durumunu (analizi) al
    let financialContext = '';
    try {
      const data = await ExpenseService.getMonthlyData(uid, currentMonth);
      const user = await UserRepository.findById(uid);
      
      financialContext = `
Kullanıcı Adı: ${user?.name || 'Öğrenci'}
Aylık Gelir: ${data.analysis.income} TL
Toplam Harcama: ${data.analysis.totalSpent} TL
Kalan Bütçe: ${data.analysis.remainingBalance} TL
Tasarruf Oranı: %${data.analysis.savingsRate}
Genel Durum: ${data.analysis.overallStatus}

Aşılan Kategoriler:
${data.analysis.alerts.map(a => `- ${a.label}: %${a.actualPercent} (İdeal: %${a.idealPercent}) - Tahmini kayıp: ${a.estimatedSaving} TL`).join('\n') || 'Yok, her şey ideal!'}
`;
    } catch (e) {
      console.error('Finansal veriler çekilemedi:', e);
      financialContext = '(Finansal veriler geçici olarak okunamadı)';
    }

    // AI Sistem Konfigürasyonu
    const systemPrompt = `Sen "Student Budget Optimizer" uygulamasının samimi, yardımsever ve uzman bir yapay zeka finansal danışmanısın. Karşındaki kişi üniversite öğrencisi. Sana kullanıcının anlık bütçe analizini kontekst olarak veriyorum. Kullanıcının sorusuna, bu finansal tabloyu göz önünde bulundurarak akılcı, motive edici ve doğrudan tavsiyeler vererek cevap vereceksin. Cevaplarını markdown formatında, kısa paragraflar ve madde imleri (bullet points) kullanarak çok yapısal ve okunabilir yaz. Asla lafı uzatma.\n\nKullanıcının Finansal Durumu (Bu Ay):\n${financialContext}`;

    try {
      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Merhaba! Ben Student Budget Optimizer danışmanınızım. Bütçenizle ilgili size nasıl yardımcı olabilirim?' }] },
          ...history.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          }))
        ]
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (e) {
      console.error('Gemini error:', e);
      throw new AppError('Yapay zeka yanıt oluştururken bir hata oluştu.', 500);
    }
  }
};
