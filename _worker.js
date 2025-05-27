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
    <title>Redirecting to Telegram...</title>
    <script>
      // Attempt to open the Telegram app
      const tgUrl = "${tgProtocolUrl}";
      const webUrl = "${webUrl}";
      function redirect() {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = tgUrl;
        document.body.appendChild(iframe);

        // Fallback to web version after 1s
        setTimeout(() => {
          window.location.href = webUrl;
        }, 1000);
      }
      window.onload = redirect;
    </script>
  </head>
  <body>
    <p>Đang chuyển hướng đến Telegram… Nếu không tự động mở ứng dụng, bạn sẽ được chuyển sang bản web.</p>
  </body>
</html>`;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  }
};
