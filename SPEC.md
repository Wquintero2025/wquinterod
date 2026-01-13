# Church Management SaaS - Technical Specification

## System Architecture

### Multi-Tenant Design

The system implements row-level multi-tenancy where all data is stored in a single database with a `churchId` discriminator column. This approach provides:

- **Cost Efficiency:** Single database instance for all tenants
- **Easy Maintenance:** Centralized schema updates
- **Data Isolation:** Enforced via Prisma middleware
- **Scalability:** Horizontal scaling via read replicas

#### Tenant Isolation Implementation

```typescript
// Automatic churchId filtering in all queries
prismaWithMiddleware.$use(async (params, next) => {
  if (tenantModels.includes(params.model)) {
    params.args.where = params.args.where || {}
    params.args.where.churchId = churchId
  }
  return next(params)
})
```

### Authentication Flow

1. User enters email/password
2. System validates credentials against `User` table
3. JWT token generated with `churchId`, `role`, `personId`
4. Session stored with tenant context
5. All subsequent requests filtered by `churchId`

## Duplicate Detection Algorithm

### Matching Strategy

The system uses a multi-criteria scoring approach:

#### 1. Phone Number Matching
```typescript
// Normalize and compare last 10 digits
normalizePhone(phone).slice(-10)
// Score: 90% confidence
```

#### 2. Email Matching
```typescript
// Case-insensitive exact match
normalizeEmail(email).toLowerCase()
// Score: 90% confidence
```

#### 3. Name Similarity (Levenshtein Distance)
```typescript
// Calculate edit distance between names
const similarity = ((longer.length - distance) / longer.length) * 100
// Score: 70-85% based on similarity + campus match
```

#### 4. Combined Scoring
- Phone + Email match: 95% confidence
- Phone + Name match: 92% confidence
- Email + Name match: 92% confidence
- Name + Campus match: +10% boost

### Duplicate Resolution Workflow

1. User submits altar call form
2. System searches for potential duplicates
3. If matches found (>70% confidence):
   - Display ranked list of candidates
   - Show match reasons (phone/email/name)
   - User chooses: "Use Existing" or "Create New"
4. If "Use Existing": Link altar call to existing person
5. If "Create New": Create person and mark as "not duplicate"

## Database Schema Design

### Core Entities

#### Church (Tenant)
- Primary tenant entity
- Contains: name, slug, contact info, settings
- Relationships: All other entities reference churchId

#### Person (Central Entity)
- Hub for all member/visitor data
- Contains: demographics, contact, spiritual status, key dates
- Relationships: User, Roles, Timeline, all module entities

#### User (Authentication)
- Links to Person for authentication
- Contains: email, passwordHash, role, lastLogin
- One-to-one with Person

### Module Entities

#### Module 1: Church Structure
- **LeadershipPosition:** Organizational roles
- **Ministry:** Departments per campus

#### Module 2: CRM
- **PersonTimeline:** Audit trail of all interactions
- **PersonRelationship:** Family and spiritual connections

#### Module 3: Altar Call
- **AltarCallEvent:** Decision records
- **FollowUpTask:** Automated follow-up pipeline
- **DuplicateMatch:** Tracking potential duplicates

#### Module 4: Academy
- **Course:** Training programs
- **CourseClass:** Specific class instances
- **Enrollment:** Student registrations
- **ClassSession:** Individual meetings
- **SessionAttendance:** Attendance per session

#### Module 5: Pastoral Care
- **CareCase:** Counseling cases with case numbers
- **CareAssignment:** Counselor assignments
- **CareNote:** Session notes and next steps

#### Module 6: Groups
- **Group:** Small groups/cells/ministries
- **GroupMembership:** Member assignments with roles
- **GroupMeeting:** Meeting records
- **GroupAttendance:** Meeting attendance

#### Module 7: Events
- **Event:** Church events and services
- **EventRegistration:** Pre-registration
- **EventAttendance:** Attendance tracking

## Role-Based Access Control

### Role Hierarchy

1. **SUPER_ADMIN** - Platform administrator
   - Manage all churches
   - System configuration
   - Cross-tenant access

2. **ADMIN** - Church administrator
   - Full access to church data
   - User management
   - Settings configuration

3. **PASTOR** - Ministry leadership
   - View all modules
   - Create/edit most entities
   - Assign tasks

4. **GROUP_LEADER** - Small group leader
   - Manage assigned groups
   - Record attendance
   - View member data

5. **COUNSELOR** - Pastoral care
   - Manage assigned cases
   - Add case notes
   - View person history

6. **USER** - Standard member
   - View own data
   - Register for events
   - Limited access

### Permission Matrix

| Action | SuperAdmin | Admin | Pastor | GroupLeader | Counselor | User |
|--------|-----------|-------|--------|-------------|-----------|------|
| Manage Churches | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Persons | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Altar Call | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manage Courses | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Care Cases | ✅ | ✅ | ✅ | ❌ | ✅* | ❌ |
| Manage Groups | ✅ | ✅ | ✅ | ✅* | ❌ | ❌ |
| Create Events | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

