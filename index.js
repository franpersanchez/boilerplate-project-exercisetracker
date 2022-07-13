const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser=require('body-parser')
const mongoose = require('mongoose')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//creating the DB connection. DB users
mongoose.connect(process.env['MONGO_URI']) ;

// new schema
const userSchema = new mongoose.Schema({
  username: String,
  log: [{ description: String, duration: Number, date: Date }]
});

//new Model

const User = mongoose.model('User', userSchema);

//POST, creation of a new user.

app.post('/api/users',bodyParser.urlencoded({ extended: false }), (req, res)=>{

let usernamePost=req.body['username']


  var newUser = new User({
    username: usernamePost, 
   });

    newUser.save(function(err, doc) {
      if (err) {
        return console.error(err);
      }else {
          console.log("User saved successfully!");
          findUser(console.log)
            }
                                    }); 
  
   function findUser(done){     
     User.findOne({username:usernamePost},function(err,obj) { 
       if(err){
         return console.error(err)
       }else{
         done(obj);
         res.json({
           username: obj['username'],
           _id: obj['_id']
         });
       }
         
      });
   };
  
});

//post of the exercise for an specific user _id
app.post('/api/exercises',bodyParser.urlencoded({ extended: false }), (req, res)=>{


  res.json({
   username: "fcc_test",
  
});

  
} )



//por ultimo faltaria el GET






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
