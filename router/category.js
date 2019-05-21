var core=require('../require.js')
core()
var db = admin.firestore();
router.get('/listcategory',function(req,res){
  var username = req.session.userName;
  var datacategory=[]
  var category=db.collection("category");
  category.where('username','==',username).get()
  .then(snapshot => {
    console.log("Masuk ke Category");
    snapshot.forEach(doc => {
      datacategory.push(doc.data());
    });
    res.status(200);
    res.json({datacategory:datacategory});

  })
  .catch(err => {
    console.log('Error getting documents', err);
    res.redirect('/');
  });
})

router.get('/',(req,res)=>{
  var username = req.session.userName;
  var category = db.collection('category');
  var datas = []
  var datacategory = ['cashicon','bank','lend','cheque','creditcard','food','electric','truck','health','ball',
  'house','water','clothes','movie','poker','car','accident','daily','tax','pet','computer','plane','gasoline',
  'garden','bitcoin','insurance','investment','fixing','medical','drink','other']
  category.where('username','==',username).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Masuk ke Category");
        console.log(doc.id, '=>', doc.data());
        datas.push(doc.data())
      });
      res.render('category',{list : datas, listcategory: datacategory, username:username});
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
})

router.post('/authcategory',(req,res)=>{
  var exist=false;
  
  // if(req.body.select_name=='0'){
  //   console.log('Wajib Pilih Kategori');
  //   res.end();
  // }
  // else{
  //   console.log("Anda berhasil login1");
  //   if(req.body.select_name=='other'){
  //     categoryname = req.body.catename;
  //   }
  //   else{
  //     categoryname = req.body.select_name;
  //   }
  //   console.log("Anda berhasil login2");

    //var categoryname = req.body.namecate;
    var categoryname = req.body.catename;
    var categorynum = req.body.categnums;
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
          //console.log("Anda berhasil login3"+categorynum+categoryname);
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

router.post('/editcategory',(req,res)=>{
  var exist=false;
  var categoryname= req.body.editcatename;
  
  // if(req.body.editselect_name=='other'){
  //   categoryname = req.body.editcatename;
  // }
  // else{
  //   categoryname = req.body.editselect_name;
  // }
  
  //var categoryname = req.body.namecate;
  var beforecategoryname = req.body.beforeeditcatename;
  var categorynum = req.body.editcategnums;
  console.log(categorynum);
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
        var dupdates={
          category_createddate: moment().format('LLL') ,
          category_image: categorynum,
          category_name: categoryname
        }
        category.where('username','==',username).where('category_name','==',beforecategoryname).get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              console.log("Update Category");
              db.collection('category').doc(doc.id).update(dupdates);
            });
            res.redirect('/category');
          })
        
      }
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });

  
})

router.post('/deletecategory',(req,res)=>{
  var beforecategoryname = req.body.beforedeletecatename;
  var username = req.session.userName;

  var category = db.collection('category');

  category.where('username','==',username).where('category_name','==',beforecategoryname).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log("Delete Category "+beforecategoryname);
        db.collection('category').doc(doc.id).delete();
      });
      res.redirect('/category');
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.redirect('/');
    });
  
  
})

module.exports = router
