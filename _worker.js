export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Remove leading "/"

    if (!path) {
      return Response.redirect(
        "https://bibica.net/giai-quyet-telegram-bi-nha-mang-viet-nam-chan-bang-mtproto-proxy-proton-vpn",
        301
      );
    }

    const tgUrl = path.startsWith('+')
      ? `tg://join?invite=${path.slice(1)}`
      : `tg://resolve?domain=${path.replace(/^@/, '')}`;

    return new Response(
      `<!DOCTYPE html><meta http-equiv="refresh" content="0;url=${tgUrl}">`,
      { headers: { "content-type": "text/html" } }
    );
  }
};
