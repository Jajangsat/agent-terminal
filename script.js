// AGENT TERMINAL v3.0 — MODERN SAAS AESTHETIC
// Zero dependencies. Clean, gradient, minimalist.
(function() {
    'use strict';

// ========== STATE ==========
    const state = {
        sessions: {},
        currentSessionId: null,
        settings: {
            apiUrl: '',
            apiKey: '',
            chatModel: 'gpt-4o',
            imageModel: 'dall-e-3',
            systemPrompt: 'You are a powerful AI agent capable of answering questions, generating ideas, creating solutions, and assisting with various tasks. Be concise, direct, and helpful. Format your responses using markdown when appropriate.',
            temperature: 0.7,
            accessPassword: '',
            searchApiKey: ''
        },
        isLoading: false,
        darkMode: false,
        availableModels: [],
        reasoningMode: false,
        debugMode: false,
        webSearchEnabled: false
    };

    // ========== DOM ==========
    const dom = {
        landingView: document.getElementById('landingView'),
        appView: document.getElementById('appView'),

        // Landing
        launchBtn: document.getElementById('launchBtn'),
        launchBtn2: document.getElementById('launchBtn2'),
        launchBtn3: document.getElementById('launchBtn3'),
        openSettingsBtn: document.getElementById('openSettingsBtn'),

        // App
        homeBtn: document.getElementById('homeBtn'),
        newChatBtn: document.getElementById('newChatBtn'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        historyList: document.getElementById('historyList'),
        messagesContainer: document.getElementById('messagesContainer'),
        welcomeMessage: document.getElementById('welcomeMessage'),
        messageInput: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendBtn'),
        imageModeBtn: document.getElementById('imageModeBtn'),
        chatView: document.getElementById('chatView'),
        imageView: document.getElementById('imageView'),
        imagePromptInput: document.getElementById('imagePromptInput'),
        imageSize: document.getElementById('imageSize'),
        imageQuality: document.getElementById('imageQuality'),
        generateImageBtn: document.getElementById('generateImageBtn'),
        backToChatBtn: document.getElementById('backToChatBtn'),
        imageResult: document.getElementById('imageResult'),
        statusDot: document.getElementById('statusDot'),
        statusText: document.getElementById('statusText'),
        modelSelect: document.getElementById('modelSelect'),
        chatToolbarTitle: document.getElementById('chatToolbarTitle'),
        copyChatBtn: document.getElementById('copyChatBtn'),
        exportChatBtn: document.getElementById('exportChatBtn'),
        clearChatBtn: document.getElementById('clearChatBtn'),

        // Settings Modal
        settingsModal: document.getElementById('settingsModal'),
        closeSettings: document.getElementById('closeSettings'),
        saveSettings: document.getElementById('saveSettings'),
        testConnection: document.getElementById('testConnection'),
        apiUrl: document.getElementById('apiUrl'),
        apiKey: document.getElementById('apiKey'),
        chatModel: document.getElementById('chatModel'),
        imageModel: document.getElementById('imageModel'),
        systemPrompt: document.getElementById('systemPrompt'),
        accessPassword: document.getElementById('accessPassword'),
        temperature: document.getElementById('temperature'),
        tempValue: document.getElementById('tempValue')
    };

    // ========== INIT ==========
    function init() {
        loadSettings();
        loadSessions();
        setupEventListeners();
        updateStatus();
        populateModelSelect();

        // Try to fetch models if API is configured
        if (state.settings.apiUrl && state.settings.apiKey) {
            fetchModels();
        }

        if (Object.keys(state.sessions).length > 0) {
            const sorted = Object.values(state.sessions).sort((a, b) => b.updatedAt - a.updatedAt);
            state.currentSessionId = sorted[0].id;
        }
    }

    // ========== EVENT LISTENERS ==========
    function setupEventListeners() {
        // Launch buttons
        [dom.launchBtn, dom.launchBtn2, dom.launchBtn3].forEach(btn => {
            if (btn) btn.addEventListener('click', launchApp);
        });

        // Settings
        if (dom.openSettingsBtn) dom.openSettingsBtn.addEventListener('click', openSettings);
        dom.closeSettings.addEventListener('click', closeSettings);
        dom.saveSettings.addEventListener('click', saveSettingsHandler);
        dom.testConnection.addEventListener('click', testConnectionHandler);
        dom.testModelBtn = document.getElementById('testModelBtn');
        if (dom.testModelBtn) {
            dom.testModelBtn.addEventListener('click', testCurrentModel);
        }
        dom.settingsModal.addEventListener('click', (e) => {
            if (e.target === dom.settingsModal) closeSettings();
        });

        // Show warning for agentrouter
        dom.apiUrl.addEventListener('input', () => {
            const warning = document.getElementById('agentRouterWarning');
            if (warning) {
                warning.style.display = dom.apiUrl.value.includes('agentrouter.org') ? 'block' : 'none';
            }
        });

        // App navigation
        dom.homeBtn.addEventListener('click', showLanding);
        dom.newChatBtn.addEventListener('click', createNewSession);
        dom.clearHistoryBtn.addEventListener('click', clearAllSessions);
        dom.sendBtn.addEventListener('click', sendMessage);
        dom.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        dom.messageInput.addEventListener('input', autoResize);
        dom.imageModeBtn.addEventListener('click', () => switchView('imageView'));
        dom.backToChatBtn.addEventListener('click', () => switchView('chatView'));
        dom.generateImageBtn.addEventListener('click', generateImage);

        // Search & Answer button
        dom.searchAnswerBtn = document.getElementById('searchAnswerBtn');
        if (dom.searchAnswerBtn) {
            dom.searchAnswerBtn.addEventListener('click', searchAndAnswer);
        }
        dom.searchAnswerBtn2 = document.getElementById('searchAnswerBtn2');
        if (dom.searchAnswerBtn2) {
            dom.searchAnswerBtn2.addEventListener('click', searchAndAnswer);
        }

        // Model select sync
        dom.modelSelect.addEventListener('change', () => {
            state.settings.chatModel = dom.modelSelect.value;
            saveSettings();
        });

        // Reasoning mode toggle
        dom.reasoningModeBtn = document.getElementById('reasoningModeBtn');
        if (dom.reasoningModeBtn) {
            dom.reasoningModeBtn.addEventListener('click', toggleReasoningMode);
        }

        // Web search toggle
        dom.searchToggleBtn = document.getElementById('searchToggleBtn');
        dom.searchPanel = document.getElementById('searchPanel');
        dom.searchCloseBtn = document.getElementById('searchCloseBtn');
        dom.searchQueryInput = document.getElementById('searchQueryInput');
        dom.searchExecuteBtn = document.getElementById('searchExecuteBtn');
        dom.searchResults = document.getElementById('searchResults');

        if (dom.searchToggleBtn) {
            dom.searchToggleBtn.addEventListener('click', () => {
                state.webSearchEnabled = !state.webSearchEnabled;
                dom.searchPanel.style.display = state.webSearchEnabled ? 'flex' : 'none';
                dom.searchToggleBtn.classList.toggle('reasoning-active', state.webSearchEnabled);
                dom.searchToggleBtn.textContent = state.webSearchEnabled ? 'Search ON' : 'Search';
            });
        }
        if (dom.searchCloseBtn) {
            dom.searchCloseBtn.addEventListener('click', () => {
                state.webSearchEnabled = false;
                dom.searchPanel.style.display = 'none';
                if (dom.searchToggleBtn) {
                    dom.searchToggleBtn.classList.remove('reasoning-active');
                    dom.searchToggleBtn.textContent = 'Search';
                }
            });
        }
        if (dom.searchExecuteBtn) {
            dom.searchExecuteBtn.addEventListener('click', executeManualSearch);
        }
        if (dom.searchQueryInput) {
            dom.searchQueryInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') executeManualSearch();
            });
        }

        // Refresh models button
        dom.refreshModelsBtn = document.getElementById('refreshModelsBtn');
        if (dom.refreshModelsBtn) {
            dom.refreshModelsBtn.addEventListener('click', () => {
                fetchModels();
                dom.refreshModelsBtn.textContent = 'Refreshing...';
                setTimeout(() => { dom.refreshModelsBtn.textContent = 'Refresh Models'; }, 2000);
            });
        }

        // Debug panel toggle
        dom.debugToggleBtn = document.getElementById('debugToggleBtn');
        dom.debugPanel = document.getElementById('debugPanel');
        dom.debugContent = document.getElementById('debugContent');
        dom.debugCloseBtn = document.getElementById('debugCloseBtn');

        if (dom.debugToggleBtn) {
            dom.debugToggleBtn.addEventListener('click', () => {
                state.debugMode = !state.debugMode;
                dom.debugPanel.style.display = state.debugMode ? 'block' : 'none';
                dom.debugToggleBtn.classList.toggle('reasoning-active', state.debugMode);
            });
        }
        if (dom.debugCloseBtn) {
            dom.debugCloseBtn.addEventListener('click', () => {
                state.debugMode = false;
                dom.debugPanel.style.display = 'none';
                dom.debugToggleBtn.classList.remove('reasoning-active');
            });
        }

        // Toolbar actions
        dom.copyChatBtn.addEventListener('click', copyChat);
        dom.exportChatBtn.addEventListener('click', exportChat);
        dom.clearChatBtn.addEventListener('click', clearCurrentSession);

        // Temperature
        dom.temperature.addEventListener('input', () => {
            dom.tempValue.textContent = parseFloat(dom.temperature.value).toFixed(1);
        });

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (id === '#') return;
                e.preventDefault();
                const target = document.querySelector(id);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openSettings();
            }
            if (e.key === 'Escape' && dom.settingsModal.classList.contains('active')) {
                closeSettings();
            }
        });
    }

    // ========== VIEW MANAGEMENT ==========
    function launchApp(e) {
        if (e) e.preventDefault();

        if (state.settings.accessPassword) {
            const input = prompt('Enter access password:');
            if (input === null) return;
            if (input !== state.settings.accessPassword) {
                alert('Access denied');
                return;
            }
        }

        document.body.classList.add('app-active');
        renderHistory();
        renderMessages();

        if (!state.currentSessionId) {
            createNewSession();
        }
    }

    function showLanding() {
        document.body.classList.remove('app-active');
    }

    function switchView(viewId) {
        document.getElementById('chatView').style.display = 'none';
        document.getElementById('imageView').classList.remove('active');
        document.getElementById('imageView').style.display = 'none';

        if (viewId === 'imageView') {
            document.getElementById('imageView').style.display = 'flex';
            setTimeout(() => document.getElementById('imageView').classList.add('active'), 10);
        } else {
            document.getElementById('chatView').style.display = 'flex';
        }
    }

    // ========== SESSION MANAGEMENT ==========
    function createNewSession() {
        const id = 'session_' + Date.now();
        state.sessions[id] = {
            id,
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        state.currentSessionId = id;
        saveSessions();
        renderHistory();
        renderMessages();
    }

    function switchSession(id) {
        state.currentSessionId = id;
        renderHistory();
        renderMessages();
    }

    function deleteSession(id, e) {
        if (e) e.stopPropagation();
        delete state.sessions[id];
        if (state.currentSessionId === id) {
            const sorted = Object.values(state.sessions).sort((a, b) => b.updatedAt - a.updatedAt);
            if (sorted.length > 0) {
                state.currentSessionId = sorted[0].id;
                renderMessages();
            } else {
                state.currentSessionId = null;
                createNewSession();
                return;
            }
        }
        saveSessions();
        renderHistory();
    }

    function clearAllSessions() {
        if (Object.keys(state.sessions).length === 0) return;
        if (!confirm('Clear all chat sessions?')) return;
        state.sessions = {};
        state.currentSessionId = null;
        saveSessions();
        renderHistory();
        renderMessages();
    }

    function clearCurrentSession() {
        const session = state.sessions[state.currentSessionId];
        if (!session || session.messages.length === 0) return;
        if (!confirm('Clear this session?')) return;
        session.messages = [];
        session.updatedAt = Date.now();
        saveSessions();
        renderMessages();
        renderHistory();
    }

    // ========== REASONING MODE ==========
    function toggleReasoningMode() {
        state.reasoningMode = !state.reasoningMode;
        const btn = dom.reasoningModeBtn;
        if (btn) {
            btn.classList.toggle('reasoning-active', state.reasoningMode);
            btn.textContent = state.reasoningMode ? 'Reasoning ON' : 'Reasoning';
        }
    }

    async function executeManualSearch() {
        const query = dom.searchQueryInput.value.trim();
        if (!query) return;

        dom.searchResults.innerHTML = '<div class="search-placeholder">Searching...</div>';

        try {
            const results = await performWebSearch(query);
            const formatted = formatSearchResults(results);

            dom.searchResults.innerHTML = results.map((r, i) => `
                <div class="search-result-item">
                    <div class="search-result-title">${escapeHtml(r.title)}</div>
                    <div class="search-result-snippet">${escapeHtml(r.snippet)}</div>
                    <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener" class="search-result-url">${escapeHtml(r.url)}</a>
                    <button class="search-send-btn" data-results='${escapeAttr(JSON.stringify(results))}' data-index="${i}">Send to Chat</button>
                </div>
            `).join('');

            // Add send to chat buttons
            dom.searchResults.querySelectorAll('.search-send-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const results = JSON.parse(btn.dataset.results);
                    const selected = results[parseInt(btn.dataset.index)];
                    const text = `Here are search results for "${query}":\n\n${formatSearchResults([selected])}\n\nPlease analyze this information and answer my question.`;
                    dom.messageInput.value = text;
                    autoResize();
                    sendMessage();
                });
            });
        } catch (error) {
            dom.searchResults.innerHTML = `<div class="search-placeholder" style="color:var(--error)">Search failed: ${escapeHtml(error.message)}</div>`;
        }
    }

    async function searchAndAnswer() {
        const content = dom.messageInput.value.trim();
        if (!content || state.isLoading) return;

        if (!state.settings.apiUrl || !state.settings.apiKey) {
            alert('Please configure API settings first');
            openSettings();
            return;
        }

        ensureSession();
        const session = state.sessions[state.currentSessionId];
        if (!session) return;

        if (dom.welcomeMessage) dom.welcomeMessage.style.display = 'none';

        // Show search indicator
        const searchDiv = document.createElement('div');
        searchDiv.className = 'typing-indicator';
        searchDiv.id = 'searchIndicator';
        searchDiv.style.maxWidth = '250px';
        searchDiv.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div><div style="font-size:0.7rem;color:var(--primary);margin-top:4px;font-family:var(--font)">Searching web for: ${escapeHtml(content)}...</div>`;
        dom.messagesContainer.appendChild(searchDiv);
        scrollToBottom();

        // Perform search
        let searchContext = '';
        try {
            const results = await performWebSearch(content);
            searchContext = formatSearchResults(results);
        } catch (error) {
            searchContext = 'Web search unavailable. Answering from training data.';
        }

        removeTypingIndicator();

        // Combine user message with search results
        const enhancedMessage = `I need to answer this question with the most current information available.\n\nQuestion: ${content}\n\nHere are the latest search results from the web:\n\n${searchContext}\n\nPlease analyze the search results above and provide a comprehensive, accurate answer based on this current information. Cite your sources when possible.`;

        session.messages.push({ role: 'user', content: enhancedMessage, timestamp: Date.now() });
        session.updatedAt = Date.now();
        if (session.messages.length === 1) {
            session.title = content.substring(0, 40) + (content.length > 40 ? '...' : '');
        }

        dom.messageInput.value = '';
        autoResize();
        renderMessages();
        saveSessions();
        renderHistory();

        // Now send normally
        state.isLoading = true;
        updateSendButton();

        try {
            const currentModel = dom.modelSelect.value;
            const systemPrompt = getSystemPrompt();
            const messages = [
                { role: 'system', content: systemPrompt },
                ...session.messages.map(m => ({ role: m.role, content: m.content }))
            ];

            const requestBody = {
                model: currentModel,
                messages,
                temperature: state.reasoningMode ? 0.3 : parseFloat(state.settings.temperature)
            };

            const response = await callApi('chat/completions', requestBody);
            const assistantContent = response.choices[0].message.content;

            session.messages.push({
                role: 'assistant',
                content: assistantContent,
                timestamp: Date.now()
            });
        } catch (error) {
            session.messages.push({
                role: 'assistant',
                content: '[ERROR] ' + error.message,
                timestamp: Date.now()
            });
        }

        state.isLoading = false;
        updateSendButton();
        renderMessages({ animateMessageIndex: session.messages.length - 1 });
        saveSessions();
    }

    function getSystemPrompt() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const dateContext = `\n\nCurrent date: ${dateStr}. Always reference the current date when answering time-sensitive questions.`;

        let basePrompt;
        if (state.reasoningMode) {
            basePrompt = 'You are an expert AI analyst with deep reasoning capabilities. When answering questions:\n\n1. Think step by step and explain your reasoning process\n2. Consider multiple perspectives before concluding\n3. Acknowledge uncertainty when appropriate\n4. Provide evidence-based conclusions\n5. Use structured analysis for complex problems\n6. Break down complex topics into understandable parts\n\nBe thorough, precise, and intellectually honest. Format your responses using markdown when appropriate.';
        } else {
            basePrompt = state.settings.systemPrompt;
        }

        return basePrompt + dateContext;
    }

    // ========== DEBUG LOG ==========
    function addDebugLog(type, data) {
        if (!dom.debugContent) return;

        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'debug-request';

        let html = `<div class="debug-label">[${time}] ${type}</div>`;

        if (type === 'REQUEST') {
            html += `<div class="debug-value">URL: ${data.url}</div>`;
            html += `<div class="debug-value">Model: ${data.model}</div>`;
            html += `<div class="debug-value">Temperature: ${data.temperature}</div>`;
            html += `<div class="debug-value">Messages: ${data.messageCount}</div>`;
            html += `<div class="debug-value" style="color:#fbbf24">System: ${data.systemPrompt}</div>`;
        } else if (type === 'RESPONSE') {
            html += `<div class="debug-success">✓ Model: ${data.model}</div>`;
            html += `<div class="debug-value">Usage: ${data.usage}</div>`;
            html += `<div class="debug-value">Finish: ${data.finishReason}</div>`;
            html += `<div class="debug-value">Content: ${data.contentLength}</div>`;
        } else if (type === 'ERROR') {
            html += `<div class="debug-error">✗ ${data.message}</div>`;
        }

        entry.innerHTML = html;
        dom.debugContent.prepend(entry);

        // Keep only last 10 entries
        while (dom.debugContent.children.length > 10) {
            dom.debugContent.removeChild(dom.debugContent.lastChild);
        }
    }

    // ========== WEB SEARCH TOOL ==========
    async function performWebSearch(query) {
        try {
            const encodedQuery = encodeURIComponent(query);
            // Use AllOrigins CORS proxy to fetch DuckDuckGo results
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://html.duckduckgo.com/html/?q=${encodedQuery}`)}`;

            const response = await fetch(proxyUrl, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Proxy request failed');

            const data = await response.json();
            const html = data.contents;

            if (!html) throw new Error('No content returned');

            const results = [];

            // Extract result links and titles
            const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g;
            let match;
            let i = 0;

            while ((match = resultRegex.exec(html)) !== null && i < 5) {
                let url = match[1];
                // Clean up DuckDuckGo redirect URLs
                if (url.startsWith('//')) url = 'https:' + url;
                const title = match[2].replace(/<[^>]*>/g, '').trim();

                if (title && url) {
                    results.push({ title, url, snippet: '' });
                }
                i++;
            }

            // Extract snippets
            const snippetRegex = /<div[^>]*class="result__snippet"[^>]*>(.*?)<\/div>/g;
            const snippets = [];
            let snippetMatch;
            while ((snippetMatch = snippetRegex.exec(html)) !== null) {
                snippets.push(snippetMatch[1].replace(/<[^>]*>/g, '').trim());
            }

            results.forEach((r, idx) => {
                if (snippets[idx]) r.snippet = snippets[idx];
            });

            if (results.length === 0) {
                throw new Error('No results found');
            }

            return results;
        } catch (error) {
            // Fallback: try alternative approach with a simpler proxy
            try {
                const encodedQuery = encodeURIComponent(query);
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://duckduckgo.com/html/?q=${encodedQuery}`)}`;

                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error('Alternative proxy failed');

                const html = await response.text();
                const results = [];

                const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g;
                let match;
                let i = 0;

                while ((match = resultRegex.exec(html)) !== null && i < 5) {
                    let url = match[1];
                    if (url.startsWith('//')) url = 'https:' + url;
                    const title = match[2].replace(/<[^>]*>/g, '').trim();
                    if (title && url) results.push({ title, url, snippet: '' });
                    i++;
                }

                if (results.length > 0) return results;
            } catch (e2) {
                // Both proxies failed
            }

            return [{
                title: 'Search Unavailable',
                url: '',
                snippet: `Could not perform web search: ${error.message}. The model will answer based on its training data.`
            }];
        }
    }

    function formatSearchResults(results) {
        return results.map((r, i) =>
            `${i + 1}. **${r.title}**\n   ${r.snippet}\n   URL: ${r.url}`
        ).join('\n\n');
    }

    // ========== CHAT ==========
    function ensureSession() {
        if (!state.currentSessionId || !state.sessions[state.currentSessionId]) {
            createNewSession();
        }
    }

    async function sendMessage() {
        const content = dom.messageInput.value.trim();
        if (!content || state.isLoading) return;

        if (!state.settings.apiUrl || !state.settings.apiKey) {
            if (dom.welcomeMessage) dom.welcomeMessage.style.display = 'none';
            ensureSession();
            const session = state.sessions[state.currentSessionId];
            if (session) {
                session.messages.push({
                    role: 'assistant',
                    content: '[ERROR] API not configured!\n\n1. Click Settings in the nav bar\n2. Enter your API URL (e.g., https://api.openai.com/v1)\n3. Enter your API Key\n4. Click Save Settings\n5. Click Test Connection',
                    timestamp: Date.now()
                });
                renderMessages();
            }
            openSettings();
            return;
        }

        ensureSession();
        const session = state.sessions[state.currentSessionId];
        if (!session) return;

        if (dom.welcomeMessage) dom.welcomeMessage.style.display = 'none';

        session.messages.push({ role: 'user', content, timestamp: Date.now() });
        session.updatedAt = Date.now();
        if (session.messages.length === 1) {
            session.title = content.substring(0, 40) + (content.length > 40 ? '...' : '');
        }

        dom.messageInput.value = '';
        autoResize();
        renderMessages();
        saveSessions();
        renderHistory();
        showTypingIndicator();

        state.isLoading = true;
        updateSendButton();

        try {
            const currentModel = dom.modelSelect.value;
            const systemPrompt = getSystemPrompt();
            const messages = [
                { role: 'system', content: systemPrompt },
                ...session.messages.map(m => ({ role: m.role, content: m.content }))
            ];

            const requestBody = {
                model: currentModel,
                messages,
                temperature: state.reasoningMode ? 0.3 : parseFloat(state.settings.temperature)
            };

            // Log debug info
            if (state.debugMode) {
                addDebugLog('REQUEST', {
                    url: state.settings.apiUrl.replace(/\/+$/, '') + '/chat/completions',
                    model: currentModel,
                    temperature: requestBody.temperature,
                    systemPrompt: systemPrompt.substring(0, 200) + '...',
                    messageCount: messages.length
                });
            }

            const response = await callApi('chat/completions', requestBody);

            const assistantContent = response.choices[0].message.content;

            // Log response debug
            if (state.debugMode) {
                addDebugLog('RESPONSE', {
                    model: response.model || currentModel,
                    usage: response.usage ? JSON.stringify(response.usage) : 'N/A',
                    finishReason: response.choices[0].finish_reason || 'stop',
                    contentLength: assistantContent.length + ' chars'
                });
            }

            session.messages.push({
                role: 'assistant',
                content: assistantContent,
                timestamp: Date.now()
            });
        } catch (error) {
            session.messages.push({
                role: 'assistant',
                content: '[ERROR] ' + error.message,
                timestamp: Date.now()
            });

            if (state.debugMode) {
                addDebugLog('ERROR', {
                    message: error.message,
                    stack: error.stack
                });
            }
        }

        state.isLoading = false;
        updateSendButton();
        removeTypingIndicator();
        renderMessages({ animateMessageIndex: session.messages.length - 1 });
        saveSessions();
    }

    async function callApi(endpoint, body) {
        const url = state.settings.apiUrl.replace(/\/+$/, '') + '/' + endpoint;
        console.log('API Request:', url);

        // Detect aggregator APIs and add required headers
        const isOpenRouter = state.settings.apiUrl.includes('openrouter.ai');
        const isAgentRouter = state.settings.apiUrl.includes('agentrouter.org');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + state.settings.apiKey
        };

        if (isOpenRouter || isAgentRouter) {
            headers['HTTP-Referer'] = window.location.origin;
            headers['X-Title'] = 'Agent Terminal';
            headers['X-Request-Source'] = 'web';
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                console.error('API Error:', response.status, error);

                // Special handling for agentrouter unauthorized client error
                if (error.type === 'unauthorized_client_error') {
                    throw new Error('AgentRouter requires specific client configuration. This API may not support browser-based requests directly. Try using a server-side proxy or contact AgentRouter support (Discord: https://discord.gg/aYq5B4RW3) for browser access setup.');
                }

                throw new Error(error.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                throw new Error('CORS/Network error. Check your API URL or use a CORS proxy.');
            }
            throw error;
        }
    }

    // ========== DYNAMIC MODELS ==========
    async function fetchModels() {
        if (!state.settings.apiUrl || !state.settings.apiKey) return;

        const url = state.settings.apiUrl.replace(/\/+$/, '') + '/models';
        console.log('Fetching models from:', url);

        const select = dom.modelSelect;
        if (select) {
            select.style.opacity = '0.5';
            select.disabled = true;
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': 'Bearer ' + state.settings.apiKey
                }
            });

            console.log('Models response status:', response.status);

            if (!response.ok) {
                const errText = await response.text().catch(() => '');
                console.warn('Failed to fetch models:', response.status, errText);
                if (select) { select.style.opacity = '1'; select.disabled = false; }
                return;
            }

            const data = await response.json();
            console.log('Models response:', data);

            const models = data.data || [];
            console.log('Raw models count:', models.length);

            // Filter chat-compatible models
            const chatModels = models.filter(m => {
                const id = m.id.toLowerCase();
                if (id.includes('embedding') || id.includes('image') ||
                    id.includes('whisper') || id.includes('tts') ||
                    id.includes('moderation') || id.includes('davinci-similarity') ||
                    id.includes('cinnamon') || id.includes('code-') ||
                    id.includes('dall-e') || id.includes('tts')) return false;
                return true;
            }).map(m => m.id);

            console.log('Filtered chat models:', chatModels.length);

            // Add common defaults if none found or if list is very small
            if (chatModels.length === 0) {
                console.log('No models found, using defaults');
                const defaults = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo',
                    'claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku',
                    'gemini-pro', 'gemini-1.5-pro', 'llama-3.1-70b', 'llama-3.1-8b', 'mixtral-8x7b'];
                defaults.forEach(d => chatModels.push(d));
            }

            state.availableModels = chatModels.slice(0, 50);
            console.log('Final models:', state.availableModels);
            populateModelSelect();

        } catch (error) {
            console.warn('Error fetching models:', error.message);
        } finally {
            if (select) { select.style.opacity = '1'; select.disabled = false; }
        }
    }

    function populateModelSelect() {
        const select = dom.modelSelect;
        if (!select) return;

        const current = select.value;
        const models = state.availableModels.length > 0 ? state.availableModels :
            ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo',
             'claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku',
             'gemini-pro', 'gemini-1.5-pro', 'llama-3.1-70b', 'llama-3.1-8b', 'mixtral-8x7b'];

        select.innerHTML = '';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            select.appendChild(option);
        });

        // Try to restore previous selection
        if (models.includes(current)) {
            select.value = current;
        } else if (models.includes(state.settings.chatModel)) {
            select.value = state.settings.chatModel;
        }
    }

    // ========== IMAGE GENERATION ==========
    async function generateImage() {
        const prompt = dom.imagePromptInput.value.trim();
        if (!prompt || state.isLoading) return;

        if (!state.settings.apiUrl || !state.settings.apiKey) {
            alert('Please configure API settings first!');
            openSettings();
            return;
        }

        state.isLoading = true;
        dom.imageResult.innerHTML = '<div class="app-image-placeholder"><div class="icon">⏳</div><p>Generating your image...</p></div>';

        try {
            const response = await callApi('images/generations', {
                model: state.settings.imageModel,
                prompt,
                n: 1,
                size: dom.imageSize.value,
                quality: dom.imageQuality.value
            });

            const imageUrl = response.data[0].url;
            const dlId = 'dl_' + Date.now();
            dom.imageResult.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:16px;max-width:100%">
                    <img src="${imageUrl}" alt="${escapeHtml(prompt)}" class="app-generated-image" />
                    <div class="app-image-actions">
                        <button onclick="window.open('${imageUrl}','_blank')" class="btn btn-sm btn-outline">Open</button>
                        <button id="${dlId}" class="btn btn-sm btn-primary">⬇ Download</button>
                    </div>
                </div>
            `;

            setTimeout(() => {
                const dlBtn = document.getElementById(dlId);
                if (dlBtn) dlBtn.addEventListener('click', () => downloadImage(imageUrl, prompt));
            }, 100);
        } catch (error) {
            dom.imageResult.innerHTML = `<div class="app-image-placeholder"><div class="icon">⚠</div><p style="color:var(--error)">${escapeHtml(error.message)}</p></div>`;
        }

        state.isLoading = false;
    }

    async function downloadImage(url, filename) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = (filename || 'image').substring(0, 30).replace(/[^a-z0-9]/gi, '_') + '.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (e) {
            window.open(url, '_blank');
        }
    }

    // ========== MARKDOWN RENDERER ==========
    function renderMarkdown(text) {
        if (!text) return '';
        let html = escapeHtml(text);

        // Code blocks
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="lang-${escapeHtml(lang)}">${code.trimEnd()}<button class="app-msg-action-btn" onclick="copyCode(this)" style="position:absolute;top:8px;right:8px">📋 Copy</button></code></pre>`;
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Headers
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Bold & Italic
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');

        // Blockquotes
        html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

        // Lists
        html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    window.copyCode = function(btn) {
        const code = btn.parentElement;
        const text = code.textContent.replace('📋 Copy', '').trim();
        navigator.clipboard.writeText(text).then(() => {
            btn.textContent = '✓ Copied';
            setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
        }).catch(() => {
            btn.textContent = '✗ Error';
            setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
        });
    };

    // ========== UI FUNCTIONS ==========
    function renderMessages(options = {}) {
        const session = state.sessions[state.currentSessionId];
        if (!session || session.messages.length === 0) {
            dom.messagesContainer.innerHTML = '';
            if (dom.welcomeMessage) dom.welcomeMessage.style.display = 'block';
            updateToolbarTitle();
            return;
        }

        if (dom.welcomeMessage) dom.welcomeMessage.style.display = 'none';

        dom.messagesContainer.innerHTML = session.messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const content = isUser ? escapeHtml(msg.content) : renderMarkdown(msg.content);

            return `
                <div class="app-msg app-msg-${isUser ? 'user' : 'ai'}" data-message-index="${index}">
                    <div class="app-msg-header">
                        <span class="app-msg-role">${isUser ? 'You' : 'AI'}</span>
                        <span class="app-msg-time">${time}</span>
                    </div>
                    <div class="app-msg-content">${content}</div>
                    <div class="app-msg-actions">
                        <button class="app-msg-action-btn app-copy-message-btn" data-message-index="${index}">Copy</button>
                    </div>
                </div>
            `;
        }).join('');

        updateToolbarTitle();
        if (Number.isInteger(options.animateMessageIndex)) {
            animateAssistantMessage(options.animateMessageIndex);
        } else {
            scrollToBottom();
        }
        dom.messagesContainer.querySelectorAll('.app-copy-message-btn').forEach(button => {
            button.addEventListener('click', () => {
                const currentSession = state.sessions[state.currentSessionId];
                const message = currentSession?.messages[Number(button.dataset.messageIndex)];
                if (message) copyMessage(button, message.content);
            });
        });
    }

    function animateAssistantMessage(messageIndex) {
        const message = dom.messagesContainer.querySelector(
            `.app-msg-ai[data-message-index="${messageIndex}"] .app-msg-content`
        );
        if (!message) return;

        const walker = document.createTreeWalker(message, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        let node;

        while ((node = walker.nextNode())) {
            if (node.parentElement.closest('pre')) continue;
            if (node.nodeValue.trim()) textNodes.push(node);
        }

        let wordIndex = 0;
        textNodes.forEach(textNode => {
            const fragment = document.createDocumentFragment();
            textNode.nodeValue.split(/(\s+)/).forEach(part => {
                if (!part) return;
                if (/\s+/.test(part)) {
                    fragment.appendChild(document.createTextNode(part));
                    return;
                }

                const word = document.createElement('span');
                word.className = 'app-msg-word';
                word.textContent = part;
                word.style.setProperty('--word-index', wordIndex++);
                fragment.appendChild(word);
            });
            textNode.parentNode.replaceChild(fragment, textNode);
        });

        const words = [...message.querySelectorAll('.app-msg-word')];
        if (words.length === 0) return;

        // Start at the beginning of the new answer, then follow the reveal downward.
        const messageBubble = message.closest('.app-msg');
        dom.messagesContainer.scrollTop = Math.max(0, messageBubble.offsetTop - 20);

        const wordDelay = 35;
        const animationDuration = 320;
        const startedAt = performance.now();

        function followWords(now) {
            const elapsed = now - startedAt;
            const visibleIndex = Math.min(words.length - 1, Math.floor(elapsed / wordDelay));
            const word = words[visibleIndex];
            const containerRect = dom.messagesContainer.getBoundingClientRect();
            const wordRect = word.getBoundingClientRect();
            const bottomPadding = 28;

            if (wordRect.bottom > containerRect.bottom - bottomPadding) {
                dom.messagesContainer.scrollTop += wordRect.bottom - (containerRect.bottom - bottomPadding);
            }

            if (elapsed < words.length * wordDelay + animationDuration) {
                requestAnimationFrame(followWords);
            }
        }

        requestAnimationFrame(followWords);
    }

    window.copyMessage = function(btn, content) {
        navigator.clipboard.writeText(content).then(() => {
            btn.textContent = '✓ Copied';
            setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        }).catch(() => {
            btn.textContent = '✗ Error';
            setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        });
    };

    function renderHistory() {
        const sessions = Object.values(state.sessions).sort((a, b) => b.updatedAt - a.updatedAt);

        if (sessions.length === 0) {
            dom.historyList.innerHTML = '<div style="font-size:0.75rem;color:var(--text-muted);padding:8px;text-align:center">No sessions yet</div>';
            return;
        }

        dom.historyList.innerHTML = sessions.map(s => `
            <div class="app-history-item ${s.id === state.currentSessionId ? 'active' : ''}" data-id="${s.id}">
                <span style="overflow:hidden;text-overflow:ellipsis">${escapeHtml(s.title)}</span>
                <span class="app-history-delete" data-delete="${s.id}">✕</span>
            </div>
        `).join('');

        dom.historyList.querySelectorAll('.app-history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.dataset.delete) {
                    deleteSession(e.target.dataset.delete, e);
                } else {
                    switchSession(item.dataset.id);
                }
            });
        });
    }

    function showTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.id = 'typingIndicator';
        div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        dom.messagesContainer.appendChild(div);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
        const searchEl = document.getElementById('searchIndicator');
        if (searchEl) searchEl.remove();
    }

    function scrollToBottom() {
        dom.messagesContainer.scrollTop = dom.messagesContainer.scrollHeight;
    }

    function autoResize() {
        dom.messageInput.style.height = 'auto';
        dom.messageInput.style.height = Math.min(dom.messageInput.scrollHeight, 150) + 'px';
    }

    function updateSendButton() {
        if (state.isLoading) {
            dom.sendBtn.innerHTML = '…';
            dom.sendBtn.disabled = true;
        } else {
            dom.sendBtn.innerHTML = '→';
            dom.sendBtn.disabled = false;
        }
    }

    function updateStatus() {
        if (state.settings.apiUrl && state.settings.apiKey) {
            dom.statusDot.classList.add('online');
            dom.statusText.textContent = 'Ready';
        } else {
            dom.statusDot.classList.remove('online');
            dom.statusText.textContent = 'Offline';
        }
    }

    function updateToolbarTitle() {
        const session = state.sessions[state.currentSessionId];
        if (session) {
            dom.chatToolbarTitle.textContent = session.title || 'New Chat';
        } else {
            dom.chatToolbarTitle.textContent = 'New Chat';
        }
    }

    // ========== COPY & EXPORT ==========
    function copyChat() {
        const session = state.sessions[state.currentSessionId];
        if (!session || session.messages.length === 0) {
            alert('No messages to copy');
            return;
        }

        const text = session.messages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n');
        navigator.clipboard.writeText(text).then(() => {
            dom.copyChatBtn.textContent = '✓ Copied';
            setTimeout(() => { dom.copyChatBtn.textContent = 'Copy'; }, 2000);
        }).catch(() => {
            alert('Failed to copy');
        });
    }

    function exportChat() {
        const session = state.sessions[state.currentSessionId];
        if (!session || session.messages.length === 0) {
            alert('No messages to export');
            return;
        }

        const exportData = {
            session: { id: session.id, title: session.title, createdAt: session.createdAt, updatedAt: session.updatedAt },
            messages: session.messages,
            settings: { model: state.settings.chatModel, temperature: state.settings.temperature },
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (session.title || 'chat').substring(0, 20).replace(/[^a-z0-9]/gi, '_') + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ========== SETTINGS ==========
    function openSettings() {
        dom.apiUrl.value = state.settings.apiUrl;
        dom.apiKey.value = state.settings.apiKey;
        dom.chatModel.value = state.settings.chatModel;
        dom.imageModel.value = state.settings.imageModel;
        dom.systemPrompt.value = state.settings.systemPrompt;
        dom.accessPassword.value = state.settings.accessPassword;
        dom.temperature.value = state.settings.temperature;
        dom.tempValue.textContent = parseFloat(state.settings.temperature).toFixed(1);
        dom.settingsModal.classList.add('active');
    }

    function closeSettings() {
        dom.settingsModal.classList.remove('active');
    }

    function saveSettingsHandler() {
        state.settings.apiUrl = dom.apiUrl.value.trim();
        state.settings.apiKey = dom.apiKey.value.trim();
        state.settings.chatModel = dom.chatModel.value.trim() || 'gpt-4o';
        state.settings.imageModel = dom.imageModel.value.trim() || 'dall-e-3';
        state.settings.systemPrompt = dom.systemPrompt.value.trim();
        state.settings.accessPassword = dom.accessPassword.value.trim();
        state.settings.temperature = parseFloat(dom.temperature.value);

        saveSettings();
        updateStatus();
        closeSettings();

        // Fetch available models from API
        if (state.settings.apiUrl && state.settings.apiKey) {
            fetchModels();
        }

        const btn = dom.saveSettings;
        btn.textContent = '✓ Saved';
        setTimeout(() => { btn.textContent = 'Save Settings'; }, 1500);
    }

    async function testConnectionHandler() {
        const btn = dom.testConnection;
        btn.textContent = 'Testing...';
        btn.disabled = true;

        try {
            const url = dom.apiUrl.value.replace(/\/+$/, '') + '/chat/completions';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + dom.apiKey.value
                },
                body: JSON.stringify({
                    model: dom.chatModel.value || 'gpt-4o',
                    messages: [{ role: 'user', content: 'Say "connected" in one word' }],
                    max_tokens: 5
                })
            });

            if (response.ok) {
                btn.textContent = '✓ Connected';
                btn.style.background = 'var(--success)';
                btn.style.color = 'white';
            } else {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error?.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            btn.textContent = '✗ Failed';
            btn.style.background = 'var(--error)';
            btn.style.color = 'white';
        }

        setTimeout(() => {
            btn.textContent = 'Test Connection';
            btn.style.background = '';
            btn.style.color = '';
            btn.disabled = false;
        }, 2500);
    }

    async function testCurrentModel() {
        const btn = dom.testModelBtn;
        const model = dom.chatModel.value || 'gpt-4o';
        const apiUrl = dom.apiUrl.value.trim();
        const apiKey = dom.apiKey.value.trim();

        if (!apiUrl || !apiKey) {
            alert('Please enter API URL and API Key first');
            return;
        }

        btn.textContent = '🧪 Testing ' + model + '...';
        btn.disabled = true;

        try {
            const url = apiUrl.replace(/\/+$/, '') + '/chat/completions';
            const startTime = Date.now();

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant.' },
                        { role: 'user', content: 'Explain your reasoning step by step: If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies? Answer in 2-3 sentences.' }
                    ],
                    max_tokens: 200,
                    temperature: 0.3
                })
            });

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error?.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            const actualModel = data.model || model;

            // Show result in a more visible way
            alert(
                `✅ Model Test Passed!\n\n` +
                `Model ID sent: ${model}\n` +
                `Model ID returned: ${actualModel}\n` +
                `Response time: ${elapsed}s\n` +
                `Finish reason: ${data.choices[0].finish_reason}\n\n` +
                `Response preview:\n${content.substring(0, 300)}${content.length > 300 ? '...' : ''}`
            );

            // Also log to debug panel
            if (state.debugMode) {
                addDebugLog('MODEL TEST', {
                    sentModel: model,
                    actualModel: actualModel,
                    responseTime: elapsed + 's',
                    finishReason: data.choices[0].finish_reason,
                    preview: content.substring(0, 200)
                });
            }

            btn.textContent = '✓ ' + actualModel;
            btn.style.color = 'var(--success)';

        } catch (error) {
            alert(`❌ Model Test Failed!\n\nModel: ${model}\nError: ${error.message}\n\nThis model ID might not exist on seekai.cc. Try a different model name.`);
            btn.textContent = '✗ Failed';
            btn.style.color = 'var(--error)';
        }

        setTimeout(() => {
            btn.textContent = '🧪 Test Current Model';
            btn.disabled = false;
            btn.style.color = '';
        }, 4000);
    }

    // ========== STORAGE ==========
    function saveSettings() {
        localStorage.setItem('agent_terminal_settings', JSON.stringify(state.settings));
    }

    function loadSettings() {
        const saved = localStorage.getItem('agent_terminal_settings');
        if (saved) Object.assign(state.settings, JSON.parse(saved));
    }

    function saveSessions() {
        localStorage.setItem('agent_terminal_sessions', JSON.stringify(state.sessions));
    }

    function loadSessions() {
        const saved = localStorage.getItem('agent_terminal_sessions');
        if (saved) state.sessions = JSON.parse(saved);
    }

    // ========== UTILITY ==========
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
    }

    // ========== START ==========
    init();
})();
