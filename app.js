var express = require('express')
var mysql = require('mysql')
var bodyParser = require('body-parser')
// var cookieParser = require('cookie-parser')
var session = require('express-session')
var md5 = require('md5');
var app = express()
var port = 2300
var admin = require("firebase-admin");

var moment=require("moment");

var serviceAccount = require("./firestorekey/primacash-5708b-firebase-adminsdk-05x2x-3ca57065dd.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://primacash-5708b.firebaseio.com"
});

var db = admin.firestore();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
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

app.get('/home',(req,res)=>{
  console.log("Masuk Home");
  console.log(req.session.userName);
  var username = req.session.userName;
  var account = db.collection('account');
  var income = db.collection('income');
  var expense = db.collection('expense');
  var dataAccount = []
  var dataIncome = []
  var dataExpense = []
  account.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        dataAccount.push(doc.data());
      });
      income.where('username','==',username).get()
        .then(snapshot1 => {
          snapshot1.forEach(doc1 => {
            console.log(doc1.id, '=>', doc1.data());
            dataIncome.push(doc1.data());
          });
          expense.where('username','==',username).get()
            .then(snapshot2 => {
              snapshot2.forEach(doc2 => {
                console.log(doc2.id, '=>', doc2.data());
                dataExpense.push(doc2.data());
              });
              res.render('home',{list : dataAccount, list1 : dataIncome, list2 : dataExpense, username : username});                                                                                                                         
            })
            .catch(err => {
              console.log('Error getting documents', err);
            });
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
})

/*
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
})*/

app.get('/chart',function(req,res){
  var username = req.session.userName;
  var dataexpense=[]
  var expense=db.collection("expense");
  expense.where('username','==',username).get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log("Masuk ke Expense Chart");
      dataexpense.push(doc.data());
    });
    res.status(200);
    res.json(dataexpense);
  })
  .catch(err => {
    console.log('Error getting documents', err);
    res.redirect('/');
  });
})
/*
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
})*/

app.get('/income',(req,res)=>{
  var username = req.session.userName;
  var account = db.collection('account');
  var income = db.collection('income');
  var dataincome = []
  var dataaccount = []
  income.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Masuk ke Income");
        console.log(doc.id, '=>', doc.data());
        dataincome.push(doc.data())
      });
      account.where('username','==',username).get()
        .then(snapshot1 => {
          snapshot1.forEach(doc1 => {
            console.log(doc1.id, '=>', doc1.data());
            dataaccount.push(doc1.data())
          });
          res.render('income',{list : dataincome, list1 : dataaccount })
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})
/*
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
})*/

app.get('/expense',(req,res)=>{
  var username = req.session.userName;
  var account = db.collection('account');
  var expense = db.collection('expense');
  var dataexpense = []
  var dataaccount = []
  expense.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Masuk ke Expense");
        console.log(doc.id, '=>', doc.data());
        dataexpense.push(doc.data())
      });
      account.where('username','==',username).get()
        .then(snapshot1 => {
          snapshot1.forEach(doc1 => {
            console.log(doc1.id, '=>', doc1.data());
            dataaccount.push(doc1.data())
          });
          res.render('expense', {list : dataexpense, list1 : dataaccount });
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})
/*
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
})*/

app.get('/transfer',(req,res)=>{
  var username = req.session.userName;
  var account = db.collection('account');
  var transfer = db.collection('transfer');
  var datatransfer = []
  var dataaccount = []
  transfer.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Masuk ke Transfer");
        console.log(doc.id, '=>', doc.data());
        datatransfer.push(doc.data())
      });
      account.where('username','==',username).get()
        .then(snapshot1 => {
          snapshot1.forEach(doc1 => {
            console.log(doc1.id, '=>', doc1.data());
            dataaccount.push(doc1.data())
          });
          res.render('transfer', {list : datatransfer, list1 : dataaccount });
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

app.get('/account',(req,res)=>{
  var username = req.session.userName;
  var account = db.collection('account');
  var category = db.collection('category');
  var dataaccount = []
  var datacategory = []
  account.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Masuk ke Account");
        console.log(doc.id, '=>', doc.data());
        dataaccount.push(doc.data())
      });
      category.where('username','==',username).get()
        .then(snapshot1 => {
          snapshot1.forEach(doc1 => {
            console.log(doc1.id, '=>', doc1.data());
            datacategory.push(doc1.data())
          });
          res.render('account',{list : dataaccount, list1 : datacategory});
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})
/*
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
})*/

app.get('/category',(req,res)=>{
  var username = req.session.userName;
  var category = db.collection('category');
  var datas = []
  category.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Masuk ke Category");
        console.log(doc.id, '=>', doc.data());
        datas.push(doc.data())
      });
      res.render('category',{list : datas});
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})
/*
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
})*/

