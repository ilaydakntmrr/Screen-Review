require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./db');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Series = require('./models/Series');
const Movie = require('./models/Movies');
const Support = require('./models/Support');
const Favorite = require('./models/Favorite');
const Watchlist = require('./models/Watchlist');
const Comment = require('./models/Comments')
const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

connectDB();

app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ msg: 'Bu email adresi ile kayıtlı bir kullanıcı zaten var' });
    }

    user = new User({
      firstName,
      lastName,
      email,
      password 
    });

    await user.save();

    res.status(200).json({ msg: 'Kullanıcı başarıyla oluşturuldu' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Sunucu hatası');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Geçersiz email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Geçersiz sifre' });
    }

    req.session.userId = user.userid;

    res.status(200).json({
      msg: 'Giriş başarılı',
      userId: user.userid,
      role: user.role
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Sunucu hatası');
  }
});

app.get('/home', async (req, res) => {
  try {
    const series = await Series.find();
    const movies = await Movie.find();

    res.status(200).json({ series, movies });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Sunucu hatası');
  }
});

app.get('/movie/:id', async (req, res) => {
  const { id } = req.params; 
  console.log(id);
  try {
    const movie = await Movie.findOne({ movieid: id });
    if (!movie) {
      return res.status(404).json({ message: 'Film bulunamadı' });
    }
    res.json(movie); 
  } catch (error) {
    console.error('Film detayları alınamadı:', error);
    res.status(500).send('Sunucu hatası');
  }
});

app.get('/series/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id); 
  try {
    const series = await Series.findOne({ seriesid: id });
    if (!series) {
      return res.status(404).json({ message: 'Film bulunamadı' });
    }
    res.json(series); 
  } catch (error) {
    console.error('Film detayları alınamadı:', error);
    res.status(500).send('Sunucu hatası');
  }
});

app.put('/series/:id', async (req, res) => {
  const { id } = req.params;
  const { averageRating, commentCount } = req.body;

  try {
    const result = await Series.updateOne(
      { seriesid: id },
      { averageRating, commentCount }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: 'Dizi bulunamadı' });
    }

    res.status(200).json({ message: 'Dizi güncellendi' });
  } catch (error) {
    console.error('Dizi güncellenirken hata:', error);
    res.status(500).json({ message: 'Dizi güncellenirken bir hata oluştu' });
  }
});

app.put('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const { averageRating, commentCount } = req.body;

  try {
    const result = await Movie.updateOne(
      { movieid: id },
      { averageRating, commentCount }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: 'Film bulunamadı' });
    }

    res.status(200).json({ message: 'Film güncellendi' });
  } catch (error) {
    console.error('Film güncellenirken hata:', error);
    res.status(500).json({ message: 'Film güncellenirken bir hata oluştu' });
  }
});

app.post('/favorites', async (req, res) => {
  try {
    const { userId, itemId, itemType } = req.body;

    const favorite = new Favorite({
      userId, 
      itemId,
      itemType
    });

    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Favori ekleme hatası:', error);
    res.status(500).json({ message: 'Favori eklenirken bir hata oluştu' });
  }
});

app.delete('/favorites', async (req, res) => {
  const { userId, itemId, itemType } = req.body;

  try {
    const result = await Favorite.deleteOne({ userId, itemId, itemType });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Film favorilerde bulunamadı.' });
    }

    res.status(200).json({ message: 'Film favorilerden çıkarıldı.' });
  } catch (error) {
    console.error('Favorilerden çıkarılırken bir hata oluştu:', error);
    res.status(500).json({ message: 'Bir hata oluştu.' });
  }
});

app.get('/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await Favorite.find({ userId: Number(userId) }).exec();
    res.status(200).json(favorites);
  } catch (error) {
    console.error('Favorileri listeleme hatası:', error);
    res.status(500).json({ message: 'Favoriler alınırken bir hata oluştu' });
  }
});

