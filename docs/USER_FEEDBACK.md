# User Feedback System

## Overview

This document outlines the user feedback collection and processing system for SUVIDHA.

## Feedback Channels

### 1. In-App Feedback (Kiosk UI)

Add a feedback button to the kiosk UI:
- Location: Bottom navigation bar
- Triggers: Modal with rating + comment
- Stores: Database table `user_feedback`

### 2. Admin Dashboard Analytics

Monitor user behavior:
- Most used services
- Average session duration
- Error rates by service
- Complaint categories

### 3. Support Tickets (Grievance Service)

Track all complaints:
- Resolution time
- Recurring issues
- User satisfaction ratings

## Feedback Database Schema

```sql
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(50),
  kiosk_id VARCHAR(50),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  category VARCHAR(50), -- 'service', 'ui', 'performance', 'other'
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_created ON user_feedback(created_at);
CREATE INDEX idx_feedback_rating ON user_feedback(rating);
```

## Feedback Collection API

**Endpoint:** `POST /api/feedback`

**Request:**
```json
{
  "rating": 4,
  "category": "service",
  "comment": "Great experience, but payment took longer than expected"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

## Analysis & Reporting

### Daily Feedback Report

```sql
-- Daily feedback summary
SELECT 
  DATE(created_at) as date,
  AVG(rating) as avg_rating,
  COUNT(*) as total_feedback,
  category,
  COUNT(*) FILTER (WHERE rating <= 2) as negative_count
FROM user_feedback
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at), category
ORDER BY date DESC;
```

### Weekly Review Meeting

**Schedule:** Every Monday 10 AM

**Agenda:**
1. Review feedback metrics
2. Identify top 3 issues
3. Prioritize improvements
4. Assign action items

## Continuous Improvement Process

### 1. Collect Feedback
- In-app ratings
- Support tickets
- Analytics data

### 2. Analyze Patterns
- Weekly reports
- Trend analysis
- Root cause analysis

### 3. Prioritize Issues
- Impact vs effort matrix
- User pain points
- Technical debt

### 4. Implement Improvements
- Sprint planningAdd to backlog
- Development
- Testing

### 5. Measure Impact
- Compare before/after metrics
- User satisfaction scores
- Service usage patterns

## Feedback Response SLA

| Priority | Response Time | Resolution Time |
|----------|---------------|-----------------|
| Critical | 1 hour | 24 hours |
| High     | 4 hours | 3 days |
| Medium   | 1 day | 1 week |
| Low      | 3 days | 2 weeks |

## Integration with Analytics

Feedback data flows into:
- Analytics dashboard
- Monthly reports
- Stakeholder presentations
- Product roadmap planning

## Action Items

- [ ] Add feedback button to kiosk UI
- [ ] Create feedback database table
- [ ] Build feedback API endpoint
- [ ] Set up automated weekly reports
- [ ] Create feedback review dashboard
- [ ] Schedule weekly review meetings
