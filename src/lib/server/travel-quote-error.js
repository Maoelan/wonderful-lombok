export class TravelQuoteError extends Error {
  constructor(message, status = 503, code = 'route_unavailable') {
    super(message);
    this.name = 'TravelQuoteError';
    this.status = status;
    this.code = code;
  }
}
