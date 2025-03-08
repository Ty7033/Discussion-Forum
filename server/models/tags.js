// Tag Document Schema

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TagSchema = new Schema(
  {
    name: {type: String, required: true, maxLength:20},
  }
);
TagSchema
.virtual('url')
.get(function() {
  return 'posts/tag/' + this.id;
});


module.exports = mongoose.model('Tag', TagSchema);
