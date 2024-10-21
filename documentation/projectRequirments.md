# Updated Requirements Document

## Overview
A ride-sharing application utilizing **React Native**, **Node.js**, and **MongoDB**, featuring driver-driven pricing. Hosted on DigitalOcean.

### Functional Requirements
- User registration (drivers and riders).
- Profile management for users.
- Ride request and booking system.
- Driver sets pricing for rides.
- Payment processing between riders and drivers.
- Performance adjustments based on the number of concurrent users and query load.

### Non-Functional Requirements
- High performance for concurrent users.
- Secure data transmission and storage.
- User-friendly interface.
- **Performance Tuning**: Maintain a system where CPU usage does not exceed 50%, even with a high number of queries per minute, as shown in the load distribution for 100, 500, 1000, and 5000 users.

### Technical Requirements
- **Front-End:** React Native
- **Back-End:** Node.js
- **Database:** MongoDB
- **Hosting:** DigitalOcean
- **Performance Management**: System should handle the following user query loads while keeping CPU usage under 50%:
    - **100 Users:** 60 queries per user per minute (6000 total queries per minute).
    - **500 Users:** 12 queries per user per minute (6000 total queries per minute).
    - **1000 Users:** 6 queries per user per minute (6000 total queries per minute).
    - **5000 Users:** 1.2 queries per user per minute (6000 total queries per minute).

## User Roles
- **Rider:** Requests rides and provides feedback.
- **Driver:** Accepts requests, sets prices, and rates riders.
- **Administrator:** Validates driver documents.

## Milestones
- **January 2025:** MVP 1, AppStore & AndroidStore Submission.
- **February 2025:** MVP 2, User Testing.
- **March 2025:** MVP 3, Testing & Refinement.

### Performance Considerations
To ensure optimal performance, the application must be designed to handle a varying number of users while maintaining query efficiency. The goal is to distribute queries per user based on total users to maintain **6000 queries per minute** while keeping **CPU usage under 50%**. For example:
- For 500 users, each user should query every **5 seconds**.
- For 1000 users, each user should query every **10 seconds**.
- For 5000 users, each user should query every **50 seconds**.

This setup will ensure the application remains responsive while meeting both performance and efficiency targets.
