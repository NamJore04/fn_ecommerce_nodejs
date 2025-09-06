# OPERATIONS & MAINTENANCE GUIDE - COFFEE & TEA E-COMMERCE

## 1. System Operations Overview

### 1.1. Production Environment Management

#### **Environment Structure**
```
Production Environment
├── Frontend (React/Vue)
│   ├── CDN: Cloudflare/AWS CloudFront
│   ├── Caching: Browser + CDN caching
│   └── Monitoring: Real User Monitoring (RUM)
├── Backend (Node.js/Express)
│   ├── Load Balancer: Nginx/AWS ALB
│   ├── App Servers: 2+ instances
│   ├── Auto-scaling: CPU/Memory based
│   └── Health Checks: /health endpoint
├── Database Layer
│   ├── PostgreSQL: Primary + Read replicas
│   ├── Redis: Clustering for high availability
│   ├── ElasticSearch: Search indexing
│   └── Backup: Automated daily backups
└── Infrastructure
    ├── Container orchestration: Docker/Kubernetes
    ├── CI/CD: GitHub Actions/GitLab CI
    ├── Monitoring: Prometheus + Grafana
    └── Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
```

### 1.2. Service Level Agreements (SLA)

#### **Availability Targets**
- **Uptime**: 99.9% (8.77 hours downtime/year)
- **Response Time**: 
  - API endpoints: < 200ms (95th percentile)
  - Page load: < 2 seconds
  - Search results: < 500ms
- **Database Performance**:
  - Query response: < 100ms (90th percentile)
  - Connection pool: 80% utilization max

#### **Performance Metrics**
```javascript
// Key Performance Indicators (KPIs)
const performanceTargets = {
  // Response Time Targets
  apiResponseTime: {
    target: '< 200ms',
    warning: '> 150ms',
    critical: '> 500ms'
  },
  
  // Throughput Targets
  requestsPerSecond: {
    normal: '100-500 RPS',
    peak: '1000+ RPS',
    maximum: '2000 RPS'
  },
  
  // Error Rate Targets
  errorRate: {
    target: '< 0.1%',
    warning: '> 0.5%',
    critical: '> 1%'
  },
  
  // Database Performance
  dbConnections: {
    normal: '< 50 connections',
    warning: '> 80 connections',
    critical: '> 100 connections'
  }
};
```

## 2. Monitoring and Alerting

### 2.1. Application Monitoring

#### **Real-time Monitoring Dashboard**
```yaml
# Grafana Dashboard Configuration
dashboard_config:
  refresh_interval: 30s
  
  panels:
    - name: "API Response Times"
      type: "graph"
      metrics:
        - "http_request_duration_seconds{percentile='95'}"
        - "http_request_duration_seconds{percentile='99'}"
      
    - name: "Request Rate"
      type: "stat"
      metrics:
        - "rate(http_requests_total[5m])"
      
    - name: "Error Rate"
      type: "stat"
      metrics:
        - "rate(http_requests_total{status=~'5..'}[5m])"
        
    - name: "Active Users"
      type: "gauge"
      metrics:
        - "websocket_active_connections"
        
    - name: "Database Connections"
      type: "gauge"
      metrics:
        - "pg_stat_activity_count"
        
    - name: "Cache Hit Rate"
      type: "stat"
      metrics:
        - "redis_cache_hit_rate"
```

#### **Application Health Checks**
```javascript
// backend/middleware/healthcheck.js
const healthCheck = {
  // Basic health endpoint
  basic: async (req, res) => {
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV
    };
    
    res.json(checks);
  },

  // Detailed health check
  detailed: async (req, res) => {
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {}
    };

    try {
      // Database check
      checks.services.database = await checkDatabase();
      
      // Redis check
      checks.services.redis = await checkRedis();
      
      // External services check
      checks.services.email = await checkEmailService();
      checks.services.storage = await checkStorageService();
      
      // Memory usage
      checks.memory = {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
      };
      
      // Determine overall status
      const allHealthy = Object.values(checks.services).every(service => service.status === 'healthy');
      checks.status = allHealthy ? 'healthy' : 'degraded';
      
      res.json(checks);
    } catch (error) {
      checks.status = 'unhealthy';
      checks.error = error.message;
      res.status(503).json(checks);
    }
  }
};

async function checkDatabase() {
  const startTime = Date.now();
  try {
    await db.query('SELECT 1');
    return {
      status: 'healthy',
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
}
```

