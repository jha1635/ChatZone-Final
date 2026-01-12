// Admin Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadAllUsers();
});

// 1. साइट के स्टैट्स लोड करना (कुल यूजर्स और मैसेज)
async function loadStats() {
    try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        const statsDiv = document.getElementById('stats');
        if (statsDiv) {
            statsDiv.innerHTML = `
                <div style="display:flex; justify-content: space-around;">
                    <p><strong>Total Users:</strong> ${data.users}</p>
                    <p><strong>Total Messages:</strong> ${data.messages}</p>
                </div>
            `;
        }
    } catch (err) {
        console.error("Failed to load stats", err);
    }
}

// 2. सभी यूजर्स की लिस्ट लोड करना ताकि एडमिन उन्हें मैनेज कर सके
async function loadAllUsers() {
    try {
        const res = await fetch('/api/users'); // एडमिन के लिए बैकएंड से फुल एक्सेस मिलता है
        const users = await res.json();
        const list = document.getElementById('adminUserList');
        
        if (!list) return;
        list.innerHTML = '';

        users.forEach(u => {
            const row = document.createElement('div');
            row.className = 'admin-row';
            row.style = "display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #ddd;";
            row.innerHTML = `
                <div>
                    <strong>${u.username}</strong> (${u.display_name}) 
                    <br><small>Country: ${u.country} | Role: ${u.role}</small>
                </div>
                <button onclick="deleteUser(${u.id})" style="background: red; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">Delete</button>
            `;
            list.appendChild(row);
        });
    } catch (err) {
        console.error("Failed to load users", err);
    }
}

// 3. यूजर को डिलीट करने का फंक्शन
async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
        const res = await fetch('/api/admin/delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        
        const result = await res.json();
        if (result.success) {
            alert('User deleted successfully');
            loadAllUsers(); // लिस्ट रिफ्रेश करें
            loadStats();    // स्टैट्स रिफ्रेश करें
        } else {
            alert('Error deleting user');
        }
    }
}