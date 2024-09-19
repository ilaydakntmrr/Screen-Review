const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const commentSchema = new mongoose.Schema({
  commentId: { type: Number, unique: true },
  text: { type: String, required: false },
  rating: { type: Number, required: true },
  itemId: { type: String, required: true },
  itemType: { type: String, enum: ['movie', 'series'], required: true },
  userId: { type: Number, ref: 'User', required: true }
});

commentSchema.plugin(AutoIncrement, { inc_field: 'commentId' });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
