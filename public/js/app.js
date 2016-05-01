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
//new AudioContext object instance
var audioContext = new(window.AudioContext || window.webkitAudioContext)(),
    filter = audioContext.createBiquadFilter(),

    sampleURL = '../media/The_Voyage.mp3',
    sampleBuffer, sound, playButton = document.querySelector('.play'),

    // gain node = volume out of 1
    gainNode = audioContext.createGain(),
    
    //for analyzing audio, analyserNode method
    analyser = audioContext.createAnalyser(),
    scriptProcessorNode = audioContext.createScriptProcessor(2048, 1, 1), 
    source, 
    fbcArray, bars, barsX, barWidth, barHeight, bufferLength,
    // canvasOne = document.querySelector('.canvasOne'), 
    // ctxOne = canvasOne.getContext('2d'),
    // canvasTwo = document.querySelector('.canvasTwo'), 
    // ctxTwo = canvasTwo.getContext('2d'),

    stopButton = document.querySelector('.stop'),
    loop = true,
    playbackSlider = document.querySelector('.playbackSlider'),
    playbackRate = document.querySelector('.rate'),

    filterType = document.querySelector('.filterType'),
    filterFreq = document.querySelector('.freq'),
    filterFreqSlider = document.querySelector('.filterSlider'),

    filterQ = document.querySelector('.filterQValue'),
    filterQSlider = document.querySelector('.filterQSlider'),

    filterGain = document.querySelector('.filterGainValue'),
    filterGainSlider = document.querySelector('.filterGainSlider'),
    
    gainValue = document.querySelector('.gain'), //for the volume

    gainSlider = document.querySelector('.gainSlider');   

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
    analyser.fftSize = 2048,
    analyser.minDecibels = -90,
    analyser.maxDecibels = -10,

    sound.connect(filter); //can connect more than one to a node?
    
    // Connect the source to the gain node.
    filter.connect(gainNode);
    filter.connect(analyser);
    analyser.connect(scriptProcessorNode);
    scriptProcessorNode.connect(gainNode);
    // Connect the gain node to the destination
    gainNode.connect(audioContext.destination);
    //barVizLooper();
    //waveVizLooper();
}

// function barVizLooper(){
//     window.requestAnimationFrame(barVizLooper);
//     fbcArray = new Uint8Array(analyser.frequencyBinCount);
//     analyser.getByteFrequencyData(fbcArray);
//     ctxOne.clearRect(0, 0, canvasOne.width, canvasOne.height); // Clear canvas
//     ctxOne.fillStyle = '#5a0d5f'; // Color of the bars
//     bars = 100;
//     for (var i = 0; i < bars; i++) {
//         barX = i * 3;
//         barWidth = 2;
//         barHeight = -(fbcArray[i] / 2);
//         ctxOne.fillRect(barX, canvasOne.height, barWidth, barHeight);
//     }
// }

// function waveVizLooper(){
//     window.requestAnimationFrame(waveVizLooper);

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
            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

            var renderer = new THREE.WebGLRenderer();
            renderer.setSize( window.innerWidth, window.innerHeight );
            document.body.appendChild( renderer.domElement );

            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
            var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
            var cube = new THREE.Mesh( geometry, material );
            scene.add( cube );

            camera.position.z = 5;

            var render = function () {
                requestAnimationFrame( render );

                cube.rotation.x += 0.1;
                cube.rotation.y += 0.1;

                renderer.render(scene, camera);
            };