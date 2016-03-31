//Note: run with python -m SimpleHTTPServer
//defaults to http://localhost:8000/


//loading file with XMLHttpRequest
var request = new XMLHttpRequest();
 
request.open('GET', '../media/Fly_Inverted_Past_a_Jenny.mp3', true);
request.responseType = 'arraybuffer';
 
request.onload = function () {
    var undecodedAudio = request.response;
 
    context.decodeAudioData(undecodedAudio, function (buffer) {
        // Create the AudioBufferSourceNode
        var sourceBuffer = context.createBufferSource();
 
        // Tell the AudioBufferSourceNode to use this AudioBuffer
        sourceBuffer.buffer = buffer;
        //connect source node to speakers
        sourceBuffer.connect(context.destination);
        //when? now
        sourceBuffer.start(context.currentTime);
    });
};
 
request.send();




//TEST generate sound in browser using web audio API for 3 seconds
// Create the audio context
var context = new AudioContext(),
    oscillator = context.createOscillator();

// Connect the oscillator to speakers
oscillator.connect(context.destination);

// Start the oscillator now
oscillator.start(context.currentTime);

// Stop the oscillator 3 seconds from now
oscillator.stop(context.currentTime + 3);

// If you're using Safari, you'll need to use this line instead
var audioContext = new webkitAudioContext();



// window.onload = init;
// var context;
// var bufferLoader;

// function init() {
//   context = new webkitAudioContext();

//   bufferLoader = new BufferLoader(
//     context,
//     [
//       '../media/The_Voyage.mp3',
//       '../media/Fly_Inverted_Past_a_Jenny.mp3',
//     ],
//     finishedLoading
//     );

//   bufferLoader.load();
// }

// function finishedLoading(bufferList) {
//   // Create two sources and play them both together.
//   var source1 = context.createBufferSource();
//   var source2 = context.createBufferSource();
//   source1.buffer = bufferList[0];
//   source2.buffer = bufferList[1];

//   source1.connect(context.destination);
//   source2.connect(context.destination);
//   source1.start(0);
//   source2.start(0);
// }



