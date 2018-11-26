var express = require('express')
var mysql = require('mysql')
var bodyParser = require('body-parser')
// var cookieParser = require('cookie-parser')
var session = require('express-session')
var md5 = require('md5');
var app = express()
var port = 2300
var admin = require("firebase-admin");

var serviceAccount = require("./firestorekey/primacash-5708b-firebase-adminsdk-05x2x-3ca57065dd.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://primacash-5708b.firebaseio.com"
});

var db = admin.firestore();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

//session
app.use(session({
   secret : 'usertest',
   resave: true,
   saveUninitialized: false,
   cookie: { maxAge: 18000000 }
   // cookie: { secure: true }
}));

//view engine pug
app.set('view engine','pug');

//connection
var conn = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '',
  database : 'cash'
})

//set cookie
// app.use(cookieParser())
//static public


app.use(express.static('public'))

app.get('/testfirebase',(req,res)=>{
  var datas = []
  var datas1 = []
  var i =0
  db.collection('income').get()
    .then((data) => {
      data.forEach(json => {
//        console.log(json.id, "=>" , json.data())
            if (json.data().username == "winargo") {
              datas.push(json.data())
            }
          // datas[i] = json.data()
          // i++
      })
      db.collection('expense').get()
      .then((data1)=>{
        data1.forEach(json=>{
          if (json.data().username == "winargo") {
            datas1.push(json.data())
          }
        })
        res.json({status : true, message : "berhasil get data account",data : datas, data1: datas1})
      })
      .catch((err)=>{
        throw err
      })
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });

})


app.get('/home',function(req,res){
  var username = req.session.userName;
  var dataAccount = []
  var dataIncome = []
  var dataExpense = []
  var selsql = 'select * from account where username = ? limit 5';
  conn.query(selsql,username,function(err,result){
    if(err)
      throw err
    else {
      var selsql2 = 'select * from income where username = ? limit 5';
      conn.query(selsql2,username,function(err,result1){
        if(err)
          throw err
        else {
          var selsql3 = 'select * from expense where username = ? limit 5';
          conn.query(selsql3,username,function(err,result2){
            if(err)
              throw err;
            else {
              res.render('home',{list : result, list1 : result1, list2 : result2, username : username});
            }
          })
        }
      })
    }
  })
  db.collection('account').get()
  .then((data)=>{
    data.forEach(json=>{
      if (json.data().username == username) {

      }
    })
  })
})

app.get('/chart',function(req,res){
  var username = req.session.userName;
  var selsql = 'select expense_amount from expense where username = ?';
  conn.query(selsql,username,function(err,row){
     if(err)
        throw err
      else{
        res.status(200);
        res.json(row);
      }
    })
})

app.get('/income',function(req,res){
  var username = req.session.userName;
  var dataincome = []
  var dataaccount = []
  db.collection('income').get()
    .then((data) => {
      data.forEach(json => {
        console.log(json.data().username);
          if (json.data().username == username) {
            dataincome.push(json.data())
          }
      })
      db.collection('account').get()
      .then((data) => {
        data.forEach(json => {
          if (json.data().username == username) {
            dataaccount.push(json.data())
          }
        })
        res.render('income',{list : dataincome, list1 : dataaccount })
      })
      .catch((err)=>{
        throw err
      })
    })
    .catch((err)=>{
      throw err
    })
})

app.get('/expense',function(req,res){
  var username = req.session.userName;
  var dataexpense = []
  var dataaccount = []

  db.collection('expense').get()
    .then((data) => {
      data.forEach(json=>{
        if (json.data().username == username) {
          dataexpense.push(json.data())
        }
      })
      db.collection('account').get()
      .then((data) => {
        data.forEach(json => {
          if (json.data().username == username) {
            dataaccount.push(json.data())
          }
        })
        res.render('expense', {list : dataexpense, list1 : dataaccount });
      })
      .catch((err)=>{
        throw err
      }) // end data1
    })
    .catch((err)=>{
      throw err
    })// end data
})

app.get('/account',function(req,res){
    var username = req.session.userName;
    var dataaccount = []
    var datacategory = []
    db.collection('account').get()
    .then((data)=>{
      data.forEach(json=>{
        if (json.data().username == username) {
          dataaccount.push(json.data())
        }
      })
      db.collection('category').get()
      .then((data1)=>{
        data1.forEach(json=>{
          if (json.data().username == username) {
            datacategory.push(json.data())
          }
        })
        res.render('account',{list : dataaccount, list1 : datacategory});
      })
      .catch((err)=>{
        throw err
      }) // end data1
    })
    .catch((err)=>{
      throw err
    }) // end data
})

app.get('/category',function(req,res){
    var username = req.session.userName;
    var datas = []
    db.collection('category').get()
    .then((data)=>{
      data.forEach(json=>{
        if(json.data().username == username)
        {
          datas.push(json.data())
        }
      })
      res.render('category',{list : datas});
    })
})

app.post('/authen',function(req,res,next){
  var username = req.body.username;
  var password = md5(req.body.password);

  var datas = []
  var i =0
  db.collection('accounts').get()
    .then((data) => {
      data.forEach(json => {
//        console.log(json.id, "=>" , json.data())
          datas[i] = json.data()
          if ((json.data().email == username && json.data().password == password) || (json.data().username == username && json.data().password == password)) {
              req.session.userName = json.data().username
              res.redirect('/home');
          }
          i++
      })
      res.redirect('/');
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });

})

