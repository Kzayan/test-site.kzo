#!/usr/bin/env node
/*
 * Telegram-ға ұқсас Single-File Веб-Мессенджер
 * Барлық логика, frontend және сервер бір server.js файлында.
 *
 * Іске қосу:
 *   npm install express socket.io
 *   node server.js
 * Браузерде: http://localhost:3000
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

// ─── Конфигурация ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// ─── Хабарламаларды JSON файлда сақтау/оқу ─────────────────────────────────
function loadMessages() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const raw = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Хабарламаларды оқу қатесі:', err.message);
  }
  return []; // алғаш рет іске қосқанда бос массив
}

function saveMessages(messages) {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Хабарламаларды сақтау қатесі:', err.message);
  }
}

// Жадтағы хабарламалар (in-memory) – JSON файлмен синхрондалады
let allMessages = loadMessages();

// Онлайн пайдаланушылар { socketId: { username, online: true } }
const onlineUsers = {}; // socketId -> { id, username }

// ─── Express + Socket.io серверін құру ─────────────────────────────────────
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingInterval: 10000,
  pingTimeout: 5000,
});

// ─── Бүкіл Frontend (HTML + CSS + JS) бір string ретінде ───────────────────
const FRONTEND = `
<!DOCTYPE html>
<html lang="kk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Telegram Web Clone</title>
  <!-- Socket.io клиент кітапханасы (серверден автоматты түрде беріледі) -->
  <style>
    /*
     * Telegram Web стиліне ұқсас CSS
     * Минималды, таза дизайн
     */
    :root {
      --bg: #e8ecef;
      --sidebar-bg: #ffffff;
      --chat-bg: #e8ecef;
      --primary: #2b8cbe;
      --primary-light: #5ba0d0;
      --my-msg-bg: #dcf8c6;
      --other-msg-bg: #ffffff;
      --text: #303030;
      --text-secondary: #707070;
      --border: #dfe1e5;
      --hover: #f4f5f7;
      --online: #4caf50;
      --shadow: 0 1px 3px rgba(0,0,0,0.08);
      --radius: 8px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #d0d5db;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text);
    }

    /* ─── Login экраны ─────────────────────────────────── */
    #login-screen {
      background: #fff;
      border-radius: 12px;
      padding: 40px 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      text-align: center;
      width: 360px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    #login-screen h1 {
      font-size: 1.6em;
      color: var(--primary);
      margin-bottom: 8px;
    }
    #login-screen p { color: var(--text-secondary); font-size: 0.9em; }
    #login-screen input[type="text"] {
      padding: 12px 16px;
      border: 2px solid var(--border);
      border-radius: var(--radius);
      font-size: 1em;
      transition: border 0.2s;
      outline: none;
    }
    #login-screen input[type="text"]:focus { border-color: var(--primary); }
    #login-screen button {
      padding: 12px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: var(--radius);
      font-size: 1em;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }
    #login-screen button:hover { background: var(--primary-light); }
    .login-error { color: #e74c3c; font-size: 0.85em; display: none; }

    /* ─── Негізгі интерфейс ─────────────────────────────── */
    #app-screen {
      display: none;               /* default: жасырын */
      width: 100%;
      max-width: 1100px;
      height: 92vh;
      max-height: 760px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.14);
      overflow: hidden;
      grid-template-columns: 320px 1fr;
    }
    #app-screen.active { display: grid; }

    /* Сол жақ панель (чат тізімі + онлайн) */
    .sidebar {
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .sidebar-header {
      padding: 16px;
      background: #f8f9fa;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sidebar-header h3 { font-size: 1.1em; font-weight: 700; color: var(--text); }
    .sidebar-header .user-badge {
      background: var(--primary);
      color: #fff;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8em;
      font-weight: 600;
    }
    .sidebar-section-title {
      padding: 12px 16px 6px;
      font-size: 0.75em;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-secondary);
      font-weight: 600;
    }
    .user-list, .chat-list {
      flex: 1;
      overflow-y: auto;
      list-style: none;
    }
    .user-list li, .chat-list li {
      padding: 12px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.15s;
    }
    .user-list li:hover, .chat-list li:hover { background: var(--hover); }
    .user-list li.selected, .chat-list li.selected {
      background: #e3f0f9;
      font-weight: 600;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary-light);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9em;
      flex-shrink: 0;
      position: relative;
    }
    .avatar .online-dot {
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--online);
      border: 2px solid #fff;
      display: none;
    }
    .avatar .online-dot.online { display: block; }
    .user-info { flex: 1; min-width: 0; }
    .user-info .name { font-size: 0.95em; font-weight: 500; }
    .user-info .last-msg {
      font-size: 0.78em;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sidebar-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--border);
      font-size: 0.8em;
      color: var(--text-secondary);
      text-align: center;
    }

    /* Оң жақ панель (чат терезесі) */
    .chat-area {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--chat-bg);
    }
    .chat-header {
      padding: 16px 20px;
      background: #f8f9fa;
      border-bottom: 1px solid var(--border);
      font-weight: 700;
      font-size: 1.05em;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .chat-header .typing-ind {
      font-weight: 400;
      font-size: 0.8em;
      color: var(--primary);
      font-style: italic;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .chat-header .typing-ind.visible { opacity: 1; }
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .message {
      max-width: 72%;
      padding: 10px 14px;
      border-radius: 12px;
      line-height: 1.4;
      word-wrap: break-word;
      box-shadow: var(--shadow);
      font-size: 0.93em;
      position: relative;
    }
    .message.my {
      align-self: flex-end;
      background: var(--my-msg-bg);
      border-bottom-right-radius: 4px;
    }
    .message.other {
      align-self: flex-start;
      background: var(--other-msg-bg);
      border-bottom-left-radius: 4px;
    }
    .message .sender {
      font-size: 0.75em;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 4px;
    }
    .message .time {
      font-size: 0.68em;
      color: #999;
      float: right;
      margin-left: 12px;
      margin-top: 4px;
    }
    .message.system {
      align-self: center;
      background: #e3e8ed;
      color: #666;
      font-size: 0.8em;
      font-style: italic;
      max-width: 90%;
      text-align: center;
    }
    .input-area {
      padding: 14px 20px;
      background: #f8f9fa;
      border-top: 1px solid var(--border);
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .input-area input[type="text"] {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid var(--border);
      border-radius: 24px;
      font-size: 0.95em;
      outline: none;
      transition: border 0.2s;
    }
    .input-area input[type="text"]:focus { border-color: var(--primary); }
    .input-area button {
      padding: 12px 22px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 24px;
      font-size: 0.95em;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }
    .input-area button:hover { background: var(--primary-light); }

    /* Жалпы чат (барлығына) */
    .global-chat-item {
      font-weight: 600;
      color: var(--primary);
    }
    .global-chat-item .avatar { background: var(--primary); }
  </style>
</head>
<body>

<!-- ─── Логин экраны ─────────────────────────────────────── -->
<div id="login-screen">
  <h1>💬 Messenger</h1>
  <p>Telegram Web стиліндегі чат</p>
  <input type="text" id="username-input" placeholder="Пайдаланушы атыңыз" maxlength="25" autofocus />
  <button id="login-btn">Кіру</button>
  <span class="login-error" id="login-error">Бұл атпен кіру мүмкін емес</span>
</div>

<!-- ─── Негізгі экран ─────────────────────────────────────── -->
<div id="app-screen">
  <!-- Сол жақ панель -->
  <div class="sidebar">
    <div class="sidebar-header">
      <h3>Хабарламалар</h3>
      <span class="user-badge" id="my-username-badge">Мен</span>
    </div>
    <div class="sidebar-section-title">Жалпы</div>
    <ul class="chat-list" id="global-chat-list">
      <li class="global-chat-item selected" data-chat="global">
        <div class="avatar">🌐</div>
        <div class="user-info">
          <div class="name">Жалпы чат</div>
          <div class="last-msg">Барлық пайдаланушылар</div>
        </div>
      </li>
    </ul>
    <div class="sidebar-section-title">Пайдаланушылар</div>
    <ul class="user-list" id="user-list"></ul>
    <div class="sidebar-footer" id="online-count">Онлайн: 0</div>
  </div>

  <!-- Оң жақ панель -->
  <div class="chat-area" id="chat-area">
    <div class="chat-header">
      <span id="chat-title">Жалпы чат</span>
      <span class="typing-ind" id="typing-indicator">жазып жатыр...</span>
    </div>
    <div class="messages-container" id="messages-container"></div>
    <div class="input-area">
      <input type="text" id="message-input" placeholder="Хабарлама жазыңыз..." maxlength="500" />
      <button id="send-btn">Жіберу</button>
    </div>
  </div>
</div>

<!-- Socket.io клиенті (серверден автоматты түрде беріледі) -->
<script src="/socket.io/socket.io.js"></script>
<script>
  /*
   * Клиент жағы – Барлық интерактивті логика
   */
  (function() {
    // ─── Элементтерге сілтеме ────────────────────────────
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    const usernameInput = document.getElementById('username-input');
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');
    const myBadge = document.getElementById('my-username-badge');
    const userList = document.getElementById('user-list');
    const globalChatItem = document.querySelector('.global-chat-item');
    const chatTitle = document.getElementById('chat-title');
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const onlineCount = document.getElementById('online-count');

    // ─── Күй айнымалылары ────────────────────────────────
    let myUsername = null;
    let socket = null;
    let currentChat = 'global';     // 'global' | 'private:username'
    let onlineUserList = [];        // [{ username, online }]
    let typingTimeouts = {};        // username -> timeout id

    // ─── Уақытты пішімдеу ────────────────────────────────
    function formatTime(ts) {
      const d = new Date(ts);
      const hh = String(d.getHours()).padStart(2,'0');
      const mm = String(d.getMinutes()).padStart(2,'0');
      return hh + ':' + mm;
    }

    // ─── Аватар әрпі ──────────────────────────────────────
    function avatarLetter(name) {
      if (!name || name === 'Жалпы чат') return '🌐';
      return name.charAt(0).toUpperCase();
    }

    // ─── Хабарламаны DOM-ға қосу ──────────────────────────
    function appendMessage(msg, prepend = false) {
      const div = document.createElement('div');
      div.className = 'message';

      const isMy = (msg.sender === myUsername);
      const isGlobal = (msg.target === 'global');
      const isPrivate = (msg.target && msg.target.startsWith('private:'));

      // Жеке чаттар үшін сүзгі
      if (currentChat === 'global' && isPrivate) {
        // Жеке хабарлама тек "private:username" чатында көрінеді
        // Егер ағымдағы чат global болса, тек global хабарларды көрсетеміз
        // және маған жіберілген жеке хабарларды (мен алушы болсам)
        const targetUser = msg.target.split(':')[1];
        const isForMe = (targetUser === myUsername);
        if (!isForMe && isGlobal === false) return;
      }
      if (currentChat.startsWith('private:')) {
        const chatUser = currentChat.split(':')[1];
        if (isPrivate) {
          const targetUser = msg.target.split(':')[1];
          // Мен жіберген немесе маған жіберілген
          const relevant = (msg.sender === myUsername && targetUser === chatUser) ||
                           (msg.sender === chatUser && targetUser === myUsername);
          if (!relevant) return;
        } else if (isGlobal) {
          return; // жеке чатта жалпы хабарларды көрсетпейміз
        }
      }

      if (isMy) {
        div.classList.add('my');
      } else if (msg.sender === 'SYSTEM') {
        div.classList.add('system');
      } else {
        div.classList.add('other');
      }

      let contentHtml = '';
      if (msg.sender !== 'SYSTEM' && !isMy && currentChat === 'global') {
        contentHtml += '<span class="sender">' + escapeHtml(msg.sender) + '</span>';
      }
      contentHtml += escapeHtml(msg.text);
      contentHtml += '<span class="time">' + formatTime(msg.timestamp) + '</span>';

      div.innerHTML = contentHtml;
      if (prepend) {
        messagesContainer.prepend(div);
      } else {
        messagesContainer.appendChild(div);
      }
    }

    // Қарапайым HTML escape
    function escapeHtml(str) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return String(str).replace(/[&<>"']/g, (c) => map[c] || c);
    }

    // ─── Барлық сақталған хабарламаларды көрсету ────────
    function renderAllMessages(messages) {
      messagesContainer.innerHTML = '';
      messages.forEach((msg) => appendMessage(msg));
      scrollToBottom();
    }

    // ─── Онлайн пайдаланушылар тізімін жаңарту ──────────
    function updateUserList(users) {
      onlineUserList = users;
      userList.innerHTML = '';
      users.forEach((user) => {
        if (user.username === myUsername) return; // өзімді көрсетпеймін
        const li = document.createElement('li');
        li.dataset.username = user.username;
        li.innerHTML = \`
          <div class="avatar">
            \${avatarLetter(user.username)}
            <span class="online-dot \${user.online ? 'online' : ''}"></span>
          </div>
          <div class="user-info">
            <div class="name">\${escapeHtml(user.username)}</div>
            <div class="last-msg">\${user.online ? 'Онлайн' : 'Офлайн'}</div>
          </div>
        \`;
        li.addEventListener('click', () => selectPrivateChat(user.username));
        userList.appendChild(li);
      });
      // Таңдалған чатты белгілеу
      highlightSelectedChat();
      onlineCount.textContent = 'Онлайн: ' + users.filter(u => u.online).length;
    }

    function highlightSelectedChat() {
      document.querySelectorAll('.user-list li, .chat-list li').forEach(el => el.classList.remove('selected'));
      if (currentChat === 'global') {
        globalChatItem.classList.add('selected');
      } else {
        const target = currentChat.split(':')[1];
        const li = document.querySelector(\`.user-list li[data-username="\${target}"]\`);
        if (li) li.classList.add('selected');
      }
    }

    function selectPrivateChat(username) {
      currentChat = 'private:' + username;
      chatTitle.textContent = username;
      highlightSelectedChat();
      renderAllMessages(allMessages);
      messageInput.focus();
    }

    function selectGlobalChat() {
      currentChat = 'global';
      chatTitle.textContent = 'Жалпы чат';
      highlightSelectedChat();
      renderAllMessages(allMessages);
      messageInput.focus();
    }

    globalChatItem.addEventListener('click', selectGlobalChat);

    // ─── Скролл төменге ──────────────────────────────────
    function scrollToBottom() {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // ─── Typing индикаторы ───────────────────────────────
    function showTyping(username) {
      if (currentChat === 'global') {
        typingIndicator.textContent = username + ' жазып жатыр...';
        typingIndicator.classList.add('visible');
      } else {
        const chatUser = currentChat.split(':')[1];
        if (chatUser === username) {
          typingIndicator.textContent = 'Жазып жатыр...';
          typingIndicator.classList.add('visible');
        }
      }
      // 2 секундтан кейін өшіреміз
      if (typingTimeouts[username]) clearTimeout(typingTimeouts[username]);
      typingTimeouts[username] = setTimeout(() => {
        typingIndicator.classList.remove('visible');
        delete typingTimeouts[username];
      }, 2000);
    }

    // ─── Хабарлама жіберу ────────────────────────────────
    function sendMessage() {
      const text = messageInput.value.trim();
      if (!text || !socket) return;

      const payload = {
        text: text,
        target: currentChat,
        timestamp: Date.now(),
      };

      socket.emit('chat message', payload);
      messageInput.value = '';
      messageInput.focus();
      // Жібергеннен кейін typing тоқтату
      socket.emit('stop typing', { target: currentChat });
    }

    // ─── Логин ───────────────────────────────────────────
    function doLogin() {
      const name = usernameInput.value.trim();
      if (!name || name.length < 2 || name.length > 25) {
        loginError.textContent = 'Пайдаланушы аты 2-25 таңба аралығында болуы керек';
        loginError.style.display = 'block';
        return;
      }
      if (/[<>"'&]/.test(name)) {
        loginError.textContent = 'Атыңызда арнайы таңбалар болмасын';
        loginError.style.display = 'block';
        return;
      }
      // Socket.io қосылу
      socket = io();
      socket.emit('login', { username: name });

      socket.on('login success', (data) => {
        myUsername = name;
        allMessages = data.messages || [];
        onlineUserList = data.onlineUsers || [];
        myBadge.textContent = name;
        loginScreen.style.display = 'none';
        appScreen.classList.add('active');
        updateUserList(onlineUserList);
        renderAllMessages(allMessages);
        setupSocketListeners();
      });

      socket.on('login error', (data) => {
        loginError.textContent = data.message || 'Кіру қатесі';
        loginError.style.display = 'block';
        socket.disconnect();
        socket = null;
      });
    }

    // ─── Socket.io тыңдаушылары ─────────────────────────
    function setupSocketListeners() {
      // Жаңа хабарлама
      socket.on('chat message', (msg) => {
        allMessages.push(msg);
        appendMessage(msg);
        scrollToBottom();
        // Соңғы хабарламаны чат тізімінде жаңарту
        updateLastMessagePreview(msg);
      });

      // Пайдаланушы қосылды
      socket.on('user joined', (user) => {
        if (user.username === myUsername) return;
        const exists = onlineUserList.find(u => u.username === user.username);
        if (!exists) {
          onlineUserList.push(user);
        } else {
          exists.online = true;
        }
        updateUserList(onlineUserList);
        // Системалық хабарлама
        const sysMsg = {
          sender: 'SYSTEM',
          text: user.username + ' чатқа қосылды',
          target: 'global',
          timestamp: Date.now(),
        };
        allMessages.push(sysMsg);
        appendMessage(sysMsg);
        scrollToBottom();
      });

      // Пайдаланушы шықты
      socket.on('user left', (data) => {
        const idx = onlineUserList.findIndex(u => u.username === data.username);
        if (idx !== -1) {
          onlineUserList[idx].online = false;
          updateUserList(onlineUserList);
        }
        const sysMsg = {
          sender: 'SYSTEM',
          text: data.username + ' чаттан шықты',
          target: 'global',
          timestamp: Date.now(),
        };
        allMessages.push(sysMsg);
        appendMessage(sysMsg);
        scrollToBottom();
      });

      // Онлайн тізім жаңартуы
      socket.on('online users', (users) => {
        onlineUserList = users;
        updateUserList(users);
      });

      // Typing индикаторы
      socket.on('typing', (data) => {
        if (data.username !== myUsername) {
          showTyping(data.username);
        }
      });

      // Хабарламалар синхрондау (қайта қосылғанда)
      socket.on('sync messages', (messages) => {
        allMessages = messages;
        renderAllMessages(allMessages);
      });
    }

    function updateLastMessagePreview(msg) {
      // Чат тізіміндегі соңғы хабарламаны жаңарту (опционал)
      // Қарапайым үшін бұл жерде толық жаңартпаймыз
    }

    // ─── Оқиға тыңдаушылары ────────────────────────────
    loginBtn.addEventListener('click', doLogin);
    usernameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLogin();
    });

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });

    // Typing индикаторын серверге жіберу
    let typingTimer = null;
    messageInput.addEventListener('input', () => {
      if (!socket || !myUsername) return;
      socket.emit('typing', { target: currentChat });
      if (typingTimer) clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        socket.emit('stop typing', { target: currentChat });
      }, 1500);
    });

    // Браузер жабылғанда
    window.addEventListener('beforeunload', () => {
      if (socket) {
        socket.emit('stop typing', { target: currentChat });
      }
    });

    console.log('Клиент дайын. Пайдаланушы атыңызды енгізіңіз.');
  })();
</script>
</body>
</html>
`;

// ─── Сервер маршруттары ────────────────────────────────────────────────────
// Барлық сұранысқа frontend-ті қайтарамыз
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(FRONTEND);
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ─── Socket.io логикасы ────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Жаңа қосылым: ${socket.id}`);

  // Пайдаланушы логин жасағанша күте тұрамыз
  let currentUser = null;

  // Логин
  socket.on('login', ({ username }) => {
    // Валидация
    if (!username || typeof username !== 'string') {
      socket.emit('login error', { message: 'Пайдаланушы аты қажет' });
      return;
    }
    const cleanName = username.trim();
    if (cleanName.length < 2 || cleanName.length > 25) {
      socket.emit('login error', { message: 'Атыңыз 2-25 таңбадан тұруы керек' });
      return;
    }
    if (/[<>"'&]/.test(cleanName)) {
      socket.emit('login error', { message: 'Арнайы таңбалар қолдануға болмайды' });
      return;
    }

    // Бұл username-мен басқа socket бар ма?
    // (бір пайдаланушы бірнеше қойындыдан кіре алмайды – соңғысы ғана)
    for (const [sid, u] of Object.entries(onlineUsers)) {
      if (u.username === cleanName && sid !== socket.id) {
        // Ескі қосылымды үземіз
        const oldSocket = io.sockets.sockets.get(sid);
        if (oldSocket) {
          oldSocket.emit('login error', { message: 'Басқа жерден кірдіңіз' });
          oldSocket.disconnect(true);
        }
        delete onlineUsers[sid];
      }
    }

    currentUser = cleanName;
    onlineUsers[socket.id] = {
      id: socket.id,
      username: cleanName,
      online: true,
    };

    // Логин сәтті
    socket.emit('login success', {
      messages: allMessages,
      onlineUsers: Object.values(onlineUsers),
    });

    // Барлығына хабарлау
    socket.broadcast.emit('user joined', { username: cleanName, online: true });
    io.emit('online users', Object.values(onlineUsers));

    console.log(`✅ ${cleanName} кірді (socket: ${socket.id})`);
    console.log(`👥 Онлайн: ${Object.values(onlineUsers).map(u => u.username).join(', ')}`);
  });

  // Хабарлама жіберу
  socket.on('chat message', (payload) => {
    if (!currentUser) return;
    const { text, target, timestamp } = payload;
    if (!text || typeof text !== 'string' || text.trim().length === 0) return;
    if (text.length > 500) return;

    const msg = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      sender: currentUser,
      text: text.trim(),
      target: target || 'global',
      timestamp: timestamp || Date.now(),
    };

    allMessages.push(msg);
    // 5000 хабарламадан асса, ескілерін қысқартамыз (жадты үнемдеу)
    if (allMessages.length > 5000) {
      allMessages = allMessages.slice(-4000);
    }
    saveMessages(allMessages);

    // Тарату
    if (msg.target === 'global') {
      io.emit('chat message', msg);
    } else if (msg.target.startsWith('private:')) {
      const targetUser = msg.target.split(':')[1];
      // Жіберушіге және алушыға
      socket.emit('chat message', msg);
      // Алушының socket-ін табу
      for (const [sid, u] of Object.entries(onlineUsers)) {
        if (u.username === targetUser && sid !== socket.id) {
          io.to(sid).emit('chat message', msg);
          break;
        }
      }
    }

    console.log(`💬 [${msg.sender} -> ${msg.target}]: ${msg.text.substring(0, 50)}`);
  });

  // Typing индикаторы
  socket.on('typing', ({ target }) => {
    if (!currentUser) return;
    if (target === 'global') {
      socket.broadcast.emit('typing', { username: currentUser, target: 'global' });
    } else if (target.startsWith('private:')) {
      const targetUser = target.split(':')[1];
      for (const [sid, u] of Object.entries(onlineUsers)) {
        if (u.username === targetUser && sid !== socket.id) {
          io.to(sid).emit('typing', { username: currentUser, target: target });
          break;
        }
      }
    }
  });

  // Typing тоқтату
  socket.on('stop typing', ({ target }) => {
    // typing өшетінін клиент өзі басқарады (timeout)
    // бұл жерде қосымша логика қажет емес
  });

  // Байланыс үзілгенде
  socket.on('disconnect', () => {
    if (currentUser && onlineUsers[socket.id]) {
      const username = onlineUsers[socket.id].username;
      delete onlineUsers[socket.id];

      // Бұл пайдаланушының басқа socket-тері бар ма?
      const stillOnline = Object.values(onlineUsers).some(u => u.username === username);
      if (!stillOnline) {
        socket.broadcast.emit('user left', { username, online: false });
        console.log(`👋 ${username} шықты`);
      }

      io.emit('online users', Object.values(onlineUsers));
    }
    console.log(`🔌 Қосылым үзілді: ${socket.id}`);
  });
});

// ─── Серверді іске қосу ────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🚀 Веб-мессенджер сервері іске қосылды  ║');
  console.log(`║  🌐 http://localhost:${PORT}                ║`);
  console.log('║  💾 Хабарламалар messages.json-да сақталады ║');
  console.log('╚══════════════════════════════════════════╝');
});

// Қателерді өңдеу
process.on('uncaughtException', (err) => {
  console.error('Өңделмеген қате:', err);
});
process.on('SIGINT', () => {
  console.log('\n🛑 Сервер тоқтатылды');
  process.exit(0);
});