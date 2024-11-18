const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supportSchema = new Schema({
  email: { type: String, required: true, trim: true },
  suggestions: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Support', supportSchema);
