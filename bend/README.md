# Sakhi Backend

Backend API for Sakhi - Your Personal Companion for Holistic Period Care

## Project Structure

\`\`\`
bend/
├── src/
│   ├── routes/
│   │   ├── users.ts              # User authentication & profile management
│   │   ├── period-tracking.ts    # Period logging & cycle predictions
│   │   ├── health-wellness.ts    # Articles, tips, and resources
│   │   ├── reminders.ts          # Reminder management
│   │   └── community.ts          # Community posts & discussions
│   └── server.ts                 # Main server file
├── prisma/
│   └── schema.prisma             # Database schema
├── package.json
├── tsconfig.json
└── .env.example
\`\`\`

## Features

### 1. **User Management** (`users.ts`)
- User signup & login
- JWT authentication
- Profile management
- User data retrieval

### 2. **Period Tracking** (`period-tracking.ts`)
- Log period start/end dates
- Track flow intensity & symptoms
- View period history
- Predict next period based on cycle patterns
- Update & delete period logs

### 3. **Health & Wellness** (`health-wellness.ts`)
- Browse wellness articles by category
- Access health tips
- View resources
- Admin article creation

### 4. **Reminders** (`reminders.ts`)
- Create custom reminders
- Set period, medication, appointment reminders
- Manage active reminders
- Update & delete reminders

### 5. **Community** (`community.ts`)
- Create community posts
- Browse posts by category
- Add comments to posts
- Support discussions & experiences

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
cd bend
npm install
\`\`\`

### 2. Configure Environment Variables
\`\`\`bash
cp .env.example .env
# Edit .env with your database URL and JWT secret
\`\`\`

### 3. Setup Database
\`\`\`bash
npm run prisma:generate
npm run prisma:migrate
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

The backend will start on `http://localhost:5000`

## API Endpoints

### Users
- `POST /api/users/signup` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile/:userId` - Get user profile
- `PUT /api/users/profile/:userId` - Update user profile

### Period Tracking
- `POST /api/period-tracking/log` - Log period
- `GET /api/period-tracking/history/:userId` - Get period history
- `GET /api/period-tracking/prediction/:userId` - Get cycle prediction
- `PUT /api/period-tracking/:logId` - Update period log
- `DELETE /api/period-tracking/:logId` - Delete period log

### Health & Wellness
- `GET /api/health-wellness/articles` - Get all articles
- `GET /api/health-wellness/articles/:articleId` - Get single article
- `POST /api/health-wellness/articles` - Create article (admin)
- `GET /api/health-wellness/tips` - Get wellness tips
- `GET /api/health-wellness/resources` - Get resources

### Reminders
- `POST /api/reminders` - Create reminder
- `GET /api/reminders/:userId` - Get user reminders
- `PUT /api/reminders/:reminderId` - Update reminder
- `DELETE /api/reminders/:reminderId` - Delete reminder

### Community
- `POST /api/community/posts` - Create post
- `GET /api/community/posts` - Get all posts
- `GET /api/community/posts/:postId` - Get single post with comments
- `POST /api/community/comments` - Add comment
- `DELETE /api/community/posts/:postId` - Delete post

## Database Schema

The backend uses PostgreSQL with Prisma ORM. Key models:
- **User** - User accounts & authentication
- **PeriodLog** - Period tracking data
- **Article** - Health & wellness articles
- **Tip** - Quick wellness tips
- **Resource** - External resources
- **Reminder** - User reminders
- **CommunityPost** - Community discussions
- **Comment** - Comments on posts

## Technologies Used

- **Express.js** - Web framework
- **Prisma** - ORM for database
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Zod** - Data validation
- **PostgreSQL** - Database

## Next Steps

1. Connect to your PostgreSQL database
2. Run migrations to create tables
3. Integrate with frontend
4. Add authentication middleware
5. Implement email notifications
6. Add admin dashboard
