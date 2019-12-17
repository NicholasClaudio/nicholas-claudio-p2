import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema({
  user: {
    type: 'ObjectId',
    ref: 'User'
  },

  brandName: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: true
  },
  servingSize: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  servingsPerContainer: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Entry = mongoose.model('entry', EntrySchema);

export default Entry;