### 2.2. Alert Configuration

#### **Alert Rules (Prometheus)**
```yaml
# prometheus/alert-rules.yml
groups:
  - name: coffee-tea-alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      # High response time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 0.5
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"

      # Database connections
      - alert: DatabaseConnectionsHigh
        expr: pg_stat_activity_count > 80
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "High database connection count"
          description: "Database has {{ $value }} active connections"

      # Memory usage
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      # Service down
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.instance }} has been down for more than 1 minute"
```

#### **Notification Channels**
```yaml
# alertmanager/config.yml
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@coffeetea.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    email_configs:
      - to: 'devops@coffeetea.com'
        subject: '[ALERT] Coffee & Tea E-commerce - {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}
    
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts'
        title: 'Coffee & Tea Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
```

## 3. Backup and Recovery

### 3.1. Backup Strategy

#### **Automated Backup Script**
```bash
#!/bin/bash
# scripts/backup.sh

set -e

# Configuration
BACKUP_DIR="/backups"
DB_NAME="coffee_tea_db"
DB_USER="postgres"
RETENTION_DAYS=30
S3_BUCKET="coffee-tea-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Database backup
backup_database() {
    log "Starting database backup..."
    
    BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
    
    # Create database dump
    pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_FILE
    
    # Compress backup
    gzip $BACKUP_FILE
    
    log "Database backup completed: ${BACKUP_FILE}.gz"
    
    # Upload to S3 (if configured)
    if [ ! -z "$S3_BUCKET" ]; then
        aws s3 cp "${BACKUP_FILE}.gz" "s3://$S3_BUCKET/database/"
        log "Database backup uploaded to S3"
    fi
}

# Files backup
backup_files() {
    log "Starting files backup..."
    
    BACKUP_FILE="$BACKUP_DIR/files_backup_$TIMESTAMP.tar.gz"
    
    # Create archive of uploads
    tar -czf $BACKUP_FILE uploads/
    
    log "Files backup completed: $BACKUP_FILE"
    
    # Upload to S3 (if configured)
    if [ ! -z "$S3_BUCKET" ]; then
        aws s3 cp $BACKUP_FILE "s3://$S3_BUCKET/files/"
        log "Files backup uploaded to S3"
    fi
}

# Redis backup
backup_redis() {
    log "Starting Redis backup..."
    
    # Redis automatically creates dump.rdb
    if [ -f "/var/lib/redis/dump.rdb" ]; then
        cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis_backup_$TIMESTAMP.rdb"
        gzip "$BACKUP_DIR/redis_backup_$TIMESTAMP.rdb"
        
        log "Redis backup completed"
        
        # Upload to S3 (if configured)
        if [ ! -z "$S3_BUCKET" ]; then
            aws s3 cp "$BACKUP_DIR/redis_backup_$TIMESTAMP.rdb.gz" "s3://$S3_BUCKET/redis/"
            log "Redis backup uploaded to S3"
        fi
    fi
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups..."
    
    # Remove local backups older than retention period
    find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "*.sql" -mtime +$RETENTION_DAYS -delete
    
    log "Cleanup completed"
}

# Main backup function
main() {
    log "Starting backup process..."
    
    backup_database
    backup_files
    backup_redis
    cleanup_backups
    
    log "Backup process completed successfully"
}

# Execute if called directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
```

#### **Backup Schedule (Cron)**
```bash
# crontab -e
# Daily backup at 2 AM
0 2 * * * /opt/coffee-tea/scripts/backup.sh

# Weekly full backup at 1 AM Sunday
0 1 * * 0 /opt/coffee-tea/scripts/backup.sh --full

# Hourly Redis backup (during business hours)
0 8-18 * * * /opt/coffee-tea/scripts/backup-redis.sh
```

### 3.2. Recovery Procedures

