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
    // Aynı email ile kayıtlı bir kullanıcı var mı kontrol ediliyor
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ msg: 'Bu email adresi ile kayıtlı bir kullanıcı zaten var' });
    }

    // Yeni kullanıcı oluşturuluyor
    user = new User({
      firstName,
      lastName,
      email,
      password // Şifre hash'lenmiş değil, şifre hash'lenmeli
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
    // Series ve Movies koleksiyonlarındaki verileri getiriyoruz
    const series = await Series.find();
    const movies = await Movie.find();

    // Her iki koleksiyonun verilerini birleştirip döndürüyoruz
    res.status(200).json({ series, movies });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Sunucu hatası');
  }
});

app.get('/movie/:id', async (req, res) => {
  const { id } = req.params; // req.params kullanılarak id alınıyor
  console.log(id); // id doğru şekilde loglanıyor
  try {
    // Veritabanında movieid ile eşleşen bir kayıt aranıyor
    const movie = await Movie.findOne({ movieid: id });
    if (!movie) {
      return res.status(404).json({ message: 'Film bulunamadı' });
    }
    res.json(movie); // Film bulunduysa JSON olarak döndürülüyor
  } catch (error) {
    console.error('Film detayları alınamadı:', error); // Hata durumunda konsola hata yazdırılıyor
    res.status(500).send('Sunucu hatası');
  }
});

app.get('/series/:id', async (req, res) => {
  const { id } = req.params; // req.params kullanılarak id alınıyor
  console.log(id); // id doğru şekilde loglanıyor
  try {
    // Veritabanında movieid ile eşleşen bir kayıt aranıyor
    const series = await Series.findOne({ seriesid: id });
    if (!series) {
      return res.status(404).json({ message: 'Film bulunamadı' });
    }
    res.json(series); // Film bulunduysa JSON olarak döndürülüyor
  } catch (error) {
    console.error('Film detayları alınamadı:', error); // Hata durumunda konsola hata yazdırılıyor
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

    // Favori nesnesini oluştur
    const favorite = new Favorite({
      userId, // Number olarak alınan userId
      itemId,
      itemType
    });

    // Favoriyi veritabanına kaydet
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

    // userId Number olduğu için Number olarak alıyoruz
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

    // Kullanıcının favori filmlerini/dizilerini bul
    const favorites = await Favorite.find({ userId: Number(userId) });

    const favoriteDetails = await Promise.all(
      favorites.map(async (favorite) => {
        if (favorite.itemType === 'movie') {
          // Movie detayını getir
          const movie = await Movie.findOne({ movieid: favorite.itemId });
          return { ...movie._doc, itemType: 'movie' }; // itemType ekleniyor
        } else if (favorite.itemType === 'series') {
          // Series detayını getir
          const series = await Series.findOne({ seriesid: favorite.itemId });
          return { ...series._doc, itemType: 'series' }; // itemType ekleniyor
        }
        return null;
      })
    );

    res.status(200).json(favoriteDetails.filter(item => item !== null)); // Null olmayan öğeleri döndür
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

    // İzleme listesinde öğenin zaten var olup olmadığını kontrol et
    const existingWatchlistItem = await Watchlist.findOne({ userId, itemId, itemType });

    if (existingWatchlistItem) {
      return res.status(400).json({ message: 'Öğe zaten izleme listenizde mevcut' });
    }

    // Yeni izleme listesi öğesi oluştur
    const newWatchlistItem = new Watchlist({
      userId,
      itemId,
      itemType
    });

    // İzleme listesini veritabanına kaydet
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

    // Kullanıcının izleme listesinde olan filmleri/dizilerini bul
    const watchlist = await Watchlist.find({ userId: Number(userId) });

    const watchlistDetails = await Promise.all(
      watchlist.map(async (item) => {
        if (item.itemType === 'movie') {
          // Movie detayını getir
          const movie = await Movie.findOne({ movieid: item.itemId });
          return { ...movie._doc, itemType: 'movie' }; // itemType ekleniyor
        } else if (item.itemType === 'series') {
          // Series detayını getir
          const series = await Series.findOne({ seriesid: item.itemId });
          return { ...series._doc, itemType: 'series' }; // itemType ekleniyor
        }
        return null;
      })
    );

    res.status(200).json(watchlistDetails.filter(item => item !== null)); // Null olmayan öğeleri döndür
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
    // Yeni yorumu oluştur
    const comment = new Comment({
      text,
      rating,
      itemId,
      itemType,
      userId: Number(userId),
    });

    await comment.save();

    // Belirli bir koleksiyonun verilerini güncelle
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
  console.log('User ID:', userId); // Kullanıcı ID'sini konsola yazdır

  if (!userId) {
    return res.status(401).json({ message: 'Yetkilendirilmemiş erişim' });
  }

  try {
    // Kullanıcıyı ID'ye göre bul
    const user = await User.findOne({ userid: userId }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcı bilgilerini konsola yazdır
    console.log('User Data:', user);

    // Kullanıcı bilgilerini döndür
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
    ).select('-password'); // Şifreyi dahil etme

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

    // Eski şifreyi kontrol et
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Eski şifre yanlış' });
    }

    // Yeni şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Şifreyi doğrudan güncelle
    await User.updateOne({ userid: userId }, { password: hashedPassword });

    // Güncellenmiş kullanıcı verisini tekrar al
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
    // Kullanıcıyı email ile bul
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Yeni şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Şifreyi güncelle
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
    req.session.destroy(); // Oturumu sonlandır
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
    // Son film ID'sini bul
    const lastMovie = await Movie.findOne().sort({ movieid: -1 }).exec();
    const newMovieId = lastMovie ? lastMovie.movieid + 1 : 1; // Eğer koleksiyon boşsa ID 1'den başlasın

    // Yeni film nesnesini oluştur
    const newMovie = new Movie({
      ...req.body,
      movieid: newMovieId, // Yeni film ID'sini ata
    });

    // Filmi kaydet
    await newMovie.save();
    res.status(201).send({ message: 'Film başarıyla eklendi!' });
  } catch (error) {
    console.error('Film eklenirken hata oluştu:', error); // Hata mesajını konsola yazdır
    res.status(400).send({ error: 'Film eklenirken hata oluştu!' });
  }
});

app.post('/series', async (req, res) => {
  try {
    // Son dizi ID'sini bul
    const lastSeries = await Series.findOne().sort({ seriesid: -1 }).exec();
    const newSeriesId = lastSeries ? lastSeries.seriesid + 1 : 1; // Eğer koleksiyon boşsa ID 1'den başlasın

    // Yeni dizi nesnesini oluştur
    const newSeries = new Series({
      ...req.body,
      seriesid: newSeriesId, // Yeni dizi ID'sini ata
    });

    // Diziyi kaydet
    await newSeries.save();
    res.status(201).send({ message: 'Dizi başarıyla eklendi!' });
  } catch (error) {
    console.error('Dizi eklenirken hata oluştu:', error); // Hata mesajını konsola yazdır
    res.status(400).send({ error: 'Dizi eklenirken hata oluştu!' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
