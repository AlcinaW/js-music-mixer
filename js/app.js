var audioClip = document.getElementById("audioClip"); 
var audioVolume = document.getElementById("audioVolume");

// binds audio volume to slider input
function slideVolume() {
    audioClip.volume = audioVolume.value;
}


// On input change, number can't go below a range
//but why write in JS when you can min max in HTML5?
// function handleChange(input) {
// 	if (input.value < 0) input.value = 0;
//     if (input.value > 10) input.value = 10;
// }
