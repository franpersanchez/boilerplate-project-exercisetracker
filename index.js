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
  username: {type:String, required:true},
  count: {type:Number},
  log: [{ description: { type: String, required: true },
         duration: {type: Number,required: true},
         date: Date,
         _id: false}]
});

//new Model

const User = mongoose.model('User', userSchema);

//POST, creation of a new user and display of ID and username

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
          findUser()
            }
                                    }); 
  
   function findUser(){     
     User.findOne({username:usernamePost},function(err,obj) { 
       if(err){
         return console.error(err)
       }else{
         console.log(typeof obj);
         res.json({
           username: obj['username'],
           _id: obj['_id']
         });
       }
         
      });
   };
  
});


//get the list of users and their id
app.get('/api/users', (req, res)=>{

User.find({}).select({username:1, _id:1}).exec((err,usersList)=>{
   if(err){
         return console.error(err)
       }else{
         res.json(usersList)
                }
})
    
} );


//POST, creation of a new exercise. Parameters: exercise and duration, date is option and if not entered, the date is the current date by default

app.post('/api/users/:_id/exercises',bodyParser.urlencoded({ extended: false }), (req, res)=>{
  let idUsuario=req.params._id;
  let description=req.body['description']
  let duration=+req.body['duration']
  let enteredDate= req.body.date
  let formatedEnteredDate= new Date(enteredDate).toDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})

   const defaultDate=  new Date().toDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});
  
  const date =  req.body.date? formatedEnteredDate : defaultDate;

 
   
    
    let query = {_id: idUsuario};
  
         User.findOneAndUpdate(query, {$push: {log:[{description: description,duration: duration, date: date }]}},{ new: true },(err,savedExercise)=>{
                                  
          if(err){
               return console.error(err)
             }else{    
        
            res.json({
           username: savedExercise['username'],
           _id: savedExercise['_id'],
              description:description,
              duration: duration,
              date: date,
         });
    
        }
         });
    
});
              
              
              
//get the list exercises in LOG given an _id

app.get('/api/users/:_id/logs', (req, res)=>{
  const {from, to, limit}= req.query;
  const id=req.params._id;

  User.findById(id, (err, data)=>{
    
   
     if(err){
      res.send("No user with this ID")
    }
    else{
let responseObject=data;
      
      
      if(req.query.from || req.query.to){
        let fromDate= new Date(0)
        let toDate = new Date()

        if(req.query.from){
          fromDate = new Date (req.query.from)
        }

        if (req.query.to){
          toDate = new Date (req.query.to)
        }

        fromDate=fromDate.getTime()
        toDate=toDate.getTime()

        data.log=data.log.filter((exercise)=>{
          let exerciseDate = new Date(exercise.date).getTime();
           return exerciseDate >=fromDate && exerciseDate <= toDate
        })
        
      }

      if(!isNaN(req.query.limit)){
        data.log=data.log.slice(0,req.query.limit)
      }
      
      let exercises=data.log;
      let log=exercises.map((e)=>({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString()
      }));
      res.json({
        username: data['username'],
        count: exercises.length,
        _id:id,        
        log
      })
    }
  })

});

             





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