app.get('/report',function(req,res){
  var username = req.session.userName;
  var totalincome = 0;
  var totalexpense = 0;
  var dataincome = []
  var dataexpense = []

  db.collection('income').get()
    .then((data) => {
      data.forEach(json => {
          if (json.data().username == username) {
            dataincome.push(json.data())
          }
      })
      // res.render('report',{list : datas});
      db.collection('expense').get()
        .then((data) => {
          data.forEach(json => {
              if (json.data().username == username) {
                dataexpense.push(json.data())
              }

          })
          res.render('report',{listincome : dataincome, listexpense : dataexpense});
        })
        .catch((err) => {
          console.log('Error getting documents', err);
        });
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
})

app.post('/authenregis',function(req,res){
  var username = req.body.username;
  var password = req.body.password;
  var sql = 'select * from user where username = ? and password = ?';
  conn.query(sql,[username,password],function(err,row){
    if(err){
      throw err
    }
    else{
      var count = row.length;
      console.log("sampai tahap ini");
      if(count == 0){
        sqls = 'insert into user (username,password) values (?,?)';
        conn.query(sqls,[username,password],function(err,row){
            if(err){
                throw err
            }
            else{
                console.log("berhasil register" + row);
                res.redirect('/');
            }
        })
      }
      else{
        res.redirect('/register.html')
      }

    }
  })
})

app.post('/authaccount',function(req,res){
    var accs = req.body.nameacc;
    var currency = req.body.currency;
    var option = req.body.option;

    var sql = 'select * from account where account_name = ?';
    conn.query(sql,accs,function(err,row){
        if(err){
            throw err
        }
        else{
            var count = row.length;
            var dt = new Date();
            var dts = dt.getFullYear()+":"+dt.getMonth()+":"+dt.getDate();
            var username = req.session.userName;
            if(count == 0){
                sqls = 'insert into account (account_name,account_balance,account_createdate,username,category_name) values (?,?,?,?,?)';
                conn.query(sqls,[accs,currency,dts,username,option]);
                res.redirect('/account');
            }
            else{
                res.redirect('/account');
            }
        }
    })
})

app.post('/authcategory',function(req,res){
    var categoryname = req.body.namecate;
    var categorynum = req.body.catenums;
    var username = req.session.userName;
    sql = 'select * from category where category_name = ?';
    conn.query(sql,categoryname,function(err,row){
        if(err)
            throw err
        else{
            var count = row.length;
            var dt = new Date();
            var dts = dt.getFullYear()+":"+dt.getMonth()+":"+dt.getDate();
            if(count == 0){
                insert ='insert into category (category_name,category_createdate,username,category_nums) values (?,?,?,?)';
                conn.query(insert,[categoryname,dts,username,categorynum]);
                res.redirect('/category');
            }
            else{
                res.redirect('/category');
            }
        }
    })
})

app.post('/authincome',function(req,res){
  var amount = req.body.amount;
  var from = req.body.from;
  var option = req.body.options;
  var note = req.body.note;
  var incomedate = req.body.inptdate;
  var date = new Date()
  var dts = date.getFullYear()+":"+date.getMonth()+":"+date.getDate();
  var selsql = 'select * from account where account_name = ?';
  conn.query(selsql,option,function(err,row){
      if(err)
        throw err
      else{
        var username = req.session.userName;
        var balance = row[0].account_balance;
        var left = parseInt(balance) + parseInt(amount);
        console.log(left);

        var insert = 'insert into income (income_account,username,income_date,income_amount,income_from,income_notes,amount_left,income_createdate,income_id) values (?,?,?,?,?,?,?,?,?)';
        conn.query(insert,[option,username,incomedate,amount,from,note,left,date,dts],function(err,result) {
            if(err)
              throw err
            else{
              var update = 'update account set account_balance = account_balance + ? where account_name = ?';
              conn.query(update,[amount,option],function(err,hasil){
                  if(err)
                    throw err
                  else{
                    console.log(hasil);
                  }
              })
              res.redirect('/income');
            }
        })
      }
  })
})

app.post('/authexpense',function(req,res){
  var amount = req.body.amount;
  var to = req.body.to;
  var option = req.body.options;
  var note = req.body.note;
  var expdate = req.body.inptdate;
  var date = new Date()
  var dts = date.getFullYear()+":"+date.getMonth()+":"+date.getDate();
  var selsql = 'select * from account where account_name = ?';
  conn.query(selsql,option,function(err,row){
      if(err)
        throw err
      else{
        var username = req.session.userName;
        var balance = row[0].account_balance;
        var left = parseInt(balance) - parseInt(amount);
        console.log(left);

        var insert = 'insert into expense (expense_account,username,expense_date,expense_amount,expense_to,expense_notes,amount_left,expense_createdate,expense_id) values (?,?,?,?,?,?,?,?,?)';
        conn.query(insert,[option,username,expdate,amount,to,note,left,date,dts],function(err,result) {
            if(err)
              throw err
            else{
              var update = 'update account set account_balance = account_balance - ? where account_name = ?';
              conn.query(update,[amount,option],function(err,hasil){
                  if(err)
                    throw err
                  else{
                    console.log(hasil);
                  }
              })
              res.redirect('/expense');
            }
        })
      }
  })
})

app.listen(port,function(){
    console.log("server up port "+port)
})
