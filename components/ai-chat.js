/**
 * 光伏储能地图站 - AI选址助手
 * 基于Coze API的智能对话组件
 */

class AIChatAssistant {
    constructor(container) {
        this.container = container;
        this.apiToken = 'pat_53WOClLJSHBvmnUoB8toK8du8v1rX98PwbNwylpB1UqC5ce6duiEtpGmt5S88i7U';
        this.workflowId = '7580370589329080383';
        this.apiBase = 'https://api.coze.cn/v1/workflow/runs';
        this.chatHistory = [];
        this.isStreaming = false;
        
        this.init();
    }

    init() {
        this.loadHistory();
        this.bindEvents();
    }

    // 加载聊天历史
    loadHistory() {
        const saved = localStorage.getItem('ai_chat_history');
        if (saved) {
            this.chatHistory = JSON.parse(saved);
        }
    }

    // 保存聊天历史
    saveHistory() {
        // 只保留最近20条记录
        if (this.chatHistory.length > 20) {
            this.chatHistory = this.chatHistory.slice(-20);
        }
        localStorage.setItem('ai_chat_history', JSON.stringify(this.chatHistory));
    }

    // 清除历史
    clearHistory() {
        this.chatHistory = [];
        localStorage.removeItem('ai_chat_history');
        this.renderMessages();
    }

    // 绑定事件
    bindEvents() {
        const sendBtn = this.container.querySelector('.ai-send-btn');
        const input = this.container.querySelector('.ai-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // 预设问题按钮
        this.container.querySelectorAll('.preset-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.question;
                this.sendMessage(question);
            });
        });
    }

    // 渲染消息列表
    renderMessages() {
        const messagesEl = this.container.querySelector('.ai-messages');
        if (!messagesEl) return;

        if (this.chatHistory.length === 0) {
            messagesEl.innerHTML = `
                <div class="ai-welcome">
                    <div class="welcome-icon">🌞</div>
                    <h3>光伏储能AI选址助手</h3>
                    <p>点击下方快捷问题开始咨询，或输入您的问题</p>
                </div>
            `;
            return;
        }

        messagesEl.innerHTML = this.chatHistory.map(msg => `
            <div class="ai-message ${msg.role}">
                <div class="message-avatar">${msg.role === 'user' ? '👤' : '🤖'}</div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(msg.content)}</div>
                    <div class="message-time">${msg.time}</div>
                </div>
            </div>
        `).join('');

        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // 转义HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 发送消息
    async sendMessage(initialContent = null) {
        const input = this.container.querySelector('.ai-input');
        const content = initialContent || input.value.trim();
        
        if (!content || this.isStreaming) return;

        // 添加用户消息
        this.addMessage('user', content);
        if (!initialContent) input.value = '';
        
        // 显示加载状态
        this.showTypingIndicator();
        
        // 调用Coze API
        await this.callCozeAPI(content);
    }

    // 添加消息
    addMessage(role, content) {
        this.chatHistory.push({
            role,
            content,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        });
        this.saveHistory();
        this.renderMessages();
    }

    // 显示打字指示器
    showTypingIndicator() {
        const messagesEl = this.container.querySelector('.ai-messages');
        const indicator = document.createElement('div');
        indicator.className = 'ai-message assistant typing';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-text">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        messagesEl.appendChild(indicator);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // 移除打字指示器
    removeTypingIndicator() {
        const indicator = document.container?.querySelector('#typing-indicator') || 
                         document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    // 调用Coze API
    async callCozeAPI(userMessage) {
        this.isStreaming = true;
        let fullResponse = '';
        
        try {
            const response = await fetch(this.apiBase, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    workflow_id: this.workflowId,
                    parameters: {
                        query: userMessage
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // 移除打字指示器
            this.removeTypingIndicator();

            // 创建AI消息元素用于流式更新
            const messagesEl = this.container.querySelector('.ai-messages');
            const aiMessage = document.createElement('div');
            aiMessage.className = 'ai-message assistant streaming';
            aiMessage.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="message-text"></div>
                    <div class="message-time">${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `;
            messagesEl.appendChild(aiMessage);
            const textEl = aiMessage.querySelector('.message-text');

            // 流式读取响应
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                try {
                    // 尝试解析SSE数据
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = JSON.parse(line.slice(6));
                            if (data.content) {
                                fullResponse += data.content;
                                textEl.textContent = fullResponse;
                                messagesEl.scrollTop = messagesEl.scrollHeight;
                            }
                        }
                    }
                } catch (e) {
                    // 如果解析失败，直接追加原始文本
                    fullResponse += chunk;
                    textEl.textContent = fullResponse;
                }
            }

            // 移除streaming类
            aiMessage.classList.remove('streaming');

            // 保存到历史
            this.chatHistory.push({
                role: 'assistant',
                content: fullResponse,
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            });
            this.saveHistory();

        } catch (error) {
            console.error('Coze API调用失败:', error);
            
            // 移除打字指示器
            this.removeTypingIndicator();

            // 显示错误消息
            const messagesEl = this.container.querySelector('.ai-messages');
            const errorMessage = document.createElement('div');
            errorMessage.className = 'ai-message assistant error';
            errorMessage.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="message-text">抱歉，服务暂时不可用，请稍后再试。错误信息: ${error.message}</div>
                    <div class="message-time">${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `;
            messagesEl.appendChild(errorMessage);
        } finally {
            this.isStreaming = false;
        }
    }
}

// 预设问题配置
const PRESET_QUESTIONS = [
    { icon: '📍', text: '推荐浙江适合安装光伏的地点', key: 'location' },
    { icon: '💰', text: '估算100kW系统投资回报周期', key: 'roi' },
    { icon: '🔋', text: '储能系统配置建议', key: 'storage' },
    { icon: '📊', text: '当地电价补贴政策查询', key: 'policy' },
    { icon: '⚡', text: '装机容量与发电量计算', key: 'capacity' }
];

// 导出
window.AIChatAssistant = AIChatAssistant;
window.PRESET_QUESTIONS = PRESET_QUESTIONS;
