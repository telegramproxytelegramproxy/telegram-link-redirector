export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1);

    if (!path) {
      return Response.redirect(
        "https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-proxy-proton-vpn",
        301
      );
    }

    const cleaned = path.replace(/^@/, '');

    const tgProtocolUrl = cleaned.startsWith('+')
      ? `tg://join?invite=${cleaned.slice(1)}`
      : `tg://resolve?domain=${cleaned}`;

    const webUrl = cleaned.startsWith('+')
      ? `https://t.me/+${cleaned.slice(1)}`
      : `https://t.me/${cleaned}`;

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Đang mở Telegram…</title>
    <script>
      const tgUrl = "${tgProtocolUrl}";
      const webUrl = "${webUrl}";
      let redirected = false;

      // Bắt đầu chuyển hướng
      window.onload = function() {
        // Thử mở ứng dụng Telegram
        window.location.href = tgUrl;

        // Sau 1.2 giây, nếu vẫn ở trên trang, chuyển sang bản web
        setTimeout(function() {
          if (!redirected) {
            redirected = true;
            window.location.href = webUrl;
          }
        }, 1200);
      };
    </script>
  </head>
  <body>
    <p>Nếu bạn không được chuyển hướng tự động, <a href="${webUrl}">nhấn vào đây để mở Telegram Web</a>.</p>
  </body>
</html>`;

    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
};
