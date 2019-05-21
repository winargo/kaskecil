var core=require('./require.js')
core()
// var express = require('express')
// var mysql = require('mysql')
// var bodyParser = require('body-parser')
// // var cookieParser = require('cookie-parser')
// var session = require('express-session')
// var md5 = require('md5');
// var app = express()
// var port = 2300
// var admin = require("firebase-admin");
// var numeral = require('numeral');
// // var MoneyConverter = require('money-converter');
// // var async = require('async');
// //const currencyConverter = require('nam-currency-converter');
// // var convertcurrency=require('nodejs-currency-converter');

// // const currencyConvert = require('currency-convert')
// // const API_KEY = "#####################"
// // var currencyFormatter = require('currency-formatter');
// var fx=require('money');
// // 39.115292915531334
// //var converter = require('@divvit/currency-converter');
//   // if you want to change the storage path, call the script like that:
//   // var converter = require('@divvit/currency-converter')({ storageDir: '/some/other/path' });
//   // the default path is process.env.TMPDIR
// var moment=require("moment");

// var serviceAccount = require("./firestorekey/primacash-5708b-firebase-adminsdk-05x2x-3ca57065dd.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://primacash-5708b.firebaseio.com"
});

var db = admin.firestore();

var routerDashboard = require('./router/dashboard.js')
var routerIncome = require('./router/income.js')
var routerExpense = require('./router/expense.js')
var routerTransfer = require('./router/transfer.js')
var routerAccount = require('./router/account.js')
var routerCategory = require('./router/category.js')
var routerReport = require('./router/report.js')

app.use("/dashboard",routerDashboard)
app.use("/income",routerIncome)
app.use("/expense",routerExpense)
app.use("/transfer",routerTransfer)
app.use("/account",routerAccount)
app.use("/category",routerCategory)
app.use("/report",routerReport)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// //view engine pug
// app.set('view engine','pug');

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

app.post('/authen',(req,res)=>{
  var login=false;
  var username = req.body.username;
  var password = md5(req.body.password);
  var account = db.collection('accounts');
  account.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        if(doc.data().username==username){
          if(doc.data().password==password){
            console.log("\nAnda berhasil login dengan Username");
            console.log(doc.id, '=>', doc.data());
            req.session.userName = username;
            req.session.email = doc.data().email;
            login=true;

          }
        }
        else if(doc.data().email==username){
          if(doc.data().password==password){
            console.log("\nAnda berhasil login dengan Email");
            console.log(doc.id, '=>', doc.data());
            req.session.userName = doc.data().username;
            req.session.email = doc.data().email;
            login=true;
          }
        }
        
      });
      if(!login){
        console.log("Username/Email dan Password Anda salah");
      //   // res.set('location','localhost:2300');
      //   // var error="Error";
      //   // res.json(error);
      //   // res.redirect('/?error=Error')
      //   res.redirect('/');
      }
      else{
        res.redirect('/dashboard');
      }
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

app.get('/islogin',(req,res)=>{
  if(req.session.userName!=null){
    res.json({status:true})
    res.redirect('/dashboard');
  }
  else{
    res.json({status:false})
    // res.redirect('/');
  }
})

app.get('/is_login',(req,res)=>{
  if(req.session.userName!=null){
    res.json({status:true})
    // res.redirect('/dashboard');
  }
  else{
    res.json({status:false})
    res.redirect('/');
  }
})

app.get('/logout',(req,res)=>{
  if(req.session.userName!=null){
    console.log("Masuk")
    req.session.userName=null;
    // res.json({status:true})
    res.redirect('/');
  }
  else{
    res.json({status:false})
    // res.redirect('/');
  }
})

