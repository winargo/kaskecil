var core=require('../require.js')
core()
var db = admin.firestore();
router.get('/ac',function(req,res){
  var username = req.session.userName;
  var dataaccount=[]
  var datacategory=[]
  var temp=[];
  var exist=false;
  db.collection('account').orderBy('account_lastused','desc').get()
  .then((data) => {
    data.forEach(json => {
      if(json.data().username == username) {
        if(json.data().account_status=="1"){
          dataaccount.push(json.data());
        }
      }
    })
    db.collection('category').where('username','==',username).get()
    .then((data) => {
      data.forEach(json => {
          for(var i=0;i<dataaccount.length;i++){
            if(dataaccount[i]["account_status"]=="1" || dataaccount[i]["account_status"]=="0"){
              if(dataaccount[i]["account_category"]==json.data().category_name){
                if(temp.length>0){
                  exist=false;
                  for(var j=0;j<temp.length;j++){
                    if(dataaccount[i]["account_category"]==temp[j].category_name){
                      exist=true;
                    }
                  }
                  if(!exist){
                    console.log("Termasuk"+json.data().category_name)
                    temp.push(json.data());
                  }
                  // temp.forEach(result => {
                  //   if(json.data().category_name!=result.category_name){
                  //     console.log(json.data())
                  //     temp.push(json.data());
                  //   }
                  // })
                }
                else{
                  console.log(json.data())
                  temp.push(json.data());
                }

              }
            }
            else{
              console.log("Tidak Termasuk")
            }
          }
          datacategory=temp;
          // for(var i=0;i<temps.length;i++){
          //   for(var j=0;j<temp.length;j++){
          //     if(temps[i]["category_name"]==temp[j]["category_name"]){
          //       console.log(json.data())
          //       datacategory.push(json.data());
          //     }
          //   }
          // }

          


        
        
      })
      res.render('acreport',{username:username,listacc:dataaccount, listcategory:datacategory});
    })
  })
})

router.get('/cob',function(req,res){
  var username = req.session.userName;
  var dataaccount=[]
  var datacategory=[]
  var temp=[];
  var exist=false;
  db.collection('account').orderBy('account_lastused','desc').get()
  .then((data) => {
    data.forEach(json => {
      if(json.data().username == username) {
        if(json.data().account_status=="1"){
          dataaccount.push(json.data());
        }
      }
    })
    db.collection('category').where('username','==',username).get()
    .then((data) => {
      data.forEach(json => {
          for(var i=0;i<dataaccount.length;i++){
            if(dataaccount[i]["account_status"]=="1" || dataaccount[i]["account_status"]=="0"){
              if(dataaccount[i]["account_category"]==json.data().category_name){
                if(temp.length>0){
                  exist=false;
                  for(var j=0;j<temp.length;j++){
                    if(dataaccount[i]["account_category"]==temp[j].category_name){
                      exist=true;
                    }
                  }
                  if(!exist){
                    console.log("Termasuk"+json.data().category_name)
                    temp.push(json.data());
                  }
                  // temp.forEach(result => {
                  //   if(json.data().category_name!=result.category_name){
                  //     console.log(json.data())
                  //     temp.push(json.data());
                  //   }
                  // })
                }
                else{
                  console.log(json.data())
                  temp.push(json.data());
                }

              }
            }
            else{
              console.log("Tidak Termasuk")
            }
          }
          datacategory=temp;
          // for(var i=0;i<temps.length;i++){
          //   for(var j=0;j<temp.length;j++){
          //     if(temps[i]["category_name"]==temp[j]["category_name"]){
          //       console.log(json.data())
          //       datacategory.push(json.data());
          //     }
          //   }
          // }

          


        
        
      })
      res.render('cobreport',{username:username,listacc:dataaccount, listcategory:datacategory});
    })
  })
})

