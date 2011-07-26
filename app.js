
/**
 * Module dependencies.
 */

var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , sio = require('socket.io')

/**
 * Create app.
 */

app = express.createServer(
    express.bodyParser()
  , stylus.middleware({ src: __dirname + '/public/', compile: css })
  , express.static('public')
);

/**
 * Stylus compiler
 */

function css (str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib())
    .import('nib');
};

/**
 * Configure app.
 */

app.configure(function () {
  app.set('views', __dirname);
  app.set('view engine', 'jade');
});

/**
 * Development configuration.
 */

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

/**
 * Production configuration.
 */

app.configure('production', function () {
  app.use(express.errorHandler());
});

/**
 * Index.
 */

app.get('/', function (req, res, next) {
  res.render('index');
});

/**
 * Admin.
 */

app.get('/admin', function (req, res, next) {
  res.render('admin');
});

/**
 * About.
 */

app.get('/about', function (req, res, next) {
  res.render('about');
});

/**
 * Add socket.io
 */

var io = sio.listen(app);

io.configure(function () {
  io.set('log level', 2);
});

io.sockets.on('connection', function (socket) {
  socket.on('admin', function () {
    socket.admin = true;
    socket.join('admins');
  });

  socket.on('user message', function (msg) {
    socket.broadcast.to('admins').emit('user message', socket.id, msg);
  });

  socket.on('admin message', function (id, msg) {
    io.sockets.socket(id).emit('admin message', msg);
  });

  socket.emit('ready', socket.id);

  socket.on('disconnect', function () {
    if (socket.admin) return;
    socket.broadcast.to('admins').emit('user disconnect', socket.id);
  });
});

/**
 * Listen.
 */

app.listen(3000, function (err) {
  if (err) throw err;

  console.log('   info  - listening on http://localhost:3000');
});
