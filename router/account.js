var core=require('../require.js')
core()
var db = admin.firestore();
router.post('/currentbalance',function(req,res){
  var username=req.session.userName;
  var nameacc=req.body.nameacc;
  var balance=0;
  var currency="";
  var account=db.collection("account");
  account.where('username','==',username).where('account_name','==',nameacc).get()
  .then(snapshot => {
    console.log("Masuk ke Account");
    snapshot.forEach(doc => {
      balance=doc.data().account_balance_current;
      currency=doc.data().account_fullcurrency.substring(4);
      console.log(currency)
    });
    res.status(200);
    res.json({balance:balance,currency:currency});

  })
  .catch(err => {
    console.log('Error getting documents', err);
    res.redirect('/');
  });
})

router.get('/listaccount',function(req,res){
  var username=req.session.userName;
  var dataaccount=[]
  var account=db.collection("account");
  account.where('username','==',username).get()
  .then(snapshot => {
    console.log("Masuk ke Account");
    snapshot.forEach(doc => {
      // if(doc.data().account_status=="1"){
        dataaccount.push(doc.data());
      // }
    });
    res.status(200);
    res.json({dataaccount:dataaccount});

  })
  .catch(err => {
    console.log('Error getting documents', err);
    res.redirect('/');
  });
})

