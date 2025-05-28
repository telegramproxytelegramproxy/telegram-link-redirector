export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname + url.search; // Giữ nguyên path và params
    const telegramUrl = `https://t.me${path}`;

    // Forward request đến t.me và trả về response
    return fetch(telegramUrl, {
      headers: request.headers,
      method: request.method,
    });
  }
};
