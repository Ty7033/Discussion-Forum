const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
      firstname:{type: String, required:true},
      lastname:{type:String, required:true},
      username:{type:String, required:true},
      email: {type: String, required:true},
      password:{type: String, required:true},
      rep: {type: Number, required:true, default:50},
      memberTime: {type:Date, default: Date.now},
      admin: {type:Boolean, default:false}
});

userSchema.virtual('url').get(function() {
  return 'posts/user/' + this.id;
});

module.exports= mongoose.model('User', userSchema);