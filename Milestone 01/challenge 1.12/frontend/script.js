// Conversation history (full context)
const messages = [];

const chatDisplay = document.getElementById('chatDisplay');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

/**
 * Render a message bubble in the chat display
 */
function renderMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);
    messageDiv.textContent = content;
    chatDisplay.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

/**
 * Handle sending the message
 */
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    // 1. Add user message to state
    messages.push({ role: "user", content: text });

    // 2. Render user bubble
    renderMessage("user", text);

    // 3. Clear input
    messageInput.value = "";

    try {
        // 4. Call your backend /chat route
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages })
        });

        const data = await response.json();

        if (data.reply) {
            // 5. Add assistant response to state
            messages.push({ role: "assistant", content: data.reply });
            
            // 6. Render assistant bubble
            renderMessage("assistant", data.reply);
        } else {
            console.error("Error from backend:", data.error);
            renderMessage("assistant", "Sorry, I encountered an error. Please check the console.");
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        renderMessage("assistant", "Could not connect to the server. Make sure the backend is running.");
    }
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
