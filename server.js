var HTTPS_PORT = 10000;
var HTTPS_IP = '0.0.0.0';

var fs = require('fs');
var https = require('https');
var WebSocketServer = require('ws').Server;

// Yes, SSL is required
var serverConfig = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
};

// ----------------------------------------------------------------------------------------

// Create a server for the client html page
var handleRequest = function(request, response) {
    // Render the single client html file for any request the HTTP server receives
    console.log('request received: ' + request.url);

    if(request.url == '/index') {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(fs.readFileSync('index.html'));
    } else if(request.url == '/main.js') {
        response.writeHead(200, {'Content-Type': 'application/javascript'});
        response.end(fs.readFileSync('webapp/js/main.js'));
    }
    else if(request.url == '/adapter.js') {
        response.writeHead(200, {'Content-Type': 'application/javascript'});
        response.end(fs.readFileSync('webapp/js/adapter.js'));
    }
    else if(request.url == '/favicon.ico') {
        response.end(fs.readFileSync('favicon.ico'));
    }
};

var httpsServer = https.createServer(serverConfig, handleRequest);
httpsServer.listen(process.env.PORT || HTTPS_PORT);

// ----------------------------------------------------------------------------------------

// Create a server for handling websocket calls
var wss = new WebSocketServer({server: httpsServer});

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        // Broadcast any received message to all clients
        wss.broadcast(message);
    });
});

wss.broadcast = function(data) {
    for(var i in this.clients) {
        this.clients[i].send(data);
    }
};

console.log('Server running. Visit https://' + HTTPS_IP + ':' + HTTPS_PORT + '/index in Firefox/Chrome (note the HTTPS; there is no HTTP -> HTTPS redirect!)');