router.get('/acreport',function(req,res){
  var username = req.session.userName;
  var totalincome = 0;
  var totalexpense = 0;
  var totaltransfer = 0;
  var totalaccount = 0;
  var dataincome = []
  var dataexpense = []
  var datatransfer = []
  var dataaccount = []
  var datacategory = []
  var datachart=[]
  var rangedate;
  var tfbase,symbol;;
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
  var balancenow;
  

  db.collection('category').get()
    .then((data) => {
      data.forEach(json => {
          if (json.data().username == username) {
            datacategory.push(json.data());
          }
      })
      db.collection('account').orderBy('account_lastused','desc').get()
      .then((data) => {
        data.forEach(json => {
            if (json.data().username == username) {  
              if(json.data().account_status=="1"){
                if(json.data().account_currency==tfbase){
                  var dupdates={
                    account_lastused: json.data().account_lastused,
                    account_name: json.data().account_name,
                    account_currency: json.data().account_currency,
                    account_category: json.data().account_category,
                    account_balance_current: symbol+" "+numeral(json.data().account_balance_current).format('0,0.00')
                  }
                  var cupdates={
                    account_name:json.data().account_name,
                    account_currency:json.data().account_currency,
                    account_category:json.data().account_category,
                    account_balance:json.data().account_fullcurrency.substring(4)+" "+json.data().account_balance,
                    not_included:0,
                    type_transaction:"make account",
                    debit_balance:0,
                    credit_balance:0,
                    transaction_date:json.data().account_lastused,
                    account_balance_current:json.data().account_fullcurrency.substring(4)+" "+json.data().account_balance_current,
                  }
                  datachart.push(cupdates)
                  dataaccount.push(dupdates)
                  totalaccount += parseFloat(json.data().account_balance_current);
                }
                else{
                  balancenow=parseFloat(fx(parseInt(json.data().account_balance_current)).convert({ from:json.data().account_currency, to:tfbase })).toFixed(2);
                  totalaccount += parseFloat(balancenow);
                  var dupdates={
                    account_lastused: json.data().account_lastused,
                    account_name: json.data().account_name,
                    account_currency: json.data().account_currency,
                    account_category: json.data().account_category,
                    account_balance_current: symbol+" "+numeral(balancenow).format('0,0.00')
                  }
                  var cupdates={
                    account_name:json.data().account_name,
                    account_currency:json.data().account_currency,
                    account_category:json.data().account_category,
                    account_balance:json.data().account_fullcurrency.substring(4)+" "+json.data().account_balance,
                    not_included:0,
                    type_transaction:"make account",
                    debit_balance:0,
                    credit_balance:0,
                    transaction_date:json.data().account_lastused,
                    account_balance_current:json.data().account_fullcurrency.substring(4)+" "+json.data().account_balance_current,
                  }
                  datachart.push(cupdates)
                  dataaccount.push(dupdates)
                }
              }
            }
        })
        res.status(200);
        res.json({datacategory:datacategory,dataaccount:dataaccount});
      })
      .catch((err) => {
        console.log('Error getting documents', err);
      });
    
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
})

router.get('/cobreport',function(req,res){
  var username = req.session.userName;
  var totalincome = 0;
  var totalexpense = 0;
  var totaltransfer = 0;
  var totalaccount = 0;
  var dataincome = []
  var dataexpense = []
  var datatransfer = []
  var dataaccount = []
  var datacategory = []
  var datachart=[]
  var rangedate;
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
  var balancenow;
  db.collection('account').orderBy('account_lastused','desc').get()
    .then((data) => {
      data.forEach(json => {
          if (json.data().username == username) {  
            if(json.data().account_status=="1"){
              if(json.data().account_currency==tfbase){
                var dupdates={
                  account_lastused: json.data().account_lastused,
                  account_name: json.data().account_name,
                  account_currency: json.data().account_currency,
                  account_category: json.data().account_category,
                  account_balance:symbol+" "+numeral(json.data().account_balance).format('0,0.00'),
                  account_balance_current: symbol+" "+numeral(json.data().account_balance_current).format('0,0.00')
                }
                var cupdates={
                  account_name:json.data().account_name,
                  account_currency:json.data().account_currency,
                  account_category:json.data().account_category,
                  account_balance:json.data().account_fullcurrency.substring(4)+" "+json.data().account_balance,
                  not_included:0,
                  type_transaction:"make account",
                  debit_balance:0,
                  credit_balance:0,
                  transaction_date:json.data().account_createdate,
                  account_balance_current:json.data().account_fullcurrency.substring(4)+" "+json.data().account_balance_current,
                }
                datachart.push(cupdates)
                dataaccount.push(dupdates)
                totalaccount += parseFloat(json.data().account_balance_current);
              }
              else{
                balancenow=parseFloat(fx(parseInt(json.data().account_balance_current)).convert({ from:json.data().account_currency, to:tfbase })).toFixed(2);
                totalaccount += parseFloat(balancenow);
                var dupdates={
                  account_lastused: json.data().account_lastused,
                  account_name: json.data().account_name,
                  account_currency: json.data().account_currency,
                  account_category: json.data().account_category,
                  account_balance:symbol+" "+numeral(json.data().account_balance).format('0,0.00'),
                  account_balance_current: symbol+" "+numeral(balancenow).format('0,0.00')
                }
                var cupdates={
                  account_name:json.data().account_name,
                  account_currency:json.data().account_currency,
                  account_category:json.data().account_category,
                  account_balance:json.data().account_fullcurrency.substring(4)+" "+json.data().account_balance,
                  not_included:0,
                  type_transaction:"make account",
                  debit_balance:0,
                  credit_balance:0,
                  transaction_date:json.data().account_createdate,
                  account_balance_current:json.data().account_fullcurrency.substring(4)+" "+json.data().account_balance_current,
                }
                datachart.push(cupdates)
                dataaccount.push(dupdates)
              }
            }
          }
      })
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });

  //cashflow
  db.collection('income').orderBy("income_date",'desc').get()
    .then((data) => {
      data.forEach(json => {
          if (json.data().username == username) {
            db.collection('account').where("username",'==',username).where("account_name",'==',json.data().income_account).get()
            .then((data) => {
              data.forEach(jsonacc => {
                if(jsonacc.data().account_status=="1"){
                  if(jsonacc.data().account_currency==tfbase){
                    totalincome += parseFloat(json.data().income_amount);
                    var dupdates={
                      income_date: json.data().income_date,
                      income_category: json.data().income_category,
                      income_account: json.data().income_account,
                      income_notes: json.data().income_notes,
                      income_amount: symbol+" "+numeral(json.data().income_amount).format('0,0.00')
                    }
                    var cupdates={
                      account_name:jsonacc.data().account_name,
                      account_currency:jsonacc.data().account_currency,
                      account_category:jsonacc.data().account_category,
                      account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                      not_included:0,
                      type_transaction:"Income",
                      debit_balance:0,
                      credit_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+json.data().income_amount,
                      transaction_date:json.data().income_date,
                      account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                      // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                      // symbol:jsonacc.data().account_fullcurrency.substring(4),
                    }
                    datachart.push(cupdates)
                  }
                  else{
                    balancenow=parseFloat(fx(parseInt(json.data().income_amount)).convert({ from:jsonacc.data().account_currency, to:tfbase })).toFixed(2);
                    totalincome += parseFloat(balancenow);
                    var cupdates={
                      account_name:jsonacc.data().account_name,
                      account_currency:jsonacc.data().account_currency,
                      account_category:jsonacc.data().account_category,
                      account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                      not_included:0,
                      type_transaction:"Income",
                      debit_balance:0,
                      credit_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+json.data().income_amount,
                      transaction_date:json.data().income_date,
                      account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                      // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                      // symbol:jsonacc.data().account_fullcurrency.substring(4),
                    }
                    var dupdates={
                      income_date: json.data().income_date,
                      income_category: json.data().income_category,
                      income_account: json.data().income_account,
                      income_notes: json.data().income_notes,
                      income_amount: symbol+" "+numeral(balancenow).format('0,0.00')
                    }
                    datachart.push(cupdates)
                  }
                }
              });
            })
            // dataincome.push(json.data())
            // totalincome += parseInt(json.data().income_amount);
          }
      })
      // res.render('report',{list : datas});
      db.collection('expense').orderBy('expense_date','desc').get()
        .then((data) => {
          data.forEach(json1 => {
              if (json1.data().username == username) {
                
                db.collection('account').where("username",'==',username).where("account_name",'==',json1.data().expense_account).get()
                .then((data) => {
                  data.forEach(jsonacc => {
                    if(jsonacc.data().account_status=="1"){
                      if(jsonacc.data().account_currency==tfbase){
                        totalexpense += parseFloat(json1.data().expense_amount);
                        var dupdates={
                          expense_date: json1.data().expense_date,
                          expense_category: json1.data().expense_category,
                          expense_account: json1.data().expense_account,
                          expense_notes: json1.data().expense_notes,
                          expense_amount: symbol+" "+numeral(json1.data().expense_amount).format('0,0.00')
                        }
                        var cupdates={
                          account_name:jsonacc.data().account_name,
                          account_currency:jsonacc.data().account_currency,
                          account_category:jsonacc.data().account_category,
                          account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                          not_included:0,
                          type_transaction:"Expense",
                          debit_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+json1.data().expense_amount,
                          credit_balance:0,
                          transaction_date:json1.data().expense_date,
                          account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                          // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                          // symbol:jsonacc.data().account_fullcurrency.substring(4),
                        }
                        datachart.push(cupdates)
                      }
                      else{
                        balancenow=parseFloat(fx(parseInt(json1.data().expense_amount)).convert({ from:jsonacc.data().account_currency, to:tfbase })).toFixed(2);
                        totalexpense += parseFloat(balancenow);
                        var dupdates={
                          expense_date: json1.data().expense_date,
                          expense_category: json1.data().expense_category,
                          expense_account: json1.data().expense_account,
                          expense_notes: json1.data().expense_notes,
                          expense_amount: symbol+" "+numeral(balancenow).format('0,0.00')
                        }
                        var cupdates={
                          account_name:jsonacc.data().account_name,
                          account_currency:jsonacc.data().account_currency,
                          account_category:jsonacc.data().account_category,
                          account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                          not_included:0,
                          type_transaction:"Expense",
                          debit_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+json1.data().expense_amount,
                          credit_balance:0,
                          transaction_date:json1.data().expense_date,
                          account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                          // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                          // symbol:jsonacc.data().account_fullcurrency.substring(4)+""+,
                        }
                        datachart.push(cupdates)
                      }
                    }
                  });
                })
              }
          })
          db.collection('transfer').orderBy('transfer_date','desc').get()
            .then((data2) => {
              data2.forEach(json2 => {
                if (json2.data().username == username) {
                  console.log(json2.id, '=>', json2.data());
                  // datatransfer.push(json2.data())
                  // totaltransfer += parseInt(json2.data().transfer_amount);
                  db.collection('account').where("username",'==',username).get()
                    .then((data) => {
                      data.forEach(jsonacc => {
                        // console.log("Transfer")
                        // console.log(jsonacc.data().account_currency)
                        // console.log(tfbase);
                        // var tipe;
                        // if(json2.data().transfer_dest==jsonacc.data().account_name){
                        //   tipe="credit";
                        // }
                        // else if(json2.data().transfer_src==jsonacc.data().account_name){
                        //   tipe="debit";
                        // }
                        if(jsonacc.data().account_status=="1"){
                          if(json2.data().transfer_dest==jsonacc.data().account_name){
                            if(jsonacc.data().account_currency==tfbase){
                              totaltransfer += parseFloat(json2.data().transfer_amount);
                              var dupdates={
                                transfer_date: json2.data().transfer_date,
                                transfer_category: json2.data().transfer_category,
                                transfer_src: json2.data().transfer_src,
                                transfer_dest: json2.data().transfer_dest,
                                transfer_notes: json2.data().transfer_notes,
                                transfer_amount: symbol+" "+numeral(json2.data().transfer_amount).format('0,0.00')
                              }
                              datatransfer.push(dupdates)
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
                                transfer_amount: symbol+" "+numeral(balancenow).format('0,0.00')
                              }
                              datatransfer.push(dupdates)
                            }
                          }
                          else if(json2.data().transfer_dest==jsonacc.data().account_name || json2.data().transfer_src==jsonacc.data().account_name){
                            
                              if(json2.data().transfer_dest==jsonacc.data().account_name){
                                var cupdates={
                                  account_name:jsonacc.data().account_name,
                                  account_currency:jsonacc.data().account_currency,
                                  account_category:jsonacc.data().account_category,
                                  account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                                  not_included:0,
                                  type_transaction:"Transfer",
                                  debit_balance:0,
                                  credit_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+json2.data().transfer_amount,
                                  transaction_date:json2.data().transfer_date,
                                  account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                                  // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                                  // symbol:jsonacc.data().account_fullcurrency.substring(4),
                                }
                                datachart.push(cupdates)
                              }
                              if(json2.data().transfer_src==jsonacc.data().account_name){
                                var cupdates={
                                  account_name:jsonacc.data().account_name,
                                  account_currency:jsonacc.data().account_currency,
                                  account_category:jsonacc.data().account_category,
                                  account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                                  not_included:0,
                                  type_transaction:"Transfer",
                                  debit_balance:symbol+" "+json2.data().transfer_amount,
                                  credit_balance:0,
                                  transaction_date:json2.data().transfer_date,
                                  account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                                  // symbol:symbol+" ",
                                  // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                                }
                                datachart.push(cupdates)
                              }
                              
                              
                              
                              // console.log(totaltransfer)
                            
                            else{
                             
                              if(json2.data().transfer_dest==jsonacc.data().account_name){
                                var cupdates={
                                  account_name:jsonacc.data().account_name,
                                  account_currency:jsonacc.data().account_currency,
                                  account_category:jsonacc.data().account_category,
                                  account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                                  not_included:0,
                                  type_transaction:"Transfer",
                                  debit_balance:0,
                                  credit_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+json2.data().transfer_amount,
                                  transaction_date:json2.data().transfer_date,
                                  account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                                  // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                                  // symbol:jsonacc.data().account_fullcurrency.substring(4),
                                }
                                datachart.push(cupdates)
                              }
                              if(json2.data().transfer_src==jsonacc.data().account_name){
                                var cupdates={
                                  account_name:jsonacc.data().account_name,
                                  account_currency:jsonacc.data().account_currency,
                                  account_category:jsonacc.data().account_category,
                                  account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                                  not_included:0,
                                  type_transaction:"Transfer",
                                  debit_balance:symbol+" "+json2.data().transfer_amount,
                                  credit_balance:0,
                                  transaction_date:json2.data().transfer_date,
                                  account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                                  // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                                  // symbol:symbol+" ",
                                }
                                datachart.push(cupdates)
                              }
                              
                              // console.log(totaltransfer)
                            }
                          }
                        }
                      });

                  })
                 
                }
                
                
              });
              
              function report(){
                console.log("Masuk");
                var before=moment().subtract(7, 'days').format('L');
                //var beforef=moment(before).format('L');
                rangedate=before+" - "+moment().format('MM/DD/YYYY');
                console.log(rangedate);
                //res.render('report',{username:username, listaccount : dataaccount, listincome : dataincome, listexpense : dataexpense, listtransfer : datatransfer, totalAccount : totalaccount, totalIncome : totalincome, totalExpense : totalexpense, totalTransfer : totaltransfer});
                console.log("\n"+totaltransfer);
                res.status(200);
                res.json({dataaccount:dataaccount,datachart,datachart});
                // res.render('report',{
                //   id:1,
                //   username:username, 
                //   symbol:symbol,
                //   selectofacc:"Select All Account", 
                //   selectcategory:"Select All Category",
                //   selectacc:"Select All Account",
                //   selecttype:"Select All Type",
                //   rangedate:rangedate,
                //   listaccount : dataaccount, 
                //   listofaccount : dataaccount,
                //   listcategory : datacategory, 
                //   listincome : dataincome, 
                //   listexpense : dataexpense, 
                //   listtransfer : datatransfer, 
                //   totalAccount : numeral(totalaccount).format('0,0.00'), 
                //   totalIncome : numeral(totalincome).format('0,0.00'), 
                //   totalExpense : numeral(totalexpense).format('0,0.00'), 
                //   totalTransfer : numeral(totaltransfer).format('0,0.00')});
              }
              setTimeout(report,3000);
            })
            .catch((err) => {
              console.log('Error getting documents', err);
            });
        })
        .catch((err) => {
          console.log('Error getting documents', err);
        });
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
    
})

router.get('/reportacc',function(req,res){
  var username = req.session.userName;
  var totalincome = 0;
  var totalexpense = 0;
  var totaltransfer = 0;
  var totalaccount = 0;
  var dataincome = []
  var dataexpense = []
  var datatransfer = []
  var dataaccount = []
  var datacategory = []
  var datachart=[]
  var rangedate;
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
  var balancenow;
  db.collection('account').orderBy('account_lastused','desc').get()
    .then((data) => {
      data.forEach(json => {
          if (json.data().username == username) {  
            if(json.data().account_status=="1"){
              if(json.data().account_currency==tfbase){
                var dupdates={
                  account_lastused: json.data().account_lastused,
                  account_name: json.data().account_name,
                  account_currency: json.data().account_currency,
                  account_category: json.data().account_category,
                  account_balance_current: symbol+" "+numeral(json.data().account_balance_current).format('0,0.00')
                }
                var cupdates={
                  account_name:json.data().account_name,
                  account_currency:json.data().account_currency,
                  account_category:json.data().account_category,
                  account_balance:json.data().account_fullcurrency.substring(4)+" "+json.data().account_balance,
                  not_included:0,
                  type_transaction:"make account",
                  debit_balance:0,
                  credit_balance:0,
                  transaction_date:json.data().account_lastused,
                  account_balance_current:json.data().account_fullcurrency.substring(4)+" "+json.data().account_balance_current,
                }
                datachart.push(cupdates)
                dataaccount.push(dupdates)
                totalaccount += parseFloat(json.data().account_balance_current);
              }
              else{
                balancenow=parseFloat(fx(parseInt(json.data().account_balance_current)).convert({ from:json.data().account_currency, to:tfbase })).toFixed(2);
                totalaccount += parseFloat(balancenow);
                var dupdates={
                  account_lastused: json.data().account_lastused,
                  account_name: json.data().account_name,
                  account_currency: json.data().account_currency,
                  account_category: json.data().account_category,
                  account_balance_current: symbol+" "+numeral(balancenow).format('0,0.00')
                }
                var cupdates={
                  account_name:json.data().account_name,
                  account_currency:json.data().account_currency,
                  account_category:json.data().account_category,
                  account_balance:json.data().account_fullcurrency.substring(4)+" "+json.data().account_balance,
                  not_included:0,
                  type_transaction:"make account",
                  debit_balance:0,
                  credit_balance:0,
                  transaction_date:json.data().account_lastused,
                  account_balance_current:json.data().account_fullcurrency.substring(4)+" "+json.data().account_balance_current,
                }
                datachart.push(cupdates)
                dataaccount.push(dupdates)
              }
            }
          }
      })
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });

  db.collection('category').get()
    .then((data) => {
      data.forEach(json => {
          if (json.data().username == username) {
            datacategory.push(json.data());
          }
      })
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
    
  //cashflow
  db.collection('income').orderBy("income_date",'desc').get()
    .then((data) => {
      data.forEach(json => {
          if (json.data().username == username) {
            db.collection('account').where("username",'==',username).where("account_name",'==',json.data().income_account).get()
            .then((data) => {
              data.forEach(jsonacc => {
                if(jsonacc.data().account_status=="1"){
                  if(jsonacc.data().account_currency==tfbase){
                    totalincome += parseFloat(json.data().income_amount);
                    var dupdates={
                      income_date: json.data().income_date,
                      income_category: json.data().income_category,
                      income_account: json.data().income_account,
                      income_notes: json.data().income_notes,
                      income_amount: symbol+" "+numeral(json.data().income_amount).format('0,0.00')
                    }
                    var cupdates={
                      account_name:jsonacc.data().account_name,
                      account_currency:jsonacc.data().account_currency,
                      account_category:jsonacc.data().account_category,
                      account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                      not_included:0,
                      type_transaction:"Income",
                      debit_balance:0,
                      credit_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+json.data().income_amount,
                      transaction_date:json.data().income_date,
                      account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                      // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                      // symbol:jsonacc.data().account_fullcurrency.substring(4),
                    }
                    datachart.push(cupdates)
                    dataincome.push(dupdates)
                  }
                  else{
                    balancenow=parseFloat(fx(parseInt(json.data().income_amount)).convert({ from:jsonacc.data().account_currency, to:tfbase })).toFixed(2);
                    totalincome += parseFloat(balancenow);
                    var cupdates={
                      account_name:jsonacc.data().account_name,
                      account_currency:jsonacc.data().account_currency,
                      account_category:jsonacc.data().account_category,
                      account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                      not_included:0,
                      type_transaction:"Income",
                      debit_balance:0,
                      credit_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+json.data().income_amount,
                      transaction_date:json.data().income_date,
                      account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                      // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                      // symbol:jsonacc.data().account_fullcurrency.substring(4),
                    }
                    var dupdates={
                      income_date: json.data().income_date,
                      income_category: json.data().income_category,
                      income_account: json.data().income_account,
                      income_notes: json.data().income_notes,
                      income_amount: symbol+" "+numeral(balancenow).format('0,0.00')
                    }
                    datachart.push(cupdates)
                    dataincome.push(dupdates)
                  }
                }
              });
            })
            // dataincome.push(json.data())
            // totalincome += parseInt(json.data().income_amount);
          }
      })
      // res.render('report',{list : datas});
      db.collection('expense').orderBy('expense_date','desc').get()
        .then((data) => {
          data.forEach(json1 => {
              if (json1.data().username == username) {
                
                db.collection('account').where("username",'==',username).where("account_name",'==',json1.data().expense_account).get()
                .then((data) => {
                  data.forEach(jsonacc => {
                    if(jsonacc.data().account_status=="1"){
                      if(jsonacc.data().account_currency==tfbase){
                        totalexpense += parseFloat(json1.data().expense_amount);
                        var dupdates={
                          expense_date: json1.data().expense_date,
                          expense_category: json1.data().expense_category,
                          expense_account: json1.data().expense_account,
                          expense_notes: json1.data().expense_notes,
                          expense_amount: symbol+" "+numeral(json1.data().expense_amount).format('0,0.00')
                        }
                        var cupdates={
                          account_name:jsonacc.data().account_name,
                          account_currency:jsonacc.data().account_currency,
                          account_category:jsonacc.data().account_category,
                          account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                          not_included:0,
                          type_transaction:"Expense",
                          debit_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+json1.data().expense_amount,
                          credit_balance:0,
                          transaction_date:json1.data().expense_date,
                          account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                          // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                          // symbol:jsonacc.data().account_fullcurrency.substring(4),
                        }
                        datachart.push(cupdates)
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
                          expense_amount: symbol+" "+numeral(balancenow).format('0,0.00')
                        }
                        var cupdates={
                          account_name:jsonacc.data().account_name,
                          account_currency:jsonacc.data().account_currency,
                          account_category:jsonacc.data().account_category,
                          account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                          not_included:0,
                          type_transaction:"Expense",
                          debit_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+json1.data().expense_amount,
                          credit_balance:0,
                          transaction_date:json1.data().expense_date,
                          account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                          // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                          // symbol:jsonacc.data().account_fullcurrency.substring(4)+""+,
                        }
                        datachart.push(cupdates)
                        dataexpense.push(dupdates)
                      }
                    }
                  });
                })
              }
          })
          db.collection('transfer').orderBy('transfer_date','desc').get()
            .then((data2) => {
              data2.forEach(json2 => {
                if (json2.data().username == username) {
                  console.log(json2.id, '=>', json2.data());
                  // datatransfer.push(json2.data())
                  // totaltransfer += parseInt(json2.data().transfer_amount);
                  db.collection('account').where("username",'==',username).get()
                    .then((data) => {
                      data.forEach(jsonacc => {
                        // console.log("Transfer")
                        // console.log(jsonacc.data().account_currency)
                        // console.log(tfbase);
                        // var tipe;
                        // if(json2.data().transfer_dest==jsonacc.data().account_name){
                        //   tipe="credit";
                        // }
                        // else if(json2.data().transfer_src==jsonacc.data().account_name){
                        //   tipe="debit";
                        // }
                        if(jsonacc.data().account_status=="1"){
                          if(json2.data().transfer_dest==jsonacc.data().account_name){
                            if(jsonacc.data().account_currency==tfbase){
                              totaltransfer += parseFloat(json2.data().transfer_amount);
                              var dupdates={
                                transfer_date: json2.data().transfer_date,
                                transfer_category: json2.data().transfer_category,
                                transfer_src: json2.data().transfer_src,
                                transfer_dest: json2.data().transfer_dest,
                                transfer_notes: json2.data().transfer_notes,
                                transfer_amount: symbol+" "+numeral(json2.data().transfer_amount).format('0,0.00')
                              }
                              datatransfer.push(dupdates)
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
                                transfer_amount: symbol+" "+numeral(balancenow).format('0,0.00')
                              }
                              datatransfer.push(dupdates)
                            }
                          }
                          else if(json2.data().transfer_dest==jsonacc.data().account_name || json2.data().transfer_src==jsonacc.data().account_name){
                            
                              if(json2.data().transfer_dest==jsonacc.data().account_name){
                                var cupdates={
                                  account_name:jsonacc.data().account_name,
                                  account_currency:jsonacc.data().account_currency,
                                  account_category:jsonacc.data().account_category,
                                  account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                                  not_included:0,
                                  type_transaction:"Transfer",
                                  debit_balance:0,
                                  credit_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+json2.data().transfer_amount,
                                  transaction_date:json2.data().transfer_date,
                                  account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                                  // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                                  // symbol:jsonacc.data().account_fullcurrency.substring(4),
                                }
                                datachart.push(cupdates)
                              }
                              if(json2.data().transfer_src==jsonacc.data().account_name){
                                var cupdates={
                                  account_name:jsonacc.data().account_name,
                                  account_currency:jsonacc.data().account_currency,
                                  account_category:jsonacc.data().account_category,
                                  account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                                  not_included:0,
                                  type_transaction:"Transfer",
                                  debit_balance:symbol+" "+json2.data().transfer_amount,
                                  credit_balance:0,
                                  transaction_date:json2.data().transfer_date,
                                  account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                                  // symbol:symbol+" ",
                                  // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                                }
                                datachart.push(cupdates)
                              }
                              
                              
                              
                              // console.log(totaltransfer)
                            
                            else{
                             
                              if(json2.data().transfer_dest==jsonacc.data().account_name){
                                var cupdates={
                                  account_name:jsonacc.data().account_name,
                                  account_currency:jsonacc.data().account_currency,
                                  account_category:jsonacc.data().account_category,
                                  account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                                  not_included:0,
                                  type_transaction:"Transfer",
                                  debit_balance:0,
                                  credit_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+json2.data().transfer_amount,
                                  transaction_date:json2.data().transfer_date,
                                  account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                                  // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                                  // symbol:jsonacc.data().account_fullcurrency.substring(4),
                                }
                                datachart.push(cupdates)
                              }
                              if(json2.data().transfer_src==jsonacc.data().account_name){
                                var cupdates={
                                  account_name:jsonacc.data().account_name,
                                  account_currency:jsonacc.data().account_currency,
                                  account_category:jsonacc.data().account_category,
                                  account_balance:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance,
                                  not_included:0,
                                  type_transaction:"Transfer",
                                  debit_balance:symbol+" "+json2.data().transfer_amount,
                                  credit_balance:0,
                                  transaction_date:json2.data().transfer_date,
                                  account_balance_current:jsonacc.data().account_fullcurrency.substring(4)+" "+jsonacc.data().account_balance_current,
                                  // symbolacc:jsonacc.data().account_fullcurrency.substring(4),
                                  // symbol:symbol+" ",
                                }
                                datachart.push(cupdates)
                              }
                              
                              // console.log(totaltransfer)
                            }
                          }
                        }
                      });

                  })
                 
                }
                
                
              });
              
              function report(){
                console.log("Masuk");
                var before=moment().subtract(7, 'days').format('L');
                //var beforef=moment(before).format('L');
                rangedate=before+" - "+moment().format('MM/DD/YYYY');
                console.log(rangedate);
                //res.render('report',{username:username, listaccount : dataaccount, listincome : dataincome, listexpense : dataexpense, listtransfer : datatransfer, totalAccount : totalaccount, totalIncome : totalincome, totalExpense : totalexpense, totalTransfer : totaltransfer});
                console.log("\n"+totaltransfer);
                res.status(200);
                res.json({datacategory:datacategory,dataaccount:dataaccount,datachart,datachart,dataincome:dataincome,dataexpense,dataexpense,datatransfer:datatransfer});
                // res.render('report',{
                //   id:1,
                //   username:username, 
                //   symbol:symbol,
                //   selectofacc:"Select All Account", 
                //   selectcategory:"Select All Category",
                //   selectacc:"Select All Account",
                //   selecttype:"Select All Type",
                //   rangedate:rangedate,
                //   listaccount : dataaccount, 
                //   listofaccount : dataaccount,
                //   listcategory : datacategory, 
                //   listincome : dataincome, 
                //   listexpense : dataexpense, 
                //   listtransfer : datatransfer, 
                //   totalAccount : numeral(totalaccount).format('0,0.00'), 
                //   totalIncome : numeral(totalincome).format('0,0.00'), 
                //   totalExpense : numeral(totalexpense).format('0,0.00'), 
                //   totalTransfer : numeral(totaltransfer).format('0,0.00')});
              }
              setTimeout(report,3000);
            })
            .catch((err) => {
              console.log('Error getting documents', err);
            });
        })
        .catch((err) => {
          console.log('Error getting documents', err);
        });
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
    
})

router.post('/reportfilter1',(req,res)=>{
  var totalincome = 0;
  var totalexpense = 0;
  var totaltransfer = 0;
  var totalaccount = 0;
  var dataincome = []
  var dataexpense = []
  var datatransfer = []
  var dataaccount = []
  var datacategory = []
  var datalistaccount = []

  var username = req.session.userName;
  var accs=req.body.name;
  var category=req.body.category;

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

  
  db.collection('account').orderBy('account_lastused','DESC').get()
    .then((data) => {
      data.forEach(json => {
          if (json.data().username == username) {
            datalistaccount.push(json.data())
            if(accs=='All'){
              if(category=='All'){
                if(json.data().account_currency==tfbase){
                  var dupdates={
                    account_lastused: json.data().account_lastused,
                    account_name: json.data().account_name,
                    account_currency: json.data().account_currency,
                    account_category: json.data().account_category,
                    account_balance_current: numeral(json.data().account_balance_current).format('0,0.00')
                  }
                  dataaccount.push(dupdates)
                  totalaccount += parseInt(json.data().account_balance_current);
                }
                else{
                  balancenow=parseFloat(fx(parseInt(json.data().account_balance_current)).convert({ from:json.data().account_currency, to:tfbase })).toFixed(2);
                  totalaccount += parseInt(balancenow);
                  var dupdates={
                    account_lastused: json.data().account_lastused,
                    account_name: json.data().account_name,
                    account_currency: json.data().account_currency,
                    account_category: json.data().account_category,
                    account_balance_current: numeral(balancenow).format('0,0.00')
                  }
                  dataaccount.push(dupdates)
                }
              }
              else if(json.data().account_category == category){
                if(json.data().account_currency==tfbase){
                  var dupdates={
                    account_lastused: json.data().account_lastused,
                    account_name: json.data().account_name,
                    account_currency: json.data().account_currency,
                    account_category: json.data().account_category,
                    account_balance_current: numeral(json.data().account_balance_current).format('0,0.00')
                  }
                  dataaccount.push(dupdates)
                  totalaccount += parseInt(json.data().account_balance_current);
                }
                else{
                  balancenow=parseFloat(fx(parseInt(json.data().account_balance_current)).convert({ from:json.data().account_currency, to:tfbase })).toFixed(2);
                  totalaccount += parseInt(balancenow);
                  var dupdates={
                    account_lastused: json.data().account_lastused,
                    account_name: json.data().account_name,
                    account_currency: json.data().account_currency,
                    account_category: json.data().account_category,
                    account_balance_current: numeral(balancenow).format('0,0.00')
                  }
                  dataaccount.push(dupdates)
                }
              }
            }
            else if(json.data().account_name == accs){
              if(category=='All'){
                if(json.data().account_currency==tfbase){
                  var dupdates={
                    account_lastused: json.data().account_lastused,
                    account_name: json.data().account_name,
                    account_currency: json.data().account_currency,
                    account_category: json.data().account_category,
                    account_balance_current: numeral(json.data().account_balance_current).format('0,0.00')
                  }
                  dataaccount.push(dupdates)
                  totalaccount += parseInt(json.data().account_balance_current);
                }
                else{
                  balancenow=parseFloat(fx(parseInt(json.data().account_balance_current)).convert({ from:json.data().account_currency, to:tfbase })).toFixed(2);
                  totalaccount += parseInt(balancenow);
                  var dupdates={
                    account_lastused: json.data().account_lastused,
                    account_name: json.data().account_name,
                    account_currency: json.data().account_currency,
                    account_category: json.data().account_category,
                    account_balance_current: numeral(balancenow).format('0,0.00')
                  }
                  dataaccount.push(dupdates)
                }
              }
              else if(json.data().account_category == category){
                if(json.data().account_currency==tfbase){
                  var dupdates={
                    account_lastused: json.data().account_lastused,
                    account_name: json.data().account_name,
                    account_currency: json.data().account_currency,
                    account_category: json.data().account_category,
                    account_balance_current: numeral(json.data().account_balance_current).format('0,0.00')
                  }
                  dataaccount.push(dupdates)
                  totalaccount += parseInt(json.data().account_balance_current);
                }
                else{
                  balancenow=parseFloat(fx(parseInt(json.data().account_balance_current)).convert({ from:json.data().account_currency, to:tfbase })).toFixed(2);
                  totalaccount += parseInt(balancenow);
                  var dupdates={
                    account_lastused: json.data().account_lastused,
                    account_name: json.data().account_name,
                    account_currency: json.data().account_currency,
                    account_category: json.data().account_category,
                    account_balance_current: numeral(balancenow).format('0,0.00')
                  }
                  dataaccount.push(dupdates)
                }
              }
            }
          }
      })
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
    db.collection('category').get()
    .then((data) => {
      data.forEach(json => {
          if (json.data().username == username) {
            //moment.locale('id');
            //moment(json.data().account_lastused).format('L');
            datacategory.push(json.data());
          }
      })
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });

  //cashflow
  db.collection('income').orderBy('income_date','DESC').get()
    .then((data) => {
      console.log("Proses Income");
      data.forEach(json => {
          if (json.data().username == username) {
            db.collection('account').where("username",'==',username).where("account_name",'==',json.data().income_account).get()
            .then((data) => {
              data.forEach(jsonacc => {
                if(jsonacc.data().account_currency==tfbase){
                  totalincome += parseFloat(json.data().income_amount);
                  var dupdates={
                    income_date: json.data().income_date,
                    income_category: json.data().income_category,
                    income_account: json.data().income_account,
                    income_notes: json.data().income_notes,
                    income_amount: numeral(json.data().income_amount).format('0,0.00')
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
                    income_amount: numeral(balancenow).format('0,0.00')
                  }
                  dataincome.push(dupdates)
                }
              });
            })
            // dataincome.push(json.data())
            // totalincome += parseInt(json.data().income_amount);
          }
      })
      // res.render('report',{list : datas});
      db.collection('expense').orderBy('expense_date','DESC').get()
        .then((data) => {
          console.log("Proses Expense");
          data.forEach(json1 => {
              if (json1.data().username == username) {
                db.collection('account').where("username",'==',username).where("account_name",'==',json1.data().expense_account).get()
                .then((data) => {
                  data.forEach(jsonacc => {
                    if(jsonacc.data().account_currency==tfbase){
                      totalexpense += parseFloat(json1.data().expense_amount);
                      var dupdates={
                        expense_date: json1.data().expense_date,
                        expense_category: json1.data().expense_category,
                        expense_account: json1.data().expense_account,
                        expense_notes: json1.data().expense_notes,
                        expense_amount: numeral(json1.data().expense_amount).format('0,0.00')
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
                        expense_amount: numeral(balancenow).format('0,0.00')
                      }
                      dataexpense.push(dupdates)
                    }
                  });
                })
                // dataexpense.push(json.data())
                // totalexpense += parseInt(json.data().expense_amount);
              }
          })
          db.collection('transfer').orderBy('transfer_date','DESC').get()
            .then((data) => {
              console.log("Proses Transfer");
              data.forEach(json2 => {
                if (json2.data().username == username) {
                  console.log(json2.id, '=>', json2.data());
                  // datatransfer.push(json2.data())
                  // totaltransfer += parseInt(json2.data().transfer_amount);
                  db.collection('account').where("username",'==',username).where("account_name",'==',json2.data().transfer_dest).get()
                    .then((data) => {
                      data.forEach(jsonacc => {
                        console.log("Transfer")
                        console.log(jsonacc.data().account_currency)
                        console.log(tfbase);
                        if(jsonacc.data().account_currency==tfbase){
                          totaltransfer += parseFloat(json2.data().transfer_amount);
                          var dupdates={
                            transfer_date: json2.data().transfer_date,
                            transfer_category: json2.data().transfer_category,
                            transfer_src: json2.data().transfer_src,
                            transfer_dest: json2.data().transfer_dest,
                            transfer_notes: json2.data().transfer_notes,
                            transfer_amount: numeral(json2.data().transfer_amount).format('0,0.00')
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
                            transfer_amount: numeral(balancenow).format('0,0.00')
                          }
                          datatransfer.push(dupdates)
                          console.log(totaltransfer)
                        }
                      });

                  })
                  // datatransfer.push(json.data())
                  // totaltransfer += parseInt(json.data().transfer_amount);
                }
              })
              function report(){
                console.log("Masuk");
                var before=moment().subtract(7, 'days').format('L');
                //var beforef=moment(before).format('L');
                rangedate=before+" - "+moment().format('MM/DD/YYYY');
                console.log(rangedate);
                //res.render('report',{username:username, listaccount : dataaccount, listincome : dataincome, listexpense : dataexpense, listtransfer : datatransfer, totalAccount : totalaccount, totalIncome : totalincome, totalExpense : totalexpense, totalTransfer : totaltransfer});
                console.log("\n"+totaltransfer);
                res.render('report',{
                  id:1,
                  username:username, 
                  symbol:symbol,
                  selectofacc:accs, 
                  selectcategory:category,
                  selectacc:"Select All Account",
                  selecttype:"Select All Type",
                  rangedate:rangedate,
                  listaccount : dataaccount, 
                  listofaccount : datalistaccount,
                  listcategory : datacategory, 
                  listincome : dataincome, 
                  listexpense : dataexpense, 
                  listtransfer : datatransfer, 
                  totalAccount : numeral(totalaccount).format('0,0.00'), 
                  totalIncome : numeral(totalincome).format('0,0.00'), 
                  totalExpense : numeral(totalexpense).format('0,0.00'), 
                  totalTransfer : numeral(totaltransfer).format('0,0.00')});
              }
              setTimeout(report,3000);
              // var before=moment().subtract(7, 'days').calendar();
              // var beforef=moment(before).format('L');
              // rangedate=moment(beforef).format('MM/DD/YYYY')+" - "+moment().format('MM/DD/YYYY');
              // console.log(rangedate);
              // res.render('report',{
              //   id:1,
              //   username:username,
              //   symbol:symbol,
              //   selectofacc:accs, 
              //   selectcategory:category,
              //   selectacc:"Select All Account",
              //   selecttype:"Select All Type",
              //   rangedate:rangedate,
              //   listaccount : dataaccount, 
              //   listofaccount:datalistaccount, 
              //   listcategory : datacategory, 
              //   listincome : dataincome, 
              //   listexpense : dataexpense, 
              //   listtransfer : datatransfer, 
              //   totalAccount : numeral(totalaccount).format('0,0.00'), 
              //   totalIncome : totalincome, 
              //   totalExpense : totalexpense, 
              //   totalTransfer : totaltransfer});
            })
            .catch((err) => {
              console.log('Error getting documents', err);
            });
        })
        .catch((err) => {
          console.log('Error getting documents', err);
        });
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
})

router.post('/reportfilter2',(req,res)=>{
  var totalincome = 0;
  var totalexpense = 0;
  var totaltransfer = 0;
  var totalaccount = 0;
  var dataincome = []
  var dataexpense = []
  var datatransfer = []
  var dataaccount = []
  var datacategory = []
  var username = req.session.userName;
  var accs=req.body.name;
  var type=req.body.type;
  var from=req.body.date.substring(0,10);
  var to=req.body.date.substring(14,24);
  var fromdate=moment(from).format('YYYY-MM-DD');
  var todate=moment(to).format('YYYY-MM-DD');
  var rangedate;
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
  var balancenow;
  db.collection('account').orderBy('account_lastused','DESC').get()
    .then((data) => {
      data.forEach(json => {
          if (json.data().username == username) {
            if(json.data().account_currency==tfbase){
              var dupdates={
                account_lastused: json.data().account_lastused,
                account_name: json.data().account_name,
                account_currency: json.data().account_currency,
                account_category: json.data().account_category,
                account_balance_current: numeral(json.data().account_balance_current).format('0,0.00')
              }
              dataaccount.push(dupdates)
              totalaccount += parseFloat(json.data().account_balance_current);
            }
            else{
              balancenow=parseFloat(fx(parseInt(json.data().account_balance_current)).convert({ from:json.data().account_currency, to:tfbase })).toFixed(2);
              totalaccount += parseFloat(balancenow);
              var dupdates={
                account_lastused: json.data().account_lastused,
                account_name: json.data().account_name,
                account_currency: json.data().account_currency,
                account_category: json.data().account_category,
                account_balance_current: numeral(balancenow).format('0,0.00')
              }
              dataaccount.push(dupdates)
            }
          }
      })
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
    db.collection('category').get()
    .then((data) => {
      data.forEach(json => {
          if (json.data().username == username) {
            //moment.locale('id');
            //moment(json.data().account_lastused).format('L');
            datacategory.push(json.data());
          }
      })
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
  //cashflow
  db.collection('income').orderBy('income_date','DESC').get()
    .then((data) => {
      console.log("Proses Income");
      data.forEach(json => {
          if (json.data().username == username) {
            moment.locale('id');
            var temp=moment(json.data().income_date,'DD/MM/YYYY').format('MM/DD/YYYY');
            var indate=moment(temp).format('YYYY-MM-DD');
            console.log(indate);
            console.log(fromdate);
            console.log(todate);
            if(moment(fromdate).isBefore(indate, 'day') || moment(fromdate).isSame(indate, 'day')){
              if(moment(todate).isAfter(indate, 'day') || moment(todate).isSame(indate, 'day')){
                if(accs=='All'){
                  db.collection('account').where("username",'==',username).where("account_name",'==',json.data().income_account).get()
                  .then((data) => {
                    data.forEach(jsonacc => {
                      if(jsonacc.data().account_currency==tfbase){
                        totalincome += parseFloat(json.data().income_amount);
                        var dupdates={
                          income_date: json.data().income_date,
                          income_category: json.data().income_category,
                          income_account: json.data().income_account,
                          income_notes: json.data().income_notes,
                          income_amount: numeral(json.data().income_amount).format('0,0.00')
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
                          income_amount: numeral(balancenow).format('0,0.00')
                        }
                        dataincome.push(dupdates)
                      }
                    });
                  })
                }
                else if(json.data().income_account==accs){
                  db.collection('account').where("username",'==',username).where("account_name",'==',json.data().income_account).get()
                  .then((data) => {
                    data.forEach(jsonacc => {
                      if(jsonacc.data().account_currency==tfbase){
                        totalincome += parseFloat(json.data().income_amount);
                        var dupdates={
                          income_date: json.data().income_date,
                          income_category: json.data().income_category,
                          income_account: json.data().income_account,
                          income_notes: json.data().income_notes,
                          income_amount: numeral(json.data().income_amount).format('0,0.00')
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
                          income_amount: numeral(balancenow).format('0,0.00')
                        }
                        dataincome.push(dupdates)
                      }
                    });
                  })
                }
              }
            }
          }
      })
      // res.render('report',{list : datas});
      db.collection('expense').orderBy('expense_date','DESC').get()
        .then((data) => {
          console.log("Proses Expense");
          data.forEach(json1 => {
              if (json1.data().username == username) {
                moment.locale('id');
                var temp=moment(json1.data().expense_date,'DD/MM/YYYY').format('MM/DD/YYYY');
                var exdate=moment(temp).format('YYYY-MM-DD');
                console.log(exdate);
                console.log(fromdate);
                console.log(todate);
                if(moment(fromdate).isBefore(exdate, 'day') || moment(fromdate).isSame(exdate, 'day')){
                  if(moment(todate).isAfter(exdate, 'day') || moment(todate).isSame(exdate, 'day') ){
                    if(accs=='All'){
                      db.collection('account').where("username",'==',username).where("account_name",'==',json1.data().expense_account).get()
                      .then((data) => {
                        data.forEach(jsonacc => {
                          if(jsonacc.data().account_currency==tfbase){
                            totalexpense += parseFloat(json1.data().expense_amount);
                            var dupdates={
                              expense_date: json1.data().expense_date,
                              expense_category: json1.data().expense_category,
                              expense_account: json1.data().expense_account,
                              expense_notes: json1.data().expense_notes,
                              expense_amount: numeral(json1.data().expense_amount).format('0,0.00')
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
                              expense_amount: numeral(balancenow).format('0,0.00')
                            }
                            dataexpense.push(dupdates)
                          }
                        });
                      })
                    }
                    else if(json1.data().expense_account==accs){
                      db.collection('account').where("username",'==',username).where("account_name",'==',json1.data().expense_account).get()
                      .then((data) => {
                        data.forEach(jsonacc => {
                          if(jsonacc.data().account_currency==tfbase){
                            totalexpense += parseFloat(json1.data().expense_amount);
                            var dupdates={
                              expense_date: json1.data().expense_date,
                              expense_category: json1.data().expense_category,
                              expense_account: json1.data().expense_account,
                              expense_notes: json1.data().expense_notes,
                              expense_amount: numeral(json1.data().expense_amount).format('0,0.00')
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
                              expense_amount: numeral(balancenow).format('0,0.00')
                            }
                            dataexpense.push(dupdates)
                          }
                        });
                      })
                    }
                  }
                }
              }
          })
          db.collection('transfer').orderBy('transfer_date','DESC').get()
            .then((data) => {
              console.log("Proses Transfer");
              data.forEach(json2 => {
                if (json2.data().username == username) {
                  moment.locale('id');
                  var temp=moment(json2.data().transfer_date,'DD/MM/YYYY').format('MM/DD/YYYY');
                  var tfdate=moment(temp).format('YYYY-MM-DD');
                  console.log(tfdate);
                  console.log(fromdate);
                  console.log(todate);
                  if(moment(fromdate).isBefore(tfdate, 'day') || moment(fromdate).isSame(tfdate, 'day')){
                    if(moment(todate).isAfter(tfdate, 'day') || moment(todate).isSame(tfdate, 'day')){
                      if(accs=='All'){
                        console.log(json2.id, '=>', json2.data());
                        // datatransfer.push(json2.data())
                        // totaltransfer += parseInt(json2.data().transfer_amount);
                        db.collection('account').where("username",'==',username).where("account_name",'==',json2.data().transfer_dest).get()
                          .then((data) => {
                            data.forEach(jsonacc => {
                              console.log("Transfer")
                              console.log(jsonacc.data().account_currency)
                              console.log(tfbase);
                              if(jsonacc.data().account_currency==tfbase){
                                totaltransfer += parseFloat(json2.data().transfer_amount);
                                var dupdates={
                                  transfer_date: json2.data().transfer_date,
                                  transfer_category: json2.data().transfer_category,
                                  transfer_src: json2.data().transfer_src,
                                  transfer_dest: json2.data().transfer_dest,
                                  transfer_notes: json2.data().transfer_notes,
                                  transfer_amount: numeral(json2.data().transfer_amount).format('0,0.00')
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
                                  transfer_amount: numeral(balancenow).format('0,0.00')
                                }
                                datatransfer.push(dupdates)
                                console.log(totaltransfer)
                              }
                            });

                        })
                      }
                      else if(json2.data().transfer_src==accs || json2.data().transfer_dest==accs){
                        console.log(json2.id, '=>', json2.data());
                        // datatransfer.push(json2.data())
                        // totaltransfer += parseInt(json2.data().transfer_amount);
                        db.collection('account').where("username",'==',username).where("account_name",'==',json2.data().transfer_dest).get()
                          .then((data) => {
                            data.forEach(jsonacc => {
                              console.log("Transfer")
                              console.log(jsonacc.data().account_currency)
                              console.log(tfbase);
                              if(jsonacc.data().account_currency==tfbase){
                                totaltransfer += parseFloat(json2.data().transfer_amount);
                                var dupdates={
                                  transfer_date: json2.data().transfer_date,
                                  transfer_category: json2.data().transfer_category,
                                  transfer_src: json2.data().transfer_src,
                                  transfer_dest: json2.data().transfer_dest,
                                  transfer_notes: json2.data().transfer_notes,
                                  transfer_amount: numeral(json2.data().transfer_amount).format('0,0.00')
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
                                  transfer_amount: numeral(balancenow).format('0,0.00')
                                }
                                datatransfer.push(dupdates)
                                console.log(totaltransfer)
                              }
                            });

                        })
                        // datatransfer.push(json.data())
                        // totaltransfer += parseInt(json.data().transfer_amount);
                      }
                    }
                  }
                }
              })
              function reportfilter2(){
                if(type=='Income'){
                  totalexpense = 0;
                  totaltransfer = 0;
                  dataexpense = []
                  datatransfer = []
                  console.log("1");
                }
                else if(type=='Expense'){
                  totalincome = 0;
                  totaltransfer = 0;
                  dataincome = []
                  datatransfer = []
                  console.log("2");
                }
                else if(type=='Income-Expense'){
                  totaltransfer = 0;
                  datatransfer = []
                  console.log("3");
                }
                else if(type=='Transfer'){
                  totalincome = 0;
                  totalexpense = 0;
                  dataincome = []
                  dataexpense = []
                  console.log("4");
                }
                else{
                  console.log("Type All");
                }
                rangedate=moment(fromdate).format('MM/DD/YYYY')+" - "+moment(todate).format('MM/DD/YYYY');
                console.log(rangedate);
                res.render('report',{
                  id:2,
                  username:username,
                  symbol:symbol,
                  selectofaccs:"Select All Account",
                  selectcategory:"Select All Account",
                  selectacc:accs,
                  selecttype:type,
                  rangedate:rangedate,
                  listaccount : dataaccount,
                  listofaccount:dataaccount,  
                  listcategory : datacategory, 
                  listincome : dataincome, 
                  listexpense : dataexpense, 
                  listtransfer : datatransfer, 
                  totalAccount : totalaccount, 
                  totalIncome : totalincome, 
                  totalExpense : totalexpense, 
                  totalTransfer : totaltransfer});
                }
                setTimeout(reportfilter2,3000);

              })
            
            /*
                id:1,
                username:username,
                selectacc1:accs, 
                selectcategory:category,
                selectacc:"Select Account Name",
                selecttype:"Select Type Cash Flow",
                rangedate:rangedate,
                listaccount : dataaccount, 
                listofaccount:datalistaccount, 
                listcategory : datacategory, 
                listincome : dataincome, 
                listexpense : dataexpense, 
                listtransfer : datatransfer, 
                totalAccount : totalaccount, 
                totalIncome : totalincome, 
                totalExpense : totalexpense, 
                totalTransfer : totaltransfer*/
            .catch((err) => {
              console.log('Error getting documents', err);
            });
        })
        .catch((err) => {
          console.log('Error getting documents', err);
        });
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
})

module.exports = router
