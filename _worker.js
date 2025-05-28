<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegram Proxy</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        
        .telegram-icon {
            width: 80px;
            height: 80px;
            background: #0088cc;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 16px;
        }
        
        .status {
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 500;
        }
        
        .status.loading {
            background: #e3f2fd;
            color: #1976d2;
        }
        
        .status.success {
            background: #e8f5e8;
            color: #2e7d32;
        }
        
        .status.error {
            background: #ffebee;
            color: #c62828;
        }
        
        .url-info {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: monospace;
            word-break: break-all;
        }
        
        .btn {
            background: #0088cc;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #006699;
        }
        
        .btn.secondary {
            background: #6c757d;
        }
        
        .btn.secondary:hover {
            background: #5a6268;
        }
        
        .countdown {
            font-size: 18px;
            font-weight: bold;
            color: #0088cc;
        }
        
        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #999;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 20px;
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="telegram-icon">📱</div>
        <h1>Telegram Proxy</h1>
        <p class="subtitle">Thay thế cho t.me bị chặn</p>
        
        <div id="status" class="status loading">
            Đang xử lý liên kết...
        </div>
        
        <div id="urlInfo" class="url-info" style="display: none;"></div>
        
        <div id="countdown" class="countdown" style="display: none;">
            Tự động chuyển hướng sau <span id="timer">5</span> giây
        </div>
        
        <div id="actions" style="display: none;">
            <a id="openTelegram" href="#" class="btn">Mở Telegram</a>
            <a id="openWeb" href="#" class="btn secondary">Mở Web</a>
        </div>
        
        <div class="footer">
            <p>Proxy thay thế cho t.me - Hỗ trợ tất cả tính năng Telegram</p>
        </div>
    </div>

    <script>
        class TelegramProxy {
            constructor() {
                this.init();
            }

            init() {
                const path = window.location.pathname;
                const search = window.location.search;
                const hash = window.location.hash;
                
                // Xử lý URL và tạo deep link
                const telegramUrl = this.processUrl(path, search, hash);
                
                if (telegramUrl) {
                    this.showUrlInfo(telegramUrl);
                    this.setupRedirect(telegramUrl);
                } else {
                    this.showError();
                }
            }

            processUrl(path, search, hash) {
                // Xóa slash đầu tiên
                const cleanPath = path.replace(/^\//, '');
                
                if (!cleanPath) {
                    return null;
                }

                let telegramUrl = '';
                let webUrl = '';

                // Xử lý các loại URL khác nhau
                if (cleanPath.startsWith('s/')) {
                    // Sticker set: t.me/s/stickername -> tg://addstickers?set=stickername
                    const stickerName = cleanPath.substring(2);
                    telegramUrl = `tg://addstickers?set=${stickerName}`;
                    webUrl = `https://t.me/s/${stickerName}`;
                } 
                else if (cleanPath.startsWith('addstickers/')) {
                    // Add stickers: t.me/addstickers/stickername
                    const stickerName = cleanPath.substring(12);
                    telegramUrl = `tg://addstickers?set=${stickerName}`;
                    webUrl = `https://t.me/addstickers/${stickerName}`;
                }
                else if (cleanPath.startsWith('joinchat/')) {
                    // Join chat: t.me/joinchat/xxxxx -> tg://join?invite=xxxxx
                    const inviteCode = cleanPath.substring(9);
                    telegramUrl = `tg://join?invite=${inviteCode}`;
                    webUrl = `https://t.me/joinchat/${inviteCode}`;
                }
                else if (cleanPath.startsWith('+')) {
                    // Invite link: t.me/+xxxxx -> tg://join?invite=xxxxx
                    const inviteCode = cleanPath.substring(1);
                    telegramUrl = `tg://join?invite=${inviteCode}`;
                    webUrl = `https://t.me/+${inviteCode}`;
                }
                else if (cleanPath.startsWith('proxy')) {
                    // Proxy settings: t.me/proxy?server=xxx&port=xxx&secret=xxx
                    const params = new URLSearchParams(search);
                    const server = params.get('server');
                    const port = params.get('port');
                    const secret = params.get('secret');
                    
                    if (server && port && secret) {
                        telegramUrl = `tg://proxy?server=${server}&port=${port}&secret=${secret}`;
                        webUrl = `https://t.me/proxy${search}`;
                    }
                }
                else if (cleanPath.startsWith('socks')) {
                    // SOCKS proxy: t.me/socks?server=xxx&port=xxx&user=xxx&pass=xxx
                    const params = new URLSearchParams(search);
                    const server = params.get('server');
                    const port = params.get('port');
                    const user = params.get('user') || '';
                    const pass = params.get('pass') || '';
                    
                    if (server && port) {
                        telegramUrl = `tg://socks?server=${server}&port=${port}&user=${user}&pass=${pass}`;
                        webUrl = `https://t.me/socks${search}`;
                    }
                }
                else if (cleanPath.includes('/')) {
                    // Channel/Group with message: t.me/channel/123 -> tg://resolve?domain=channel&post=123
                    const parts = cleanPath.split('/');
                    const channel = parts[0];
                    const messageId = parts[1];
                    
                    if (messageId) {
                        telegramUrl = `tg://resolve?domain=${channel}&post=${messageId}`;
                    } else {
                        telegramUrl = `tg://resolve?domain=${channel}`;
                    }
                    webUrl = `https://t.me/${cleanPath}`;
                }
                else {
                    // Simple channel/user: t.me/username -> tg://resolve?domain=username
                    telegramUrl = `tg://resolve?domain=${cleanPath}`;
                    webUrl = `https://t.me/${cleanPath}`;
                }

                // Thêm các parameters khác nếu có
                if (search) {
                    const params = new URLSearchParams(search);
                    const telegramParams = new URLSearchParams();
                    
                    // Xử lý start parameter
                    if (params.has('start')) {
                        telegramParams.set('start', params.get('start'));
                    }
                    
                    // Xử lý startgroup parameter
                    if (params.has('startgroup')) {
                        telegramParams.set('startgroup', params.get('startgroup'));
                    }
                    
                    // Xử lý game parameter
                    if (params.has('game')) {
                        telegramParams.set('game', params.get('game'));
                    }

                    if (telegramParams.toString()) {
                        telegramUrl += (telegramUrl.includes('?') ? '&' : '?') + telegramParams.toString();
                    }
                }

                return {
                    telegram: telegramUrl,
                    web: webUrl,
                    original: `t.me${path}${search}${hash}`
                };
            }

            showUrlInfo(urlData) {
                const statusEl = document.getElementById('status');
                const urlInfoEl = document.getElementById('urlInfo');
                const actionsEl = document.getElementById('actions');
                const openTelegramEl = document.getElementById('openTelegram');
                const openWebEl = document.getElementById('openWeb');

                statusEl.className = 'status success';
                statusEl.textContent = 'Liên kết đã được xử lý thành công!';

                urlInfoEl.innerHTML = `
                    <strong>URL gốc:</strong> ${urlData.original}<br>
                    <strong>Deep link:</strong> ${urlData.telegram}<br>
                    <strong>Web fallback:</strong> ${urlData.web}
                `;
                urlInfoEl.style.display = 'block';

                openTelegramEl.href = urlData.telegram;
                openWebEl.href = urlData.web;
                openWebEl.target = '_blank';
                
                actionsEl.style.display = 'block';

                // Lưu URL để sử dụng trong countdown
                this.telegramUrl = urlData.telegram;
                this.webUrl = urlData.web;
            }

            setupRedirect(urlData) {
                const countdownEl = document.getElementById('countdown');
                const timerEl = document.getElementById('timer');
                
                countdownEl.style.display = 'block';
                
                let seconds = 5;
                const interval = setInterval(() => {
                    seconds--;
                    timerEl.textContent = seconds;
                    
                    if (seconds <= 0) {
                        clearInterval(interval);
                        this.redirect(urlData.telegram, urlData.web);
                    }
                }, 1000);
            }

            redirect(telegramUrl, webUrl) {
                // Thử mở ứng dụng Telegram trước
                window.location.href = telegramUrl;
                
                // Fallback sang web sau 2 giây nếu app không mở được
                setTimeout(() => {
                    const userAgent = navigator.userAgent.toLowerCase();
                    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
                    
                    if (isMobile) {
                        // Trên mobile, có thể app đã mở, không cần fallback
                        return;
                    } else {
                        // Trên desktop, mở web version
                        window.open(webUrl, '_blank');
                    }
                }, 2000);
            }

            showError() {
                const statusEl = document.getElementById('status');
                statusEl.className = 'status error';
                statusEl.textContent = 'Không thể xử lý URL này. Vui lòng kiểm tra lại đường dẫn.';
            }
        }

        // Khởi tạo khi trang load xong
        document.addEventListener('DOMContentLoaded', () => {
            new TelegramProxy();
        });

        // Xử lý click vào các nút
        document.addEventListener('click', (e) => {
            if (e.target.id === 'openTelegram') {
                e.preventDefault();
                window.location.href = e.target.href;
            }
        });
    </script>
</body>
</html>
