const express = require('express');
const app = express();
const firebase = require('firebase');
const bcrypt = require('bcrypt');
const port = process.env.PORT || 8080;
const path=require('path')
require('dotenv').config()

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://kokhaomae-1ca54.firebaseio.com",
    storageBucket: process.env.BUCKET_URL
});

const bucket = admin.storage().bucket();
const firebaseConfig = {
    apiKey: "AIzaSyDey1gR8PtP42JF_eBdA5ovLQzsRRKKdfc",
    authDomain: "kokhaomae-1ca54.firebaseapp.com",
    projectId: "kokhaomae-1ca54",
    storageBucket: "kokhaomae-1ca54.appspot.com",
    messagingSenderId: "143276939391",
    appId: "1:143276939391:web:6df44286e849c1007a474a",
    measurementId: "G-4BJ78T7HV7"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig)
  const db =admin.firestore();
  const Food = db.collection('food');
  const User = db.collection('users');
  const storage = firebase.storage();


app.set('views', path.join(__dirname, 'static', 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded())
app.use('/public', express.static(path.join(__dirname, 'static', 'public')))
app.use(express.json());


app.get("/",async(req, res, next) => {
  try {
    const foodSnapshot = await Food.get();
    const Foods = [];
    foodSnapshot.forEach((doc) => {
      console.log(doc);
        Foods.push({
            id: doc.id,
            name: doc.data().name,
            price: doc.data().price,
            type: doc.data().type
        });
    });
    res.json(Foods);
} catch(e) {
    next(e);
}
});

app.get("/:id",async(req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) throw new Error('id is blank');
    const cuisine = await Food.doc(id).get();
    if (!cuisine.exists) {
        throw new Error('cuisine does not exists');
    }
    res.json({
        id: cuisine.id,
        name:cuisine.data().name,
        price: cuisine.data().price,
        type: cuisine.data().type
    });
} catch(e) {
    next(e);
}
})

app.post("/status",async(req, res,next)=>{
  
})

 
app.post("/create", async (req, res) => {

  await Food.add(req.body);
  res.send({msg:"User Added sussess"})

  });


app.post('/register',async(req,res) => {
    await bcrypt.hash(req.body.password,async (err,hash)=>{
        console.log(req.body)
    try {  
        await admin.auth().createUser({
          email: req.body.email,
          password:hash
        })

        await User.add(req.body);

        res.json({message:'User Created'})
 } catch(e){
         console.log(e)
         res.json({message:'Error creating user'})
       }
      })
    });
 app.post('/login',async(req,res)=>{
    try{const user = await admin.auth().getUserByEmail(req.body.email);
    {
    try {const token =await admin.auth().createCustomToken(req.body.email)
            res.json(token)} catch(e){
            console.log(e)
            res.json({message:'Error Generating Token!Please try again'})
            }
             }
        }catch(e){
             res.json({message:'no user record found'})
            }            
            });

   app.post ('/logout',async(req,res)=>{
          firebase.auth().signOut().then(() =>{
          res.json({success: true})
          }).catch(function(error) {
          res.json({success: false})
          });
});

app.post('/login/admin', async(req, res) => {
    try{const user = await admin.auth().getUserByEmail(req.body.email);
    {
    try {const token =await admin.auth().createCustomToken(req.body.email)
            res.json(token)} catch(e){
            console.log(e)
            res.json({message:'Error Generating Token!Please try again'})
            }
             }
        }catch(e){
             res.json({message:'no user record found'})
            }            
            });


app.post('/logout/admin',(req, res) => {
    firebase.auth().signOut().then(() =>{
      res.json({success: true})
      }).catch(function(error) {
      res.json({success: false})
      });
    });


    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });