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
          console.log("slide " + i + " of " + board.id + " > ", this.value);
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






