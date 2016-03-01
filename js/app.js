var audioClip = document.getElementById("audioClip"); 
var audioVolume = document.getElementById("audioVolume");
var playButton = document.getElementById("playPauseButton");

// binds audio volume to slider input
function slideVolume() {
    audioClip.volume = audioVolume.value;
}

// button that lets you play or pause the audio
function playPause() {
    if (audioClip.paused) {
    	audioClip.play();   
    } else {
        audioClip.pause();
    }
}

//button text swaps when pressed
function swapText() {
    if (playButton.value === "Pause") {
    	playButton.value = "Play";
    }
    else {
    	playButton.value = "Pause";
    }
}

// On input change, number can't go below a range
//but why write in JS when you can min max in HTML5?
// function handleChange(input) {
// 	if (input.value < 0) input.value = 0;
//     if (input.value > 10) input.value = 10;
// }
