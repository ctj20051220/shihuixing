// 格式化消息文本
function formatMessage(text) {
    if (!text) return '';

    // 处理标题和换行
    let lines = text.split('\n');
    let formattedLines = lines.map(line => {
        // 处理标题（**文本**）
        line = line.replace(/\*\*(.*?)\*\*/g, '<span class="bold-text">$1</span>');
        return line;
    });

    // 将 ### 替换为换行，并确保每个部分都是一个段落
    let processedText = formattedLines.join('\n');
    let sections = processedText
        .split('###')
        .filter(section => section.trim())
        .map(section => {
            // 移除多余的换行和空格
            let lines = section.split('\n').filter(line => line.trim());

            if (lines.length === 0) return '';

            // 处理每个部分
            let result = '';
            let currentIndex = 0;

            while (currentIndex < lines.length) {
                let line = lines[currentIndex].trim();

                // 如果是数字开头（如 "1.")
                if (/^\d+\./.test(line)) {
                    result += `<p class="section-title">${line}</p>`;
                }
                // 如果是小标题（以破折号开头）
                else if (line.startsWith('-')) {
                    result += `<p class="subsection"><span class="bold-text">${line.replace(/^-/, '').trim()}</span></p>`;
                }
                // 如果是正文（包含冒号的行）
                else if (line.includes(':')) {
                    let [subtitle, content] = line.split(':').map(part => part.trim());
                    result += `<p><span class="subtitle">${subtitle}</span>: ${content}</p>`;
                }
                // 普通文本
                else {
                    result += `<p>${line}</p>`;
                }
                currentIndex++;
            }
            return result;
        });

    return sections.join('');
}

// 显示消息
function displayMessage(role, message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;

    // 仅机器人显示头像
    if (role === 'bot') {
        const avatar = document.createElement('img');
        avatar.src = 'cqjd.jpg';
        avatar.alt = 'Bot';
        messageElement.appendChild(avatar);
    }

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = role === 'user' ? message : formatMessage(message);
    messageElement.appendChild(messageContent);

    messagesContainer.appendChild(messageElement);
    messageElement.scrollIntoView({ behavior: 'smooth' });
}

function sendMessage() {
    const inputElement = document.getElementById('chat-input');
    const userMessage = inputElement.value.trim();
    if (!userMessage) return;

    displayMessage('user', userMessage);
    inputElement.value = '';
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';

    tempMessages.push({ role: 'user', content: userMessage });

    // 使用CORS代理
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const endpoint = `${corsProxy}https://api.deepseek.com/chat/completions`;
    const apiKey = 'sk-349c90660c3c4965ad29d7e86a6712eb'; // 建议替换为环境变量或后端服务

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant" },
          { role: "user", content: userMessage }
        ],
        stream: false
      })
    })
    .then(res => res.json())
    .then(data => {
      const reply = data.choices?.[0]?.message?.content || '抱歉，暂时无法获取回复';
      displayMessage('bot', reply);
      tempMessages.push({ role: 'bot', content: reply });
      // 保存聊天记录逻辑...
    })
    .catch(err => {
      console.error('API请求失败:', err);
      displayMessage('bot', '网络请求失败，请重试');
    })
    .finally(() => loadingElement.style.display = 'none');
  }

// 添加主题切换功能
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const chatContainer = document.querySelector('.chat-container');
    const messages = document.querySelector('.messages');

    // 同时切换容器的深色模式
    chatContainer.classList.toggle('dark-mode');
    messages.classList.toggle('dark-mode');

    // 保存主题设置
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// 页面加载时检查主题设置
document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.chat-container').classList.add('dark-mode');
        document.querySelector('.messages').classList.add('dark-mode');
    }
});

// 添加下拉菜单功能
function toggleDropdown(event) {
    event.preventDefault();
    document.getElementById('dropdownMenu').classList.toggle('show');
}

// 点击其他地方关闭下拉菜单
window.onclick = function (event) {
    if (!event.target.matches('.dropdown button')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (const dropdown of dropdowns) {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    }
}

// 添加回车发送功能
document.getElementById('chat-input').addEventListener('keypress', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

function formatMessage(text) {
    if (!text) return '';

    let lines = text.split('\n');
    let formattedLines = lines.map(line => {
        line = line.replace(/\*\*(.*?)\*\*/g, '<span class="bold-text">$1</span>');
        return line;
    });

    let processedText = formattedLines.join('\n');
    let sections = processedText
        .split('###')
        .filter(section => section.trim())
        .map(section => {
            let lines = section.split('\n').filter(line => line.trim());

            if (lines.length === 0) return '';

            let result = '';
            let currentIndex = 0;

            while (currentIndex < lines.length) {
                let line = lines[currentIndex].trim();

                if (/^\d+\./.test(line)) {
                    result += `<p class="section-title">${line}</p>`;
                } else if (line.startsWith('-')) {
                    result += `<p class="subsection"><span class="bold-text">${line.replace(/^-/, '').trim()}</span></p>`;
                } else if (line.includes(':')) {
                    let [subtitle, content] = line.split(':').map(part => part.trim());
                    result += `<p><span class="subtitle">${subtitle}</span>: ${content}</p>`;
                } else {
                    result += `<p>${line}</p>`;
                }
                currentIndex++;
            }
            return result;
        });

    return sections.join('');
}

function displayMessage(role, message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;

    if (role === 'bot') {
        const avatar = document.createElement('img');
        avatar.src = 'cqjd.jpg';
        avatar.alt = 'Bot';
        messageElement.appendChild(avatar);
    }

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = role === 'user' ? message : formatMessage(message);
    messageElement.appendChild(messageContent);

    messagesContainer.appendChild(messageElement);
    messageElement.scrollIntoView({ behavior: 'smooth' });

    saveMessageToHistory(role, message);
}
