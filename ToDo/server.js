const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
// const MongoClient = require('mongodb').MongoClient;


const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

var db = null;
MongoClient.connect('mongodb+srv://user:qwer1234@cluster0.nhxhy.mongodb.net/todoapp?retryWrites=true&w=majority', function(err, client){
    if (err) {return console.log(err)}

    db = client.db('todoapp');

    // //object 자료형 ({key: value})
    // db.collection('post').insertOne({name: 'john', age: 20}, function(err, res){
    //     console.log('saved');
    // })

    app.listen(8080, function(){
        console.log('listening on 8080')
    });

})


app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/write', (req, res) => {
    res.render('write.ejs');
});

app.post('/add', (req, res) => {
    res.redirect('/write')
    console.log(req.body.date)
    console.log(req.body.title)
    
    var totalCount = db.collection('counter').findOne({name: '게시물갯수'}, function(err, res){
        console.log(res.totalPost);
        var totalCount = res.totalPost;

        db.collection('post').insertOne({ _id : totalCount + 1, title: req.body.title, date: req.body.date}, function(err, res){
            console.log('saved');
            db.collection('counter').updateOne({name: '게시물갯수'}, { $inc : {totalPost: 1} }, function(err, res){
                if (err) return console.log(err)
            })
        })
    })
})

app.get('/list', (req, res) => {
    db.collection('post').find().toArray(function(err, result){
        console.log(result);
        res.render('list.ejs', { posts : result});
    });
})

app.delete('/delete', (req, response) => {
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, function(err, res){
        console.log('deleted');
        response.status(200).send({ message : 'success'});
    })
})

app.get('/detail/:id', (req, res) => {
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result){
        res.render('detail.ejs', { data : result})
    })
})

app.get('/edit/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result){
        res.render('edit.ejs', { data : result})
    })
})

app.put('/edit', function(req, res){
    console.log(req.body)
    db.collection('post').updateOne({_id: parseInt(req.body.id)}, { $set : {title: req.body.title, date: req.body.date}}, function(err, result){
        res.redirect('/list')
    })
})

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : 'secretcode', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
//app.use(미들웨어)
//미들웨어 : 요청 - 응답 중간에 실행되는 코드

app.get('/login', function(req, res){
    res.render('login.ejs')
})
app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), function(req, res){
    res.redirect('/')
})

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (input_id, input_pw, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: input_id }, function (err, res) {
      if (err) return done(err)
  
      if (!res) return done(null, false, { message: '존재하지않는 아이디요' })
      if (input_pw == res.pw) {
        return done(null, res)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));

  //session 생성
passport.serializeUser(function(user, done){
    done(null, user.id)
});

//session 확인
passport.deserializeUser(function(id, done){
    done(null, {})
});
