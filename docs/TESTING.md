# SUVIDHA Testing Guide

## Overview

This document describes the testing infrastructure for the SUVIDHA Kiosk System.

## Test Structure

```
tests/
├── integration/          # Integration tests
│   ├── auth.test.ts     # Auth service tests
│   └── ...              # Other service tests
├── load/                # Load testing
│   └── artillery-config.yml
├── package.json
└── jest.config.js
```

## Running Tests

### Integration Tests

```bash
cd tests
npm install
npm test
```

### Load Tests

```bash
# Install Artillery
npm install -g artillery

# Run load tests
cd tests/load
artillery run artillery-config.yml

# Generate report
artillery run --output report.json artillery-config.yml
artillery report report.json
```

## Test Coverage

Run tests with coverage:

```bash
npm run test:coverage
```

Target coverage: **70%** for all metrics (branches, functions, lines, statements)

## CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request to `main`

See `.github/workflows/ci-cd.yml` for CI/CD configuration.

## Writing New Tests

Example integration test:

```typescript
import request from 'supertest';

describe('Service Tests', () => {
  it('should handle request', async () => {
    const response = await request(SERVICE_URL)
      .post('/api/endpoint')
      .send({ data: 'test' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Performance Benchmarks

| Metric | Target |
|--------|--------|
| Response Time (p95) | < 500ms |
| Throughput | > 100 req/s |
| Error Rate | < 1% |
| CPU Usage | < 70% |
| Memory Usage | < 512MB |
