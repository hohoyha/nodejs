var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var multer = require('multer');
var mysql = require('mysql');

var _storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
});

var upload = multer({storage: _storage });

var connection = mysql.createConnection({
  host     : 'localhost',
  port     : 3308,
  user     : 'root',
  password : '111111',
  database : 'o2'
});

connection.connect(function(err) {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
});

var app = express();
app.locals.pretty = true;
app.set('views', './views_mysql');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/user', express.static('uploads'));

app.listen(3000, function() {
    console.log("Connected, 3000 port");
});

app.get('/upload', function(req, res){
    res.render('upload');
});

app.post('/upload', upload.single('userfile'), function(req, res){
    console.log(req.file);
    res.send('Uploaded: ' + req.file.filename);
});

app.get('/topic/add', function(req, res){
    var sql = 'SELECT id, title from topic';

       connection.query(sql, function(err, topics, fields){
        if(err)
        {
            console.log('err');
            res.status(500).send('Internal Server Error');   
        }  
        else
        {
            res.render('add', {topics:topics});
        }

    });
});

app.post('/topic/add', function(req, res){
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;

    var sql = 'insert into topic (title, description, author) values(?, ?, ?)';

    connection.query(sql, [title, description, author], function(err, results,  fields) 
    {
        if(err) 
        {
             console.log('err');
            res.status(500).send('Internal Server Error');         
        }else{
            res.redirect('/topic/'+ results.insertId);
        }
    });
});

app.post('/topic', function(req, res){
    var title = req.body.title;
    var description = req.body.description;
    fs.writeFile('data/' +title, description, function(err, data){
        if(err){
            console.log('err');
            res.status(500).send('Internal Server Error');
        }
       
        res.redirect('/topic/'+title);
    });
});

app.get('/topic/:id/delete', function(req, res){
    var sql = 'select id, title from topic';
    var id = req.params.id;
    connection.query(sql, function(err, topics, fields){
        var sql = 'select * from topic where id=?';
        connection.query(sql, [id], function(err, topic, fields){
            if(err)
            {
              console.log('err');
              res.status(500).send('Internal Server Error');   
            }
            else
            {
                if(topic.length === 0){
                    console.log('err');
                    res.status(500).send('Internal Server Error');  
                }else{
                    res.render('delete', {topics:topics, topic:topic[0]});
                }
            }     
        }); 
    });
 
    var sql = 'delete from topic where id= ?';
});

app.post('/topic/:id/delete', function(req, res){
    var id = req.params.id;
    var sql = 'delete from topic where id=?';
    connection.query(sql, [id], function(err, results, fields){
        res.redirect('/topic/');        
    });
});

app.get(['/topic','/topic/:id'], function(req, res){
      
       var sql = 'SELECT id, title from topic';

       connection.query(sql, function(err, topics, fields){
          if(err)
          {
              console.log('err');
              res.status(500).send('Internal Server Error');   
          }  
          else
          {
                var id = req.params.id;
                if(id)
                {
                    var sql = 'Select * from topic where id=?';
                    connection.query(sql, [id], function(err, topic, fields){
                        if(err)
                        {
                            console.log('err');
                            res.status(500).send('Internal Server Error');   
                        }  
                        else
                        {
                            res.render('view', {topics:topics, topic:topic[0]});   
                        }
                    });
                }
                else{
                    res.render('view', {topics:topics});   
                }  
          }
       });
});

app.get(['/topic/:id/edit'], function(req, res){
      
       var sql = 'SELECT id, title from topic';

       connection.query(sql, function(err, topics, fields){
          if(err)
          {
              console.log('err');
              res.status(500).send('Internal Server Error');   
          }  
          else
          {
                var id = req.params.id;
                if(id)
                {
                    var sql = 'Select * from topic where id=?';
                    connection.query(sql, [id], function(err, topic, fields){
                        if(err)
                        {
                            console.log('err');
                            res.status(500).send('Internal Server Error');   
                        }  
                        else
                        {
                            res.render('edit', {topics:topics, topic:topic[0]});   
                        }
                    });
                }
                else{
                      console.log('err');
                      res.status(500).send('Internal Server Error');   
                }  
          }
       });
});

app.post(['/topic/:id/edit'], function(req, res){
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var id = req.params.id;
    
    var sql = 'Update topic set title=?, description=?, author=? where id=?';
    connection.query(sql, [title, description, author, id], 
    function(err, results, fields ) {
        if(err)
        {
            console.log(err);
            res.status(500).send('Internal Server Error');   
        }
        else{
            res.redirect('/topic/'+id);
        }

    });
});
