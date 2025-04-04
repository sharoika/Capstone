## Overview
A ride-sharing application utilizing **React Native**, **Node.js**, and **MongoDB**, featuring driver-driven pricing. Hosted on DigitalOcean.

### Functional Requirements
- User-friendly interface. (A non first time user, will be able to book a ride within 3 clicks)
- User registration for drivers and riders. (Collecting 0% metadata) 
- Profile management for users. (Changing passwords, and payment methods)
- Ride request and booking system. (Rebook previous drivers)
- Driver sets pricing for rides. (No limit on prices set)
- Payment processing between riders and drivers. (Credit/Debit card)
- Performance adjustments based on the number of concurrent users and query load. (Listed below)

### Technical Requirements
- Secure data transmission and storage by using SSL in 100% of our calls.
- **Front-End:** React Native
- **Back-End:** Node.js
- **Database:** MongoDB
- **Hosting:** DigitalOcean
- **Performance Management**: System should handle the following user query loads while keeping CPU usage under 50%:
    - **100 Users:** 60 queries per user per minute (6000 total queries per minute).
    - **500 Users:** 12 queries per user per minute (6000 total queries per minute).
    - **1000 Users:** 6 queries per user per minute (6000 total queries per minute).
    - **5000 Users:** 1.2 queries per user per minute (6000 total queries per minute).
- **Performance Tuning**: Maintain a system where CPU usage does not exceed 50%, even with a high number of queries per minute, as shown in the load distribution for 100, 500, 1000, and 5000 users.

### Infrastructure Costs: Monolithic vs. Microservices

#### Monolithic Architecture:
- **Cost Range**: $200 - $600/month
- **Components**: Single Node.js server, single database (e.g., MongoDB on DigitalOcean or AWS), load balancer.
- **Scalability**: Vertical scaling required (more powerful servers).
- **Pros**: Easier to set up, lower initial cost.
- **Cons**: Harder to scale, slower to develop and deploy changes.

#### Microservices Architecture:
- **Cost Range**: $300 - $1000/month
- **Components**: Multiple services (e.g., separate services for GPS tracking, user management, and payments), containerization (Docker), API gateway, and multiple databases.
- **Scalability**: Horizontal scaling (add more instances or services).
- **Pros**: Scalable, faster deployments, more flexible.
- **Cons**: Higher operational and infrastructure complexity.

### User Roles
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

### Potential Obstacles 
- Getting GPS working within the time frame may be tricky due to our inexperience and knowledge with GPS services 
This setup will ensure the application remains responsive while meeting both performance and efficiency targets.
