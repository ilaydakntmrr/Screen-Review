const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  movieid: { type: Number, required: true },
  name: { type: String, required: true },
  category: { type: [String], required: true },
  summary: { type: String },
  duration: { type: Number },
  director: { type: String },
  imdb: { type: Number },
  averageRating: { type: Number, default: null },
  commentCount: { type: Number, default: null },
  screenwriter: { type: String },
  stars: [String],
  img: { type: String }
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
