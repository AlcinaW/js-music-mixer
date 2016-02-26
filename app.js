var audioClip = document.getElementById("audioClip"); 
var audioVolume = document.getElementbyId("audioVolume");

//Grabs slider value
var vol_input = document.getElementById('audio-vol-input');

console.log(vol_input);

function slideVolume() {
    var audioClip = document.getElementById("audioClip");
    audioClip.volume = document.getElementById("audioVolume").value;

}


// On input change, number can't go below a range
//but why write in JS when you can min max in HTML5?
// function handleChange(input) {
// 	if (input.value < 0) input.value = 0;
//     if (input.value > 10) input.value = 10;
// }

//Make volume == to what is in input field
music.volume = vol_input;
console.log (music.volume);
