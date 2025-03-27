# Fleet System State Chart Diagram

```mermaid
stateDiagram-v2
    [*] --> UserInactive: Launch App
    
    state UserInactive {
        [*] --> NotLoggedIn
        NotLoggedIn --> Registration: Sign Up
        NotLoggedIn --> Authentication: Login
        Registration --> Authentication: Complete Registration
        Authentication --> LoggedIn: Valid Credentials
        Authentication --> NotLoggedIn: Invalid Credentials
        LoggedIn --> UserActive: Enter System
    }
    
    UserInactive --> UserActive: Successful Login
    UserActive --> UserInactive: Logout
    
    state UserActive {
        state RiderState {
            [*] --> Browsing
            Browsing --> RequestingRide: Request Ride
            RequestingRide --> WaitingForDriver: Confirm Request
            RequestingRide --> Browsing: Cancel Request
            WaitingForDriver --> RideInProgress: Driver Arrives
            WaitingForDriver --> Browsing: Cancel Before Driver Assignment
            RideInProgress --> RateAndPay: Arrive at Destination
            RateAndPay --> Browsing: Complete Payment and Rating
        }
        
        state DriverState {
            [*] --> Offline
            Offline --> Available: Go Online
            Available --> Offline: Go Offline
            Available --> AssignedToRide: Accept Ride Request
            AssignedToRide --> EnRouteToPickup: Navigate to Pickup
            EnRouteToPickup --> ArrivedAtPickup: Reach Pickup Location
            ArrivedAtPickup --> InProgress: Start Ride
            InProgress --> Completed: End Ride
            Completed --> Available: Ready for Next Ride
        }
    }
    
    state PaymentProcessing {
        [*] --> InitiatingPayment
        InitiatingPayment --> ProcessingPayment: Submit Payment
        ProcessingPayment --> PaymentSuccessful: Payment Approved
        ProcessingPayment --> PaymentFailed: Payment Declined
        PaymentFailed --> InitiatingPayment: Retry Payment
        PaymentSuccessful --> [*]
    }
    
    RateAndPay --> PaymentProcessing: Process Payment
    PaymentProcessing --> RateAndPay: Return to App
```

## Diagram Description

This state chart illustrates the various states and transitions within the Fleet ride-sharing system:

### User Authentication Flow
- App begins in inactive state with unauthenticated users
- Users can register or log in to enter the active system state
- Active users can return to inactive state by logging out

### Rider States
- **Browsing**: Default state when rider is logged in but not actively using a ride
- **RequestingRide**: Rider is in the process of requesting transportation
- **WaitingForDriver**: Ride request is confirmed and awaiting driver assignment
- **RideInProgress**: Rider is currently in a vehicle en route to destination
- **RateAndPay**: Post-ride state for payment processing and driver rating

### Driver States
- **Offline**: Driver is logged in but not accepting ride requests
- **Available**: Driver is online and ready to accept rides
- **AssignedToRide**: Driver has accepted a specific ride request
- **EnRouteToPickup**: Driver is navigating to the rider's pickup location
- **ArrivedAtPickup**: Driver has reached the pickup location
- **InProgress**: Driver is transporting rider to destination
- **Completed**: Ride has concluded at the destination

### Payment Processing
- Separate subprocess showing the states involved in processing ride payments
- Handles payment initiation, processing, and success/failure outcomes

This state chart provides a comprehensive view of system behavior, illustrating how users transition between different functional states throughout their journey in the application.