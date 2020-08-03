const mongoose = require('mongoose');
const config = require('config');
const dbconfig = config.get('Database.MongoDB');
const dbPath = `mongodb://${dbconfig.host}:${dbconfig.port}/${dbconfig.dbName}`;

mongoose.connect(dbPath, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    autoIndex: false 
}).catch((err) => {
    console.error(err.message); //Handles initial connection errors
    process.exit(1); // Exit process with failure
});

const db = mongoose.connection;
db.on('error', () => {
    console.log('> error occurred from the database');
});
db.once('open', () => {
    console.log('> successfully opened the database');
});
module.exports = mongoose;