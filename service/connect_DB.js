var mongoose = require('mongoose')

try {
  var url = `mongodb://${process.env.databaseHost}:${process.env.databasePort_ie}/${process.env.databaseName_ie}?authSource=${process.env.database_AuthSource}`;
  var option =  {
    user: process.env.database_User,
    pass: process.env.database_Password,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    }
  mongoose.connect(url,option)
  mongoose.connection.on('connected', function () {  
    console.log('DB Connection');
  }); 
  mongoose.connection.on('error',function (err) {  
    console.log('DB Connection error: ' + err);
  }); 
} 
catch (error) {
  console.log(error);
}
