let currentUser = null;
let currentChatUser = null;
let socket = null;

// Auth Logic
async function login() {
    const user = document.getElementById('l_username').value;
    const pass = document.getElementById('l_password').value;
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();
    if (data.success) {
        if(data.role === 'admin') window.location.href = '/admin.html';
        else window.location.href = '/dashboard.html';
    } else alert(data.error);
}

async function signup() {
    // Gather data
    const data = {
        username: document.getElementById('s_username').value,
        password: document.getElementById('s_password').value,
        display_name: document.getElementById('s_display').value,
        age: document.getElementById('s_age').value,
        gender: document.getElementById('s_gender').value
    };
    const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if (res.ok) window.location.href = '/dashboard.html';
    else alert('Signup failed');
}

function toggleAuth() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('signupForm').classList.toggle('hidden');
}

// Dashboard Logic
async function initDashboard() {
    socket = io();
    const res = await fetch('/api/me');
    if (res.status === 401) window.location.href = '/index.html';
    currentUser = await res.json();
    
    document.getElementById('myUsername').textContent = currentUser.display_name;
    socket.emit('join', currentUser.id);
    
    loadUsers();
    
    socket.on('new_message', (msg) => {
        if (currentChatUser && (msg.sender_id === currentChatUser.id || msg.sender_id === currentUser.id)) {
            appendMessage(msg);
        }
    });
}

async function loadUsers() {
    const query = document.getElementById('searchUser').value;
    const res = await fetch(`/api/users?q=${query}`);
    const users = await res.json();
    const list = document.getElementById('userList');
    list.innerHTML = '';
    
    users.forEach(u => {
        const div = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `
            <div>
                <strong>${u.display_name}</strong> <small>(${u.username})</small><br>
                <small>${u.country} | ${u.age || '?'} | ${u.gender || '?'}</small>
            </div>
            <div class="status-dot"></div>
        `;
        div.onclick = () => openChat(u);
        list.appendChild(div);
    });
}

function openChat(user) {
    currentChatUser = user;
    document.getElementById('chatHeader').innerText = `Chat with ${user.display_name}`;
    document.getElementById('messagesArea').innerHTML = '';
    socket.emit('load_chat', { userA: currentUser.id, userB: user.id });
}

socket.on('chat_history', (msgs) => {
    msgs.forEach(appendMessage);
    scrollToBottom();
});

function appendMessage(msg) {
    const div = document.createElement('div');
    const type = msg.sender_id === currentUser.id ? 'sent' : 'received';
    div.className = `message ${type}`;
    div.innerText = msg.content;
    document.getElementById('messagesArea').appendChild(div);
    scrollToBottom();
}

function sendMessage() {
    if (!currentChatUser) return;
    const input = document.getElementById('msgInput');
    const content = input.value;
    if (!content) return;
    
    socket.emit('send_message', {
        senderId: currentUser.id,
        receiverId: currentChatUser.id,
        content: content
    });
    input.value = '';
}

function scrollToBottom() {
    const area = document.getElementById('messagesArea');
    area.scrollTop = area.scrollHeight;
}

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/index.html';
}

function toggleSettings() {
    document.getElementById('settingsModal').classList.toggle('hidden');
}

async function saveSettings() {
    const bio = document.getElementById('set_bio').value;
    const page = document.getElementById('set_page').value;
    
    await fetch('/api/settings', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ bio, p_age: page })
    });
    toggleSettings();
}