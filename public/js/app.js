//Note: run with python -m SimpleHTTPServer to test

//Would it be better to npm the packages for ToneJS in and configure the package.json, 
// or just CDN, or leave files as is


//loading file with XMLHttpRequest
//to-do: what to do about more than one piece
//to-do: re-add sliders
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

//toneJS uses uses loose callbacks for sound
//JSON-like format for sound control


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

// If Safari, will need this line
var audioContext = new webkitAudioContext();


