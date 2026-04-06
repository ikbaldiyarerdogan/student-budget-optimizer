import { AIService } from '../services/ai.service.js';

export const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Mesaj boş olamaz.' });
    }

    const reply = await AIService.chatWithUser(req.user.uid, message, history || []);
    res.json({ success: true, reply });
  } catch (err) {
    next(err);
  }
};
