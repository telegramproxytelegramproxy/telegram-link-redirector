export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Bỏ "/" ở đầu
    const params = url.searchParams.toString(); // Giữ lại tham số (nếu có)
    const userAgent = request.headers.get('User-Agent') || '';

    // Xử lý từng loại link
    let tgUri;
    if (path.startsWith('+') && /^\+[0-9]+$/.test(path)) {
      // Link số điện thoại (ví dụ: t.bibica.net/+84123456789)
      tgUri = `tg://resolve?phone=${path.slice(1)}`;
    } else if (path.startsWith('+') || path.startsWith('joinchat/')) {
      // Private invite link (ví dụ: t.bibica.net/+AbCdEf123 hoặc t.bibica.net/joinchat/AbCdEf123)
      const inviteCode = path.replace('joinchat/', '');
      tgUri = `tg://join?invite=${inviteCode}`;
    } else if (path.startsWith('c/')) {
      // Group chat ID (ví dụ: t.bibica.net/c/123456789/10)
      const [_, chatId, postId] = path.split('/');
      tgUri = `tg://privatepost?chat_id=${chatId}&post_id=${postId}`;
    } else {
      // Mặc định: username/channel/bot (ví dụ: t.bibica.net/duck_bot?start=123)
      tgUri = `tg://resolve?domain=${path}${params ? '&' + params : ''}`;
    }

    // Kiểm tra thiết bị để chọn redirect phù hợp
    if (/Android|iPhone|iPad|iPod/i.test(userAgent)) {
      return Response.redirect(tgUri, 302); // Mở app Telegram trên mobile
    } else {
      return Response.redirect(`https://t.me/${path}${params ? '?' + params : ''}`, 302); // Mở web trên desktop
    }
  }
};
