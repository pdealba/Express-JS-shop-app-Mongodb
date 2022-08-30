const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  mongoClient
    .connect(
      "mongodb+srv://pedroDeAlba123:Paraiso22@cluster0.zfzxf.mongodb.net/?retryWrites=true&w=majority"
    )
    .then((client) => {
        console.log("CONNECTED TO DATABASE");
        _db = client.db();
        callback()
    })
    .catch((err) => console.log(err));
};

const getDb = () => {
  if(_db) {
    return _db;
  }
  throw 'No Database Found!'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;