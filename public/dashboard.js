document.addEventListener('DOMContentLoaded', () => {
    // Blob animation
    const blob = document.getElementById("blob");
    document.body.onpointermove = event => { 
        const { clientX, clientY } = event;
        blob.animate({
            left: `${clientX}px`,
            top: `${clientY}px`
        }, { duration: 3000, fill: "forwards" });
    }

    // Fetch and render messages
    fetchMessages();
});

async function fetchMessages() {
    const listContainer = document.getElementById('messages-list');
    const totalCount = document.getElementById('total-messages');

    try {
        const response = await fetch('/api/messages');
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch messages');
        }

        // Update total count
        totalCount.textContent = data.length;

        // Render messages
        listContainer.innerHTML = ''; // Clear loading state

        if (data.length === 0) {
            listContainer.innerHTML = '<div class="no-data">No messages found.</div>';
            return;
        }

        data.forEach(msg => {
            const date = new Date(msg.date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const card = document.createElement('div');
            card.className = 'message-card';
            
            card.innerHTML = `
                <div class="message-header">
                    <div class="sender-info">
                        <span class="sender-name">${escapeHTML(msg.name)}</span>
                        <a href="mailto:${escapeHTML(msg.email)}" class="sender-email">${escapeHTML(msg.email)}</a>
                    </div>
                    <div class="message-date">${date}</div>
                </div>
                <div class="message-body">${escapeHTML(msg.message)}</div>
            `;
            
            listContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Error:', error);
        listContainer.innerHTML = `<div class="error">Error loading messages: ${error.message}</div>`;
    }
}

// Basic HTML escaping to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
