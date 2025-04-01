class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.subscriptions = new Set();
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.connectionPromise = null;
  }

  async connect() {
    if (this.connectionPromise) return this.connectionPromise;
    
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);
        
        this.socket.onopen = () => {
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
        
        this.socket.onclose = () => {
          this.connectionPromise = null;
          this.handleReconnect();
        };
        
        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };
      } catch (error) {
        reject(error);
      }
    });
    
    return this.connectionPromise;
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    
    this.reconnectAttempts++;
    setTimeout(() => {
      console.log(`Reconnecting attempt ${this.reconnectAttempts}...`);
      this.connect().then(() => {
        this.resubscribeAll();
      });
    }, this.reconnectDelay);
  }

  resubscribeAll() {
    this.subscriptions.forEach(subscription => {
      this.send(subscription);
    });
  }

  subscribe(channel, callback) {
    const subscription = JSON.stringify({ subscribe: channel });
    this.subscriptions.add(subscription);
    this.messageHandlers.set(channel, callback);
    this.send(subscription);
  }

  unsubscribe(channel) {
    const unsubscription = JSON.stringify({ forget: channel });
    this.subscriptions.delete(JSON.stringify({ subscribe: channel }));
    this.messageHandlers.delete(channel);
    this.send(unsubscription);
  }

  send(message) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      this.connect().then(() => {
        this.socket.send(message);
      });
    }
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      if (data?.subscription?.id) {
        const handler = this.messageHandlers.get(data.subscription.id);
        if (handler) handler(data);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connectionPromise = null;
    }
  }
}

export default WebSocketManager;