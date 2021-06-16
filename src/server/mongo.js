const mongoose = require('mongoose');
/**
 * Set to Node.js native promises
 * Per http://mongoosejs.com/docs/promises.html
 */
mongoose.Promise = global.Promise;

const env = require('./env/environment');

// eslint-disable-next-line max-len
const mongoUri = `mongodb://${process.env.accountName}:${process.env.mongokey}@${process.env.accountName}.documents.azure.com:${process.env.mongoport}/${process.env.mongoDatabaseName}?ssl=true`;
console.log("mongoUri "+mongoUri);

function connect() {
  mongoose.set('debug', true);
  return mongoose.connect(
    mongoUri,
    {
      useMongoClient: true
    }
  );
}

module.exports = {
  connect,
  mongoose
};