app.get('/favorites/details/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await Favorite.find({ userId: Number(userId) });

    const favoriteDetails = await Promise.all(
      favorites.map(async (favorite) => {
        if (favorite.itemType === 'movie') {
          const movie = await Movie.findOne({ movieid: favorite.itemId });
          return { ...movie._doc, itemType: 'movie' };
        } else if (favorite.itemType === 'series') {
          const series = await Series.findOne({ seriesid: favorite.itemId });
          return { ...series._doc, itemType: 'series' }; 
        }
        return null;
      })
    );

    res.status(200).json(favoriteDetails.filter(item => item !== null)); 
  } catch (error) {
    console.error('Favori detayları alınırken hata:', error);
    res.status(500).json({ message: 'Favori detayları alınırken bir hata oluştu' });
  }
});

app.post('/add-to-watchlist', async (req, res) => {
  try {
    const { userId, itemId, itemType } = req.body;

    if (!userId || !itemId || !itemType) {
      return res.status(400).json({ message: 'Eksik parametreler' });
    }
    const existingWatchlistItem = await Watchlist.findOne({ userId, itemId, itemType });

    if (existingWatchlistItem) {
      return res.status(400).json({ message: 'Öğe zaten izleme listenizde mevcut' });
    }

    const newWatchlistItem = new Watchlist({
      userId,
      itemId,
      itemType
    });

    await newWatchlistItem.save();
    res.status(201).json({ message: 'Öğe izleme listenize başarıyla eklendi' });
  } catch (error) {
    console.error('İzleme listesine öğe eklenirken bir hata oluştu:', error);
    res.status(500).json({ message: 'Bir hata oluştu' });
  }
});

app.get('/watchlist/details/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const watchlist = await Watchlist.find({ userId: Number(userId) });

    const watchlistDetails = await Promise.all(
      watchlist.map(async (item) => {
        if (item.itemType === 'movie') {
          const movie = await Movie.findOne({ movieid: item.itemId });
          return { ...movie._doc, itemType: 'movie' };
        } else if (item.itemType === 'series') {
          const series = await Series.findOne({ seriesid: item.itemId });
          return { ...series._doc, itemType: 'series' }; 
        }
        return null;
      })
    );

    res.status(200).json(watchlistDetails.filter(item => item !== null));
  } catch (error) {
    console.error('İzleme listesi detayları alınırken hata:', error);
    res.status(500).json({ message: 'İzleme listesi detayları alınırken bir hata oluştu' });
  }
});

app.delete('/watchlist', async (req, res) => {
  const { userId, itemId, itemType } = req.body;

  try {
    const result = await Watchlist.deleteOne({ userId, itemId, itemType });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Öğe izleme listesinde bulunamadı.' });
    }

    res.status(200).json({ message: 'Öğe izleme listesinden çıkarıldı.' });
  } catch (error) {
    console.error('İzleme listesinden çıkarılırken bir hata oluştu:', error);
    res.status(500).json({ message: 'Bir hata oluştu.' });
  }
});

app.post('/comments', async (req, res) => {
  const userId = req.session.userId;
  const { text, rating, itemId, itemType } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Yetkilendirilmemiş erişim' });
  }

  if (!rating || !itemId || !itemType) {
    return res.status(400).json({ message: 'Eksik parametreler' });
  }

  try {
    const comment = new Comment({
      text,
      rating,
      itemId,
      itemType,
      userId: Number(userId),
    });

    await comment.save();

    if (itemType === 'movie') {
      const movie = await Movie.findOne({ movieid: itemId });
      if (movie) {
        const comments = await Comment.find({ itemId, itemType });
        const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
        const averageRating = comments.length ? (totalRating / comments.length).toFixed(1) : 0;
        const commentCount = comments.length;

        await Movie.updateOne({ movieid: itemId }, { averageRating, commentCount });
      }
    } else if (itemType === 'series') {
      const series = await Series.findOne({ seriesid: itemId });
      if (series) {
        const comments = await Comment.find({ itemId, itemType });
        const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
        const averageRating = comments.length ? (totalRating / comments.length).toFixed(1) : 0;
        const commentCount = comments.length;

        await Series.updateOne({ seriesid: itemId }, { averageRating, commentCount });
      }
    } else {
      return res.status(400).json({ message: 'Geçersiz itemType' });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    res.status(500).json({ message: 'Yorum eklenirken bir hata oluştu' });
  }
});

