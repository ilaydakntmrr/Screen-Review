const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: Number, ref: 'User', required: true },
  itemId: { type: String, required: true },
  itemType: { type: String, enum: ['movie', 'series'], required: true }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