#### **Database Recovery Script**
```bash
#!/bin/bash
# scripts/restore.sh

set -e

BACKUP_DIR="/backups"
DB_NAME="coffee_tea_db"
DB_USER="postgres"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# List available backups
list_backups() {
    log "Available database backups:"
    ls -la $BACKUP_DIR/db_backup_*.sql.gz | awk '{print $9, $5, $6, $7, $8}'
}

# Restore database from backup
restore_database() {
    local backup_file=$1
    
    if [ ! -f "$backup_file" ]; then
        log "Error: Backup file not found: $backup_file"
        exit 1
    fi
    
    log "Starting database restore from: $backup_file"
    
    # Stop application to prevent connections
    docker-compose stop backend
    
    # Drop existing database
    dropdb -h localhost -U $DB_USER $DB_NAME || true
    
    # Create new database
    createdb -h localhost -U $DB_USER $DB_NAME
    
    # Restore from backup
    if [[ $backup_file == *.gz ]]; then
        gunzip -c $backup_file | psql -h localhost -U $DB_USER -d $DB_NAME
    else
        psql -h localhost -U $DB_USER -d $DB_NAME < $backup_file
    fi
    
    # Restart application
    docker-compose start backend
    
    log "Database restore completed successfully"
}

# Point-in-time recovery
point_in_time_recovery() {
    local target_time=$1
    
    log "Starting point-in-time recovery to: $target_time"
    
    # This requires WAL archiving to be configured
    # pg_basebackup + WAL replay would be implemented here
    
    log "Point-in-time recovery completed"
}

# Main function
case "${1:-help}" in
    "list")
        list_backups
        ;;
    "restore")
        if [ -z "$2" ]; then
            echo "Usage: $0 restore <backup_file>"
            exit 1
        fi
        restore_database "$2"
        ;;
    "pitr")
        if [ -z "$2" ]; then
            echo "Usage: $0 pitr <target_timestamp>"
            exit 1
        fi
        point_in_time_recovery "$2"
        ;;
    *)
        echo "Usage: $0 {list|restore|pitr}"
        echo "  list          - List available backups"
        echo "  restore FILE  - Restore from specific backup file"
        echo "  pitr TIME     - Point-in-time recovery to timestamp"
        exit 1
        ;;
esac
```

## 4. Security Operations

### 4.1. Security Monitoring

#### **Security Event Monitoring**
```javascript
// backend/middleware/securityMonitoring.js
const securityEvents = {
  // Failed login attempts
  loginFailure: (req, userId, reason) => {
    const event = {
      type: 'LOGIN_FAILURE',
      timestamp: new Date().toISOString(),
      userId: userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      reason: reason,
      severity: 'WARNING'
    };
    
    // Log to security log
    logger.security(event);
    
    // Check for brute force
    checkBruteForce(req.ip, userId);
  },

  // Suspicious activity
  suspiciousActivity: (req, activity, details) => {
    const event = {
      type: 'SUSPICIOUS_ACTIVITY',
      timestamp: new Date().toISOString(),
      activity: activity,
      details: details,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'HIGH'
    };
    
    logger.security(event);
    
    // Trigger alerts for high severity events
    if (event.severity === 'HIGH') {
      alertManager.trigger('security', event);
    }
  },

  // Administrative actions
  adminAction: (req, adminId, action, target) => {
    const event = {
      type: 'ADMIN_ACTION',
      timestamp: new Date().toISOString(),
      adminId: adminId,
      action: action,
      target: target,
      ip: req.ip,
      severity: 'INFO'
    };
    
    logger.security(event);
  }
};

// Brute force protection
const bruteForceProtection = {
  attempts: new Map(),
  
  checkBruteForce: (ip, userId) => {
    const key = `${ip}:${userId}`;
    const attempts = this.attempts.get(key) || [];
    const now = Date.now();
    
    // Clean old attempts (older than 1 hour)
    const recentAttempts = attempts.filter(time => now - time < 3600000);
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    // Check if threshold exceeded
    if (recentAttempts.length >= 5) {
      // Block IP for 1 hour
      rateLimiter.blockIP(ip, 3600);
      
      // Send alert
      alertManager.trigger('security', {
        type: 'BRUTE_FORCE_DETECTED',
        ip: ip,
        userId: userId,
        attempts: recentAttempts.length
      });
    }
  }
};
```

