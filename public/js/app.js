//Note: run with python -m SimpleHTTPServer to test, not from file, or else won't work

//Would it be better to npm the packages for ToneJS in and configure the package.json, 
// or just CDN, or leave files as is


//loading file with XMLHttpRequest
//to-do: what to do about more than one piece of audio

// initializing a new context
//To-do: use below two var to create visualization (MDN example link version)


// LOADING AUDIO ONLY
//var analyser;

//var sampleBuffer;
//To-DO: change to camelcase, for UI buttons maybe rewrite
var audioContext = new(window.AudioContext || window.webkitAudioContext)(),
    filter = audioContext.createBiquadFilter(),

    //convolver = audioContext.createConvolver(),

    sampleURL = '../media/The_Voyage.mp3',
    sampleBuffer, sound, playButton = document.querySelector('.play'),

    // Create a gain node
    gainNode = audioContext.createGain(),

    analyser = audioContext.createAnalyser(),
    
    //depreciated, use script processor node
    //javascriptNode = audioContext.createScriptProcessor(2048, 1, 1),

    scriptProcessorNode = audioContext.createScriptProcessor(2048, 1, 1), 

    stopButton = document.querySelector('.stop'),
    loop = true,
    playbackSlider = document.querySelector('.playback-slider'),
    playbackRate = document.querySelector('.rate'),

    filterType = document.querySelector('.filtertype'),
    filterFreq = document.querySelector('.freq'),
    filterFreqSlider = document.querySelector('.filter-slider'),

    filterQ = document.querySelector('.filter-q-value'),
    filterQSlider = document.querySelector('.filter-q-slider'),

    filterGain = document.querySelector('.filter-gain-value'),
    filterGainSlider = document.querySelector('.filter-gain-slider'),
    
    gainValue = document.querySelector('.gain'), //for the volume

    gainSlider = document.querySelector('.gain-slider');   

// load sound
init();

function init() {
    loadSound(sampleURL);
}

playButton.onclick = function () {
    playSound();
};

stopButton.onclick = function () {
    stopSound();
};

playbackSlider.oninput = function () {
    changeRate(playbackSlider.value);
};

gainSlider.oninput = function () {
    changeGain(gainSlider.value);
};

// function to load sounds via AJAX
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        audioContext.decodeAudioData(request.response, function (buffer) {
            var soundLength = buffer.duration;
            sampleBuffer = buffer;
            playButton.disabled = false;
            playButton.innerHTML = 'Play';
        });
    };

    request.send();
}

// set our sound buffer, loop, and connect to destination
// connect each node to each other in a chain, and then connect to audioContext.destination!
//javascriptNode is decrepreciated, as is scriptProcessorNode, but there isn't much documentation on audio workers
function setupSound() {
    sound = audioContext.createBufferSource();
    sound.buffer = sampleBuffer;
    sound.loop = loop; //auto is false
    sound.playbackRate.value = playbackSlider.value;

    analyser.smoothingTimeConstant = 0.85, //0<->1. 0 is no time smoothing
    //analyser.fftSize = 1024,
    analyser.fftSize = 256,
    analyser.minDecibels = -90,
    analyser.maxDecibels = -10,

    sound.connect(filter); //can connect more than one to a node?
    
    // Connect the source to the gain node.
    filter.connect(gainNode);
    // Connect the gain node to the destination

    //gainNode.connect(analyser);
    gainNode.connect(audioContext.destination);

    //analyser.connect(scriptProcessorNode);
    //scriptProcessorNode.connect(audioContext.destination);

    // setup a javascript node
    //javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    
    //javascriptNode.connect(audioContext.destination),

    //sound.connect(analyser); //new 
    //analyser.connect(javascriptNode); //new
}

// setup sound, loop, and connect to destination
// function setupSound() {
//     sound = audioContext.createBufferSource();
//     sound.buffer = sampleBuffer;
//     sound.loop = loop;
//     sound.connect(filter);
//     filter.connect(audioContext.destination);
// }

// play sound and enable / disable buttons
function playSound() {
    setupSound();
    UI('play');
    sound.start(0);
    sound.onended = function () {
        UI('stop');
    }
}
// stop sound and enable / disable buttons
function stopSound() {
    UI('stop');
    sound.stop(0);
}

// change playback speed/rate
function changeRate(rate) {
    sound.playbackRate.value = rate;
    playbackRate.innerHTML = rate;
    console.log(rate);
}

// change playback speed/rate
function changeGain(gain) {
    gainNode.gain.value = gain;
    gainValue.innerHTML = gain;
    console.log(gain);
}

function UI(state){
    switch(state){
        case 'play':
            playButton.disabled = true;
            stopButton.disabled = false;
            gainSlider.disabled = false; //volume
            playbackSlider.disabled = false;
            filterFreqSlider.disabled = false;
            filterQSlider.disabled = false;
            filterGainSlider.disabled = false;
            break;
        case 'stop':
            playButton.disabled = false;
            stopButton.disabled = true;
            gainSlider.disabled = true;
            playbackSlider.disabled = true;
            filterFreqSlider.disabled = true;
            filterQSlider.disabled = true;
            filterGainSlider.disabled = true;
            break;
    }
}


//ADD FILTERS
//can use onmousedown or onmousemove
filterType.oninput = function () {
    changeFilterType(filterType.value);
};

filterFreqSlider.oninput = function () {
    changeFilterFreq(filterFreqSlider.value);
};

filterQSlider.oninput = function () {
    changeFilterQ(filterQSlider.value);
};

filterGainSlider.oninput = function () {
    changeFilterGain(event.target.value);
};

// change filter type and enable / disable controls depending on filter type
function changeFilterType(type) {
    filter.type = type;
    switch (type) {
        case 'peaking':
            filterQSlider.disabled = false;
            filterGainSlider.disabled = false;
            break;
        case 'lowpass':
        case 'highpass':
        case 'bandpass':
        case 'notch':
        case 'allpass':
            filterGainSlider.disabled = true;
            filterQSlider.disabled = false;
            break;
        case 'lowshelf':
        case 'highshelf':
            filterGainSlider.disabled = false;
            filterQSlider.disabled = true;
            break;
    }
}

// change filter frequency and update display 
function changeFilterFreq(freq) {
    filter.frequency.value = freq;
    filterFreq.innerHTML = freq + 'Hz';
}

// change filter Q and update display
function changeFilterQ(Q) {
    filter.Q.value = Q;
    filterQ.innerHTML = Q;
}

// change filter Gain and update display
function changeFilterGain(gain) {
    filter.gain.value = gain;
    filterGain.innerHTML = gain + 'dB';
}

//START VISUALIZATION