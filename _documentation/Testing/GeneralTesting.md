# Testing Documentation

## Test Plan: What are the goals and strategy for testing?
- The project follows a phased testing approach focusing on both backend API testing and frontend user testing
- Testing goals include ensuring API endpoint functionality, verifying user flows for both drivers and riders, and measuring performance under load
- The strategy involves tests for backend functionality and structured usability testing with real users for the frontend experience

## Test Cases: What are you specifically going to test?
- API testing covers all endpoints with test cases documented in a test matrix, covering:
  - Ride management
  - Payment processing
  - User management
  - Location tracking
  - Authentication
  - Admin operations
  - Receipt handling
- User interface testing addresses specific user flows for both drivers and riders, including:
  - Registration
  - Booking
  - Driver experience
  - Ride tracking
- Test cases verify:
  - Functional requirements (successful operations)
  - Error handling
  - Performance thresholds

## Test Procedure: How are you going to test this?
- Backend testing uses API calls to verify endpoint functionality with specific inputs and expected outputs, we used PostMan an API tool for the testing.
- Performance testing uses k6 framework to simulate multiple concurrent users, with configurable parameters for load testing
- User testing follows structured scenarios with real participants interacting with the application, followed by feedback collection
- Testing routes by setting a manual route to ensure that the app would update based on location changes 

## Test Results and Incident Reports
### What are the testing results?
- Routes worked as intended for rides, we were able to successfully go through 2 rides which had their coordinates constantly changing
- For a server stress test, our highest capacity we could handle (success rate is defined as call latency under 1 second):
  - 100 Users: 100% success rate at 5-second intervals
  - 1,000 Users: ~80% success rate at 5-second intervals
  - 5,000 Users: ~50% success rate at 5-second intervals
- For stripe implementation:
  - We are able to process all payments from the rider to Fleet successfully after the completion of a ride
  - Drivers are able to request a payout at any time, as long as they have a valid balance
- User flow testing:
  - Drivers and riders are able to successfully sign up for the application
  - Riders are able to link their payment method via Stripe in the settings after signing up
  - Riders are able to input their pick up and drop off locations to trigger a potential ride
  - Riders can select the driver of their liking who is online and ready to give rides
  - The driver is assigned the ride and begins making their way to pick up location
  - Once the rider is picked up, the rider can start the ride towards the drop off location
  - After drop-off, the rider can trigger the ride to end, which charges their card for the fare
  - After a successful loop, the rider can book another ride, and the driver may request a payout or continue providing services

### What faults have been uncovered which need remedy?
- Stripe integration issues:
  - When a rider first attempts to add a payment method, there is a known bug where it will not allow the user to add a payment method
  - Solution: Triggering the button twice overrides the first click bug
- Server load issues:
  - The more users utilizing our servers, the more stress the server experiences
  - Solution options: 
    - Getting a better server
    - Increasing the refresh interval

## Testing automation
### What frameworks allow your tests to be run automatically?
- k6 framework is implemented for performance testing with automated test scripts
- Node.js scripts coordinate automated test runs across different user types (rider and driver perspectives)

## Testing ethics
### When working with users, how can you ensure they are safeguarded from harm?
- User testing includes participants with diverse backgrounds and experiences
- Personal information of test participants is protected with only relevant demographics shared
- Testing involves clear explanations of the testing process to participants

## Test environment: If a system behaves differently in different environments (e.g. operating system, processor, etc.), then which system is needed to replicate the tests?
- Testing supports both development and production environments with configurable endpoints
- Performance tests can be adjusted for different server capacities
- Mobile testing covers both iOS and Android platforms through React Native

## Test completion criteria: How can you assess that the project is sufficiently tested?
- User interface flows must address high-priority issues identified in testing
- Security requirements for authentication and data privacy must be satisfied
