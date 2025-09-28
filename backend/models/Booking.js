const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deskId: {
    type: Number,
    required: [true, 'Desk ID is required']
  },
  deskName: {
    type: String,
    required: [true, 'Desk name is required']
  },
  floor: {
    type: Number,
    required: [true, 'Floor is required']
  },
  zone: {
    type: String,
    required: [true, 'Zone is required']
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  purpose: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ deskId: 1, date: 1 });

module.exports = mongoose.model('Booking', bookingSchema);