router.get('/',(req,res)=>{
  var username = req.session.userName;
  var account = db.collection('account');
  var category = db.collection('category');
  var dataaccount = []
  var datacategory = []
  account.where('username','==',username).get()
    .then(snapshot => {
      console.log("Masuk ke Account");
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        dataaccount.push(doc.data())
      });
      category.where('username','==',username).get()
        .then(snapshot1 => {
          snapshot1.forEach(doc1 => {
            console.log(doc1.id, '=>', doc1.data());
            datacategory.push(doc1.data())
          });
          res.render('account',{list : dataaccount, list1 : datacategory, username:username});
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

router.post('/account_status',(req,res)=>{
  var username = req.session.userName;
  var status=req.body.status;
  var acc=req.body.acc;
  var account = db.collection('account');
  var dataaccount = []
  account.where('username','==',username).where('account_name','==',acc).get()
    .then(snapshot => {
      console.log("Masuk ke Account");
      snapshot.forEach(doc => {
        var update={
          account_status:status
        }
        db.collection("account").doc(doc.id).update(update);
      });
      res.status(200)
      // res.json('account',{list : dataaccount, list1 : datacategory, username:username});
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

router.get('/listaccounts',(req,res)=>{
  var account = db.collection('accounts');
  var dataaccount = []
  account.get()
    .then(snapshot => {
      console.log("Masuk ke Account");
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        dataaccount.push(doc.data())
      });
      res.status(200);
      res.json({dataaccount:dataaccount});
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

router.post('/authaccount',(req,res)=>{
  var exist=false;
  var username=req.session.userName;
  var accs = req.body.nameacc;
  var currency = req.body.currency;
  var ammount = req.body.ammount;
  var option = req.body.option;
  var fullcurrency='';
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
        
        if(currency=='IDR'){
          fullcurrency='IDR-RP';
        }
        else if(currency=='USD'){
          fullcurrency='USD-$';
        }
        else if(currency=='MYR'){
          fullcurrency='MYR-RM';
        }
        else if(currency=='SGD'){
          fullcurrency='SGD-S$';
        }
        db.collection('account').add({
          account_balance: ''+ammount ,
          account_balance_current: ''+ammount,
          account_category: option,
          account_createdate: moment().format('L'),
          account_createorlast: 1,
          account_currency: currency,
          account_fullcurrency: fullcurrency,
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

router.post('/authsharedaccount',(req,res)=>{
  var exist=false;
  var username=req.session.userName;
  if(username!=null){
    var username=req.body.username;
    var accs = req.body.nameacc;
    var account = db.collection('account');
    account.where('username','==',username).where('account_name','==',accs).get()
      .then(snapshot => {
        console.log("/authsharedaccount");
        snapshot.forEach(doc => {
          console.log(doc.id, '=>', doc.data());
          exist=true;
          moment.locale('id');
          console.log(moment().format('LLL'));

          db.collection('account').add({
            account_balance:doc.data().account_balance,
            account_balance_current:doc.data().account_balance_current,
            account_category: doc.data().account_category,
            account_createdate: moment().format('L'),
            account_createorlast: 1,
            account_currency: doc.data().account_currency,
            account_fullcurrency: doc.data().account_fullcurrency,
            account_lastused: moment().format('L'),
            account_name: accs,
            account_status: 1,
            email: req.session.email,
            username: req.session.userName
          }).then(ref => {
            console.log('Added document with ID: ', ref.id);
          });
          res.redirect('/account');
        });
      })
      .catch(err => {
        console.log('Error getting documents', err);
        res.redirect('/');
      });
      account.where('email','==',username).where('account_name','==',accs).get()
      .then(snapshot => {
        console.log("/authsharedaccount");
        snapshot.forEach(doc => {
          console.log(doc.id, '=>', doc.data());
          exist=true;
          moment.locale('id');
          console.log(moment().format('LLL'));

          db.collection('account').add({
            account_balance:doc.data().account_balance,
            account_balance_current:doc.data().account_balance_current,
            account_category: doc.data().account_category,
            account_createdate: moment().format('L'),
            account_createorlast: 1,
            account_currency: doc.data().account_currency,
            account_fullcurrency: doc.data().account_fullcurrency,
            account_lastused: moment().format('L'),
            account_name: accs,
            account_status: 1,
            email: req.session.email,
            username: req.session.userName
          }).then(ref => {
            console.log('Added document with ID: ', ref.id);
          });
          res.redirect('/account');
        });
      })
      .catch(err => {
        console.log('Error getting documents', err);
        res.redirect('/');
      });
  }
})

router.post('/editaccount',(req,res)=>{
  var exist=false;
  var username=req.session.userName;
  var accs = req.body.editnameacc;
  var currency = req.body.editcurrency;
  var ammount = req.body.editammount;
  var option = req.body.editoption;
  var beforeaccs=req.body.beforeeditaccs;
  var fullcurrency='';
  var num;
  var account = db.collection('account');
  /*
  if(option=='cashicon'){
    num=1;
  }
  else if(option=='bank'){
    num=2;
  }
  else if(option=='lend'){
    num=3;
  }
  else if(option=='cheque'){
    num=4;
  }
  else if(option=='creditcard'){
    num=5;
  }
  else if(option=='food'){
    num=6;
  }
  else if(option=='electric'){
    num=7;
  }
  else if(option=='truck'){
    num=8;
  }
  else if(option=='health'){
    num=9;
  }
  else if(option=='ball'){
    num=10;
  }
  else if(option=='house'){
    num=11;
  }
  else if(option=='water'){
    num=12;
  }
  else if(option=='clothes'){
    num=13;
  }
  else if(option=='movie'){
    num=14;
  }
  else if(option=='poker'){
    num=15;
  }
  else if(option=='car'){
    num=16;
  }
  else if(option=='accident'){
    num=17;
  }
  else if(option=='daily'){
    num=18;
  }
  else if(option=='tax'){
    num=19;
  }
  else if(option=='pet'){
    num=20;
  }
  else if(option=='computer'){
    num=21;
  }
  else if(option=='plane'){
    num=22;
  }
  else if(option=='gasoline'){
    num=23;
  }
  else if(option=='garden'){
    num=24;
  }
  else if(option=='bitcoin'){
    num=25;
  }
  else if(option=='insurance'){
    num=26;
  }
  else if(option=='investment'){
    num=27;
  }
  else if(option=='fixing'){
    num=28;
  }
  else if(option=='medical'){
    num=29;
  }
  else if(option=='drink'){
    num=30;
  }
  else{
    num=31;
  }*/


  account.where('username','==',username).where('account_name','==',beforeaccs).get()
    .then(snapshot => {
      console.log("/editaccount");
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        if(doc.data().account_name==accs){
          exist=true;
        }
      });
      if(beforeaccs==accs){
        exist=false;
      }
      if(exist){
        console.log("Data Account sudah ada");
        res.redirect('/account');
      }
      else{
        moment.locale('id');
        console.log(moment().format('LLL'));
        if(currency=='IDR'){
          fullcurrency='IDR-RP';
        }
        else if(currency=='USD'){
          fullcurrency='USD-$';
        }
        else if(currency=='MYR'){
          fullcurrency='MYR-RM';
        }
        else if(currency=='SGD'){
          fullcurrency='SGD-S$';
        }
        var dupdates={
          // account_balance: ''+ammount ,
          account_balance_current: ''+ammount,
          account_category: option,
          account_currency: currency,
          account_fullcurrency: fullcurrency,
          account_lastused: moment().format('L'),
          account_name: accs,
        }
        account.where('username','==',username).where('account_name','==',beforeaccs).get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              console.log("Update Account");
              db.collection('account').doc(doc.id).update(dupdates);
            });
            res.redirect('/account');
          })
      }
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

router.post('/deleteaccount',(req,res)=>{
  var beforeaccname = req.body.beforedeleteaccname;
  var username = req.session.userName;

  var account = db.collection('account');

  account.where('username','==',username).where('account_name','==',beforeaccname).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Delete Account "+beforeaccname);
        db.collection('account').doc(doc.id).delete();
      });
      res.redirect('/account');
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
  
})

module.exports = router