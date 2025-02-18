const RideStates = Object.freeze({
    PROPOSED: 'proposed', // rider enters ride details
    SELECTED: 'selected', // rider picks a driver 
    ACCEPTED: 'accepted', // driver accepts a ride
    INPROGRESS: 'inprogress', //rider is being driven to final location
    COMPLETED: 'completed', // ride is completed
    CANCELLED: 'cancelled' // ride is cancelled
  });
  
  module.exports = RideStates;