#### **Security Audit Script**
```bash
#!/bin/bash
# scripts/security-audit.sh

set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check for security updates
check_updates() {
    log "Checking for security updates..."
    
    # Check npm vulnerabilities
    cd backend && npm audit --audit-level=moderate
    cd ../frontend && npm audit --audit-level=moderate
    
    # Check Docker image vulnerabilities (if using Trivy)
    if command -v trivy &> /dev/null; then
        trivy image coffee-tea-backend:latest
        trivy image coffee-tea-frontend:latest
    fi
}

# Check SSL certificate expiry
check_ssl_expiry() {
    log "Checking SSL certificate expiry..."
    
    # Check certificate expiry date
    CERT_FILE="/etc/nginx/ssl/cert.pem"
    if [ -f "$CERT_FILE" ]; then
        EXPIRY_DATE=$(openssl x509 -enddate -noout -in $CERT_FILE | cut -d= -f2)
        EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
        CURRENT_EPOCH=$(date +%s)
        DAYS_UNTIL_EXPIRY=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
        
        if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
            log "WARNING: SSL certificate expires in $DAYS_UNTIL_EXPIRY days"
            # Send alert
            echo "SSL certificate expires in $DAYS_UNTIL_EXPIRY days" | mail -s "SSL Certificate Expiry Warning" admin@coffeetea.com
        else
            log "SSL certificate is valid for $DAYS_UNTIL_EXPIRY days"
        fi
    fi
}

# Check file permissions
check_permissions() {
    log "Checking file permissions..."
    
    # Check sensitive files
    find . -name "*.env" -exec ls -la {} \;
    find . -name "*.key" -exec ls -la {} \;
    find . -name "*.pem" -exec ls -la {} \;
    
    # Check for world-writable files
    WORLD_WRITABLE=$(find . -type f -perm -002 2>/dev/null || true)
    if [ ! -z "$WORLD_WRITABLE" ]; then
        log "WARNING: World-writable files found:"
        echo "$WORLD_WRITABLE"
    fi
}

# Check for suspicious processes
check_processes() {
    log "Checking for suspicious processes..."
    
    # Check for unusual network connections
    netstat -tuln | grep LISTEN
    
    # Check running containers
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Main audit function
main() {
    log "Starting security audit..."
    
    check_updates
    check_ssl_expiry
    check_permissions
    check_processes
    
    log "Security audit completed"
}

main
```

### 4.2. Incident Response

#### **Incident Response Playbook**
```yaml
# Incident Response Procedures
incident_types:
  security_breach:
    severity: CRITICAL
    response_time: "15 minutes"
    steps:
      1. "Isolate affected systems"
      2. "Preserve evidence"
      3. "Assess scope of breach"
      4. "Notify stakeholders"
      5. "Implement containment"
      6. "Document incident"
      7. "Conduct post-incident review"
    
  service_outage:
    severity: HIGH
    response_time: "5 minutes"
    steps:
      1. "Check system status"
      2. "Identify root cause"
      3. "Implement immediate fix"
      4. "Restore service"
      5. "Monitor recovery"
      6. "Document incident"
    
  performance_degradation:
    severity: MEDIUM
    response_time: "30 minutes"
    steps:
      1. "Monitor metrics"
      2. "Identify bottlenecks"
      3. "Scale resources if needed"
      4. "Optimize performance"
      5. "Monitor improvement"

escalation_matrix:
  level_1: "On-call engineer"
  level_2: "Senior engineer + Team lead"
  level_3: "Engineering manager + CTO"
  level_4: "Executive team"

communication:
  internal:
    - "Slack #incidents channel"
    - "Email to team leads"
    - "Status page updates"
  
  external:
    - "Customer notification email"
    - "Social media updates"
    - "Status page announcements"
```

