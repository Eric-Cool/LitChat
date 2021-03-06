var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var hat = require('hat')
var rack = hat.rack()

var routes = require('./routes/index');

//  mongoDB module
var mongo = require('mongodb')
var monk = require('monk')
var db = monk('localhost:27017/Users')
var app = express();

// 模板引擎配置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

//  用户登录
app.post('/login',function(req,res){
  var collection = db.get("userdata")
  var username = req.body.username
  var password = req.body.password

  collection.find({
    "username" : username
  },function(err,docs){
    if(docs==''||docs==null){
      console.log("用户名不存在!")
      res.send('用户名不存在')
      res.end()
    }else {
      if(docs[0].password == password){
      res.send(docs[0])
      res.end()
      }else {
        console.log("密码错误!")
        res.send('密码错误')
        res.end()
      }
    }
  })
})

//  注册用户
app.post('/inputData',function(req,res){

  var collection = db.get("userdata")
  var username = req.body.username
  var password = req.body.password
  collection.find({
    "username" : username
  },function(err,docs){
    if(docs==''||docs==null){
      var UID = rack()
      collection.insert({
        "username" : username,
        "password" : password,
        "UID" : UID,
        "admin" : 0,
        "ban" : 0 
      })
      res.send(username)
      res.end()
    } else {
      console.log("用户名已存在")
      res.send('用户名已存在')
      res.end()
    }
    //赋予用户“admin”管理员用户权限
    if(username == 'admin'){
      collection.update({'username':'admin'},{$set:{'admin':1}})
    }
  })
})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(80);
console.log('Server is running on port 80');

module.exports = app;