app.get('/test',(req,res)=>{
  var account = db.collection('account');
  var allAccount = account.where('account_currency','==','IDR').where('account_balance','==','50000').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
})

app.post('/authen',(req,res)=>{
  var username = req.body.username;
  var password = md5(req.body.password);
  var account = db.collection('accounts');
  account.where('username','==',username).where('password','==',password).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Anda berhasil login");
        console.log(doc.id, '=>', doc.data());
        req.session.userName = username;
        req.session.email = doc.data().email;
        res.redirect('/home');
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
  account.where('email','==',username).where('password','==',password).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Anda berhasil login");
        console.log(doc.id, '=>', doc.data());
        req.session.userName = doc.data().username;
        req.session.email = doc.data().email;
        res.redirect('/home');
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})
/*
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

})*/

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
            totalincome += parseInt(json.data().income_amount);
          }
      })
      // res.render('report',{list : datas});
      db.collection('expense').get()
        .then((data) => {
          data.forEach(json => {
              if (json.data().username == username) {
                dataexpense.push(json.data())
                totalexpense += parseInt(json.data().expense_amount);
              }

          })
          res.render('report',{listincome : dataincome, listexpense : dataexpense, totalIncome : totalincome, totalExpense : totalexpense});
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

app.post('/authaccount',(req,res)=>{
  var exist=false;
  var username=req.session.userName;
  var accs = req.body.nameacc;
  var currency = req.body.currency;
  var option = req.body.option;
  var account = db.collection('account');
  account.where('username','==',username).where('account_name','==',accs).get()
    .then(snapshot => {
      console.log("/authaccount");
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        exist=true;
      });
      if(exist){
        console.log("Data Account sudah ada");
        res.redirect('/account');
      }
      else{
        moment.locale('id');
        console.log(moment().format('LLL'));
        db.collection('account').add({
          account_balance: currency ,
          account_balance_current: currency,
          account_category: option,
          account_createdate: moment().format('L'),
          account_createorlast: 1,
          account_currency: "IDR",
          account_fullcurrency: "IDR-RP",
          account_lastused: moment().format('L'),
          account_name: accs,
          account_status: 1,
          email: req.session.email,
          username: username
        }).then(ref => {
          console.log('Added document with ID: ', ref.id);
        });
        res.redirect('/account');
      }
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})
/*
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
})*/

app.post('/authcategory',(req,res)=>{
  var exist=false;
  var categoryname = req.body.namecate;
  var categorynum = req.body.catenums;
  var username = req.session.userName;
  var category = db.collection('category');
  category.where('username','==',username).where('category_name','==',categoryname).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Anda berhasil login");
        console.log(doc.id, '=>', doc.data());
        exist=true;
      });
      if(exist){
        console.log("Data Category sudah ada");
        res.redirect('/category');
      }
      else{
        moment.locale('id');
        console.log(moment().format('LLL'));
        db.collection('category').add({
          category_createddate: moment().format('LLL') ,
          category_image: categorynum,
          category_name: categoryname,
          category_status: 1,
          email: req.session.email,
          username: username
        }).then(ref => {
          console.log('Added document with ID: ', ref.id);
        });
        res.redirect('/category');
      }
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})
/*
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
})*/

