<script setup>
import { ref, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import apiClient from '../../services/api.client.js'

const md = new MarkdownIt({ breaks: true })

const isOpen = ref(false)
const input = ref('')
const loading = ref(false)
const messages = ref([
  { id: 1, role: 'ai', text: 'Merhaba! Ben Student Budget Organizer AI asistanınızım. Harcamalarınız ve bütçe planlamanız hakkında bana dilediğinizi sorabilirsiniz.' }
])

const chatWindow = ref(null)

async function sendMessage() {
  if (!input.value.trim() || loading.value) return
  
  const userText = input.value.trim()
  input.value = ''
  
  messages.value.push({ id: Date.now(), role: 'user', text: userText })
  scrollToBottom()
  
  loading.value = true
  
  // Format history for backend
  const history = messages.value
    .filter(m => m.id !== 1 && m.role !== 'system')
    .slice(0, -1) // exclude the message we just added
    .map(m => ({ role: m.role, text: m.text }))

  try {
    const res = await apiClient.post('/chat', { message: userText, history })
    messages.value.push({ id: Date.now(), role: 'ai', text: res.reply || res.data?.reply })
  } catch (error) {
    messages.value.push({ id: Date.now(), role: 'system', text: 'Üzgünüm, şu anda yanıt oluşturamıyorum.' })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight
    }
  })
}

function renderMD(text) {
  return md.render(text || '')
}
</script>

<template>
  <div class="chatbot-container" :class="{ 'is-open': isOpen }">
    <!-- Chat Icon Button -->
    <button v-if="!isOpen" class="chatbot-fab" @click="isOpen = true" aria-label="Asistanı Aç">
      ✨
    </button>

    <!-- Chat Window -->
    <div v-if="isOpen" class="chat-window card">
      <div class="chat-header">
        <div class="chat-title">
          <span class="icon">✨</span>
          <span>Bütçe Asistanı</span>
        </div>
        <button class="btn btn-ghost btn-sm close-btn" @click="isOpen = false">✕</button>
      </div>

      <div class="chat-body" ref="chatWindow">
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="chat-message"
          :class="`msg-${msg.role}`"
        >
          <div class="msg-bubble" v-html="renderMD(msg.text)"></div>
        </div>
        
        <div v-if="loading" class="chat-message msg-ai">
          <div class="msg-bubble typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <div class="chat-footer">
        <input 
          v-model="input" 
          type="text" 
          placeholder="Tasarruf önerisi isteyin..." 
          @keydown.enter="sendMessage"
          :disabled="loading"
        />
        <button class="btn btn-primary btn-sm" @click="sendMessage" :disabled="loading || !input.trim()">
          Gönder
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 1000;
}

.chatbot-fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(124, 111, 247, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chatbot-fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(124, 111, 247, 0.5);
}

.chat-window {
  width: 380px;
  max-width: calc(100vw - var(--space-8));
  height: 500px;
  max-height: calc(100vh - var(--space-12));
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.chat-header {
  padding: var(--space-3) var(--space-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chat-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 600;
  color: var(--text-primary);
}
.close-btn { padding: 4px 8px; color: var(--text-muted); }
.close-btn:hover { color: var(--text-primary); }

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: var(--bg-glass);
}
.chat-message {
  display: flex;
  max-width: 85%;
}
.msg-user { align-self: flex-end; }
.msg-user .msg-bubble {
  background: var(--accent);
  color: white;
  border-radius: 16px 16px 4px 16px;
}

.msg-ai { align-self: flex-start; }
.msg-ai .msg-bubble {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: 16px 16px 16px 4px;
}

.msg-system { align-self: center; max-width: 90%; }
.msg-system .msg-bubble {
  background: transparent;
  color: var(--danger);
  font-size: 0.8125rem;
  text-align: center;
}

.msg-bubble {
  padding: var(--space-3) var(--space-4);
  font-size: 0.875rem;
  line-height: 1.5;
  box-shadow: var(--shadow-sm);
}

.chat-footer {
  padding: var(--space-3);
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  display: flex;
  gap: var(--space-2);
}
.chat-footer input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  background: var(--bg-page);
  border-radius: var(--radius-md);
  color: var(--text-primary);
}
.chat-footer input:focus {
  outline: none;
  border-color: var(--accent);
}

/* Markdown Styles inside bubble */
.msg-bubble :deep(p) { margin: 0 0 0.5rem 0; }
.msg-bubble :deep(p:last-child) { margin: 0; }
.msg-bubble :deep(ul), .msg-bubble :deep(ol) { margin: 0.5rem 0; padding-left: 1.25rem; }
.msg-bubble :deep(li) { margin-bottom: 0.25rem; }
.msg-bubble :deep(strong) { font-weight: 600; color: inherit; }

/* Typing animation */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}
.typing-indicator span {
  width: 6px; height: 6px;
  background: var(--text-muted);
  border-radius: 50%;
  animation: typing 1.4s infinite cubic-bezier(0.2, 0.8, 0.2, 1);
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(-4px); opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 640px) {
  .chatbot-container { bottom: var(--space-4); right: var(--space-4); }
  .chat-window { height: 60vh; width: calc(100vw - var(--space-8)); }
}
</style>
