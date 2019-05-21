var core=require('../require.js')
core()
var db = admin.firestore();
router.get('/',(req,res)=>{
  console.log("Masuk Home");
  // console.log(req.session.userName);
  if(req.session.userName!=null){
    var username = req.session.userName;
    var account = db.collection('account');
    var income = db.collection('income');
    var expense = db.collection('expense');
    var transfer = db.collection('transfer');
    var dataAccount = []
    var dataIncome = []
    var dataExpense = []
    var totalincome=0, totalexpense=0, totaltransfer=0; 
    account.orderBy("account_createdate","desc").get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          if(doc.data().username==username){
            if(doc.data().account_status=="1"){
              // console.log(doc.id, '=>', doc.data());
              dataAccount.push(doc.data());
            }
          }
        });
        income.where('username','==',username).get()
          .then(snapshot1 => {
            snapshot1.forEach(doc1 => {
              if(doc1.data().username==username){
                // console.log(doc1.id, '=>', doc1.data());
                dataIncome.push(doc1.data());
                totalincome+=parseInt(doc1.data().income_amount);
              }
            });
            expense.where('username','==',username).get()
              .then(snapshot2 => {
                snapshot2.forEach(doc2 => {
                  if(doc2.data().username==username){
                    // console.log(doc2.id, '=>', doc2.data());
                    dataExpense.push(doc2.data());
                    totalexpense+=parseInt(doc2.data().expense_amount);
                  }
                });
                transfer.where('username','==',username).get()
                  .then(snapshot1 => {
                    snapshot1.forEach(doc3 => {
                      totaltransfer+=parseInt(doc3.data().transfer_amount);
                    });

                // dataAccount.sort((a,b) => moment(b.account_createdate).format("YYYY-MM-DD") - moment(a.account_createdate).format("YYYY-MM-DD"));
                // dataIncome.sort((a,b) => moment(b.income_date).format("YYYY-MM-DD") - moment(a.income_date).format("YYYY-MM-DD"));
                // dataExpense.sort((a,b) => moment(b.expense_date).format("YYYY-MM-DD") - moment(a.expense_date).format("YYYY-MM-DD"));
                // console.log(dataAccount);
                // console.log(dataIncome);
                // console.log(dataExpense);
                    res.render('../views/home',{totalincome:"Rp "+numeral(totalincome).format('0,0.00'),
                      totalexpense:"Rp "+numeral(totalexpense).format('0,0.00'),
                      totaltransfer:"Rp "+numeral(totaltransfer).format('0,0.00'),
                      list : dataAccount, list1 : dataIncome, list2 : dataExpense, username : username});     
                })                                                                                                            
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
  }
  else{
    res.redirect('/')
  }
})
    
module.exports = router
