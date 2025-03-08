
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommentSchema = new mongoose.Schema({
    text: {type: String, required: true},
    added_by: {type: Schema.Types.ObjectId, ref: 'User'},
    added_date_time: {type: Date, default:Date.now},
    votes:{type:Number, default:0}
});

CommentSchema
.virtual('url')
.get(function() {
  return 'posts/comment/' + this.id;
});

module.exports = mongoose.model('Comment', CommentSchema);