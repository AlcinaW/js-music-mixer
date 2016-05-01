//Note: run with python -m SimpleHTTPServer to test, not from file, or else won't work

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
}

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
//to-do: can use onmousedown or onmousemove?
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

//colours
// var colours = {
//     red:0xf25346,
//     blue:0x68c3c0,
// };

//START VISUALIZATION

//when window resizes, animation area will shift to fit
// window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}




// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

// var renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );

// var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

// var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

// camera.position.z = 5;

// var render = function () {
//     requestAnimationFrame( render );

//     cube.rotation.x += 0.1;
//     cube.rotation.y += 0.1;

//     renderer.render(scene, camera);
// };
// render();


//THREEJS scene start
var scene, camera, renderer, geometry, material;

//var speed = 0.01;

function initialize() {
    scene = new THREE.Scene();

    initShape();
    initLights();
    initCamera();
    initRenderer();

    //document.body.appendChild(renderer.domElement);
    container = document.getElementById( 'threeJSContainer' );
    container.appendChild( renderer.domElement );
}

function initCamera() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    //camera.position.set(0, 3.5, 5);
    camera.position.z =10;
    controls = new THREE.OrbitControls( camera );
    controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    //controls.enableZoom = false;
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function initShape() {
    geometry = new THREE.IcosahedronGeometry(2, 0, 2);
    material =  new THREE.MeshPhongMaterial( { color:0xd1b3e8, shading: THREE.FlatShading } );

    shape = new THREE.Mesh( geometry, material );
    
    scene.add( shape );

    //re-add this for randomly located shapes later + randomly generate color
  //   for ( var i = 0; i < 10; i ++ ) {

  //   shape = new THREE.Mesh( geometry, material );
  //   shape.position.x = ( Math.random() - 0.5 ) * 10;
  //   shape.position.y = ( Math.random() - 0.5 ) * 10;
  //   shape.position.z = ( Math.random() - 0.5 ) * 10;
  //   shape.updateMatrix();
  //   shape.matrixAutoUpdate = false;
  //   scene.add( shape );

  // }

}

function initLights(){
    light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  light = new THREE.DirectionalLight( 0x002288 );
  light.position.set( -1, -1, -1 );
  scene.add( light );

  light = new THREE.AmbientLight( 0x222222 );
  scene.add( light );
}
function rotateShape() {
    shape.rotation.x += 0.001;
    shape.rotation.y += 0.001;
    shape.rotation.z += 0.001;
    // shape.rotation.x -= speed * 2;
    // shape.rotation.y -= speed;
    // shape.rotation.z -= speed * 3;
}

function render() {
    requestAnimationFrame(render);
    rotateShape();
    renderer.render(scene, camera);
}


initialize();
render();