#### **Incident Response Script**
```bash
#!/bin/bash
# scripts/incident-response.sh

set -e

INCIDENT_ID="INC-$(date +%Y%m%d-%H%M%S)"
INCIDENT_LOG="/var/log/incidents/${INCIDENT_ID}.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $INCIDENT_LOG
}

# Emergency procedures
emergency_procedures() {
    local incident_type=$1
    
    log "INCIDENT: $incident_type - ID: $INCIDENT_ID"
    
    case $incident_type in
        "security_breach")
            log "Executing security breach response..."
            # Isolate systems
            docker-compose down
            # Block suspicious IPs
            iptables -A INPUT -s SUSPICIOUS_IP -j DROP
            # Preserve logs
            cp /var/log/nginx/* /var/log/incidents/
            ;;
            
        "service_outage")
            log "Executing service outage response..."
            # Restart services
            docker-compose restart
            # Check health
            ./scripts/healthcheck.sh
            ;;
            
        "ddos_attack")
            log "Executing DDoS response..."
            # Enable rate limiting
            nginx -s reload
            # Block attack IPs
            # Activate Cloudflare "Under Attack" mode
            ;;
    esac
}

# Notification system
send_notifications() {
    local incident_type=$1
    local message=$2
    
    # Slack notification
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 INCIDENT: $incident_type - $message\"}" \
        $SLACK_WEBHOOK_URL
    
    # Email notification
    echo "$message" | mail -s "INCIDENT: $incident_type" alerts@coffeetea.com
    
    # SMS notification (for critical incidents)
    if [ "$incident_type" == "security_breach" ]; then
        # Send SMS via Twilio or similar service
        curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_SID/Messages.json" \
            --data-urlencode "From=$TWILIO_FROM" \
            --data-urlencode "To=$EMERGENCY_PHONE" \
            --data-urlencode "Body=CRITICAL INCIDENT: $incident_type" \
            -u "$TWILIO_SID:$TWILIO_TOKEN"
    fi
}

# Main function
main() {
    local incident_type=$1
    local description=$2
    
    if [ -z "$incident_type" ]; then
        echo "Usage: $0 <incident_type> [description]"
        echo "Types: security_breach, service_outage, ddos_attack, performance_issue"
        exit 1
    fi
    
    log "Incident response initiated for: $incident_type"
    
    emergency_procedures $incident_type
    send_notifications $incident_type "$description"
    
    log "Initial incident response completed"
    log "Incident ID: $INCIDENT_ID"
    log "Continue monitoring and document resolution steps"
}

main "$@"
```

## 5. Performance Optimization

### 5.1. Database Optimization

#### **Database Maintenance Script**
```sql
-- scripts/db-maintenance.sql

-- Analyze database performance
SELECT 
    schemaname,
    tablename,
    attname,
    inherited,
    null_frac,
    avg_width,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Check for slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_scan ASC;

-- Find unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 
    AND indexname NOT LIKE '%_pkey';

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Vacuum and analyze tables
VACUUM ANALYZE;

-- Update table statistics
ANALYZE;

-- Reindex if needed (run during maintenance window)
-- REINDEX DATABASE coffee_tea_db;
```

#### **Performance Monitoring Query**
```javascript
// backend/utils/performanceMonitor.js
const performanceMonitor = {
  // Monitor slow queries
  async monitorSlowQueries() {
    const slowQueries = await db.query(`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows,
        100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
      FROM pg_stat_statements 
      WHERE mean_time > 100 
      ORDER BY mean_time DESC 
      LIMIT 20
    `);
    
    if (slowQueries.rows.length > 0) {
      logger.warn('Slow queries detected:', {
        count: slowQueries.rows.length,
        queries: slowQueries.rows
      });
      
      // Alert if too many slow queries
      if (slowQueries.rows.length > 10) {
        alertManager.trigger('performance', {
          type: 'SLOW_QUERIES',
          count: slowQueries.rows.length
        });
      }
    }
  },

  // Monitor connection pool
  async monitorConnectionPool() {
    const poolStats = {
      totalConnections: db.pool.totalCount,
      activeConnections: db.pool.idleCount,
      waitingClients: db.pool.waitingCount
    };
    
    // Log pool statistics
    logger.info('Database pool stats:', poolStats);
    
    // Alert if pool utilization is too high
    const utilizationPercent = (poolStats.activeConnections / poolStats.totalConnections) * 100;
    if (utilizationPercent > 80) {
      alertManager.trigger('performance', {
        type: 'HIGH_DB_UTILIZATION',
        utilization: utilizationPercent
      });
    }
    
    return poolStats;
  },

  // Monitor cache performance
  async monitorCache() {
    const cacheStats = await redis.info('stats');
    const hitRate = parseFloat(cacheStats.keyspace_hits) / 
                   (parseFloat(cacheStats.keyspace_hits) + parseFloat(cacheStats.keyspace_misses));
    
    logger.info('Cache performance:', {
      hitRate: hitRate,
      hits: cacheStats.keyspace_hits,
      misses: cacheStats.keyspace_misses
    });
    
    // Alert if cache hit rate is too low
    if (hitRate < 0.8) {
      alertManager.trigger('performance', {
        type: 'LOW_CACHE_HIT_RATE',
        hitRate: hitRate
      });
    }
    
    return { hitRate, ...cacheStats };
  }
};

// Schedule performance monitoring
setInterval(async () => {
  try {
    await performanceMonitor.monitorSlowQueries();
    await performanceMonitor.monitorConnectionPool();
    await performanceMonitor.monitorCache();
  } catch (error) {
    logger.error('Performance monitoring error:', error);
  }
}, 300000); // Every 5 minutes
```

