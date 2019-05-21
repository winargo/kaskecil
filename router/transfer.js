var core=require('../require.js')
core()
var db = admin.firestore();
router.get('/',(req,res)=>{
  var username = req.session.userName;
  var account = db.collection('account');
  var transfer = db.collection('transfer');
  var category = db.collection('category');
  var datatransfer = []
  var dataaccount = []
  var datacategory=[]
  var tfbase,symbol;
  var inputdate=[]
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
  transfer.orderBy('transfer_date',"asc").get()
    .then(snapshot => {
      console.log("Masuk ke Transfer");
      snapshot.forEach(doc => {
        if(doc.data().username==username){
          console.log(doc.id, '=>', doc.data());
          datatransfer.push(doc.data())
          var tdate={
            transfer_id:doc.data().transfer_id,
            transfer_date:moment(doc.data().transfer_date, "DD-MM-YYYY").format("MM/DD/YYYY")
          };
          console.log('\n'+doc.data().transfer_id);
          console.log('\n'+doc.data().transfer_date);
          console.log('\n'+moment(doc.data().transfer_date, "DD-MM-YYYY").format("MM/DD/YYYY"))
          inputdate.push(tdate)
        }
      });
      console.log("=================");
      account.where('username','==',username).get()
        .then(snapshot1 => {
          snapshot1.forEach(doc1 => {
            if(doc1.data().account_status=="1"){
              console.log(doc1.id, '=>', doc1.data());
              dataaccount.push(doc1.data())
            }
          });
          category.where('username','==',username).get()
          .then(snapshot1 => {
            snapshot1.forEach(doc1 => {
              console.log(doc1.id, '=>', doc1.data());
              datacategory.push(doc1.data())
            });
           res.render('transfer', {symbol:symbol,list : datatransfer, list1 : dataaccount, listcategory:datacategory, username:username, inputdate:inputdate });
          })
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

router.post('/edittransfer',(req,res)=>{
  var exist=false;
  var username=req.session.userName;
  var incomeid = req.body.incomeid;
  var beforenameacc = req.body.accs;
  var beforebalance = req.body.balance;

  var accs = req.body.from;
  var nameacc = req.body.editoptions;
  var editcategory = req.body.editcategory;
  var currency = req.body.editcurrency;
  var ammount = req.body.editamount;
  var inputdate = req.body.editinptdate;
  var editcount = req.body.editcount;
  var editperiod = req.body.editperiod;
  var edittimes = req.body.edittimes;
  var editnote = req.body.editnote;
  var account = db.collection('account');

  account.where('username','==',username).where('account_name','==',beforenameacc).get()
    .then(snapshot => {
      console.log("/edittransfer");
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        if(doc.data().account_name==nameacc){
          exist=true;
          var totalb=parseFloat(doc.data().account_balance_current)+parseFloat(ammount)-parseFloat(beforebalance);
          console.log(totalb);
          var dupdates={
            account_balance_current: parseFloat(totalb),
            account_category: editcategory,
            account_lastused: moment().format('L'),
            account_name: beforenameacc,
          }
          db.collection('account').doc(doc.id).update(dupdates);
          db.collection('income').where('username','==',username).where('income_id','==',incomeid).get()
          .then(snapshot => {
            snapshot.forEach(json => {
              var dupdatesi = {
                income_amount: parseFloat(ammount),
                income_category: editcategory,
                income_date: moment(inputdate,"MM/DD/YYYY").format('DD/MM/YYYY'),
                income_from: accs,
                income_repeat_count: editcount,
                income_repeat_period: editperiod,
                income_repeat_time:edittimes,
                income_notes: editnote,
              }
              db.collection('income').doc(json.id).update(dupdatesi);
              res.redirect('/income');
            });
          })
        }
        else{
          var totalb=parseFloat(doc.data().account_balance_current)-parseFloat(beforebalance);
          console.log(totalb);
          var dupdates={
            account_balance_current: parseFloat(totalb),
            account_category: editcategory,
            account_lastused: moment().format('L'),
            account_name: beforenameacc,
          }
          db.collection('account').doc(doc.id).update(dupdates);
          account.where('username','==',username).where('account_name','==',nameacc).get()
          .then(snapshot => {
            snapshot.forEach(doc1 => {
              var totalb=parseFloat(doc1.data().account_balance_current)+parseFloat(ammount);
              var dupdates={
                account_balance_current: parseFloat(totalb),
                account_category: editcategory,
                account_lastused: moment().format('L'),
                account_name: nameacc,
              }
              db.collection('account').doc(doc1.id).update(dupdates);
              db.collection('income').where('username','==',username).where('income_id','==',incomeid).get()
                .then(snapshot => {
                  snapshot.forEach(json1 => {
                    var dupdatesi = {
                      income_account: nameacc,
                      income_amount: parseFloat(ammount),
                      income_category: editcategory,
                      income_date: moment(inputdate).format('L'),
                      income_from: accs,
                      income_repeat_count: editcount,
                      income_repeat_period: editperiod,
                      income_repeat_time: edittimes,
                      income_notes: editnote,
                    }
                    db.collection('income').doc(json1.id).update(dupdatesi);
                    res.redirect('/income');
                  });
                })
            });
          })
        }
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

router.post('/deletetransfer',(req,res)=>{
  var transferid = req.body.transferid;
  var transfers = req.body.transfers;
  var transferd = req.body.transferd;
  var username = req.session.userName;
  var bcurrent;
  var account = db.collection('account');
  db.collection("transfer").where('username','==',username).where('transfer_id','==',transferid).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        account.where('username','==',username).get()
        .then(snapshot1 => {
          snapshot1.forEach(doc1 => {
            if(doc1.data().account_name==transfers){
              bcurrent=parseFloat(doc1.data().account_balance_current)+parseFloat(doc.data().transfer_amount);
              console.log("BC"+doc1.data().account_balance_current);
              console.log("IC"+doc.data().transfer_amount);
              console.log("BCURRENTS"+bcurrent);
              var dupdates={
                account_balance_current: bcurrent,
                account_lastused: moment().format('L'),
              }
              console.log("Update Account Src");
              db.collection('account').doc(doc1.id).update(dupdates);
              console.log("Delete Transfer ");
              db.collection('transfer').doc(doc.id).delete();
              
            }
            else if(doc1.data().account_name==transferd){
              bcurrent=parseFloat(doc1.data().account_balance_current)-parseFloat(doc.data().transfer_amount);
              console.log("BC"+doc1.data().account_balance_current);
              console.log("IC"+doc.data().transfer_amount);
              console.log("BCURRENTD"+bcurrent);
              var dupdates={
                account_balance_current: bcurrent,
                account_lastused: moment().format('L'),
              }
              console.log("Update Account Dest");
              db.collection('account').doc(doc1.id).update(dupdates);
              console.log("Delete Transfer ");
              db.collection('transfer').doc(doc.id).delete();
              
            }
          });
          res.redirect("/transfer");
        });
      })
      
    })
    
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

router.post('/authtransfer',(req,res)=>{
  var cbalances, dbalances;
  var username = req.session.userName;
  var trate = req.body.trate;
  var amount = req.body.amount;
  var dest = req.body.dest;
  var src = req.body.src;
  var note = req.body.note;
  var incomedate = req.body.inptdate;
  var category=req.body.category;
  var cursrc,curdest,tfamount=0,tfbase;
  if(src==dest){
    console.log("Account Sama");
    res.redirect('/transfer');
  }
  else{
  // var accounts = db.collection('accounts');
  // accounts.where('username','==',username).get()
  //   .then(snapshot => {
  //     snapshot.forEach(doc => {
  //       tfbase=doc.data().preference;
  //     });
  //   })
  //   if(tfbase=="IDR"){
  //     fx.base = "IDR";
  //     fx.rates = {
  //       "USD" : 0.000071, // eg. 1 USD === 0.745101 EUR
  //       "SGD" : 0.000096, // etc...
  //       "MYR" : 0.000291,
  //       "IDR" : 1,        // always include the base rate (1:1)
  //       /* etc */
  //     }
  //   }
  var account = db.collection('account');
  account.where('username','==',username).get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      if(doc.data().account_name==src){
        cursrc=doc.data().account_currency;
      }
      else if(doc.data().account_name==dest){
        curdest=doc.data().account_currency;
      }
    });
    fx.base = cursrc;
    fx.rates = {
      curdest : trate, // eg. 1 USD === 0.745101 EUR

    }
    console.log("Amount "+parseFloat(fx(parseInt(amount)).convert({ from:cursrc, to:curdest })).toFixed(2)); // 1355.694581
    tfamount=parseFloat(fx(parseInt(amount)).convert({ from:cursrc, to:curdest })).toFixed(2);
    // tfrate=parseFloat(tfamount/parseInt(amount)).toFixed(2);
    // console.log(parseInt(amount));
    // console.log(cursrc);
    // console.log(curdest);
    //currencyConvert(API_KEY, 1, 'USD', 'IDR').then(console.log).catch(console.log)
    //convertcurrency(parseInt(amount), cursrc, curdest).then(response => console.log(response));
    //console.log(fx.convert(parseInt(amount), {from:cursrc, to:"HKD"}));
    // var eurValue = parseInt(amount);
    // var conversionDate = moment().format("YYYY-MM-DD");
    // converter.convert(eurValue, conversionDate, cursrc, curdest, function(err, usdResult) {
    //   if (err)
    //     return callback(err);
  
    //   console.log('Converted ' + eurValue + ' EUR to ' + usdResult.value + ' USD, according to FX rate of ' . usdResult.usedDate.format('DD.MM.YYYY') );
    // });
    // currencyConverter(moment().format("YYYY-MM-DD"), cursrc, parseInt(amount), curdest)
    // .then(response => {
    //   console.log(response);
    // })
  
  
  account.where('username','==',username).where('account_name','==',src).get()
    .then(snapshot => {
      console.log("ACCOUNT SRC");
      snapshot.forEach(doc => {
        //console.log(doc.id, '=>', doc.data());
        dbalances=parseFloat(parseInt(doc.data().account_balance_current)-parseInt(amount)).toFixed(2);
        console.log("Account Src Amount "+dbalances);

        moment.locale('id');
        console.log(moment().format('LLL'));
        console.log("Tambah Transfer");
       
        db.collection('transfer').add({
          transfer_amount: parseFloat(tfamount).toFixed(2),
          transfer_category: category,
          transfer_createdate: moment().format('L'),
          transfer_date: moment(incomedate).format('L'),
          transfer_id: md5(moment().format('LTS')),
          transfer_dest:dest,
          transfer_src:src,
          transfer_isdated: 0,
          transfer_isdone: 1,
          transfer_notes: note,
          transfer_rate: parseInt(trate),
          email: req.session.email,
          username: username
        }).then(ref => {
          console.log('Added document with ID: ', ref.id);
        });
        var dupdates={
          account_lastused: moment().format('L'),
          // account_balance: dbalances,
          account_balance_current: dbalances
        }
        db.collection('account').doc(doc.id).update(dupdates);
      });
    })
    account.where('username','==',username).where('account_name','==',dest).get()
    .then(snapshot => {
      console.log("ACCOUNT DEST");
      snapshot.forEach(doc => {
        // console.log(doc.id, '=>', doc.data());
        cbalances=parseFloat(parseInt(doc.data().account_balance_current)+parseFloat(tfamount)).toFixed(2);
        console.log("Account Dest Amount "+ cbalances);
        var cupdates={
          account_lastused: moment().format('L'),
          // account_balance: cbalances,
          account_balance_current: cbalances
        }
        account.where('username','==',username).where('account_name','==',dest).get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            console.log("\nUpdate Balance Dest");
            db.collection('account').doc(doc.id).update(cupdates);
          });
        })
      });
      res.redirect('/transfer');
    })
  })
  .catch(err => {
    console.log('Error getting documents', err);
    res.redirect('/');
  });
  }
})

router.get('/listtransfer',(req,res)=>{
  var username = req.session.userName;
  var transfer = db.collection('transfer');
  var temp
  var totaltransfer=0
  var datatransfer=[], dataaccount=[]
  transfer.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        totaltransfer+=parseInt(doc.data().transfer_amount);
        // var idate={
        //   account_name:doc.data().income_account,
        //   income_amount:doc.data().income_amount,
        //   income_date:doc.data().income_date
        // };
        datatransfer.push(doc.data())
      });
      db.collection('account').where('username','==',username).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          if(doc.data().account_status=="1"){
            dataaccount.push(doc.data())
          }
        });
        res.json({datatransfer:datatransfer,dataaccount:dataaccount,totaltransfer:totaltransfer})
      })
    })
})
    
module.exports = router