app.get('/alltransaction',(req,res)=>{
  var username = req.session.userName;
  var income = db.collection('income');
  var expense = db.collection('expense');
  var transfer = db.collection('transfer');
  var temp
  var totalincome=0,totalexpense=0,totaltransfer=0;
  var dataincome=[], dataexpense=[],datatransfer=[]
  income.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        // temp=moment(doc.data().income_date, "DD-MM-YYYY").format("MM")
        totalincome+=parseInt(doc.data().income_amount);
        var idate={
          account_name:doc.data().income_account,
          income_amount:doc.data().income_amount,
          income_date:doc.data().income_date
        };
        dataincome.push(idate)
        // console.log(temp)
        // console.log(moment().format('MM'))
        // if(moment(temp).isSame(moment().format('MM'), 'month')){
        //   console.log("Masuk")
        //   totalincome+=parseInt(doc.data().income_amount);
        // }
        // else{
        //   console.log("Tidak Masuk")
        // }
        // var idate={
        //   totalincome:totalincome,
        //   bulan:moment(temp).format('MMMM')
        // };
        // dataincome.push(idate)
      });
      

      expense.where('username','==',username).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          totalexpense+=parseInt(doc.data().expense_amount);
          var edate={
            account_name:doc.data().expense_account,
            expense_amount:doc.data().expense_amount,
            expense_date:doc.data().expense_date
          };
          dataexpense.push(edate)
        });
        transfer.where('username','==',username).get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            totaltransfer+=parseInt(doc.data().transfer_amount);
            var tdate={
              account_src:doc.data().transfer_src,
              account_dest:doc.data().transfer_dest,
              transfer_amount:doc.data().transfer_amount,
              transfer_date:doc.data().transfer_date
            };
            datatransfer.push(tdate)
          });
          res.json({dataincome:dataincome,dataexpense:dataexpense,datatransfer:datatransfer,totalincome:totalincome,totalexpense:totalexpense,totaltransfer:totaltransfer})
        })
      })
    })
})

