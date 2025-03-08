// Question Document Schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const questionsSchema = new Schema({
      title: {type: String, required:true, maxLength: 50},
      summary: {type: String,required:true, maxLength: 140},
      text: {type: String, required:true},
      tags:{type:[{ type: Schema.Types.ObjectId, ref: 'Tag'}]},
      answers: {type:[{type:Schema.Types.ObjectId, ref: 'Answer'}]},
      asked_by : {type: Schema.Types.ObjectId, ref: 'User'},
      ask_date_time:{type:Date, default: Date.now},
      comments: {type:[{type:Schema.Types.ObjectId, ref: 'Comment'}]},
      views: {type: Number, default: 0},
      votes: {type: Number, default: 0}
});

questionsSchema.virtual('url').get(function() {
  return 'posts/question/' + this.id;
});

module.exports= mongoose.model('Question', questionsSchema);
