const Rider = require('../models/Rider');

const getRiderById = async (riderId) => {
    console.log(riderId);
    return await Rider.findById(riderId);
};

const updateRiderById = async (riderId, updateData) => {
    return await Rider.findByIdAndUpdate(riderId, updateData, { new: true, runValidators: true });
};

module.exports = {
    getRiderById,
    updateRiderById
};