app.post('/alltransaction',(req,res)=>{
  var select_duration=req.body.select_duration;
  var select_account=req.body.select_account;
  var username = req.session.userName;
  var income = db.collection('income');
  var expense = db.collection('expense');
  var transfer = db.collection('transfer');
  var today,lastweek,lastmonth,lastyear, month, income_date, expense_date, transfer_date
  var totalincome=0,totalexpense=0,totaltransfer=0;
  var dataincome=[], dataexpense=[],datatransfer=[]
  today=moment().format("YYYY-MM-DD")
  income.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        // today=moment(doc.data().income_date, "DD-MM-YYYY").format("DD")
        // console.log(moment(doc.data().income_date,"DD-MM-YYYY").format("DD-MM-YYYY"))
        month=moment(doc.data().income_date,"DD-MM-YYYY").get('month')
        // console.log("Month:"+month)
        income_date=moment(doc.data().income_date,"DD-MM-YYYY").format("YYYY-MM-DD")
        lastweek=moment(moment([moment(doc.data().income_date, "DD-MM-YYYY").format("YYYY"),month,moment(doc.data().income_date, "DD-MM-YYYY").format("DD")]).add(7,'days')).format("YYYY-MM-DD")
        console.log(lastweek)
        lastmonth=moment(moment([moment(doc.data().income_date, "DD-MM-YYYY").format("YYYY"),month,moment(doc.data().income_date, "DD-MM-YYYY").format("DD")]).add(30,'days')).format("YYYY-MM-DD")
        console.log(lastmonth)
        lastyear=moment(moment([moment(doc.data().income_date, "DD-MM-YYYY").format("YYYY"),month,moment(doc.data().income_date, "DD-MM-YYYY").format("DD")]).add(365,'days')).format("YYYY-MM-DD")
        console.log(lastyear)
        
        if(select_duration=="today"){
          if(moment(today).isSame(income_date,"day")){
            if(select_account=="All"){
              totalincome+=parseInt(doc.data().income_amount);
              var idate={
                account_name:doc.data().income_account,
                income_amount:doc.data().income_amount,
                income_date:doc.data().income_date
              };
              dataincome.push(idate)
            }
            else if(select_account==doc.data().income_account){
              totalincome+=parseInt(doc.data().income_amount);
              var idate={
                account_name:doc.data().income_account,
                income_amount:doc.data().income_amount,
                income_date:doc.data().income_date
              };
              dataincome.push(idate)
            }
          }
        }
        else if(select_duration=="lastweek"){
          if(moment(today).isSameOrBefore(lastweek,"week")){
            if(select_account=="All"){
              totalincome+=parseInt(doc.data().income_amount);
              var idate={
                account_name:doc.data().income_account,
                income_amount:doc.data().income_amount,
                income_date:doc.data().income_date
              };
              dataincome.push(idate)
            }
            else if(select_account==doc.data().income_account){
              totalincome+=parseInt(doc.data().income_amount);
              var idate={
                account_name:doc.data().income_account,
                income_amount:doc.data().income_amount,
                income_date:doc.data().income_date
              };
              dataincome.push(idate)
            }
          }
        }
        else if(select_duration=="lastmonth"){
          if(moment(today).isSameOrBefore(lastmonth,"month")){
            if(select_account=="All"){
              totalincome+=parseInt(doc.data().income_amount);
              var idate={
                account_name:doc.data().income_account,
                income_amount:doc.data().income_amount,
                income_date:doc.data().income_date
              };
              dataincome.push(idate)
            }
            else if(select_account==doc.data().income_account){
              totalincome+=parseInt(doc.data().income_amount);
              var idate={
                account_name:doc.data().income_account,
                income_amount:doc.data().income_amount,
                income_date:doc.data().income_date
              };
              dataincome.push(idate)
            }
          }
        }
        else if(select_duration=="lastyear"){
          if(moment(today).isSameOrBefore(lastyear,"year")){
            if(select_account=="All"){
              totalincome+=parseInt(doc.data().income_amount);
              var idate={
                account_name:doc.data().income_account,
                income_amount:doc.data().income_amount,
                income_date:doc.data().income_date
              };
              dataincome.push(idate)
            }
            else if(select_account==doc.data().income_account){
              totalincome+=parseInt(doc.data().income_amount);
              var idate={
                account_name:doc.data().income_account,
                income_amount:doc.data().income_amount,
                income_date:doc.data().income_date
              };
              dataincome.push(idate)
            }
          }
        }
        else if(select_duration=="All"){
          if(select_account=="All"){
            totalincome+=parseInt(doc.data().income_amount);
            var idate={
              account_name:doc.data().income_account,
              income_amount:doc.data().income_amount,
              income_date:doc.data().income_date
            };
            dataincome.push(idate)
          }
          else if(select_account==doc.data().income_account){
            totalincome+=parseInt(doc.data().income_amount);
            var idate={
              account_name:doc.data().income_account,
              income_amount:doc.data().income_amount,
              income_date:doc.data().income_date
            };
            dataincome.push(idate)
          }
        }
      });
      expense.where('username','==',username).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          month=moment(doc.data().expense_date,"DD-MM-YYYY").get('month')
          // console.log("Month:"+month)
          expense_date=moment(doc.data().expense_date,"DD-MM-YYYY").format("YYYY-MM-DD")
          lastweek=moment(moment([moment(doc.data().expense_date, "DD-MM-YYYY").format("YYYY"),month,moment(doc.data().expense_date, "DD-MM-YYYY").format("DD")]).add(7,'days')).format("YYYY-MM-DD")
          console.log(lastweek)
          lastmonth=moment(moment([moment(doc.data().expense_date, "DD-MM-YYYY").format("YYYY"),month,moment(doc.data().expense_date, "DD-MM-YYYY").format("DD")]).add(30,'days')).format("YYYY-MM-DD")
          console.log(lastmonth)
          lastyear=moment(moment([moment(doc.data().expense_date, "DD-MM-YYYY").format("YYYY"),month,moment(doc.data().expense_date, "DD-MM-YYYY").format("DD")]).add(365,'days')).format("YYYY-MM-DD")
          console.log(lastyear)
          
          if(select_duration=="today"){
            if(moment(today).isSame(expense_date,"day")){
              if(select_account=="All"){
                totalexpense+=parseInt(doc.data().expense_amount);
                var edate={
                  account_name:doc.data().expense_account,
                  expense_amount:doc.data().expense_amount,
                  expense_date:doc.data().expense_date
                };
                dataexpense.push(edate)
              }
              else if(select_account==doc.data().expense_account){
                totalexpense+=parseInt(doc.data().expense_amount);
                var edate={
                  account_name:doc.data().expense_account,
                  expense_amount:doc.data().expense_amount,
                  expense_date:doc.data().expense_date
                };
                dataexpense.push(edate)
              }
            }
          }
          else if(select_duration=="lastweek"){
            if(moment(today).isSameOrBefore(lastweek,"week")){
              if(select_account=="All"){
                totalexpense+=parseInt(doc.data().expense_amount);
                var edate={
                  account_name:doc.data().expense_account,
                  expense_amount:doc.data().expense_amount,
                  expense_date:doc.data().expense_date
                };
                dataexpense.push(edate)
              }
              else if(select_account==doc.data().expense_account){
                totalexpense+=parseInt(doc.data().expense_amount);
                var edate={
                  account_name:doc.data().expense_account,
                  expense_amount:doc.data().expense_amount,
                  expense_date:doc.data().expense_date
                };
                dataexpense.push(edate)
              }
            }
          }
          else if(select_duration=="lastmonth"){
            if(moment(today).isSameOrBefore(lastmonth,"month")){
              if(select_account=="All"){
                totalexpense+=parseInt(doc.data().expense_amount);
                var edate={
                  account_name:doc.data().expense_account,
                  expense_amount:doc.data().expense_amount,
                  expense_date:doc.data().expense_date
                };
                dataexpense.push(edate)
              }
              else if(select_account==doc.data().expense_account){
                totalexpense+=parseInt(doc.data().expense_amount);
                var edate={
                  account_name:doc.data().expense_account,
                  expense_amount:doc.data().expense_amount,
                  expense_date:doc.data().expense_date
                };
                dataexpense.push(edate)
              }
            }
          }
          else if(select_duration=="lastyear"){
            if(moment(today).isSameOrBefore(lastyear,"year")){
              if(select_account=="All"){
                totalexpense+=parseInt(doc.data().expense_amount);
                var edate={
                  account_name:doc.data().expense_account,
                  expense_amount:doc.data().expense_amount,
                  expense_date:doc.data().expense_date
                };
                dataexpense.push(edate)
              }
              else if(select_account==doc.data().expense_account){
                totalexpense+=parseInt(doc.data().expense_amount);
                var edate={
                  account_name:doc.data().expense_account,
                  expense_amount:doc.data().expense_amount,
                  expense_date:doc.data().expense_date
                };
                dataexpense.push(edate)
              }
            }
          }
          else if(select_duration=="All"){
            if(select_account=="All"){
              totalexpense+=parseInt(doc.data().expense_amount);
              var edate={
                account_name:doc.data().expense_account,
                expense_amount:doc.data().expense_amount,
                expense_date:doc.data().expense_date
              };
              dataexpense.push(edate)
            }
            else if(select_account==doc.data().expense_account){
              totalexpense+=parseInt(doc.data().expense_amount);
              var edate={
                account_name:doc.data().expense_account,
                expense_amount:doc.data().expense_amount,
                expense_date:doc.data().expense_date
              };
              dataexpense.push(edate)
            }
          }
        });
        transfer.where('username','==',username).get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            month=moment(doc.data().transfer_date,"DD-MM-YYYY").get('month')
            // console.log("Month:"+month)
            transfer_date=moment(doc.data().transfer_date,"DD-MM-YYYY").format("YYYY-MM-DD")
            lastweek=moment(moment([moment(doc.data().transfer_date, "DD-MM-YYYY").format("YYYY"),month,moment(doc.data().transfer_date, "DD-MM-YYYY").format("DD")]).add(7,'days')).format("YYYY-MM-DD")
            console.log(lastweek)
            lastmonth=moment(moment([moment(doc.data().transfer_date, "DD-MM-YYYY").format("YYYY"),month,moment(doc.data().transfer_date, "DD-MM-YYYY").format("DD")]).add(30,'days')).format("YYYY-MM-DD")
            console.log(lastmonth)
            lastyear=moment(moment([moment(doc.data().transfer_date, "DD-MM-YYYY").format("YYYY"),month,moment(doc.data().transfer_date, "DD-MM-YYYY").format("DD")]).add(365,'days')).format("YYYY-MM-DD")
            console.log(lastyear)
            
            if(select_duration=="today"){
              if(moment(today).isSame(transfer_date,"day")){
                if(select_account=="All"){
                  totaltransfer+=parseInt(doc.data().transfer_amount);
                  var tdate={
                    account_src:doc.data().transfer_src,
                    account_dest:doc.data().transfer_dest,
                    transfer_amount:doc.data().transfer_amount,
                    transfer_date:doc.data().transfer_date
                  };
                  datatransfer.push(tdate)
                }
                else if(select_account==doc.data().transfer_src){
                  totaltransfer+=parseInt(doc.data().transfer_amount);
                  var tdate={
                    account_src:doc.data().transfer_src,
                    account_dest:doc.data().transfer_dest,
                    transfer_amount:doc.data().transfer_amount,
                    transfer_date:doc.data().transfer_date
                  };
                  datatransfer.push(tdate)
                }
                else if(select_account==doc.data().transfer_dest){
                  totaltransfer+=parseInt(doc.data().transfer_amount);
                  var tdate={
                    account_src:doc.data().transfer_src,
                    account_dest:doc.data().transfer_dest,
                    transfer_amount:doc.data().transfer_amount,
                    transfer_date:doc.data().transfer_date
                  };
                  datatransfer.push(tdate)
                }
              }
            }
            else if(select_duration=="lastweek"){
              if(moment(today).isSameOrBefore(lastweek,"week")){
                if(select_account=="All"){
                  totaltransfer+=parseInt(doc.data().transfer_amount);
                  var tdate={
                    account_src:doc.data().transfer_src,
                    account_dest:doc.data().transfer_dest,
                    transfer_amount:doc.data().transfer_amount,
                    transfer_date:doc.data().transfer_date
                  };
                  datatransfer.push(tdate)
                }
                else if(select_account==doc.data().transfer_src){
                  totaltransfer+=parseInt(doc.data().transfer_amount);
                  var tdate={
                    account_src:doc.data().transfer_src,
                    account_dest:doc.data().transfer_dest,
                    transfer_amount:doc.data().transfer_amount,
                    transfer_date:doc.data().transfer_date
                  };
                  datatransfer.push(tdate)
                }
                else if(select_account==doc.data().transfer_dest){
                  totaltransfer+=parseInt(doc.data().transfer_amount);
                  var tdate={
                    account_src:doc.data().transfer_src,
                    account_dest:doc.data().transfer_dest,
                    transfer_amount:doc.data().transfer_amount,
                    transfer_date:doc.data().transfer_date
                  };
                  datatransfer.push(tdate)
                }
              }
            }
            else if(select_duration=="lastmonth"){
              if(moment(today).isSameOrBefore(lastmonth,"month")){
                if(select_account=="All"){
                  totaltransfer+=parseInt(doc.data().transfer_amount);
                  var tdate={
                    account_src:doc.data().transfer_src,
                    account_dest:doc.data().transfer_dest,
                    transfer_amount:doc.data().transfer_amount,
                    transfer_date:doc.data().transfer_date
                  };
                  datatransfer.push(tdate)
                }
                else if(select_account==doc.data().transfer_src){
                  totaltransfer+=parseInt(doc.data().transfer_amount);
                  var tdate={
                    account_src:doc.data().transfer_src,
                    account_dest:doc.data().transfer_dest,
                    transfer_amount:doc.data().transfer_amount,
                    transfer_date:doc.data().transfer_date
                  };
                  datatransfer.push(tdate)
                }
                else if(select_account==doc.data().transfer_dest){
                  totaltransfer+=parseInt(doc.data().transfer_amount);
                  var tdate={
                    account_src:doc.data().transfer_src,
                    account_dest:doc.data().transfer_dest,
                    transfer_amount:doc.data().transfer_amount,
                    transfer_date:doc.data().transfer_date
                  };
                  datatransfer.push(tdate)
                }
              }
            }
            else if(select_duration=="lastyear"){
              if(moment(today).isSameOrBefore(lastyear,"year")){
                if(select_account=="All"){
                  totaltransfer+=parseInt(doc.data().transfer_amount);
                  var tdate={
                    account_src:doc.data().transfer_src,
                    account_dest:doc.data().transfer_dest,
                    transfer_amount:doc.data().transfer_amount,
                    transfer_date:doc.data().transfer_date
                  };
                  datatransfer.push(tdate)
                }
                else if(select_account==doc.data().transfer_src){
                  totaltransfer+=parseInt(doc.data().transfer_amount);
                  var tdate={
                    account_src:doc.data().transfer_src,
                    account_dest:doc.data().transfer_dest,
                    transfer_amount:doc.data().transfer_amount,
                    transfer_date:doc.data().transfer_date
                  };
                  datatransfer.push(tdate)
                }
                else if(select_account==doc.data().transfer_dest){
                  totaltransfer+=parseInt(doc.data().transfer_amount);
                  var tdate={
                    account_src:doc.data().transfer_src,
                    account_dest:doc.data().transfer_dest,
                    transfer_amount:doc.data().transfer_amount,
                    transfer_date:doc.data().transfer_date
                  };
                  datatransfer.push(tdate)
                }
              }
            }
            else if(select_duration=="All"){
              if(select_account=="All"){
                totaltransfer+=parseInt(doc.data().transfer_amount);
                var tdate={
                  account_src:doc.data().transfer_src,
                  account_dest:doc.data().transfer_dest,
                  transfer_amount:doc.data().transfer_amount,
                  transfer_date:doc.data().transfer_date
                };
                datatransfer.push(tdate)
              }
              else if(select_account==doc.data().transfer_src){
                totaltransfer+=parseInt(doc.data().transfer_amount);
                var tdate={
                  account_src:doc.data().transfer_src,
                  account_dest:doc.data().transfer_dest,
                  transfer_amount:doc.data().transfer_amount,
                  transfer_date:doc.data().transfer_date
                };
                datatransfer.push(tdate)
              }
              else if(select_account==doc.data().transfer_dest){
                totaltransfer+=parseInt(doc.data().transfer_amount);
                var tdate={
                  account_src:doc.data().transfer_src,
                  account_dest:doc.data().transfer_dest,
                  transfer_amount:doc.data().transfer_amount,
                  transfer_date:doc.data().transfer_date
                };
                datatransfer.push(tdate)
              }
            }
          });
          res.json({dataincome:dataincome,dataexpense:dataexpense,datatransfer:datatransfer,totalincome:totalincome,totalexpense:totalexpense,totaltransfer:totaltransfer})
        })
      })
    })
})

