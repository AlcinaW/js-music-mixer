var music = document.getElementById("myAudio"); 

function startLoop() {
	music.loop = true; 
	music.load();
}

function stopLoop() {
	music.loop = false; 
	music.load();
}