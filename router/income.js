var core=require('../require.js')
core()
var db = admin.firestore();
router.get('/',(req,res)=>{
  var username = req.session.userName;
  var account = db.collection('account');
  var income = db.collection('income');
  var category = db.collection('category');
  var datacategory=[]
  var dataincome = []
  var dataaccount = []
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
  income.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Masuk ke Income");
        console.log(doc.id, '=>', doc.data());
        dataincome.push(doc.data())
        var idate={
          income_id:doc.data().income_id,
          income_date:moment(doc.data().income_date, "DD-MM-YYYY").format("MM/DD/YYYY")
        };
        console.log('\n'+doc.data().income_id);
        console.log('\n'+doc.data().income_date);
        console.log('\n'+moment(doc.data().income_date, "DD-MM-YYYY").format("MM/DD/YYYY"))
        inputdate.push(idate)
        
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
            
            res.render('income',{symbol:symbol,list : dataincome, list1 : dataaccount, listcategory:datacategory, username:username, inputdate:inputdate})
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

router.post('/editincome',(req,res)=>{
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
      console.log("NAMA "+nameacc);
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
                      income_date: moment(inputdate,"MM/DD/YYYY").format('DD/MM/YYYY'),
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

router.post('/deleteincome',(req,res)=>{
  var incomeid=req.body.incomeid;
  var beforeaccname = req.body.beforedeleteaccname;
  var username = req.session.userName;
  var bcurrent;
  var account = db.collection('account');
  db.collection("income").where('username','==',username).where('income_id','==',incomeid).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        
        account.where('username','==',username).where('account_name','==',beforeaccname).get()
        .then(snapshot1 => {
          snapshot1.forEach(doc1 => {
            
            bcurrent=parseFloat(doc1.data().account_balance_current)-parseFloat(doc.data().income_amount);
            console.log("BC"+doc1.data().account_balance_current);
            console.log("IC"+doc.data().income_amount);
            console.log("BCURRENT"+bcurrent);
            var dupdates={
              account_balance_current: bcurrent,
              account_lastused: moment().format('L'),
            }
            console.log("Update Account "+beforeaccname);
            db.collection('account').doc(doc1.id).update(dupdates);
            console.log("Delete Income "+beforeaccname);
            db.collection('income').doc(doc.id).delete();
            
          });
          res.redirect("/income");
        });
        
      })
    })
    
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

router.post('/authincome',(req,res)=>{
  var balances;
  var username = req.session.userName;
  var amount = req.body.amount;
  var from = req.body.from;
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
        balances=parseInt(amount)+parseInt(doc.data().account_balance_current);
        console.log(balances);

        moment.locale('id');
        console.log(moment().format('LLL'));
        console.log("Tambah Income");
        db.collection('income').add({
          income_account: option,
          income_amount: amount,
          income_category:category,
          income_createdate: moment().format('L'),
          income_date: moment(incomedate).format('L'),
          income_from: from,
          income_id: md5(moment().format('LTS')),
          income_image: categorynums,
          income_isdated: 0,
          income_isdone: 1,
          income_notes: note,
          income_onlineimage: null,
          income_repeat_count: count,
          income_repeat_period:period,
          income_repeat_time:times,
          income_type:null,
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
      res.redirect('/income');
    })

    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

router.get('/listincome',(req,res)=>{
  var username = req.session.userName;
  var income = db.collection('income');
  var temp
  var totalincome=0
  var dataincome=[], dataaccount=[]
  income.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        totalincome+=parseInt(doc.data().income_amount);
        // var idate={
        //   account_name:doc.data().income_account,
        //   income_amount:doc.data().income_amount,
        //   income_date:doc.data().income_date
        // };
        dataincome.push(doc.data())
      });
      db.collection('account').where('username','==',username).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          if(doc.data().account_status=="1"){
            dataaccount.push(doc.data())
          }
        });
        res.json({dataincome:dataincome,dataaccount:dataaccount,totalincome:totalincome})
      })
    })
})

router.post('/listincome',(req,res)=>{
  var name=req.body.name;
  var username = req.session.userName;
  var income = db.collection('income');
  var temp
  var totalincome=0
  var dataincome=[], dataaccount=[]
  income.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        if(doc.data().income_account==name){
          totalincome+=parseInt(doc.data().income_amount);
          // var idate={
          //   account_name:doc.data().income_account,
          //   income_amount:doc.data().income_amount,
          //   income_date:doc.data().income_date
          // };
          dataincome.push(doc.data())
        }
      });
      res.json({dataincome:dataincome,totalincome:totalincome})
    })
})

module.exports = router
