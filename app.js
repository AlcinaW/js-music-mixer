var vol_input = document.getElementById('audio-vol-input').value;

console.log(vol_input);


var music = document.getElementById("myAudio"); 

// On input change, number can't go below a range
function handleChange(input) {
	if (input.value < 0) input.value = 0;
    if (input.value > 10) input.value = 10;
}

//Make volume = to what is in input field
music.volume = vol_input;
console.log (music.volume);

//function startLoop() {
// 	music.loop = true; 
// 	music.load();
// }

// function stopLoop() {
// 	music.loop = false; 
// 	music.load();
// }

// music.volume = document.getElementById('audio-vol-display').innerHTML;