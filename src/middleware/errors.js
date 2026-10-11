export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error instanceof HttpError ? error.status : 500;
  let message = error instanceof HttpError ? error.message : 'Ada kendala. Coba lagi sebentar, ya.';
  if (error.type === 'entity.too.large') {
    status = 413;
    message = 'Data yang dikirim terlalu besar.';
  } else if (error.type === 'entity.parse.failed' || error.type === 'encoding.unsupported') {
    status = 400;
    message = 'Format data tidak valid.';
  }
  res.status(status).json({ success: false, message });
}
