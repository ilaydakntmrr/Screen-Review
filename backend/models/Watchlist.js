const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  itemId: { type: String, required: true },
  itemType: { type: String, enum: ['movie', 'series'], required: true },
  addedAt: { type: Date, default: Date.now }
});

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;
