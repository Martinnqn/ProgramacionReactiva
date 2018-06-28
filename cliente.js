window.addEventListener("load", function(event) {

	var status = document.getElementById("status");
	var url = document.getElementById("url");
	var open = document.getElementById("open");
	var close = document.getElementById("close");
	var sendMessage = document.getElementById("sendMessage");
	var sendUserName = document.getElementById("sendUserName");
	var message = document.getElementById("message");
	var socket;
	status.textContent = "Desconectado";
	var page = document.createElement('a');
	page.href = window.location.href;
	url.value = "ws://" + page.hostname + ":8080";
	close.disabled = true;
	sendMessage.disabled = true;
	sendUserName.disabled = true;
	message.disabled = true;
	chat.disabled = true;
	// Create a new connection when the Connect button is clicked              
	open.addEventListener("click", function(event) {
		open.disabled = true;
		socket = new WebSocket(url.value + "/" + userName.value, "echo-protocol");
		socket.addEventListener("open", function(event) {
			close.disabled = false;
			sendUserName.disabled = false;
			sendMessage.disabled = false;
			message.disabled = false;
			chat.disabled = false;
			status.textContent = "Conectado";
			status.style.color = "green";
		});

		// Display messages received from the server
		socket.addEventListener("message", function(event) {
			var chat = document.getElementById("chat")
			chat.value = chat.value + "\n" + event.data;
			chat.scrollTop = chat.scrollHeight;
		});

		// Display any errors that occur
		socket.addEventListener("error", function(event) {
			message.textContent = "Error: " + event;
		});

		socket.addEventListener("close", function(event) {
			open.disabled = false;
			status.textContent = "Desconectado";
			status.style.color = "gray";
		});

	});

	// Close the connection when the Disconnect button is clicked          
	close.addEventListener("click", function(event) {
		close.disabled = true;
		sendUserName.disabled = true;
		sendMessage.disabled = true;
		message.disabled = true;
		chat.disabled = true;
		open.disabled = false;
		message.value = "";
		chat.value = "Conversación...";
		socket.close();
	});

	// sendMessage text to the server when the sendMessage button is clicked          
	sendMessage.addEventListener("click", function(event) {
		if (message.value != "") {
			var msg = message.value;
			socket.send("msg" + msg);
			message.value = "";
		}
	});

	message.addEventListener("keydown", function(event) {
		if (event.keyCode === 13 && !event.shiftKey) {
			event.preventDefault();
			sendMessage.click();
		}
	});

	//sendUserName text to the server when the sendUserName button is clicked          
	sendUserName.addEventListener("click", function(event) {
		var msg = document.getElementById("userName").value;
		if (msg != "") {
			socket.send("name" + msg);
		}
	});

	userName.addEventListener("keydown", function(event) {
		if (event.keyCode === 13 && !event.shiftKey) {
			event.preventDefault();
			sendUserName.click();
		}
	});

});