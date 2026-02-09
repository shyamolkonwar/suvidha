# SUVIDHA Maintenance Procedures

## Daily Maintenance

### Morning Checklist (9:00 AM)
```bash
# Check system health
kubectl get pods -n suvidha
docker ps  # For local dev

# Review overnight logs
kubectl logs -n suvidha --since=12h deployment/auth-service
kubectl logs -n suvidha --since=12h deployment/payment-service

# Check database connections
kubectl exec -it deployment/auth-service -n suvidha -- npm run db:health

# Verify backup completion
ls -lh /backups/suvidha/ | tail -10
```

### Evening Checklist (6:00 PM)
```bash
# Review daily metrics
curl http://api.suvidha.example.com/analytics/dashboard

# Check disk space
df -h

# Review active alerts
kubectl get prometheus-alerts -n suvidha
```

## Weekly Maintenance

### Every Monday
- [ ] Review feedback from previous week
- [ ] Check security updates
- [ ] Review and clean up old logs
- [ ] Database performance analysis
- [ ] Update documentation if needed

```bash
# Clean old logs (keep 30 days)
find /var/log/suvidha -name "*.log" -mtime +30 -delete

# Database vacuum
kubectl exec -it postgres-auth -n suvidha -- psql -U postgres -d auth_db -c "VACUUM ANALYZE;"
```

### Every Friday
- [ ] Full system backup verification
- [ ] Security scan
- [ ] Performance metrics review
- [ ] Update sprint planning

## Monthly Maintenance

### First Monday of Month
- [ ] Review SLA compliance
- [ ] Update dependencies
- [ ] Security patches
- [ ] Capacity planning review
- [ ] Cost analysis

```bash
# Check for npm security vulnerabilities
cd services/auth-service && npm audit
cd services/utility-service && npm audit
# ... repeat for all services

# Update dependencies
npm update --save
```

### Last Friday of Month
- [ ] Full disaster recovery test
- [ ] Backup restore test
- [ ] Load testing
- [ ] Update runbooks

## Incident Response

### Severity Levels

**P0 (Critical)** - System down
- Response: Immediate
- Resolution: 1 hour
- Escalation: CTO + Team Lead

**P1 (High)** - Major service degradation
- Response: 15 minutes
- Resolution: 4 hours
- Escalation: Team Lead

**P2 (Medium)** - Minor issues
- Response: 1 hour
- Resolution: 24 hours
- Escalation: On-call engineer

**P3 (Low)** - Enhancement requests
- Response: Next business day
- Resolution: Next sprint

### Incident Checklist

1. **Acknowledge**
   - Update status page
   - Notify stakeholders
   - Create incident ticket

2. **Diagnose**
   - Check logs
   - Review metrics
   - Identify root cause

3. **Fix**
   - Apply hotfix OR
   - Rollback deployment
   - Verify resolution

4. **Document**
   - Post-mortem report
   - Update runbooks
   - Share learnings

## Common Issues & Solutions

### Issue: High CPU Usage

**Diagnosis:**
```bash
kubectl top pods -n suvidha
kubectl logs deployment/service-name -n suvidha | grep "CPU"
```

**Solution:**
- Scale horizontally: `kubectl scale deployment/service --replicas=5`
- Check for infinite loops in code
- Review recent deployments

### Issue: Database Connection Pool Exhausted

**Diagnosis:**
```bash
kubectl exec -it postgres-auth -n suvidha -- psql -c "SELECT count(*) FROM pg_stat_activity;"
```

**Solution:**
- Increase connection pool size in service config
- Check for connection leaks
- Restart affected service

### Issue: Slow API Response

**Diagnosis:**
```bash
# Check response times
kubectl logs deployment/service-name | grep "response_time"

# Check database queries
kubectl exec -it postgres-auth -n suvidha -- psql -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

**Solution:**
- Add database indexes
- Implement caching (Redis)
- Optimize queries

## Backup Procedures

### Daily Backups (Automated)

Runs via cron at 2:00 AM:
```bash
0 2 * * * /app/scripts/backup-databases.sh >> /var/log/backups.log 2>&1
```

### Backup Verification (Weekly)

Every Sunday:
```bash
# Test restore on staging environment
./scripts/restore-databases.sh <latest_backup_date>
```

### Backup Retention

- Daily backups: 30 days
- Weekly backups: 3 months
- Monthly backups: 1 year

## Performance Optimization

### Database Optimization

**Monthly:**
```sql
-- Reindex all databases
REINDEX DATABASE auth_db;

-- Update statistics
ANALYZE;

-- Check bloat
SELECT schemaname, tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
LIMIT 20;
```

### Application Optimization

**Quarterly:**
- Review slow endpoints (>500ms)
- Implement caching strategies
- Optimize database queries
- Update dependencies

## Security Procedures

### Weekly Security Checks
```bash
# Check for CVEs
npm audit
docker scan your-image:latest

# Review access logs
kubectl logs -n suvidha deployment/auth-service | grep "401\|403"

# Check SSL certificate expiry
echo | openssl s_client -connect api.suvidha.example.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Monthly Security Tasks
- Review user permissions
- Rotate API keys
- Update firewall rules
- Pen-testing review

## On-Call Rotation

### On-Call Schedule
- Week 1: Engineer A
- Week 2: Engineer B
- Week 3: Engineer C
- Week 4: Engineer D

### On-Call Responsibilities
- Monitor alerts (24/7)
- Respond to P0/P1 incidents
- Escalate when needed
- Document incidents

### Handoff Checklist
- [ ] Review current issues
- [ ] Share access credentials
- [ ] Update contact info
- [ ] Brief on recent changes

## Contact Information

**Escalation Path:**
1. On-call Engineer → Team Lead
2. Team Lead → Engineering Manager
3. Engineering Manager → CTO

**Emergency Contacts:**
- On-call: Check PagerDuty
- Team Lead: [phone]
- DevOps: [phone]
- Database Admin: [phone]

## Runbook Updates

This document should be updated:
- After every major incident
- After significant architecture changes
- When new services are deployed
- Monthly review and updates

---

**Last Updated:** 2026-02-09  
**Next Review:** 2026-03-09
