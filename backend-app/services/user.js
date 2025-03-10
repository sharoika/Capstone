const Rider = require('../models/Rider');
const Driver = require('../models/Rider');

const getRiderById = async (riderId) => {
    return await Rider.findById(riderId);
};

const getDriverById = async (driverId) => {
    return await Driver.findById(driverId);
};

const updateRiderById = async (riderId, updateData) => {
    return await Rider.findByIdAndUpdate(riderId, updateData, { new: true, runValidators: true });
};

const updateDriverById = async (driverId, updateData) => {
    return await Driver.findByIdAndUpdate(driverId, updateData, { new: true, runValidators: true });
};

module.exports = {
    getRiderById,
    getDriverById,
    updateRiderById,
    updateDriverById
};
