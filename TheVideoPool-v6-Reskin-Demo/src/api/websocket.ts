// ============================================
// THE VIDEO POOL - WEBSOCKET SERVICE
// ============================================

import { useUIStore } from '@/stores/uiStore';
import type { Notification } from '@/types';

type MessageHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private isConnecting = false;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.isConnecting = false;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  private handleMessage(message: { type: string; data: any }) {
    const { type, data } = message;

    // Notify registered handlers
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }

    // Handle built-in message types
    switch (type) {
      case 'notification:new':
        this.handleNotification(data);
        break;
      case 'download:progress':
        this.handleDownloadProgress(data);
        break;
      case 'download:complete':
        this.handleDownloadComplete(data);
        break;
      case 'weekly-pack:ready':
        this.handleWeeklyPackReady(data);
        break;
    }
  }

  private handleNotification(data: Notification) {
    const { addNotification } = useUIStore.getState();
    addNotification(data);
  }

  private handleDownloadProgress(data: { id: string; progress: number }) {
    const { updateDownloadProgress } = useUIStore.getState();
    updateDownloadProgress(data.id, data.progress, 'downloading');
  }

  private handleDownloadComplete(data: { id: string }) {
    const { updateDownloadProgress } = useUIStore.getState();
    updateDownloadProgress(data.id, 100, 'completed');
  }

  private handleWeeklyPackReady(data: any) {
    const { addNotification } = useUIStore.getState();
    addNotification({
      id: Date.now(),
      type: 'weekly_pack',
      title: 'Weekly Discovery Pack Ready!',
      message: 'Your personalized 20 picks are waiting for you.',
      read: false,
      createdAt: new Date().toISOString(),
      data,
    });
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  off(type: string, handler: MessageHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();

// React hook for WebSocket
export function useWebSocket(type: string, handler: MessageHandler) {
  // Auto-connect on first use
  if (!websocketService.isConnected) {
    websocketService.connect();
  }

  // Subscribe to events
  const unsubscribe = websocketService.on(type, handler);

  // Cleanup on unmount would be handled by the component using this hook
  return unsubscribe;
}

export default websocketService;
