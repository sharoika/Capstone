const express = require('express');
const mongoose = require('mongoose');
const { Contact, PricingDetails } = require('../models/Contact');
const User = require('../models/User');
const ContractStates = require('../models/contract_states');
const { authenticate } = require('../middlewares/auth');
const router = express.Router();

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
}

router.post('/propose', authenticate, async (req, res) => {
  const { driverId, startingLocation, endingLocation, pricingDetailsId } = req.body;
  const riderId = req.user.id;

  try {
    const contact = new Contact({
      riderId,
      driverId,
      startingLocation,
      endingLocation,
      pricingDetails: pricingDetailsId,
      state: ContractStates.PROPOSED
    });

    await contact.save();
    res.status(201).json({ message: 'Route proposed successfully', contact });
  } catch (error) {
    console.error('Error proposing route:', error.message);
    res.status(500).json({ message: 'Failed to propose route' });
  }
});

router.post('/:id/respond', authenticate, async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const driverId = req.user.id;

  try {
    const contact = await Contact.findById(id);

    if (!contact || contact.driverId.toString() !== driverId) {
      return res.status(404).json({ message: 'Route not found or unauthorized' });
    }

    if (action === 'accept') {
      if (contact.state !== ContractStates.PROPOSED) {
        return res.status(400).json({ message: 'Route is not in a proposed state' });
      }

      const existingAccepted = await Contact.findOne({
        driverId,
        state: ContractStates.ACCEPTED
      });

      if (existingAccepted) {
        return res.status(400).json({ message: 'Driver already has an accepted route' });
      }

      contact.state = ContractStates.ACCEPTED;
      await contact.save();

      res.json({ message: 'Route accepted', contact });
    } else if (action === 'reject') {
      contact.state = ContractStates.CANCELED;
      await contact.save();

      res.json({ message: 'Route rejected', contact });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error responding to route:', error.message);
    res.status(500).json({ message: 'Failed to respond to route' });
  }
});

router.post('/:id/updateGps', authenticate, async (req, res) => {
  const { id } = req.params;
  const { lat, long } = req.body;
  const userId = req.user.id;

  try {
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ message: 'Route not found' });
    }

    if (contact.state === ContractStates.COMPLETED) {
      return res.json({ message: 'Route is already completed', contact });
    }

    if (contact.riderId.toString() === userId) {
      contact.lastKnownRiderLocation = { lat, long };
    } else if (contact.driverId.toString() === userId) {
      contact.lastKnownDriverLocation = { lat, long };
    } else {
      return res.status(403).json({ message: 'Unauthorized to update location for this route' });
    }

    await contact.save();

    if (
      contact.lastKnownDriverLocation &&
      contact.lastKnownRiderLocation &&
      calculateDistance(
        contact.lastKnownDriverLocation.lat,
        contact.lastKnownDriverLocation.long,
        contact.endingLocation.lat,
        contact.endingLocation.long
      ) < 50 &&
      calculateDistance(
        contact.lastKnownRiderLocation.lat,
        contact.lastKnownRiderLocation.long,
        contact.endingLocation.lat,
        contact.endingLocation.long
      ) < 50
    ) {
      contact.state = ContractStates.COMPLETED;
      await contact.save();
    }

    res.json({ message: 'Location updated', contact });
  } catch (error) {
    console.error('Error updating location:', error.message);
    res.status(500).json({ message: 'Failed to update location' });
  }
});

module.exports = router;
