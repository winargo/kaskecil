module.exports = function(){
  this.express = require('express')

  this.port = 2300
  this.app=express()
  this.router = express.Router()
  this.mysql = require('mysql')
  this.bodyParser = require('body-parser')
  this.session = require('express-session')
  this.md5 = require('md5');
  this.port = 2300
  this.admin = require("firebase-admin");
  this.numeral = require('numeral');
  this.fx=require('money');
  this.moment=require("moment");

  this.serviceAccount = require("./firestorekey/primacash-5708b-firebase-adminsdk-05x2x-3ca57065dd.json");

  // parse application/x-www-form-urlencoded
  this.router.use(bodyParser.urlencoded({ extended: false }))
  // parse application/json
  this.router.use(bodyParser.json())

  // admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount),
  //   databaseURL: "https://primacash-5708b.firebaseio.com"
  // });

  // this.db = admin.firestore();

  //session
  this.app.use(session({
    secret : 'usertest',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 18000000 }
    // cookie: { secure: true }
  }));
  //session
  this.router.use(session({
    secret : 'usertest',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 18000000 }
    // cookie: { secure: true }
  }));

  //view engine pug
  this.app.set('view engine','pug'); 
}
