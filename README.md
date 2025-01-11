# Proctify

## Description
Proctify is an innovative proctoring platform designed to enhance the integrity of online tests and coding competitions. The platform allows users to host third-party linked tests (e.g., Google Forms, coding websites, or other test links) or create their own coding contests with custom questions, inputs, and outputs. Proctify ensures a secure and fair environment with advanced proctoring features and real-time monitoring capabilities.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Folder Structure](#folder-structure)
- [Usage](#usage)
- [Screenshots] (#screenshots)
- [Contributing](#contributing)
- [Contact](#contact)

## Features

### Proctoring Features
- **Face Detection**: Alerts if the participant is not visible on the camera for more than 6 seconds.
- **Multiple Faces Detection**: Flags instances of multiple faces in the camera frame.
- **Audio Monitoring**: Detects audio levels exceeding a predefined decibel threshold.
- **Object Detection**: Identifies prohibited items such as mobile phones, laptops, etc.
- **Browser Activity Monitoring**:
  - Disables right-click functionality.
  - Detects tab/window changes.
  - Flags exiting fullscreen mode.
  - Monitors copy-paste activity.

### Test Hosting Options
1. **Third-Party Linked Tests**:
   - Host tests by providing a title, link, start time, and duration.
   - Admin receives a unique join code to share with participants.
   - Participants use the join code to access the proctored test environment.

2. **Coding Competitions**:
   - Create contests with custom problems by specifying:
     - Title, start time, and duration.
     - Problem statements, sample input/output, and input/output files.
   - Proctored environment ensures fairness and integrity.
   - Includes a leaderboard for participants.

### Monitoring & Reports
- **Admin Dashboard**:
  - Monitor cheating activities in real time.
  - View Unfair Means (UFM) scores for each participant.
- **Leaderboards**:
  - Displays rankings for coding competitions.
  - Accessible to participants without revealing UFM scores.

## Technologies
Proctify is built using modern tools and technologies to ensure scalability, efficiency, and an exceptional user experience:

- **Frontend**: Next.js, TailwindCSS, Shadcn UI, Monaco Editor
- **Backend**: Node.js, Express, TypeScript, Prisma, Redis, Kafka
- **Database**: PostgreSQL
- **Machine Learning**: TensorFlow (for object detection and face recognition)
- **File Storage**: AWS S3
- **Authentication**: Clerk
- **Code Execution**: Judge0
- **Package Management**: Turborepo, Docker

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/superiorsd10/proctify.git
   cd proctify
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add necessary variables (e.g., database URL, Clerk credentials, AWS S3 keys, etc.).

4. Start the development environment:
   ```bash
   npm run dev
   ```

5. Build and start the production server:
   ```bash
   npm run build
   npm start
   ```

## Folder Structure
Proctify is designed with a modular architecture using Turborepo for efficient project management. The folder structure is as follows:

```
.
├── apps
│   ├── web       # Frontend application
│   ├── server    # Backend API
│   └── worker    # Background tasks (e.g., proctoring analysis)
├── packages
│   ├── config-eslint      # Shared ESLint configuration
│   ├── config-typescript  # Shared TypeScript configuration
│   ├── config-tailwind    # Shared TailwindCSS configuration
│   ├── database           # Database schema and migrations
│   ├── middlewares        # Shared middleware utilities
│   ├── services           # Business logic and service integration
│   ├── ui                 # Shared UI components
│   ├── utils              # Utility functions
│   └── validation         # Input validation using Zod
├── .gitignore
├── .npmrc
├── package-lock.json
├── package.json
├── README.md
└── turbo.json
```

## Usage

### Hosting a Third-Party Linked Test
1. Log in as an admin.
2. Navigate to the "Create Test" section.
3. Provide the following details:
   - Title
   - Link to the test
   - Start time and duration
4. Share the generated join code with participants.
5. Monitor participant activities and UFM scores in the admin dashboard.

### Hosting a Coding Contest
1. Log in as an admin.
2. Navigate to the "Create Contest" section.
3. Provide the contest details:
   - Title
   - Start time and duration
   - Add problems with:
     - Problem statements
     - Sample input/output
     - Input and output files
4. Share the generated join code with participants.
5. Monitor the leaderboard and UFM scores in the admin dashboard.

### Joining a Test/Contest
1. Participants visit the Proctify website.
2. Enter the join code provided by the test/contest creator.
3. Complete the test in a secure proctored environment.

## Screenshots



## Contributing
Contributions are welcome! Please open an issue or submit a pull request with your improvements or bug fixes.

## Contact
For any inquiries, please contact [Sachin Dapkara](mailto:sachindapkara6@gmail.com).

---
Proctify aims to revolutionize online testing and competitions by providing a robust and secure platform for creators and participants alike. Say goodbye to cheating and hello to fair assessments!

