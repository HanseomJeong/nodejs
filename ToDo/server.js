const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({enxtended : true}));
app.set('view engine', 'ejs');

// const MongoClient = require('mongodb').MongoClient;


const MongoClient = require('mongodb').MongoClient;

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
    res.sendFile(__dirname + '/index.html')
});

app.get('/write', (req, res) => {
    res.sendFile(__dirname + '/write.html')
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