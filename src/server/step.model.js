const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stepSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    Title : String,
    Description :String,
    Thumb : String,
    Url : String,
    Type : String,
    Tags : String,
    Comments : String,
    Tree : String,
    Recommender : String,
    ip: String
  },
  {
    collection: 'paths',
    read: 'nearest'
  }
);

const Step = mongoose.model('Step', stepSchema);

module.exports = Step;
