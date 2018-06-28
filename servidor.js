var WebSocketServer = require('websocket').server;
var http = require('http');

//crea el objeto server que se pondra a la escucha
var server = http.createServer(function(request, response) {
	console.log((new Date()) + " Recibe conexion de " + request.url);
	response.writeHead(404);
	response.end();
});

//pone al servidor a escuchar en el puerto 8080
server.listen(8080, function() {
	console.log((new Date()) + " El servidor esta escuchando en el puerto 8080");
});

//crea el objeto ws
var wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

//funcion que verifica si un cliente esta restringido (no utilizado)
function originIsAllowed(origin) {
	//debido a que no se restringen clientes, no se realiza ningun tratamiento
	return true;
}

//guardamos los clientes en un arreglo
var clientes = [];
var cantUsers = 0;

wsServer.on("request", function(request) {
	//verifica si la conexion proviene de un cliente restringido
	if (!originIsAllowed(request.origin)) {
		//rechaza la conexion
		request.reject();
		console.log((new Date()) + " La conexion que proviene de " + request.origin + ' fue rechazada.');
		//sale del request
		return;
	}

	//acepta la conexion utilizando el protocolo echo-protocol
	var connection = request.accept('echo-protocol', request.origin);
	console.log((new Date()) + " La conexion que proviene de " + request.origin + " fue aceptada.");

	//agrega la nueva conexion aceptada al arreglo de clientes
	clientes.push(connection);
	//parsea el url del request para obtener el nombre de usuario
	var url = require('url').parse(request.httpRequest.url);
	var param = url.pathname.substring(1);
	var userName;
	//verifica si se envio un parametro con el nombre de usuario
	if (param != "") {
		//setea el nombre de usuario con el parametro enviado
		userName = param;
	} else {
		//setea un nombre de usuario generico
		userName = "Usuario" + cantUsers;
	}

	//agregar un id unico al cliente para identificarlo univocamente.
	connection.id = cantUsers;
	cantUsers++;

	//avisar en el chat de cada usuario la conexion del nuevo usuario
	for (var i = 0; i < clientes.length; i++) {
		clientes[i].sendUTF("El usuario " + userName + " entró a al chat.");
	}

	//evento cuando el cliente envia un mensaje al servidor
	connection.on("message", function(message) {
		//verifica que el mensaje provenga de un mensaje de chat
		if (message.utf8Data.substr(0, 3) == "msg") {
			//pasea para obtener el mensaje
			var msg = message.utf8Data.substring(3);
			//envia el mensaje de chat a todos los clientes
			for (var i = 0; i < clientes.length; i++) {
				clientes[i].sendUTF(userName + ": " + msg);
			}
			//verifica que el mensaje provenga de un cambio de nombre
		} else if (message.utf8Data.substr(0, 4) == "name") {
			//pasea para obtener el mensaje
			var name = message.utf8Data.substring(4);
			//evnia el mensaje de cambio de nombre a todos los clientes
			for (var i = 0; i < clientes.length; i++) {
				clientes[i].sendUTF(userName + " cambió su nombre a: " + name);
			}
			//cambia su nombre por el recibido
			userName = name;
		}
	});

	//evento cuando el cliente se desconecta del servidor
	connection.on("close", function(reasonCode, description) {
		var nroCliente;
		//busca al cliente en el arreglo y avisa a los demas de su desconexion
		for (var i = 0; i < clientes.length; i++) {
			if (connection.id == clientes[i].id) {
				nroCliente = i;
			}
			//envia el mensaje de desconexion al resto de los clientes
			clientes[i].sendUTF("El usuario " + userName + " se desconectó del chat.");
		}
		//elimina al cliente del arreglo de clientes
		clientes.splice(nroCliente, 1);
		console.log((new Date()) + " El cliente con id " + connection.id + ", nombre " + userName + " e ip " + connection.remoteAddress + " se ha desconectado.");
	});

});