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

    const tgUrl = cleaned.startsWith('+')
      ? `tg://join?invite=${cleaned.slice(1)}`
      : `tg://resolve?domain=${cleaned}`;

    const fallbackUrl = "https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-proxy-proton-vpn";

    const body = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Open Telegram</title>
        <script>
          function openTelegram() {
            // Thử mở tg://
            window.location = "${tgUrl}";
            // Sau 2 giây nếu không chuyển được sẽ chuyển về fallback
            setTimeout(function() {
              window.location = "${fallbackUrl}";
            }, 2000);
          }
          window.onload = openTelegram;
        </script>
      </head>
      <body>
        <p>Đang chuyển hướng...</p>
        <p>Nếu không tự chuyển, <a href="${tgUrl}">bấm vào đây để mở Telegram</a> hoặc <a href="${fallbackUrl}">đọc hướng dẫn</a>.</p>
      </body>
      </html>
    `;

    return new Response(body, {
      headers: {
        "content-type": "text/html;charset=UTF-8"
      }
    });
  }
};
