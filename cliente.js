//evento al cargar la pagina
window.addEventListener("load", function(event) {

	//obtiene los elementos del formulario de chat
	var status = document.getElementById("status");
	var url = document.getElementById("url");
	var userName = document.getElementById("userName");
	var sendUserName = document.getElementById("sendUserName");
	var open = document.getElementById("open");
	var close = document.getElementById("close");
	var chat = document.getElementById("chat");
	var message = document.getElementById("message");
	var sendMessage = document.getElementById("sendMessage");
	//variable para almacenar el socket
	var socket;
	//pone el estado inicial de cada elemento de la interfaz
	status.textContent = "Desconectado";
	var page = document.createElement('a');
	page.href = window.location.href;
	//define la url del servidor como la hostname de la pagina y el puerto definido 8080 del ws
	url.value = "ws://" + page.hostname + ":8080";
	close.disabled = true;
	sendUserName.disabled = true;
	chat.disabled = true;
	message.disabled = true;
	sendMessage.disabled = true;

	//evento al presionar el boton de conectar         
	open.addEventListener("click", function(event) {
		//desabilita el boton para no permitir otra conexion simultanea
		open.disabled = true;
		//crea un socket con el servidor de ws con el protocolo echo-protocol 
		//y envia como parametro el nombre de usuario (puede estar vacio)
		socket = new WebSocket(url.value + "/" + userName.value, "echo-protocol");

		/*A CONTINUACION DEFINE LOS EVENTOS QUE TENDRA EL SOCKET CREADO*/

		//evento del socket cuando la conexion es establecida
		socket.addEventListener("open", function(event) {
			//habilita los elementos del formulario de chat
			sendUserName.disabled = false;
			close.disabled = false;
			chat.disabled = false;
			message.disabled = false;
			sendMessage.disabled = false;
			//indica el estado conectado en color verde
			status.textContent = "Conectado";
			status.style.color = "green";
		});

		//evento del socket cuando se recibe un mensaje del servidor
		socket.addEventListener("message", function(event) {
			//agrega al chat el mensaje recibido (formato = "user: mensaje")
			chat.value = chat.value + "\n" + event.data;
			//mueve el scroll del chat hasta el tope inferior
			chat.scrollTop = chat.scrollHeight;
		});

		//evento del socket cuando ocurre un error de conexion
		socket.addEventListener("error", function(event) {
			alert("Error al conectar con el servidor.");
		});

		//evento del socket cuando se cierra la conexion
		socket.addEventListener("close", function(event) {
			//habilita el boton para conectarse
			open.disabled = false;
			//indica el estado desconectado en color gris
			status.textContent = "Desconectado";
			status.style.color = "gray";
		});

	});

	//evento al presionar el boton de desconectar     
	close.addEventListener("click", function(event) {
		//deshabilita los elementos del formulario de chat
		sendUserName.disabled = true;
		close.disabled = true;
		chat.disabled = true;
		message.disabled = true;
		sendMessage.disabled = true;
		//reinicia los valores alamcenados en el chat y la casilla de mensaje
		message.value = "";
		chat.value = "Conversación...";
		//cierra el socket
		socket.close();
	});

	//evento al presionar el boton de enviar
	sendMessage.addEventListener("click", function(event) {
		//verifica que el mensaje no este vacio
		if (message.value != "") {
			//envia a el mensaje con el socket
			//utiliza la palabra msg para identificar que es un mensaje de chat
			socket.send("msg" + message.value);
			//borra el contenido de la casilla de mensaje
			message.value = "";
		}
	});

	//evento al presionar un tecla en la casilla de mensaje
	message.addEventListener("keydown", function(event) {
		//verifica si la tecla presionada fue ENTER y no se presiona SHIFT
		if (event.keyCode === 13 && !event.shiftKey) {
			//anula el enter que se escribiria
			event.preventDefault();
			//llama al evento de presionar sobre el boton de enviar
			sendMessage.click();
		}
	});

	//evento al presionar el boton de cambiar nombre
	sendUserName.addEventListener("click", function(event) {
		//verifica que el nombre no este vacio
		if (userName.value != "") {
			//envia a el nombre con el socket
			//utiliza la palabra name para identificar que es un nombre de usuario
			socket.send("name" + userName.value);
		}
	});

	//evento al presionar un tecla en la casilla de nombre
	userName.addEventListener("keydown", function(event) {
		//verifica si la tecla presionada fue ENTER y no se presiona SHIFT
		if (event.keyCode === 13 && !event.shiftKey) {
			//anula el enter que se escribiria
			event.preventDefault();
			//llama al evento de presionar sobre el boton de cambiar nombre
			sendUserName.click();
		}
	});

});