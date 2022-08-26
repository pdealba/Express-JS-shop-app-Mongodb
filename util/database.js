const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
  mongoClient
    .connect(
      "mongodb+srv://pedroDeAlba123:Paraiso22@cluster0.zfzxf.mongodb.net/?retryWrites=true&w=majority"
    )
    .then((client) => {
        console.log("CONNECTED TO DATABASE");
        callback(client)
    })
    .catch((err) => console.log(err));
};

module.exports = mongoConnect;