app.post('/authincome',(req,res)=>{
  var balances;
  var username = req.session.userName;
  var amount = req.body.amount;
  var from = req.body.from;
  var option = req.body.options;
  var note = req.body.note;
  var incomedate = req.body.inptdate;
  var account = db.collection('account');
  account.where('username','==',username).where('account_name','==',option).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        balances=parseInt(amount)+parseInt(doc.data().account_balance);
        console.log(balances);

        moment.locale('id');
        console.log(moment().format('LLL'));
        console.log("Tambah Income");
        db.collection('income').add({
          income_account: option,
          income_amount: amount,
          income_category: "credit",
          income_createdate: moment().format('L'),
          income_date: moment(incomedate).format('L'),
          income_from: from,
          income_id: md5(moment().format('L')),
          income_image: 5,
          income_isdated: 0,
          income_isdone: 1,
          income_notes: note,
          income_onlineimage: null,
          income_repeat_count: null,
          income_repeat_period:null,
          income_repeat_time:null,
          income_type:null,
          email: req.session.email,
          username: username
        }).then(ref => {
          console.log('Added document with ID: ', ref.id);
        });
        var updates={
          account_balance: balances,
          account_balance_current: balances
        }
        account.where('username','==',username).where('account_name','==',option).get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              console.log("Update Balance");
              db.collection('account').doc(doc.id).update(updates);
            });
          })
      });
      res.redirect('/income');
    })

    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})
/*
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
})*/

app.post('/authexpense',(req,res)=>{
  var balances;
  var username = req.session.userName;
  var amount = req.body.amount;
  var to = req.body.to;
  var option = req.body.options;
  var note = req.body.note;
  var incomedate = req.body.inptdate;
  var account = db.collection('account');
  account.where('username','==',username).where('account_name','==',option).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        balances=parseInt(doc.data().account_balance)-parseInt(amount);
        console.log(balances);

        moment.locale('id');
        console.log(moment().format('LLL'));
        console.log("Tambah Expense");
        db.collection('expense').add({
          expense_account: option,
          expense_amount: amount,
          expense_category: "credit",
          expense_createdate: moment().format('L'),
          expense_date: moment(incomedate).format('L'),
          expense_to: to,
          expense_id: md5(moment().format('L')),
          expense_image: 5,
          expense_isdated: 0,
          expense_isdone: 1,
          expense_notes: note,
          expense_onlineimage: null,
          expense_repeat_count: null,
          expense_repeat_period:null,
          expense_repeat_time:null,
          expense_type:null,
          email: req.session.email,
          username: username
        }).then(ref => {
          console.log('Added document with ID: ', ref.id);
        });
        var updates={
          account_balance: balances,
          account_balance_current: balances
        }
        account.where('username','==',username).where('account_name','==',option).get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              console.log("Update Balance");
              db.collection('account').doc(doc.id).update(updates);
            });
          })
      });
      res.redirect('/expense');
    })

    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

app.post('/authtransfer',(req,res)=>{
  var cbalances, dbalances;
  var username = req.session.userName;
  var amount = req.body.amount;
  var dest = req.body.dest;
  var src = req.body.src;
  var note = req.body.note;
  var incomedate = req.body.inptdate;
  if(src==dest){
    console.log("Account Sama");
    res.redirect('/transfer');
  }
  else{
  var account = db.collection('account');
  account.where('username','==',username).where('account_name','==',src).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        dbalances=parseInt(doc.data().account_balance)-parseInt(amount);
        console.log(dbalances);

        moment.locale('id');
        console.log(moment().format('LLL'));
        console.log("Tambah Transfer");
        db.collection('transfer').add({
          transfer_amount: amount,
          transfer_category: "credit",
          transfer_createdate: moment().format('L'),
          transfer_date: moment(incomedate).format('L'),
          transfer_id: md5(moment().format('L')),
          transfer_dest:dest,
          transfer_src:src,
          transfer_isdated: 0,
          transfer_isdone: 1,
          transfer_notes: note,
          transfer_rate: 1,
          email: req.session.email,
          username: username
        }).then(ref => {
          console.log('Added document with ID: ', ref.id);
        });
        var dupdates={
          account_balance: dbalances,
          account_balance_current: dbalances
        }
        account.where('username','==',username).where('account_name','==',src).get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              console.log("Update Balance Src");
              db.collection('account').doc(doc.id).update(dupdates);
            });
          })
          
      });
    })
    account.where('username','==',username).where('account_name','==',dest).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        cbalances=parseInt(doc.data().account_balance)+parseInt(amount);
        console.log(cbalances);
        var cupdates={
          account_balance: cbalances,
          account_balance_current: cbalances
        }
        account.where('username','==',username).where('account_name','==',dest).get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            console.log("Update Balance Dest");
            db.collection('account').doc(doc.id).update(cupdates);
          });
        })
      });
      res.redirect('/transfer');
    })

    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
  }
})
/*
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
})*/

app.listen(port,function(){
    console.log("server up port "+port)
})
