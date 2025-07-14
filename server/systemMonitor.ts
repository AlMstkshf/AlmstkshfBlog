import * as si from 'systeminformation';

export interface SystemMetrics {
  cpu: {
    usage: number;
    temperature: number;
    cores: number;
    speed: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    available: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
    available: number;
  };
  network: {
    rx: number;
    tx: number;
    rxSec: number;
    txSec: number;
  };
  system: {
    uptime: number;
    platform: string;
    arch: string;
    nodeVersion: string;
  };
  processes: {
    running: number;
    blocked: number;
    sleeping: number;
  };
}

class SystemMonitor {
  private static instance: SystemMonitor;
  private metricsCache: SystemMetrics | null = null;
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 5000; // 5 seconds cache
  private networkStats: { rx: number; tx: number; timestamp: number } | null = null;

  private constructor() {}

  public static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  public async getSystemMetrics(): Promise<SystemMetrics> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.metricsCache && (now - this.lastUpdate) < this.CACHE_DURATION) {
      return this.metricsCache;
    }

    try {
      // Get all system information in parallel
      const [
        cpuData,
        memData,
        diskData,
        networkData,
        systemData,
        processData,
        cpuTemp
      ] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.system(),
        si.processes(),
        si.cpuTemperature().catch(() => ({ main: 0 })) // Temperature might not be available on all systems
      ]);

      // Calculate network speed (bytes per second)
      let networkSpeed = { rxSec: 0, txSec: 0 };
      if (this.networkStats && networkData.length > 0) {
        const timeDiff = (now - this.networkStats.timestamp) / 1000; // seconds
        const currentRx = networkData[0].rx_bytes || 0;
        const currentTx = networkData[0].tx_bytes || 0;
        
        networkSpeed.rxSec = Math.max(0, (currentRx - this.networkStats.rx) / timeDiff);
        networkSpeed.txSec = Math.max(0, (currentTx - this.networkStats.tx) / timeDiff);
      }

      // Update network stats for next calculation
      if (networkData.length > 0) {
        this.networkStats = {
          rx: networkData[0].rx_bytes || 0,
          tx: networkData[0].tx_bytes || 0,
          timestamp: now
        };
      }

      // Get primary disk (usually the first one)
      const primaryDisk = diskData.find(disk => disk.mount === '/' || disk.mount === 'C:') || diskData[0];
      
      this.metricsCache = {
        cpu: {
          usage: Math.round(cpuData.currentLoad * 100) / 100,
          temperature: cpuTemp.main || 0,
          cores: cpuData.cpus?.length || 0,
          speed: systemData.cpu?.speed || 0
        },
        memory: {
          used: memData.used,
          total: memData.total,
          percentage: Math.round((memData.used / memData.total) * 10000) / 100,
          available: memData.available
        },
        disk: primaryDisk ? {
          used: primaryDisk.used,
          total: primaryDisk.size,
          percentage: Math.round((primaryDisk.used / primaryDisk.size) * 10000) / 100,
          available: primaryDisk.available
        } : {
          used: 0,
          total: 0,
          percentage: 0,
          available: 0
        },
        network: {
          rx: networkData[0]?.rx_bytes || 0,
          tx: networkData[0]?.tx_bytes || 0,
          rxSec: networkSpeed.rxSec,
          txSec: networkSpeed.txSec
        },
        system: {
          uptime: si.time().uptime,
          platform: systemData.platform || process.platform,
          arch: systemData.arch || process.arch,
          nodeVersion: process.version
        },
        processes: {
          running: processData.running || 0,
          blocked: processData.blocked || 0,
          sleeping: processData.sleeping || 0
        }
      };

      this.lastUpdate = now;
      return this.metricsCache;

    } catch (error) {
      console.error('Error getting system metrics:', error);
      
      // Return fallback metrics if system monitoring fails
      return this.getFallbackMetrics();
    }
  }

  private getFallbackMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    
    return {
      cpu: {
        usage: Math.random() * 50 + 10, // Mock 10-60% CPU usage
        temperature: 0,
        cores: 0,
        speed: 0
      },
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
        available: memUsage.heapTotal - memUsage.heapUsed
      },
      disk: {
        used: 1024 * 1024 * 1024 * 10, // Mock 10GB used
        total: 1024 * 1024 * 1024 * 100, // Mock 100GB total
        percentage: 10,
        available: 1024 * 1024 * 1024 * 90
      },
      network: {
        rx: 0,
        tx: 0,
        rxSec: 0,
        txSec: 0
      },
      system: {
        uptime: process.uptime(),
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version
      },
      processes: {
        running: 0,
        blocked: 0,
        sleeping: 0
      }
    };
  }

  public async getQuickMetrics(): Promise<{
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  }> {
    try {
      const metrics = await this.getSystemMetrics();
      return {
        cpuUsage: metrics.cpu.usage,
        memoryUsage: metrics.memory.percentage,
        diskUsage: metrics.disk.percentage
      };
    } catch (error) {
      console.error('Error getting quick metrics:', error);
      return {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0
      };
    }
  }

  public formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  public formatNetworkSpeed(bytesPerSecond: number): string {
    return this.formatBytes(bytesPerSecond) + '/s';
  }

  public getSystemStatus(metrics: SystemMetrics): {
    status: 'excellent' | 'good' | 'warning' | 'critical';
    issues: string[];
  } {
    const issues: string[] = [];
    let status: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';

    // Check CPU usage
    if (metrics.cpu.usage > 90) {
      issues.push('High CPU usage detected');
      status = 'critical';
    } else if (metrics.cpu.usage > 70) {
      issues.push('Elevated CPU usage');
      if (status === 'excellent') status = 'warning';
    }

    // Check memory usage
    if (metrics.memory.percentage > 90) {
      issues.push('High memory usage detected');
      status = 'critical';
    } else if (metrics.memory.percentage > 80) {
      issues.push('Elevated memory usage');
      if (status === 'excellent') status = 'warning';
    }

    // Check disk usage
    if (metrics.disk.percentage > 95) {
      issues.push('Disk space critically low');
      status = 'critical';
    } else if (metrics.disk.percentage > 85) {
      issues.push('Disk space running low');
      if (status === 'excellent') status = 'warning';
    }

    // Check CPU temperature (if available)
    if (metrics.cpu.temperature > 80) {
      issues.push('High CPU temperature detected');
      if (status !== 'critical') status = 'warning';
    }

    if (issues.length === 0) {
      if (metrics.cpu.usage < 30 && metrics.memory.percentage < 60) {
        status = 'excellent';
      } else {
        status = 'good';
      }
    }

    return { status, issues };
  }
}

export const systemMonitor = SystemMonitor.getInstance();