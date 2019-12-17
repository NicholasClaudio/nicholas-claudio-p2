import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema({
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
  }
});

const Entry = mongoose.model('entry', PostSchema);

export default Entry;