### 5.2. Application Performance Tuning

#### **Performance Optimization Checklist**
```javascript
// Performance optimization guidelines
const performanceOptimizations = {
  // Frontend optimizations
  frontend: {
    // Code splitting and lazy loading
    codesplitting: {
      description: "Split code by routes and components",
      implementation: `
        // React lazy loading
        const ProductList = lazy(() => import('./components/ProductList'));
        const UserProfile = lazy(() => import('./components/UserProfile'));
        
        // Route-based code splitting
        {
          path: '/products',
          component: lazy(() => import('./pages/Products'))
        }
      `
    },
    
    // Image optimization
    imageOptimization: {
      description: "Optimize images for web",
      implementation: `
        // Use WebP format with fallback
        <picture>
          <source srcSet="image.webp" type="image/webp" />
          <img src="image.jpg" alt="Product" loading="lazy" />
        </picture>
        
        // Image compression settings
        const imageSettings = {
          quality: 80,
          format: 'webp',
          progressive: true,
          responsive: true
        };
      `
    },
    
    // Caching strategies
    caching: {
      description: "Implement browser caching",
      implementation: `
        // Service Worker caching
        const CACHE_NAME = 'coffee-tea-v1';
        const urlsToCache = [
          '/',
          '/static/css/main.css',
          '/static/js/main.js'
        ];
        
        // Cache static assets for 1 year
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
          expires 1y;
          add_header Cache-Control "public, immutable";
        }
      `
    }
  },

  // Backend optimizations
  backend: {
    // Database query optimization
    databaseOptimization: {
      description: "Optimize database queries",
      implementation: `
        // Use query builder for complex queries
        const products = await db.query(\`
          SELECT p.*, c.name as category_name, 
                 COUNT(r.id) as review_count,
                 AVG(r.rating) as avg_rating
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN reviews r ON p.id = r.product_id
          WHERE p.is_active = true
          GROUP BY p.id, c.name
          ORDER BY p.created_at DESC
          LIMIT $1 OFFSET $2
        \`, [limit, offset]);
        
        // Use prepared statements
        const statement = await db.prepare('SELECT * FROM products WHERE id = $1');
        const product = await statement.get(productId);
      `
    },
    
    // Caching layers
    cachingLayers: {
      description: "Implement multi-level caching",
      implementation: `
        // Redis caching middleware
        const cacheMiddleware = (duration = 300) => {
          return async (req, res, next) => {
            const key = \`cache:\${req.originalUrl}\`;
            
            try {
              const cached = await redis.get(key);
              if (cached) {
                return res.json(JSON.parse(cached));
              }
              
              // Store original res.json
              const originalJson = res.json;
              res.json = function(data) {
                // Cache the response
                redis.setex(key, duration, JSON.stringify(data));
                return originalJson.call(this, data);
              };
              
              next();
            } catch (error) {
              next();
            }
          };
        };
        
        // Application-level caching
        app.get('/api/v1/products', cacheMiddleware(600), getProducts);
      `
    }
  }
};
```

## 6. Documentation and Knowledge Management

### 6.1. Operations Documentation

#### **System Architecture Documentation**
```markdown
# System Architecture Overview

## High-Level Architecture
[Include system architecture diagram]

## Component Responsibilities
- **Load Balancer**: Traffic distribution and SSL termination
- **API Gateway**: Request routing and authentication
- **Application Servers**: Business logic processing
- **Database Cluster**: Data persistence and retrieval
- **Cache Layer**: Performance optimization
- **Message Queue**: Asynchronous processing
- **Monitoring Stack**: System observability

## Data Flow
1. Client request → Load Balancer
2. Load Balancer → API Gateway
3. API Gateway → Application Server
4. Application Server → Database/Cache
5. Response path (reverse)

## Security Boundaries
- DMZ: Load Balancer, API Gateway
- Application Zone: App servers, Redis
- Data Zone: PostgreSQL, backups
- Management Zone: Monitoring, logging
```

#### **Runbook Template**
```markdown
# Runbook: [Service/Component Name]

## Overview
Brief description of the service and its purpose.

## Service Details
- **Repository**: Link to code repository
- **Documentation**: Link to technical docs
- **Monitoring**: Links to dashboards
- **Logs**: Location of log files

## Common Operations

