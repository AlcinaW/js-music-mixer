window.onload = init;
var context;
var bufferLoader;

function init() {
  context = new webkitAudioContext();

  bufferLoader = new BufferLoader(
    context,
    [
      '../media/The_Voyage.mp3',
      '../media/Every_Step.mp3',
    ],
    finishedLoading
    );

  bufferLoader.load();
}

function finishedLoading(bufferList) {
  // Create two sources and play them both together.
  var source1 = context.createBufferSource();
  var source2 = context.createBufferSource();
  source1.buffer = bufferList[0];
  source2.buffer = bufferList[1];

  source1.connect(context.destination);
  source2.connect(context.destination);
  source1.start(0);
  source2.start(0);
}












// var audioClip = document.getElementById("audioClip"); 
// var audioVolume = document.getElementById("audioVolume");
// var playButton = document.getElementById("playPauseButton");

//volume test
// function outputUpdate(vol) {
//     document.querySelector('#audioVolume').value = vol;
// }

// binds audio volume to slider input
// function slideVolume() {
//     audioClip.volume = audioVolume.value;
// }

// button that lets you play or pause the audio
// function playPause() {
//     if (audioClip.paused) {
//     	audioClip.play();   
//     } else {
//         audioClip.pause();
//     }
// }

//button text swaps when pressed
// function swapText() {
//     if (playButton.value === "Pause") {
//     	playButton.value = "Play";
//     }
//     else {
//     	playButton.value = "Pause";
//     }
// }


