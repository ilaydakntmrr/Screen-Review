const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const connectDB = require('./db'); 
const Movie = require('./models/Movies'); 
const Series = require('./models/Series');

const moviesFilePath = path.join(__dirname, './collections/project.movies.json');
const seriesFilePath = path.join(__dirname, './collections/project.series.json');

let movieData = JSON.parse(fs.readFileSync(moviesFilePath, 'utf-8'));
let seriesData = JSON.parse(fs.readFileSync(seriesFilePath, 'utf-8'));

movieData = movieData.map(movie => {
  delete movie._id;
  return movie;
});

seriesData = seriesData.map(series => {
  delete series._id;
  return series;
});

const seedDatabase = async () => {
  try {
    await connectDB();

    await Movie.insertMany(movieData);
    await Series.insertMany(seriesData);

    console.log('Veriler başarıyla eklendi!');
    mongoose.connection.close(); 
  } catch (error) {
    console.error('Veri eklenirken hata oluştu:', error);
    mongoose.connection.close();
  }
};

seedDatabase();
