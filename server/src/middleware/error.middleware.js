/**
 * Global hata yönetimi middleware'i.
 * Tüm route'lardan sonra tanımlanmalıdır.
 * Tutarlı bir hata yanıt formatı sağlar.
 */
export const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Sunucu hatası oluştu.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Uygulama katmanında kolayca fırlatılabilir HTTP hatası.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