### Start Service
```bash
docker-compose up -d [service-name]
```

### Stop Service
```bash
docker-compose stop [service-name]
```

### Check Status
```bash
docker-compose ps [service-name]
curl -f http://localhost:port/health
```

### View Logs
```bash
docker-compose logs -f [service-name]
tail -f /var/log/[service-name]/app.log
```

## Troubleshooting

### Common Issues
1. **Service Won't Start**
   - Check dependencies are running
   - Verify environment variables
   - Check port conflicts
   - Review startup logs

2. **High Memory Usage**
   - Check for memory leaks
   - Review garbage collection
   - Monitor heap dumps
   - Scale resources if needed

3. **Database Connection Issues**
   - Verify database is running
   - Check connection pool settings
   - Review network connectivity
   - Check authentication credentials

### Emergency Procedures
- **Complete Service Failure**: [Step-by-step recovery]
- **Data Corruption**: [Recovery from backups]
- **Security Incident**: [Incident response steps]

## Contacts
- **Primary On-call**: [Contact information]
- **Secondary On-call**: [Contact information]
- **Escalation**: [Manager contact]
```

### 6.2. Change Management

#### **Change Management Process**
```yaml
# Change Management Workflow
change_categories:
  emergency:
    approval_required: false
    documentation: "Post-implementation"
    rollback_plan: "Required"
    
  standard:
    approval_required: true
    documentation: "Pre-implementation"
    testing: "Required"
    rollback_plan: "Required"
    
  routine:
    approval_required: false
    documentation: "Pre-implementation"
    testing: "Automated"

change_board:
  members:
    - "Technical Lead"
    - "Operations Manager"
    - "Security Officer"
  
  meeting_schedule: "Weekly on Fridays"
  
  approval_criteria:
    - "Risk assessment completed"
    - "Testing plan documented"
    - "Rollback plan documented"
    - "Impact analysis completed"

deployment_windows:
  maintenance:
    - "Saturday 02:00-06:00 UTC"
    - "Sunday 02:00-06:00 UTC"
  
  emergency:
    - "Anytime with manager approval"
  
  blackout_periods:
    - "Black Friday week"
    - "New Year period"
    - "Major sales events"
```

---

## Summary

Tài liệu **Operations & Maintenance Guide** này cung cấp hướng dẫn toàn diện cho việc vận hành và bảo trì hệ thống Coffee & Tea E-commerce, bao gồm:

### **Các Tính Năng Chính:**
1. **System Operations**: Quản lý môi trường production, SLA targets
2. **Monitoring & Alerting**: Dashboard theo dõi, cảnh báo tự động
3. **Backup & Recovery**: Chiến lược backup, quy trình khôi phục
4. **Security Operations**: Giám sát bảo mật, ứng phó sự cố
5. **Performance Optimization**: Tối ưu database, application performance
6. **Documentation**: Hướng dẫn vận hành, quản lý thay đổi

### **Tuân Thủ Yêu Cầu NodeJS Final Project:**
- ✅ **Production-ready deployment** với Docker Compose
- ✅ **Monitoring và logging** với Prometheus + Grafana
- ✅ **Security best practices** với SSL, rate limiting
- ✅ **Database optimization** với PostgreSQL tuning
- ✅ **Performance monitoring** với real-time metrics
- ✅ **Backup strategies** với automated scripts
- ✅ **Incident response** procedures
- ✅ **Change management** workflow

### **Gói Tài Liệu BA Hoàn Chỉnh:**
Hiện tại chúng ta đã có **9 tài liệu BA chuyên nghiệp** covering toàn bộ lifecycle:

1. **Requirements** ✅ - Phân tích yêu cầu nghiệp vụ
2. **Use Cases** ✅ - Biểu đồ Use Case scenarios  
3. **Database Design** ✅ - Thiết kế CSDL chi tiết
4. **API Specification** ✅ - Đặc tả REST API đầy đủ
5. **Technical Architecture** ✅ - Kiến trúc hệ thống
6. **Project Plan** ✅ - Kế hoạch dự án 8 tuần
7. **Test Specification** ✅ - Chiến lược testing toàn diện
8. **Deployment Guide** ✅ - Hướng dẫn triển khai production
9. **Operations Guide** ✅ - Vận hành và bảo trì hệ thống

**Tất cả tài liệu đều sẵn sàng để team development bắt đầu implementation theo NodeJS Final Project requirements!** 🚀
