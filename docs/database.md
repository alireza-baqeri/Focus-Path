# Process Tracker - Database Design

## Overview
The database is managed using **Prisma ORM** connecting to an **SQLite** database locally. The schema revolves around a central `User` model, with cascading relationships for activity tracking, course management, and authentication.

## Core Models

### 1. Authentication Models
- **User**: The core entity representing an account.
- **Account / Session**: Standard NextAuth adapter models handling OAuth and session token verification.

### 2. User Settings
- **Settings**: A 1-to-1 relationship with `User`. Stores widget preferences such as `weatherCity`, `newsCountry`, `quoteCategory`, and UI themes.

### 3. Daily Tracking (The Core Engine)
- **DayRecord**: The central time-series model. It represents a single day (YYYY-MM-DD) for a specific user.
  - *Why?* Instead of querying thousands of individual actions, everything done on a specific day links to a `DayRecord`. This makes building the Activity Graph extremely efficient.
- **ActivityCategory**: User-defined categories for time tracking (e.g., "Learning", "Coding", "Sports").
- **ActivityLog**: A pivot bridging a `DayRecord` and an `ActivityCategory`. Stores `durationMinutes`. For example, if a user watches 30 mins of courses, 30 is added to the "Learning" ActivityLog for that DayRecord.
- **JournalEntry**: Text-based entries linked to a `DayRecord` for personal reflections.

### 4. Course Progress Tracker
- **Course**: Represents a directory/folder containing a study course. Includes `totalDuration` and `rootPath`.
- **Section**: Represents a sub-folder or chapter within a Course.
- **Video**: Represents a specific video file. 
  - Fields include `duration`, `isWatched`, `watchedAtDate` (to attribute it to a specific day in the GitHub board), `isFlagged` (for review), and `notes`.

### 5. Goal Engine
- **Goal**: Represents a long-term user objective with `startDate` and `endDate`.
- **DayGoalProgress**: Links a `Goal` to a specific `DayRecord` to track daily milestones towards the overarching goal.

## Database Workflows (How it connects)
When a user clicks "Mark as Watched" on a Video:
1. The `Video` record is updated (`isWatched = true`, `watchedAtDate = now()`).
2. The system locates or creates a `DayRecord` for today.
3. The system locates or creates an `ActivityCategory` named "Learning".
4. An `ActivityLog` is updated/created, adding the video's duration (in minutes) to today's "Learning" bucket.
5. This data cascades into the GitHub Activity Graph to instantly turn today's tile green.
