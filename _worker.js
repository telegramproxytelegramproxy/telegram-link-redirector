export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Bỏ "/" đầu URL
    const params = url.searchParams.toString();
    const userAgent = request.headers.get('User-Agent') || '';

    // 1. Xử lý trang chủ
    if (!path) {
      return Response.redirect('https://telegram.org/', 302);
    }

    // 2. Tạo link app (tg://) và web (t.me)
    let tgUri, webUri;
    
    if (path.startsWith('+') && /^\+[0-9]+$/.test(path)) {
      // Link số điện thoại
      tgUri = `tg://resolve?phone=${path.slice(1)}`;
      webUri = `https://t.me/${path}`;
    }
    else if (path.startsWith('joinchat/') || path.startsWith('+')) {
      // Private group
      const inviteCode = path.replace('joinchat/', '');
      tgUri = `tg://join?invite=${inviteCode}`;
      webUri = `https://t.me/joinchat/${inviteCode}`;
    }
    else {
      // Username/channel thông thường
      tgUri = `tg://resolve?domain=${path}${params ? '&' + params : ''}`;
      webUri = `https://t.me/${path}${params ? '?' + params : ''}`;
    }

    // 3. Phát hiện thiết bị
    const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent);

    // 4. Xử lý cho mobile
    if (isMobile) {
      // Tạo trang trung gian để thử mở app trước
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="refresh" content="0;url=${tgUri}">
          <script>
            window.location.href = "${tgUri}";
            setTimeout(function() {
              window.location.href = "${webUri}";
            }, 800);
          </script>
        </head>
        <body>
          <p>Đang chuyển hướng...</p>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // 5. Desktop thì chuyển thẳng đến web Telegram
    return Response.redirect(webUri, 302);
  }
};
