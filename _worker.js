<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegram Proxy</title>
    <meta name="description" content="Thay thế cho t.me bị chặn - Mở tất cả liên kết Telegram">
    <meta property="og:title" content="Telegram Proxy">
    <meta property="og:description" content="Thay thế cho t.me bị chặn">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            text-align: center;
            max-width: 500px;
            width: 100%;
            position: relative;
            overflow: hidden;
        }
        
        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #0088cc, #00a0e6);
        }
        
        .telegram-logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #0088cc, #00a0e6);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: white;
            position: relative;
            box-shadow: 0 10px 20px rgba(0,136,204,0.3);
        }
        
        .telegram-logo::after {
            content: '✈';
            transform: rotate(-45deg);
        }
        
        h1 {
            color: #2c3e50;
            margin-bottom: 8px;
            font-size: 28px;
            font-weight: 700;
        }
        
        .subtitle {
            color: #7f8c8d;
            margin-bottom: 30px;
            font-size: 16px;
            line-height: 1.5;
        }
        
        .status {
            padding: 16px 20px;
            border-radius: 12px;
            margin: 20px 0;
            font-weight: 500;
            font-size: 15px;
            transition: all 0.3s ease;
        }
        
        .status.loading {
            background: linear-gradient(135deg, #e3f2fd, #bbdefb);
            color: #1976d2;
            animation: pulse 2s infinite;
        }
        
        .status.success {
            background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
            color: #2e7d32;
        }
        
        .status.error {
            background: linear-gradient(135deg, #ffebee, #ffcdd2);
            color: #c62828;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        .url-info {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 13px;
            word-break: break-all;
            text-align: left;
            line-height: 1.6;
        }
        
        .url-info strong {
            color: #495057;
            display: block;
            margin-bottom: 5px;
        }
        
        .countdown {
            font-size: 20px;
            font-weight: bold;
            color: #0088cc;
            margin: 25px 0;
            padding: 15px;
            background: rgba(0,136,204,0.1);
            border-radius: 12px;
        }
        
        .countdown #timer {
            font-size: 24px;
            color: #0066aa;
        }
        
        .actions {
            margin-top: 30px;
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            background: linear-gradient(135deg, #0088cc, #0066aa);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,136,204,0.3);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,136,204,0.4);
        }
        
        .btn:active {
            transform: translateY(0);
        }
        
        .btn.secondary {
            background: linear-gradient(135deg, #6c757d, #5a6268);
            box-shadow: 0 4px 15px rgba(108,117,125,0.3);
        }
        
        .btn.secondary:hover {
            box-shadow: 0 6px 20px rgba(108,117,125,0.4);
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 14px;
            color: #6c757d;
            line-height: 1.5;
        }
        
        .loading-dots {
            display: inline-block;
        }
        
        .loading-dots::after {
            content: '';
            animation: dots 1.5s steps(5, end) infinite;
        }
        
        @keyframes dots {
            0%, 20% { content: ''; }
            40% { content: '.'; }
            60% { content: '..'; }
            80%, 100% { content: '...'; }
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                padding: 30px 20px;
            }
            
            .actions {
                flex-direction: column;
            }
            
            .btn {
                width: 100%;
                justify-content: center;
            }
            
            h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="telegram-logo"></div>
        <h1>Telegram Proxy</h1>
        <p class="subtitle">Thay thế hoàn hảo cho t.me bị chặn<br>Hỗ trợ tất cả tính năng Telegram</p>
        
        <div id="status" class="status loading">
            <span class="loading-dots">Đang xử lý liên kết</span>
        </div>
        
        <div id="urlInfo" class="url-info" style="display: none;"></div>
        
        <div id="countdown" class="countdown" style="display: none;">
            Tự động mở Telegram sau <span id="timer">5</span> giây
        </div>
        
        <div id="actions" class="actions" style="display: none;">
            <a id="openTelegram" href="#" class="btn">
                ✈ Mở Telegram
            </a>
            <a id="openWeb" href="#" class="btn secondary" target="_blank">
                🌐 Mở trên Web
            </a>
        </div>
        
        <div class="footer">
            <p><strong>t.bibica.net</strong> - Proxy thay thế cho t.me</p>
            <p>Hỗ trợ: Channels, Groups, Bots, Stickers, Proxy Settings</p>
        </div>
    </div>

    <script>
        class TelegramProxy {
            constructor() {
                this.baseUrl = 'https://t.me';
                this.init();
            }

            init() {
                try {
                    const path = window.location.pathname;
                    const search = window.location.search;
                    const hash = window.location.hash;
                    
                    console.log('Processing URL:', { path, search, hash });
                    
                    const urlData = this.processUrl(path, search, hash);
                    
                    if (urlData && urlData.telegram) {
                        this.showSuccess(urlData);
                        this.startCountdown(urlData);
                    } else {
                        this.showHomePage();
                    }
                } catch (error) {
                    console.error('Error processing URL:', error);
                    this.showError('Có lỗi xảy ra khi xử lý liên kết');
                }
            }

            processUrl(path, search, hash) {
                const cleanPath = path.replace(/^\/+|\/+$/g, '');
                
                if (!cleanPath) {
                    return null;
                }

                let telegramUrl = '';
                let webUrl = this.baseUrl + path + search + hash;
                const originalUrl = `t.me${path}${search}${hash}`;

                try {
                    // Xử lý các loại URL Telegram
                    if (cleanPath.match(/^s\/\w+/)) {
                        // Sticker set: s/stickername
                        const stickerName = cleanPath.substring(2);
                        telegramUrl = `tg://addstickers?set=${encodeURIComponent(stickerName)}`;
                    } 
                    else if (cleanPath.match(/^addstickers\/\w+/)) {
                        // Add stickers: addstickers/stickername
                        const stickerName = cleanPath.substring(12);
                        telegramUrl = `tg://addstickers?set=${encodeURIComponent(stickerName)}`;
                    }
                    else if (cleanPath.match(/^joinchat\/.+/)) {
                        // Join chat: joinchat/xxxxx
                        const inviteCode = cleanPath.substring(9);
                        telegramUrl = `tg://join?invite=${encodeURIComponent(inviteCode)}`;
                    }
                    else if (cleanPath.match(/^\+.+/)) {
                        // Invite link: +xxxxx
                        const inviteCode = cleanPath.substring(1);
                        telegramUrl = `tg://join?invite=${encodeURIComponent(inviteCode)}`;
                    }
                    else if (cleanPath === 'proxy' && search) {
                        // Proxy settings
                        const params = new URLSearchParams(search);
                        const server = params.get('server');
                        const port = params.get('port');
                        const secret = params.get('secret');
                        
                        if (server && port && secret) {
                            telegramUrl = `tg://proxy?server=${encodeURIComponent(server)}&port=${encodeURIComponent(port)}&secret=${encodeURIComponent(secret)}`;
                        }
                    }
                    else if (cleanPath === 'socks' && search) {
                        // SOCKS proxy
                        const params = new URLSearchParams(search);
                        const server = params.get('server');
                        const port = params.get('port');
                        const user = params.get('user') || '';
                        const pass = params.get('pass') || '';
                        
                        if (server && port) {
                            telegramUrl = `tg://socks?server=${encodeURIComponent(server)}&port=${encodeURIComponent(port)}&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`;
                        }
                    }
                    else if (cleanPath.includes('/')) {
                        // Channel with message: channel/123
                        const parts = cleanPath.split('/');
                        const channel = parts[0];
                        const messageId = parts[1];
                        
                        if (messageId && messageId.match(/^\d+$/)) {
                            telegramUrl = `tg://resolve?domain=${encodeURIComponent(channel)}&post=${encodeURIComponent(messageId)}`;
                        } else {
                            telegramUrl = `tg://resolve?domain=${encodeURIComponent(channel)}`;
                        }
                    }
                    else if (cleanPath.match(/^[a-zA-Z0-9_]+$/)) {
                        // Simple username: username
                        telegramUrl = `tg://resolve?domain=${encodeURIComponent(cleanPath)}`;
                    }

                    // Thêm parameters bổ sung
                    if (telegramUrl && search) {
                        const params = new URLSearchParams(search);
                        const telegramParams = new URLSearchParams();
                        
                        ['start', 'startgroup', 'game', 'voicechat', 'videochat'].forEach(param => {
                            if (params.has(param)) {
                                telegramParams.set(param, params.get(param));
                            }
                        });

                        if (telegramParams.toString()) {
                            const separator = telegramUrl.includes('?') ? '&' : '?';
                            telegramUrl += separator + telegramParams.toString();
                        }
                    }

                    return telegramUrl ? {
                        telegram: telegramUrl,
                        web: webUrl,
                        original: originalUrl
                    } : null;

                } catch (error) {
                    console.error('Error in processUrl:', error);
                    return null;
                }
            }

            showSuccess(urlData) {
                const statusEl = document.getElementById('status');
                const urlInfoEl = document.getElementById('urlInfo');
                const actionsEl = document.getElementById('actions');

                statusEl.className = 'status success';
                statusEl.innerHTML = '✅ Liên kết đã được xử lý thành công!';

                urlInfoEl.innerHTML = `
                    <strong>🔗 URL gốc:</strong> ${this.escapeHtml(urlData.original)}<br><br>
                    <strong>📱 Deep link:</strong> ${this.escapeHtml(urlData.telegram)}<br><br>
                    <strong>🌐 Web fallback:</strong> ${this.escapeHtml(urlData.web)}
                `;
                urlInfoEl.style.display = 'block';

                document.getElementById('openTelegram').href = urlData.telegram;
                document.getElementById('openWeb').href = urlData.web;
                
                actionsEl.style.display = 'flex';
                
                this.urlData = urlData;
            }

            showHomePage() {
                const statusEl = document.getElementById('status');
                statusEl.className = 'status';
                statusEl.style.background = 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
                statusEl.style.color = '#495057';
                statusEl.innerHTML = '🏠 Trang chủ Telegram Proxy<br><small>Thay thế URL t.me/xxx bằng t.bibica.net/xxx</small>';
            }

            showError(message) {
                const statusEl = document.getElementById('status');
                statusEl.className = 'status error';
                statusEl.innerHTML = `❌ ${message}`;
            }

            startCountdown(urlData) {
                const countdownEl = document.getElementById('countdown');
                const timerEl = document.getElementById('timer');
                
                countdownEl.style.display = 'block';
                
                let seconds = 5;
                const interval = setInterval(() => {
                    seconds--;
                    timerEl.textContent = seconds;
                    
                    if (seconds <= 0) {
                        clearInterval(interval);
                        this.redirectToTelegram(urlData);
                    }
                }, 1000);
            }

            redirectToTelegram(urlData) {
                try {
                    // Thử mở app Telegram
                    window.location.href = urlData.telegram;
                    
                    // Fallback cho desktop browsers
                    setTimeout(() => {
                        if (!this.isMobile() && !document.hidden) {
                            window.open(urlData.web, '_blank');
                        }
                    }, 1500);
                } catch (error) {
                    console.error('Redirect error:', error);
                    window.open(urlData.web, '_blank');
                }
            }

            isMobile() {
                return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            }

            escapeHtml(unsafe) {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }
        }

        // Khởi tạo khi DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => new TelegramProxy());
        } else {
            new TelegramProxy();
        }

        // Xử lý click events
        document.addEventListener('click', (e) => {
            if (e.target.id === 'openTelegram') {
                e.preventDefault();
                window.location.href = e.target.href;
            }
        });
    </script>
</body>
</html>
