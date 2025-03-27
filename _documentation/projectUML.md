# Fleet System UML Class Diagram

```mermaid
classDiagram
    class User {
        +String userId
        +String name
        +String email
        +String phoneNumber
        +createAccount()
        +login()
        +updateProfile()
    }
    
    class Rider {
        +List~Trip~ tripHistory
        +PaymentMethod[] paymentMethods
        +requestRide()
        +cancelRide()
        +rateDriver()
        +makePayment()
    }
    
    class Driver {
        +String licenseNumber
        +Vehicle vehicle
        +Boolean isAvailable
        +List~Trip~ completedTrips
        +Float rating
        +toggleAvailability()
        +acceptRide()
        +completeRide()
        +navigateToDestination()
    }
    
    class Trip {
        +String tripId
        +Location pickupLocation
        +Location dropoffLocation
        +DateTime requestTime
        +DateTime pickupTime
        +DateTime dropoffTime
        +Float fare
        +TripStatus status
        +calculateFare()
        +updateStatus()
    }
    
    class Vehicle {
        +String vehicleId
        +String make
        +String model
        +String year
        +String licensePlate
        +VehicleType type
    }
    
    class Payment {
        +String paymentId
        +Float amount
        +DateTime timestamp
        +PaymentStatus status
        +String transactionReference
        +processPayment()
        +generateReceipt()
    }
    
    class Location {
        +Float latitude
        +Float longitude
        +String address
        +calculateDistance(Location)
    }
    
    User <|-- Rider
    User <|-- Driver
    Driver "1" -- "1" Vehicle : drives
    Rider "1" -- "*" Trip : requests
    Driver "1" -- "*" Trip : fulfills
    Trip "1" -- "1" Payment : generates
    Trip "1" -- "2" Location : has
```

## Diagram Description

This UML class diagram illustrates the core structure of the Fleet ride-sharing system. It shows the relationships between various components:

1. **User Hierarchy**: 
   - Base User class with common attributes
   - Specialized Rider and Driver classes that inherit from User

2. **Trip Management**:
   - Riders request trips
   - Drivers fulfill trips
   - Each trip has pickup and dropoff locations

3. **Vehicle Information**:
   - Each driver is associated with a specific vehicle

4. **Payment Processing**:
   - Trip completion generates payment records
   - Payment methods are associated with riders

5. **Location Services**:
   - Location tracking and distance calculation capabilities

The diagram uses standard UML notation for inheritance, associations, and multiplicities to represent the system architecture.