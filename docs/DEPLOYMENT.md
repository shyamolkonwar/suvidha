# SUVIDHA Deployment Guide

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Docker registry access
- Domain names configured

## Quick Deploy

### 1. Build and Push Images

```bash
# Build all services
docker-compose build

# Tag and push to registry
./scripts/push-images.sh
```

### 2. Configure Secrets

```bash
# Update secrets in k8s/configmaps.yaml
# Change all "CHANGE_ME" values to secure credentials

kubectl apply -f k8s/configmaps.yaml
```

### 3. Deploy Services

```bash
# Deploy all services
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n suvidha
kubectl get services -n suvidha
```

### 4. Configure Ingress

Update `k8s/ingress.yaml` with your domain names:
- `api.your-domain.com`
- `kiosk.your-domain.com`
- `admin.your-domain.com`

```bash
kubectl apply -f k8s/ingress.yaml
```

## Monitoring Setup

### Deploy Prometheus

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/prometheus \
  -f monitoring/prometheus/values.yaml \
  -n suvidha
```

### Deploy Grafana

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana \
  -n suvidha

# Get Grafana password
kubectl get secret --namespace suvidha grafana -o jsonpath="{.data.admin-password}" | base64 --decode
```

## Scaling

### Manual Scaling

```bash
kubectl scale deployment auth-service --replicas=5 -n suvidha
```

### Auto-scaling

HPA is configured for all services. View status:

```bash
kubectl get hpa -n suvidha
```

## Rollback

```bash
# View rollout history
kubectl rollout history deployment/auth-service -n suvidha

# Rollback to previous version
kubectl rollout undo deployment/auth-service -n suvidha

# Rollback to specific revision
kubectl rollout undo deployment/auth-service --to-revision=2 -n suvidha
```

## Health Checks

```bash
# Check all services
kubectl get pods -n suvidha

# View logs
kubectl logs -f deployment/auth-service -n suvidha

# Exec into pod
kubectl exec -it deployment/auth-service -n suvidha -- /bin/sh
```

## Database Migrations

Run migrations before deployment:

```bash
# For each service
kubectl run migration-job --image=your-registry/auth-service:latest \
  --restart=Never \
  --command -- npm run migrate
```

## SSL/TLS Configuration

Update cert-manager cluster issuer:

```bash
kubectl apply -f k8s/cert-issuer.yaml
```

Certificates will be automatically provisioned for ingress domains.

## Backup & Restore

### Database Backup

```bash
# Backup all databases
./scripts/backup-databases.sh

# Restore from backup
./scripts/restore-databases.sh backup-file.sql
```

## Troubleshooting

### Service Not Starting

```bash
kubectl describe pod <pod-name> -n suvidha
kubectl logs <pod-name> -n suvidha
```

### Database Connection Issues

Check ConfigMap and Secrets:

```bash
kubectl get configmap db-config -n suvidha -o yaml
kubectl get secret db-secrets -n suvidha -o yaml
```

### Ingress Not Working

```bash
kubectl describe ingress suvidha-ingress -n suvidha
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

## Production Checklist

- [ ] Update all secrets in `k8s/configmaps.yaml`
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts
- [ ] Configure log aggregation
- [ ] Set resource limits/requests
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Test disaster recovery
- [ ] Document runbooks
- [ ] Train operations team