*Limited to assigned entities

## Extension Points

### 1. Payment Processing

**Use Case:** Course fees, event tickets, donations

**Implementation:**
```typescript
// Add to schema
model Payment {
  id          String
  churchId    String
  personId    String
  amount      Decimal
  currency    String
  status      PaymentStatus
  provider    String // stripe, paypal
  metadata    Json
}

// API endpoint
POST /api/payments
{
  "amount": 50.00,
  "currency": "USD",
  "type": "course_enrollment",
  "enrollmentId": "..."
}
```

**Integration:** Stripe Checkout or PayPal SDK

### 2. Communication System

**Use Case:** SMS/Email notifications, bulk messaging

**Implementation:**
```typescript
// Add to schema
model Message {
  id          String
  churchId    String
  personId    String
  type        MessageType // sms, email
  subject     String?
  content     String
  status      MessageStatus
  sentAt      DateTime?
}

// API endpoint
POST /api/messages/send
{
  "recipients": ["person-id-1", "person-id-2"],
  "type": "email",
  "template": "welcome",
  "variables": { "name": "John" }
}
```

**Integration:** Twilio (SMS), SendGrid (Email)

### 3. Mobile API

**Current State:** REST API ready for consumption

**Additional Endpoints Needed:**
- `POST /api/auth/mobile` - Mobile-specific auth
- `GET /api/mobile/dashboard` - Optimized dashboard data
- `POST /api/mobile/checkin` - QR code check-in

**Implementation:** Same Next.js API routes, add mobile-specific optimizations

### 4. Reporting & Analytics

**Use Case:** Growth metrics, attendance trends, engagement scores

**Implementation:**
```typescript
// API endpoints
GET /api/reports/growth?period=month
GET /api/reports/attendance?groupId=...
GET /api/reports/engagement?personId=...

// Response
{
  "period": "2024-01",
  "metrics": {
    "newMembers": 45,
    "altarCalls": 23,
    "avgAttendance": 234
  },
  "trends": [...]
}
```

**Visualization:** Chart.js or Recharts

### 5. QR Code Check-in

**Use Case:** Fast event/service check-in

**Implementation:**
```typescript
// Generate QR code
GET /api/events/[id]/qr
// Returns: data:image/png;base64,...

// Scan and check-in
POST /api/events/checkin
{
  "code": "encrypted-event-person-data"
}
```

**Integration:** `qrcode` library for generation, camera API for scanning

## Performance Considerations

### Database Indexing

Critical indexes for performance:
```sql
-- Multi-tenant queries
CREATE INDEX idx_person_church ON persons(church_id);
CREATE INDEX idx_event_church ON events(church_id);

-- Search queries
CREATE INDEX idx_person_email ON persons(email);
CREATE INDEX idx_person_phone ON persons(phone);
CREATE INDEX idx_person_name ON persons(first_name, last_name);

-- Timeline queries
CREATE INDEX idx_timeline_person ON person_timeline(person_id, occurred_at DESC);
```

### Caching Strategy

- **Session Data:** Redis for session storage
- **Static Data:** Churches, Campuses cached for 1 hour
- **Query Results:** React Query with 1-minute stale time
- **API Responses:** Next.js automatic caching

### Scalability

- **Database:** PostgreSQL with read replicas
- **Application:** Horizontal scaling via load balancer
- **Storage:** S3 for file uploads (photos, documents)
- **CDN:** CloudFront for static assets

## Security Measures

1. **Authentication:** bcrypt password hashing, JWT tokens
2. **Authorization:** Role-based access control
3. **Data Isolation:** Automatic churchId filtering
4. **SQL Injection:** Prisma parameterized queries
5. **XSS Protection:** React automatic escaping
6. **CSRF Protection:** NextAuth CSRF tokens
7. **Rate Limiting:** API rate limiting (future)
8. **Audit Logging:** PersonTimeline tracks all changes

## Deployment

### Recommended Stack

- **Hosting:** Vercel (Next.js optimized)
- **Database:** Supabase or Railway (PostgreSQL)
- **Storage:** AWS S3 or Cloudinary
- **Monitoring:** Sentry for error tracking
- **Analytics:** PostHog or Mixpanel

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=random-secret-key

# Optional
STRIPE_SECRET_KEY=sk_...
SENDGRID_API_KEY=SG...
TWILIO_ACCOUNT_SID=AC...
```

## Future Enhancements

1. **Advanced Reporting:** Custom report builder
2. **Mobile Apps:** iOS and Android native apps
3. **Integrations:** Zoom, Google Calendar, Mailchimp
4. **AI Features:** Predictive analytics, smart recommendations
5. **Multi-language:** i18n support for global churches
6. **Offline Mode:** PWA with offline capabilities
7. **Video Streaming:** Integrated live streaming
8. **Giving Platform:** Complete donation management

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Maintainer:** Development Team
