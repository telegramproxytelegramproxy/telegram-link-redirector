export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1).replace(/\/+$/, ''); // loại bỏ slash cuối

    if (!path) {
      return Response.redirect(
        "https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-socks5-proton-vpn/ ",
        301
      );
    }

    const cleaned = path.replace(/^@/, '');

    if (!cleaned || cleaned.trim() === "") {
      return new Response("Invalid Telegram domain or invite", { status: 400 });
    }

    const tgUrl = cleaned.startsWith('+')
      ? `tg://join?invite=${cleaned.slice(1)}`
      : `tg://resolve?domain=${cleaned}`;

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Opening Telegram</title>
          <meta http-equiv="cache-control" content="no-cache">
          <script>window.location.href = "${tgUrl}"</script>
        </head>
        <body>
          <p>If not redirected automatically, <a href="${tgUrl}">click here</a>.</p>
        </body>
      </html>`,
      {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store, max-age=0"
        }
      }
    );
  }
};
