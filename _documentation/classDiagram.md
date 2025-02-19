```mermaid
classDiagram
    class User {
        +string id
        +string firstName
        +string lastName
        +string email
        +string phone
        +string password
        +login()
        +register()
    }

    class Rider {
        +string homeLocation
        +string[] completedRides
        +createRide()
        +selectDriver()
        +viewRideHistory()
    }

    class Driver {
        +string vehicleMake
        +string vehicleModel
        +boolean isOnline
        +toggleOnlineStatus()D
        +acceptRide()
        +startRide()
        +completeRide()
    }

    class Ride {
        +string id
        +string riderID
        +string driverID
        +string start
        +string end
        +string distance
        +boolean rideBooked
        +boolean rideInProgress
        +boolean rideFinished
        +string status
        +updateStatus()
        +calculateRoute()
        +confirmDriver()
    }

    class RideForm {
        +string token
        +string riderID
        +function onRideCreated
        +fetchCoordinatesAndRoute()
        +handleConfirmRide()
    }

    class DriverSelection {
        +string rideID
        +string token
        +function onDriverConfirmed
        +fetchDrivers()
        +handleConfirm()
    }

    class StartRide {
        +string rideID
        +string token
        +function onRideStarted
        +checkRideStatus()
        +handleStartRide()
    }

    User <|-- Rider
    User <|-- Driver
    Rider "1" -- "*" Ride : creates
    Driver "1" -- "*" Ride : accepts
    Ride "1" -- "1" RideForm : creates
    Ride "1" -- "1" DriverSelection : selects
    Ride "1" -- "1" StartRide : starts