app.get('/comments/:itemId/:itemType', async (req, res) => {
  try {
    const { itemId, itemType } = req.params;
    const comments = await Comment.find({ itemId, itemType });

    res.status(200).json(comments);
  } catch (error) {
    console.error('Yorumlar alınırken hata:', error);
    res.status(500).json({ message: 'Yorumlar alınırken bir hata oluştu' });
  }
});

app.get('/account', async (req, res) => {
  const userId = req.session.userId;
  console.log('User ID:', userId); 

  if (!userId) {
    return res.status(401).json({ message: 'Yetkilendirilmemiş erişim' });
  }

  try {
    const user = await User.findOne({ userid: userId }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    console.log('User Data:', user);

    res.json(user);
  } catch (error) {
    console.error('Failed to load user data:', error);
    res.status(500).send('Sunucu hatası');
  }
});

app.put('/account', async (req, res) => {
  const userId = req.session.userId;
  const { firstName, lastName, email } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Yetkilendirilmemiş erişim' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { userid: userId },
      { firstName, lastName, email },
      { new: true }
    ).select('-password'); 

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    console.error('Failed to update user data:', error);
    res.status(500).send('Sunucu hatası');
  }
});

app.put('/change-password', async (req, res) => {
  const userId = req.session.userId;
  const { oldPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Yetkilendirilmemiş erişim' });
  }

  try {
    const user = await User.findOne({ userid: userId });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Eski şifre yanlış' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne({ userid: userId }, { password: hashedPassword });

    const updatedUser = await User.findOne({ userid: userId });
    console.log('Updated user data:', updatedUser);

    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Failed to change password:', error);
    res.status(500).send('Sunucu hatası');
  }
});

app.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne({ email: email }, { password: hashedPassword });

    res.json({ message: 'Şifre başarıyla sıfırlandı' });
  } catch (error) {
    console.error('Şifre sıfırlanırken bir hata oluştu:', error);
    res.status(500).send('Sunucu hatası');
  }
});

app.delete('/account', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Yetkilendirilmemiş erişim' });
  }

  try {
    await User.findOneAndDelete({ userid: userId });
    req.session.destroy(); 
    res.json({ message: 'Hesap başarıyla silindi' });
  } catch (error) {
    console.error('Failed to delete account:', error);
    res.status(500).send('Sunucu hatası');
  }
});

app.post('/support', async (req, res) => {
  console.log('Gelen istek:', req.body);
  try {
    const { email, suggestions } = req.body;

    const support = new Support({ email, suggestions });
    await support.save();

    console.log('Destek verisi başarıyla kaydedildi');
    res.status(201).json({ message: 'Destek verisi başarıyla kaydedildi.' });
  } catch (error) {
    console.error('Destek verisi kaydedilirken bir hata oluştu:', error);
    res.status(500).json({ message: 'Destek verisi kaydedilirken bir hata oluştu.' });
  }
});

app.post('/movies', async (req, res) => {
  try {
    const lastMovie = await Movie.findOne().sort({ movieid: -1 }).exec();
    const newMovieId = lastMovie ? lastMovie.movieid + 1 : 1; 

    const newMovie = new Movie({
      ...req.body,
      movieid: newMovieId, 
    });

    await newMovie.save();
    res.status(201).send({ message: 'Film başarıyla eklendi!' });
  } catch (error) {
    console.error('Film eklenirken hata oluştu:', error);
    res.status(400).send({ error: 'Film eklenirken hata oluştu!' });
  }
});

app.post('/series', async (req, res) => {
  try {
    const lastSeries = await Series.findOne().sort({ seriesid: -1 }).exec();
    const newSeriesId = lastSeries ? lastSeries.seriesid + 1 : 1; 

    const newSeries = new Series({
      ...req.body,
      seriesid: newSeriesId, 
    });

    await newSeries.save();
    res.status(201).send({ message: 'Dizi başarıyla eklendi!' });
  } catch (error) {
    console.error('Dizi eklenirken hata oluştu:', error); 
    res.status(400).send({ error: 'Dizi eklenirken hata oluştu!' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
