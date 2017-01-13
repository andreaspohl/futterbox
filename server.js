
// sensor is a reed relais activated by the closed barn door
// barn door is open, the red alarm led is blink, and
// the web page is turned red

// Loading modules
var http = require('http');
var fs = require('fs');
var path = require('path');
var b = require('bonescript');


// Create variables for GPIOs
var ledOut = "P9_12";
var sensorOut = "P9_14";
var sensorIn = "P9_16";

// Initialize the GPIOs
b.pinMode(ledOut, b.OUTPUT);
b.pinMode(sensorIn, b.INPUT);
b.pinMode(sensorOut, b.OUTPUT);

// Power up sensor
b.digitalWrite(sensorOut, b.HIGH);

// This variable is set when LED must blink
var blink = false;

// read sensor to initialize correctly
b.digitalRead(sensorIn, init);

function init(x) {
    blink = (x.value == b.LOW); // if sensor is closed, LED must blink
}

// Turn off LED
var isOn = false;
b.digitalWrite(ledOut, b.LOW);

// Initialize the server on port 8888
var server = http.createServer(function (req, res) {
    // requesting files
    var file = '.'+((req.url=='/')?'/index.html':req.url);
    var fileExtension = path.extname(file);
    var contentType = 'text/html';
    // Uncoment if you want to add css to your web page
    /*
    if(fileExtension == '.css'){
        contentType = 'text/css';
    }*/
    fs.exists(file, function(exists){
        if(exists){
            fs.readFile(file, function(error, content){
                if(!error){
                    // Page found, write content
                    res.writeHead(200,{'content-type':contentType});
                    res.end(content);
                }
            })
        }
        else{
            // Page not found
            res.writeHead(404);
            res.end('Page not found');
        }
    })
}).listen(8888);

// Loading socket io module
var io = require('socket.io').listen(server);

// When communication is established, attach interrupt

io.on('connection', function (socket) {
    
    b.attachInterrupt(sensorIn, true, b.CHANGE, function(x) {
    
        // on 'connection' x is undefined, because it was called by the server, not the interrupt
        if (x.value == undefined) {
            x.value = b.digitalRead(sensorIn);
        }

        // update web page
        socket.emit('button_event', ((x.value == b.HIGH) ? 'black' : 'red') );
        socket.broadcast.emit('button_event', ((x.value == b.HIGH) ? 'black' : 'red') );
        
        // set / reset led blinking
        blink = (x.value == b.LOW);
        
        console.log('Input changed to ' + x.value);
    });
});

setInterval(runLed, 100);

function runLed() {
    if (isOn) {
        b.digitalWrite(ledOut, b.LOW);
        isOn = false;
    } else if (!isOn && blink) {
        b.digitalWrite(ledOut, b.HIGH);
        isOn = true;
    }
}

// Displaying a console message for user feedback
server.listen(console.log("Server running at port 8888"));



