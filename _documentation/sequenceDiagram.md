sequenceDiagram
    participant R as Rider
    participant RA as Rider App
    participant D as Driver
    participant DA as Driver App
    participant BE as Backend
    participant DB as Database

    %% Rider Signup Flow (based on auth.js and Rider.js)
    R->>RA: Input registration details
    RA->>BE: POST /api/auth/rider/register
    BE->>DB: Create Rider document
    BE->>RA: Registration confirmation
    
    %% Driver Signup Flow (based on driverRegister.tsx and Driver.js)
    D->>DA: Input registration details
    D->>DA: Upload required documents
    DA->>BE: POST /api/auth/driver/register
    BE->>DB: Store driver details
    BE->>DA: Pending approval status
    
    %% Ride Flow (based on ride.js and RideForm.tsx)
    R->>RA: Enter ride details
    RA->>BE: POST /api/rides/ride
    BE->>DB: Create ride record
    BE->>DA: Notify available drivers
    D->>DA: View available rides
    D->>DA: Accept ride
    DA->>BE: POST /rides/:rideID/confirm
    BE->>RA: Driver confirmed
    
    %% Ride Progress (based on RideInProgress.tsx and StartRide.tsx)
    D->>DA: Start ride
    DA->>BE: POST /rides/:rideID/start
    BE->>DB: Update ride status
    D->>DA: End ride
    DA->>BE: Update ride completion
    BE->>DB: Store ride completion
    
    %% Ride Summary (based on RideSummary.tsx)
    BE->>RA: Send ride summary
    R->>RA: View ride details