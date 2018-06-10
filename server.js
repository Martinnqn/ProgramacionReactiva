var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
	console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});

server.listen(8080, function() {
	console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
	httpServer: server,
	// You should not use autoAcceptConnections for production
	// applications, as it defeats all standard cross-origin protection
	// facilities built into the protocol and the browser. You should
	// *always* verify the connection's origin and decide whether or not
	// to accept it.
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
	// put logic here to detect whether the specified origin is allowed.
	return true;
}

//guardamos los clientes en un arreglo. Esta variable es global
var clientes = [ ];
var cantUsers = 0;

wsServer.on('request', function(request) {
	if (!originIsAllowed(request.origin)) {	// Make sure we only accept requests from an allowed origin
	request.reject();	console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
	return;
	}

	var connection = request.accept('echo-protocol', request.origin);
	console.log((new Date()) + ' Connection accepted.');

	//si la conexion es aceptada agregamos el cliente a la lista de clientes
	clientes.push(connection);
	var userName = "Usuario"+cantUsers;
	connection.id = cantUsers; //agregar un id unico al cliente para identificarlo univocamente.
	cantUsers++;
	//avisar en el chat la conexion del usuario
	for (var i=0; i < clientes.length; i++) {
       	clientes[i].sendUTF("El usuario "+userName+" entró a al chat.");
    }

	connection.on('message', function(message) {
		if (message.utf8Data.substr(0,3)=="msg"){
			//enviar el msj a todos los clientes
			var msg = message.utf8Data.substring(3);
			for (var i=0; i < clientes.length; i++) {
	        	clientes[i].sendUTF(userName+": "+msg);
	        }
    	}else if (message.utf8Data.substr(0,4)=="name"){
    		var name = message.utf8Data.substring(4);
    		//avisar del cambio de nombre al resto de los usuarios
    		for (var i=0; i < clientes.length; i++) {
        	clientes[i].sendUTF(userName+" cambió su nombre a: "+name);
        	}
        	userName = name;
    	}
	});

	connection.on('close', function(reasonCode, description) {
		//eliminar al cliente de la lista de clientes
		var nro;
		for (var i=0; i < clientes.length; i++) {
			if (connection.id==clientes[i].id){
				nro = i;
			}
       		clientes[i].sendUTF("El usuario "+userName+" se desconectó del chat.");
    	}
		clientes.splice(nro, 1);
		console.log((new Date()) + ' Peer ' + connection.remoteAddress +' '+connection.id+' disconnected.');
	});
});