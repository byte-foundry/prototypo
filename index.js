// var app = require('express')();
// var http = require('http').Server(app);
'use strict';
var io = require('socket.io')(9001);

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

// http.listen(3000, function(){
//   console.log('listening on *:3000');
// });

var five = require('johnny-five'),
    updates = {},
    sliderMap = {
      A: {
        0: ['midWidth', 0.2, 3.1],
        1: ['serifWidth', 0, 220],
        // courbure
        2: ['serifTerminalCurve', 0, 1.5],
        3: ['serifTerminal', -2.45, 1],
        // Ampleur de courbure
        4: ['serifCurve', 0, 6],
        // COurbure d'empattement
        5: ['serifRoundness', 0, 2],
        6: ['serifMedian', 0.2, 2],
        7: ['serifHeight', 0, 150],
        8: ['curviness', 0.1, 1.4],
        9: ['',0,100],
        10: ['slant', -5, 8]
      },
      B: {
        0: ['ascender', 50, 530],
        1: ['xHeight', 300, 960],
        2: ['axis', -35, 35],
        3: ['_contrast', -1, 0.9],
        4: ['crossbar', 0.8, 1.2],
        5: ['thickness', 4, 700],
        6: ['width', 0.5, 2.15],
        7: ['capDelta', 0, 620],
        8: ['aperture', 0.2, 1.9],
        9: ['opticThickness', 1, 2.1],
        10: ['descender', -450, 170]
      }
    },
    charMap = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Add ready event handlers to both boards.
[
  new five.Board({ id: 'A' }),
  new five.Board({ id: 'B' })
].forEach(function( board ) {

  board.on('ready', function() {

    console.log(board.id +  ' ready!' );

    Object.keys(sliderMap[board.id]).forEach(function(name) {
      var params = sliderMap[board.id][name],
        slider = new five.Sensor({
          pin: 'A' + name,
          board: board,
          threshold: 3
        });

        slider.scale(params.slice(1)).on('slide', function() {
          updates[params[0] || board.id + name] = this.value;
        });
    });

    if( board.id === 'A' ) {

      var BTNreset = new five.Button(12);

      BTNreset.on('down', function() {
        console.log('reset ok');
        io.emit('reset', { id: 'reset', value: true } );
      });
      BTNreset.on('up', function() {
        io.emit('reset', { id: 'reset', value: false } );
      });

      var BTNswitch = new five.Button(13);

      BTNswitch.on('down', function() {
        console.log('switch ok');
        io.emit('switch', { id: 'switch', value: true } );
      });
      BTNswitch.on('up', function() {
        io.emit('switch', { id: 'switch', value: false } );
      });

      var BTNexport = new five.Button(14);

      BTNexport.on('down', function() {
        console.log('export ok');
        io.emit('export', { id: 'export', value: true } );
      });
      BTNexport.on('up', function() {
        io.emit('export', { id: 'export', value: false } );
      });

      var slider = new five.Sensor({
          pin: 'A11',
          board: board,
          threshold: 1
        }),
        prevChar;

        slider.scale([0, charMap.length -1]).on('slide', function() {
          var currChar = charMap[Math.round(this.value)];
          if ( currChar === prevChar  ) {
            return;
          }

          console.log('switch char', currChar);
          io.emit('char', currChar);
          prevChar = currChar;
        });
    }

  });
});

setInterval(function() {
  if ( Object.keys(updates).length === 0 ) {
    return;
  }

  console.log(updates);
  io.emit('updates', updates);
  updates = {};

}, 100);


// twitter
console.log("socket ready");

var Twit = require('twit');
var fs = require('fs');

var T = new Twit({
    consumer_key:         'Dk7bwgP7DtklXP1OYcTCiLmxr',
    consumer_secret:      'ZpHuJzSCbR2alXOy2fhUF8Jxqn69Dv12ZbegA7bjgaXszL4qjx',
    access_token:         '3018634662-oMo12chFqnTU8mNnUAI23tUBCjcRSNkTYWa415h',
    access_token_secret:  'nJPD13ZzSdKpFLwoCzWVbhesNAIxpJpAIa9PMiX1BKFc1'
});

//tumblr
var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: 'ErkJ5JhnQ40TqiF7bzcHkn2Tj0gN9ytswQMBNyOa1kwA2HpYkE',
  consumer_secret: 'jRcVLzMyRUeuuCse5imDwd4bguwh8vkL9C9u2wb4p5XTnpU4VB',
  token: 'z9m4bJyMdl4023honXXgy6F1csc88MGh7ywkanbmSsZWiYh1cg',
  token_secret: '16fTFcIoeUBucs3WoYeX3s9wWCG1q1ZtgXUBrrpdMX93HvKszQ'
});

io.sockets.on('connection', function (socket) {
    socket.on('autotweet', function(obj) {

        var b64content = obj.img;

        // twitter post
        // first we must post the media to Twitter
        T.post('media/upload', { media: obj.img.split(',')[1] }, function (err, data, response) {
            // now we can reference the media and post a tweet (media will attach to the tweet)
            var mediaIdStr = data.media_id_string;
            var params = { status: obj.hashtag + ' ' + obj.url, media_ids: [mediaIdStr] };

            T.post('statuses/update', params, function (err, data, response) {
                // console.log(data);
            });
        });

        // tumblr post
        var options = {
            title: '#' + obj.id,
            body: '<img src="' + obj.img + '"/><br/><br/><p><a target="_blank" style="font-size:24px; font-weight: bold;" href="https://dl.dropboxusercontent.com/u/3400076/biennale/' + obj.id + '.otf">Download the font</a></p><p><a href="http://www.prototypo.io/#win">Get a chance to access to the dev version by subscribing to our newsletter.<br/>Each week, we pick randomly 2 subscribers!    </a></p><p>    <a href="http://www.prototypo.io/support.html">Support an open-source project!</a><a style="float:right; color: #ff725e;" href="http://www.prototypo.io"><b>More about Prototypo</b></a></p>'
        };

        client.text('designprototypo.tumblr.com', options, function (response) {});

    });
});










