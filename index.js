// var app = require('express')();
// var http = require('http').Server(app);
var io = require('socket.io')(9001);

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

// http.listen(3000, function(){
//   console.log('listening on *:3000');
// });

var five = require("johnny-five"),
    boards, 
    nbSliders = 12;

boards = [
  new five.Board({ id: "A" }),
  new five.Board({ id: "B" })
];


// Add ready event handlers to both boards.
boards.forEach(function( board ) {
  board.on("ready", function() {

    console.log(board.id +  " ready!" );

    for (var i = 0; i < nbSliders; i++) {
      (function(i) {
        // console.log(i);
        var slider = new five.Sensor({
          pin: "A" + i,
          board: board,
          threshold: 2
        });


        slider.scale([0, 100]).on("slide", function() {
          io.emit('update', { id: board.id + '-' + i, value: this.value } );
          // console.log("slide " + i + " of " + board.id + " > ", this.value);
        });
      })(i);
    }

    if( board.id == 'A' ) {

      BTNreset = new five.Button(12);

      BTNreset.on("down", function() {
        console.log("reset ok");
        io.emit('reset', { id: 'reset', value: true } );
      });
      BTNreset.on("up", function() {
        io.emit('reset', { id: 'reset', value: false } );
      });

      BTNswitch = new five.Button(13);

      BTNswitch.on("down", function() {
        console.log("switch ok");
        io.emit('switch', { id: 'switch', value: true } );
      });
      BTNswitch.on("up", function() {
        io.emit('switch', { id: 'switch', value: false } );
      });

      BTNexport = new five.Button(14);

      BTNexport.on("down", function() {
        console.log("export ok");
        io.emit('export', { id: 'export', value: true } );
      });
      BTNexport.on("up", function() {
        io.emit('export', { id: 'export', value: false } );
      });

    }

  });
});


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










