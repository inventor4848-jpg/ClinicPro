(function () {
    // Create UI elements
    const container = document.createElement('div');
    container.id = 'ai-assistant-container';
    container.innerHTML = `
        <div id="ai-chat-window">
            <div id="ai-chat-header">
                <div class="title">🤖 Klinika Yordamchisi</div>
                <div class="close-btn" id="ai-close">&times;</div>
            </div>
            <div id="ai-messages">
                <div class="ai-msg bot">Assalomu alaykum! Men Klinika Yordamchisiman. Savollaringiz bo'lsa, yordam berishga tayyorman.</div>
            </div>
            <div class="ai-typing" id="ai-typing" style="padding: 0 16px 8px;">AI o'ylamoqda...</div>
            <div id="ai-input-area">
                <input type="text" id="ai-input" placeholder="Savolingizni yozing...">
                <button id="ai-send-btn">➤</button>
            </div>
        </div>
        <div id="ai-btn" title="Klinika Yordamchisi">💬</div>
    `;
    document.body.appendChild(container);

    const btn = document.getElementById('ai-btn');
    const window = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-close');
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const messages = document.getElementById('ai-messages');
    const typing = document.getElementById('ai-typing');
    let chatHistory = [];

    // Toggle window
    btn.onclick = () => {
        window.classList.toggle('active');
        if (window.classList.contains('active')) {
            input.focus();
        }
    };

    closeBtn.onclick = () => {
        window.classList.remove('active');
        // Clear history on close
        messages.innerHTML = `<div class="ai-msg bot">Assalomu alaykum! Men Klinika Yordamchisiman. Savollaringiz bo'lsa, yordam berishga tayyorman.</div>`;
        chatHistory = [];
    };

    // Send logic
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // Add user message to UI
        addMessage(text, 'user');
        chatHistory.push({ role: 'user', content: text });
        input.value = '';

        // Show typing
        typing.style.display = 'block';
        messages.scrollTop = messages.scrollHeight;

        // Prepare context
        const pageId = document.querySelector('.page.active')?.id?.replace('page-', '') ||
            (location.pathname.includes('login') ? 'login' : 'unknown');

        // Get user role if in index.html
        const role = typeof currentRole !== 'undefined' ? currentRole : (sessionStorage.getItem('cp_role') || 'guest');

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: chatHistory.slice(-10), // Send last 10 messages for context
                    context: {
                        page: pageId,
                        role: role,
                        url: location.href
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                addMessage(data.message, 'bot');
                chatHistory.push({ role: 'assistant', content: data.message });
            } else {
                const data = await response.json();
                addMessage("Xatolik: " + (data.error || "Noma'lum xatolik yuz berdi."), 'bot');
            }
        } catch (e) {
            addMessage("Server bilan ulanishda xatolik: " + e.message, 'bot');
        } finally {
            typing.style.display = 'none';
        }
    }

    function addMessage(text, side) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ${side}`;
        msgDiv.textContent = text;
        messages.appendChild(msgDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

})();
