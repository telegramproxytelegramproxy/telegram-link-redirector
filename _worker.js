export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Bỏ "/" ở đầu (ví dụ: "duck_group")
    const params = url.searchParams.toString(); // Giữ lại tham số (nếu có)

    // 1. Xử lý truy cập trang chủ (không có path)
    if (!path) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <body>
          <h1>Telegram Deep Links</h1>
          <p>Ví dụ: <a href="/duck_group">/duck_group</a> hoặc <a href="/duck_bot?start=123">/duck_bot?start=123</a></p>
        </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    // 2. Xác định loại link và chuyển thành tg://
    let tgUri;
    if (path.startsWith('+') && /^\+[0-9]+$/.test(path)) {
      // Link số điện thoại (ví dụ: /+84123456789)
      tgUri = `tg://resolve?phone=${path.slice(1)}`;
    } 
    else if (path.startsWith('joinchat/') || path.startsWith('+')) {
      // Private invite link (ví dụ: /joinchat/AbCdEf hoặc /+AbCdEf)
      const inviteCode = path.replace('joinchat/', '');
      tgUri = `tg://join?invite=${inviteCode}`;
    }
    else if (path.startsWith('c/')) {
      // Group chat ID (ví dụ: /c/123456789/10)
      const [_, chatId, postId] = path.split('/');
      tgUri = `tg://privatepost?chat_id=${chatId}&post_id=${postId}`;
    }
    else {
      // Mặc định: username, bot, channel (ví dụ: /duck_bot?start=123)
      tgUri = `tg://resolve?domain=${path}${params ? '&' + params : ''}`;
    }

    // 3. Chuyển hướng thẳng đến app Telegram
    return Response.redirect(tgUri, 302);
  }
};
