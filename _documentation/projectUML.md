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