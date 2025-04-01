class StateManager {
  constructor() {
    this.state = {
      trading: {
        active: false,
        currentMarket: null,
        settings: {
          targetProfit: 10,
          tradeType: 'even_odd'
        }
      },
      user: null,
      derivAccounts: [],
      markets: []
    };
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  updateState(updater) {
    const newState = typeof updater === 'function' 
      ? updater(this.state) 
      : { ...this.state, ...updater };
    
    this.state = newState;
    this.notifySubscribers();
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  getState() {
    return this.state;
  }
}

export const stateManager = new StateManager();