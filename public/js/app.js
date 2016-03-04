var audioClip = document.getElementById("audioClip"); 
var audioVolume = document.getElementById("audioVolume");
var playButton = document.getElementById("playPauseButton");

//volume test
function outputUpdate(vol) {
    document.querySelector('#audioVolume').value = vol;
}

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


