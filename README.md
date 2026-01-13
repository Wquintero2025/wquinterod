# Church Management SaaS (ChMS)

A comprehensive multi-tenant church management system built with Next.js, PostgreSQL, and Prisma.

## 🎯 Features

### Core Modules

1. **Person Management (CRM)** - Complete member and visitor database with timeline tracking
2. **Altar Call System** - Record decisions with intelligent duplicate detection
3. **Academy** - Training courses, classes, and enrollment management
4. **Pastoral Care Clinic** - Counseling case management with assignment workflow
5. **Groups** - Small groups, cells, and ministry teams with attendance
6. **Events** - Church events, services, and conferences with registration
7. **Church Structure** - Multi-campus organization with leadership hierarchy

### Key Capabilities

- ✅ **Multi-tenant Architecture** - Complete data isolation per church
- ✅ **Duplicate Detection** - Smart algorithm using phone, email, and name matching
- ✅ **Timeline Tracking** - Complete history of all person interactions
- ✅ **Role-Based Access** - SuperAdmin, Admin, Pastor, Leader, Counselor, User roles
- ✅ **Responsive Design** - Mobile-first UI with premium aesthetics
- ✅ **Type Safety** - End-to-end TypeScript with Prisma
- ✅ **API Ready** - Clean REST API for future mobile apps

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wquinterod
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/church_management"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-change-in-production"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed initial data (optional)
   npm run prisma:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
wquinterod/
├── prisma/
│   ├── schema.prisma          # Database schema with all entities
│   └── seed.ts                # Seed data script
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   └── dashboard/     # All module pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── persons/       # Person CRUD
│   │   │   ├── altar-calls/   # Altar call with duplicate detection
│   │   │   ├── academy/       # Courses, classes, attendance
│   │   │   ├── care/          # Pastoral care cases
│   │   │   ├── groups/        # Groups and meetings
│   │   │   └── events/        # Events and attendance
│   │   ├── login/             # Login page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Navigation and layout
│   │   └── providers/         # Context providers
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client with multi-tenant middleware
│   │   ├── auth.ts            # NextAuth configuration
│   │   └── duplicate-detection.ts  # Duplicate detection algorithm
│   └── types/                 # TypeScript type definitions
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## 🔐 Authentication

The system uses NextAuth.js with credentials provider. Default demo credentials:

- **Email:** admin@church.com
- **Password:** password

## 🏗️ Architecture

### Multi-Tenant Strategy

Every database query is automatically filtered by `churchId` using Prisma middleware. This ensures complete data isolation between churches.

### Duplicate Detection

The altar call system uses a sophisticated algorithm:

- **Phone Match:** 90% confidence for exact phone number match
- **Email Match:** 90% confidence for exact email match
- **Name Similarity:** 70-85% confidence using Levenshtein distance
- **Combined Matches:** 95%+ confidence when multiple criteria match

Matches above 70% confidence are shown to users for manual review.

### Database Schema

The schema includes 30+ entities organized into 7 modules:

- **Core:** Church, Campus, Person, User, Role
- **Module 1:** LeadershipPosition, Ministry
- **Module 2:** PersonTimeline, PersonRelationship
- **Module 3:** AltarCallEvent, FollowUpTask, DuplicateMatch
- **Module 4:** Course, CourseClass, Enrollment, ClassSession, SessionAttendance
- **Module 5:** CareCase, CareAssignment, CareNote
- **Module 6:** Group, GroupMembership, GroupMeeting, GroupAttendance
- **Module 7:** Event, EventRegistration, EventAttendance

## 🎨 Design System

The UI uses a custom design system built with Tailwind CSS:

- **Colors:** Primary (blue), Secondary (purple), Success (green), Warning (amber), Danger (red)
- **Components:** Button, Input, Card, Badge, Table
- **Animations:** Fade-in, slide-in, slide-up, scale-in
- **Typography:** Inter font family
- **Responsive:** Mobile-first with breakpoints at sm, md, lg, xl

## 📡 API Endpoints

### Persons
- `GET /api/persons` - List persons with filters
- `POST /api/persons` - Create person
- `GET /api/persons/[id]` - Get person with timeline
- `PATCH /api/persons/[id]` - Update person

### Altar Calls
- `POST /api/altar-calls` - Submit altar call (with duplicate detection)
- `GET /api/altar-calls` - List altar call events

### Academy
- `GET /api/academy/courses` - List courses
- `POST /api/academy/courses` - Create course
- `GET /api/academy/classes` - List classes
- `POST /api/academy/classes` - Create class
- `POST /api/academy/enrollments` - Enroll student
- `POST /api/academy/attendance` - Record attendance

### Pastoral Care
- `GET /api/care/cases` - List cases
- `POST /api/care/cases` - Create case
- `GET /api/care/cases/[id]` - Get case details
- `POST /api/care/cases/[id]/notes` - Add note

### Groups
- `GET /api/groups` - List groups
- `POST /api/groups` - Create group
- `POST /api/groups/meetings` - Create meeting with attendance

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `POST /api/events/attendance` - Record attendance

## 🔮 Extension Points

The system is designed for easy extension:

### 1. Payment Integration
Add payment processing for:
- Course fees
- Event registrations
- Donations

**Implementation:** Create `/api/payments` routes and integrate Stripe/PayPal

### 2. SMS/Email Notifications
Send automated messages for:
- Welcome messages
- Follow-up reminders
- Event notifications

**Implementation:** Integrate Twilio (SMS) and SendGrid (email) in follow-up tasks

### 3. Mobile App
The API is ready for mobile app integration:
- All endpoints return JSON
- Authentication via NextAuth
- Multi-tenant support built-in

**Implementation:** Build React Native or Flutter app consuming the existing API

### 4. Reporting & Analytics
Add dashboards for:
- Growth metrics
- Attendance trends
- Course completion rates

**Implementation:** Create `/api/reports` endpoints and visualization components

### 5. QR Code Check-in
Enable quick attendance with QR codes:
- Generate unique codes per event/meeting
- Scan to check in

**Implementation:** Use `qrcode` library and add scan endpoint

## 🧪 Testing

### Manual Testing Checklist

1. **Multi-tenant Isolation**
   - Create 2 test churches
   - Verify data doesn't leak between tenants

2. **Duplicate Detection**
   - Submit altar call with similar names
   - Test phone/email matching
   - Verify confidence scores

3. **Person Timeline**
   - Create person
   - Add various interactions
   - Verify timeline shows all events

4. **Academy Flow**
   - Create course → class → enroll students → take attendance

5. **Pastoral Care**
   - Create case → assign counselor → add notes

6. **Groups**
   - Create group → add members → record meetings

7. **Events**
   - Create event → register attendees → mark attendance

## 📝 License

This project is proprietary software for church management.

## 🤝 Support

For questions or issues, please contact the development team.

---

Built with ❤️ for churches worldwide
