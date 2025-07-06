interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

interface MemoryThresholds {
  warning: number; // MB
  critical: number; // MB
  cleanup: number; // MB
}

export class MemoryManager {
  private thresholds: MemoryThresholds = {
    warning: 256, // 256MB
    critical: 512, // 512MB
    cleanup: 128  // 128MB cleanup target
  };

  private monitoringInterval: NodeJS.Timeout | null = null;
  private cleanupCallbacks: (() => void)[] = [];

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Check memory every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000);
  }

  private checkMemoryUsage(): void {
    const usage = this.getMemoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;

    if (heapUsedMB > this.thresholds.critical) {
      console.error(`Critical memory usage: ${heapUsedMB.toFixed(2)}MB`);
      this.performCleanup();
    } else if (heapUsedMB > this.thresholds.warning) {
      console.warn(`High memory usage: ${heapUsedMB.toFixed(2)}MB`);
    }
  }

  getMemoryUsage(): MemoryUsage {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss
    };
  }

  registerCleanupCallback(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  private performCleanup(): void {
    console.log('Performing memory cleanup...');
    
    // Execute all registered cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('Garbage collection triggered');
    }
  }

  getMemoryStats(): { usage: MemoryUsage; thresholds: MemoryThresholds } {
    return {
      usage: this.getMemoryUsage(),
      thresholds: this.thresholds
    };
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

export const memoryManager = new MemoryManager();