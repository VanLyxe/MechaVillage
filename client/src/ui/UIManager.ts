import { Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'system';
}

export class UIManager {
  private socket?: Socket;
  private chatMessages: HTMLElement;
  private chatInput: HTMLInputElement;

  constructor() {
    this.chatMessages = document.getElementById('chat-messages')!;
    this.chatInput = document.getElementById('chat-input') as HTMLInputElement;
  }

  public init(socket: Socket) {
    this.socket = socket;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Chat input handling
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendChatMessage();
      }
    });

    // Prevent game controls when typing in chat
    this.chatInput.addEventListener('focus', () => {
      // Disable game input
      this.chatInput.style.borderColor = '#4169E1';
    });

    this.chatInput.addEventListener('blur', () => {
      // Re-enable game input
      this.chatInput.style.borderColor = '#666';
    });
  }

  private sendChatMessage() {
    const message = this.chatInput.value.trim();
    if (!message || !this.socket) return;

    // Send message to server
    this.socket.emit('chat_message', message);
    
    // Clear input
    this.chatInput.value = '';
  }

  public addChatMessage(message: ChatMessage) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${message.type === 'system' ? 'chat-system' : 'chat-player'}`;
    
    const timestamp = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    if (message.type === 'system') {
      messageEl.innerHTML = `<span class="chat-time">[${timestamp}]</span> ${message.message}`;
    } else {
      messageEl.innerHTML = `
        <span class="chat-time">[${timestamp}]</span> 
        <span class="chat-username">${message.username}:</span> 
        <span class="chat-text">${this.escapeHtml(message.message)}</span>
      `;
    }
    
    this.chatMessages.appendChild(messageEl);
    
    // Auto scroll to bottom
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    
    // Remove old messages (keep last 50)
    const messages = this.chatMessages.children;
    if (messages.length > 50) {
      messages[0].remove();
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  public showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      z-index: 2000;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}