interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number;
  resetTimeout: number;
}

enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private nextAttemptTime = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN - operation not allowed');
      }
      this.state = CircuitState.HALF_OPEN;
    }

    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), this.config.timeout)
      );
      
      const result = await Promise.race([operation(), timeout]);
      
      // Success - reset failure count
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.resetTimeout;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// AI service circuit breakers
export const openaiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  timeout: 30000, // 30 seconds
  resetTimeout: 60000 // 1 minute
});

export const newsApiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 10000, // 10 seconds  
  resetTimeout: 300000 // 5 minutes
});