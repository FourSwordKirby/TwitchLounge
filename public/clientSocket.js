
var socket = io();

/* The clientside can send messages back to the server the same way, via socket.emit and more */

$('form').submit(function(){
debugger;
socket.emit('chat message', $('#m').val());
$('#m').val('');
return false;
});
socket.on('chat message', function(msg){
$('#messages').append($('<li>').text(msg));
});