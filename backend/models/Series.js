const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
  seriesid: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: [String], required: true },
  summary: { type: String },
  seasonCount: { type: Number },
  director: { type: String },
  averageRating: { type: Number },
  imdb: { type: Number },
  commentCount: { type: Number, default: 0 },
  screenwriter: { type: String },
  stars: [String],
  img: { type: String }
});

const Series = mongoose.model('Series', seriesSchema);

module.exports = Series;