app.get('/chart',function(req,res){
  var username = req.session.userName;
  var dataincome=[]
  var dataexpense=[]
  var datatransfer=[]
  var datacategory=[]
  var totalincome=0
  var totalexpense=0
  var totaltransfer=0
  var category=db.collection("category");
  var income=db.collection("income");
  var expense=db.collection("expense");
  var transfer=db.collection("transfer");
  var tfbase,symbol;
  db.collection('accounts').where('username','==',username).get()
    .then((data) => {
      data.forEach(json => {
        tfbase=json.data().preference;
        if(tfbase=="IDR"){
          symbol="RP";
          fx.base = "IDR";
          fx.rates = {
            "USD" : 0.000071, // eg. 1 USD === 0.745101 EUR
            "SGD" : 0.000096, // etc...
            "MYR" : 0.000291,
            "IDR" : 1,        // always include the base rate (1:1)
            /* etc */
          }
        }
      })
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
  category.where('username','==',username).get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log("Masuk ke Category Chart");
      datacategory.push(doc.data().category_name);
    });
  })
  income.where('username','==',username).get()
  .then(snapshot => {
    snapshot.forEach(json => {
      db.collection('account').where("username",'==',username).where("account_name",'==',json.data().income_account).get()
        .then((data) => {
          data.forEach(jsonacc => {
            
            if(jsonacc.data().account_status=='1'){
              if(jsonacc.data().account_currency==tfbase){
                totalincome += parseFloat(json.data().income_amount);
                var dupdates={
                  income_date: json.data().income_date,
                  income_category: json.data().income_category,
                  income_account: json.data().income_account,
                  income_notes: json.data().income_notes,
                  income_amount: json.data().income_amount
                }
                dataincome.push(dupdates)
              }
              else{
                balancenow=parseFloat(fx(parseInt(json.data().income_amount)).convert({ from:jsonacc.data().account_currency, to:tfbase })).toFixed(2);
                totalincome += parseFloat(balancenow);
                var dupdates={
                  income_date: json.data().income_date,
                  income_category: json.data().income_category,
                  income_account: json.data().income_account,
                  income_notes: json.data().income_notes,
                  income_amount: balancenow
                }
                dataincome.push(dupdates)
              }
            }
          });
        })
      // console.log("Masuk ke Income Chart");
      // dataincome.push(doc.data());
      // totalincome+=parseInt(doc.data().income_amount);
    });
    expense.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(json1 => {
        db.collection('account').where("username",'==',username).where("account_name",'==',json1.data().expense_account).get()
          .then((data) => {
            data.forEach(jsonacc => {
              if(jsonacc.data().account_status=='1'){
                if(jsonacc.data().account_currency==tfbase){
                  totalexpense += parseFloat(json1.data().expense_amount);
                  var dupdates={
                    expense_date: json1.data().expense_date,
                    expense_category: json1.data().expense_category,
                    expense_account: json1.data().expense_account,
                    expense_notes: json1.data().expense_notes,
                    expense_amount: json1.data().expense_amount
                  }
                  dataexpense.push(dupdates)
                }
                else{
                  balancenow=parseFloat(fx(parseInt(json1.data().expense_amount)).convert({ from:jsonacc.data().account_currency, to:tfbase })).toFixed(2);
                  totalexpense += parseFloat(balancenow);
                  var dupdates={
                    expense_date: json1.data().expense_date,
                    expense_category: json1.data().expense_category,
                    expense_account: json1.data().expense_account,
                    expense_notes: json1.data().expense_notes,
                    expense_amount: balancenow
                  }
                  dataexpense.push(dupdates)
                }
              }
            });
          })
        // console.log("Masuk ke Expense Chart");
        // dataexpense.push(doc.data());
        // totalexpense+=parseInt(doc.data().expense_amount);
  
      });
      transfer.where('username','==',username).get()
      .then(snapshot => {
        snapshot.forEach(json2 => {
          db.collection('account').where("username",'==',username).where("account_name",'==',json2.data().transfer_dest).get()
            .then((data) => {
              data.forEach(jsonacc => {
                console.log("Transfer")
                console.log(jsonacc.data().account_currency)
                console.log(tfbase);
                if(jsonacc.data().account_status=='1'){
                  if(jsonacc.data().account_currency==tfbase){
                    totaltransfer += parseFloat(json2.data().transfer_amount);
                    var dupdates={
                      transfer_date: json2.data().transfer_date,
                      transfer_category: json2.data().transfer_category,
                      transfer_src: json2.data().transfer_src,
                      transfer_dest: json2.data().transfer_dest,
                      transfer_notes: json2.data().transfer_notes,
                      transfer_amount:json2.data().transfer_amount
                    }
                    datatransfer.push(dupdates)
                    console.log(totaltransfer)
                  }
                  else{
                    balancenow=parseFloat(fx(parseInt(json2.data().transfer_amount)).convert({ from:jsonacc.data().account_currency, to:tfbase })).toFixed(2);
                    totaltransfer += parseFloat(balancenow);
                    var dupdates={
                      transfer_date: json2.data().transfer_date,
                      transfer_category: json2.data().transfer_category,
                      transfer_src: json2.data().transfer_src,
                      transfer_dest: json2.data().transfer_dest,
                      transfer_notes: json2.data().transfer_notes,
                      transfer_amount: balancenow
                    }
                    datatransfer.push(dupdates)
                    console.log(totaltransfer)
                  }
                }
              });

          })
          // console.log("Masuk ke Transfer Chart");
          // datatransfer.push(doc.data());
          // totaltransfer+=parseInt(doc.data().transfer_amount);
        });
        function chart(){
          res.status(200);
          res.json({symbol:symbol,username:username,dataincome:dataincome,totalincome:dataincome,dataexpense:dataexpense,totalexpense:dataexpense, datatransfer:datatransfer, totaltransfer:datatransfer, datacategory:datacategory});
        }
        setTimeout(chart,3000);
      })
    })
  })
  .catch(err => {
    console.log('Error getting documents', err);
    res.redirect('/');
  });
})

app.listen(port,function(){
    console.log("server up port "+port)
})
