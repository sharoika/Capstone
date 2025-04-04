# Quality Assurance (QA) Overview

## Purpose
The goal of QA in this project is to ensure the software meets both functional and non-functional requirements, ensuring it fulfills its intended purpose with the desired level of quality.
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

## QA Plan
- **Requirements to Validate:**
  - Functional requirements such as ride management, payment processing, user registration, and ride tracking. (correctness)
  - Non-functional requirements like performance under load, security, usability, maintainability, reusability, portability, and robustness.

## QA Activities
- **QA Outcomes:**
  - Ensure correctness of the software, including accurate and reliable API calls and user flows.
  - Achieve user-friendly interfaces for both drivers and riders.
  - Maintain security and data privacy.

- **QA Tasks:**
  - **Automated Testing:** Use automated scripts for backend API testing and performance testing with k6 framework.
  - **User Testing:** Conduct structured user tests to evaluate the usability of registration, booking, and payment flows.
  - **Performance Testing:** Simulate high traffic to test server load and scalability.
  - **Security Testing:** Ensure that authentication and payment methods are securely implemented.
  
- **QA Records:**
  - Document results and incidents, such as bugs in Stripe integration and server load issues, along with solutions; many of which are located on the GitHub Project Board. 

## Testing
For the Testing portion we have a testing directory located from (../testing in respect of this file directory); it is further explained in detail there.

## Requirements Assessment
- **Functional:** 
  - **Correctness** of features like ride booking, payment processing, and user registration; this was treated as the quality of "correctness" it would be absolute either we deem it correct (achieving intended purpose) or incorrect (failing along the path at any point). **We have deemed all completed components correct**.
- **Non-functional:** 
  - **Security:** Proper handling of user permissions, privacy, payment processing, there are no known security failures thus **we deem this quality as achieved.**
  - **Performance:** There was extensive script testing of performance of our production infrastructure, it is performing better than our original expectations and thus **we deem this quality as achieved.**
  - **Usability:** Ensures the software is intuitive for drivers and riders, confirmed via user testing, our users gave us feedback that has been implemented and further tests have proved to show users receptive to new designs thus **we deem this quality as achieved.**
  - **Maintainability:** The systems has a large amount of code debt due to the nature of capstone emphasising moving forward, and our scope being relativly large. In addition, the system still requires manual interventions thus **we deem this quality as a work in progress.**
  - **Reusability:** As the previous point, a lot of code was not properly encapsulated and reused, leading to code debt that should be rectified thus **we deem this quality as a work in progress.**
  - **Portability:** The system is deployed on a VPS with NGINX and Node.JS; this is the only requirement and can be deployed within a few hours on another service. The React and React Native front ends were chosen to be cross-platform thus **we deem this quality as a work in progress.** 
  - **Robustness:** The system has some failure states that can cause a "lock" requiring an application refresh, these happen usually during a token expiry or device network connectivity issues thus **we deem this quality as a work in progress.**

## QA Completion Criteria
- All critical user flows are tested and meet functional and performance expectations as outlined in the ProjectRequirement.md file.
- The software is secure, and data privacy is upheld as outlined in the ProjectRequirement.md file.
- Non-functional aspects, including security and performance, meet the required thresholds as outlined in the ProjectRequirement.md file.