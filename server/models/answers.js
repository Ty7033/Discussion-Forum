// Answer Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AnswerSchema = new mongoose.Schema({
    text: {type: String, required: true},
    ans_by: {type:Schema.Types.ObjectId, ref: 'User', required: true},
    ans_date_time: {type: Date, default:Date.now},
    comments: {type:[{type:Schema.Types.ObjectId, ref: 'Comment'}]},
    votes: {type: Number, default: 0}
});

AnswerSchema
.virtual('url')
.get(function() {
  return 'posts/answer/' + this.id;
});

module.exports = mongoose.model('Answer', AnswerSchema);