var core=require('../require.js')
core()
var db = admin.firestore();
router.get('/',(req,res)=>{
  var username = req.session.userName;
  var account = db.collection('account');
  var expense = db.collection('expense');
  var category = db.collection('category');
  var dataexpense = []
  var dataaccount = []
  var datacategory=[]
  var tfbase,symbol;
  var inputdate=[];
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
  expense.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Masuk ke Expense");
        console.log(doc.id, '=>', doc.data());
        dataexpense.push(doc.data())
        var edate={
          expense_id:doc.data().expense_id,
          expense_date:moment(doc.data().expense_date, "DD-MM-YYYY").format("MM/DD/YYYY")
        };
        console.log('\n'+doc.data().expense_id);
        console.log('\n'+doc.data().expense_date);
        console.log('\n'+moment(doc.data().expense_date, "DD-MM-YYYY").format("MM/DD/YYYY"))
        inputdate.push(edate)
      });
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
            res.render('expense', {symbol:symbol,list : dataexpense, list1 : dataaccount, listcategory:datacategory, username:username, inputdate:inputdate });
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

router.post('/editexpense',(req,res)=>{
  var exist=false;
  var username=req.session.userName;
  var expenseid = req.body.expenseid;
  var beforenameacc = req.body.accs;
  var beforebalance = req.body.balance;

  var accs = req.body.to;
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
      console.log("/editexpense");
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        if(doc.data().account_name==nameacc){
          exist=true;
          var totalb=parseFloat(doc.data().account_balance_current)-parseFloat(ammount)+parseFloat(beforebalance);
          console.log(totalb);
          var dupdates={
            account_balance_current: parseFloat(totalb),
            account_category: editcategory,
            account_lastused: moment().format('L'),
            account_name: beforenameacc,
          }
          db.collection('account').doc(doc.id).update(dupdates);
          db.collection('expense').where('username','==',username).where('expense_id','==',expenseid).get()
          .then(snapshot => {
            snapshot.forEach(json => {
              var dupdatesi = {
                expense_amount: parseFloat(ammount),
                expense_category: editcategory,
                expense_date: moment(inputdate,"MM/DD/YYYY").format('DD/MM/YYYY'),
                expense_to: accs,
                expense_repeat_count: editcount,
                expense_repeat_period: editperiod,
                expense_repeat_time:edittimes,
                expense_notes: editnote,
              }
              db.collection('expense').doc(json.id).update(dupdatesi);
              res.redirect('/expense');
            });
          })
          
        }
        else{
          var totalb=parseFloat(doc.data().account_balance_current)+parseFloat(beforebalance);
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
              var totalb1=parseFloat(doc1.data().account_balance_current)-parseFloat(ammount);
              console.log(totalb1);
              var dupdates1={
                account_balance_current: parseFloat(totalb1),
                account_category: editcategory,
                account_lastused: moment().format('L'),
                account_name: nameacc,
              }
              db.collection('account').doc(doc1.id).update(dupdates1);
              db.collection('expense').where('username','==',username).where('expense_id','==',expenseid).get()
                .then(snapshot => {
                  snapshot.forEach(json1 => {
                    var dupdatesi = {
                      expense_account: nameacc,
                      expense_amount: parseFloat(ammount),
                      expense_category: editcategory,
                      expense_date: moment(inputdate,"MM/DD/YYYY").format('DD/MM/YYYY'),
                      expense_to: accs,
                      expense_repeat_count: editcount,
                      expense_repeat_period: editperiod,
                      expense_repeat_time: edittimes,
                      expense_notes: editnote,
                    }
                    db.collection('expense').doc(json1.id).update(dupdatesi);
                    res.redirect('/expense');
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

router.post('/deleteexpense',(req,res)=>{
  var expenseid=req.body.expenseid;
  var beforeaccname = req.body.beforedeleteaccname;
  var username = req.session.userName;
  var bcurrent;
  var account = db.collection('account');
  db.collection("expense").where('username','==',username).where('expense_id','==',expenseid).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        
        account.where('username','==',username).where('account_name','==',beforeaccname).get()
        .then(snapshot1 => {
          snapshot1.forEach(doc1 => {
            
            bcurrent=parseFloat(doc1.data().account_balance_current)+parseFloat(doc.data().expense_amount);
            console.log("BC"+doc1.data().account_balance_current);
            console.log("IC"+doc.data().expense_amount);
            console.log("BCURRENT"+bcurrent);
            var dupdates={
              account_balance_current: bcurrent,
              account_lastused: moment().format('L'),
            }
            console.log("Update Account "+beforeaccname);
            db.collection('account').doc(doc1.id).update(dupdates);
            console.log("Delete Expense "+beforeaccname);
            db.collection('expense').doc(doc.id).delete();
            
          });
          res.redirect("/expense");
        });
        
      })
    })
    
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

router.post('/authexpense',(req,res)=>{
  var balances;
  var username = req.session.userName;
  var amount = req.body.amount;
  var to = req.body.to;
  var option = req.body.options;
  var note = req.body.note;
  var incomedate = req.body.inptdate;
  var category=req.body.category;
  var categorynums=req.body.categnums;
  var period=req.body.period;
  var count=req.body.count;
  var times=req.body.times;
  var account = db.collection('account');
  account.where('username','==',username).where('account_name','==',option).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        balances=parseInt(doc.data().account_balance_current)-parseInt(amount);
        console.log(balances);

        moment.locale('id');
        console.log(moment().format('LLL'));
        console.log("Tambah Expense");
        db.collection('expense').add({
          expense_account: option,
          expense_amount: amount,
          expense_category: category,
          expense_createdate: moment().format('L'),
          expense_date: moment(incomedate).format('L'),
          expense_to: to,
          expense_id: md5(moment().format('LTS')),
          expense_image: categorynums,
          expense_isdated: 0,
          expense_isdone: 1,
          expense_notes: note,
          expense_onlineimage: null,
          expense_repeat_count: count,
          expense_repeat_period:period,
          expense_repeat_time:times,
          expense_type:null,
          email: req.session.email,
          username: username
        }).then(ref => {
          console.log('Added document with ID: ', ref.id);
        });
        var updates={
          account_lastused: moment().format('L'),
          // account_balance: balances,
          account_balance_current: balances
        }
        db.collection('account').doc(doc.id).update(updates);
      });
      res.redirect('/expense');
    })

    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

router.get('/listexpense',(req,res)=>{
  var username = req.session.userName;
  var expense = db.collection('expense');
  var temp
  var totalexpense=0
  var dataexpense=[], dataaccount=[]
  expense.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        totalexpense+=parseInt(doc.data().expense_amount);
        // var idate={
        //   account_name:doc.data().income_account,
        //   income_amount:doc.data().income_amount,
        //   income_date:doc.data().income_date
        // };
        dataexpense.push(doc.data())
      });
      db.collection('account').where('username','==',username).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          if(doc.data().account_status=="1"){
            dataaccount.push(doc.data())
          }
        });
        res.json({dataexpense:dataexpense,dataaccount:dataaccount,totalexpense:totalexpense})
      })
    })
})
module.exports = router

