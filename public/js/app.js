//Note: run with python -m SimpleHTTPServer to test, not from file, or else won't work

//to-do: what to do about more than one piece of audio

//To-DO: change to camelcase, for UI buttons maybe rewrite
//To-DO: document.querySelector and in others document.getElementById -> chose one or other, rename classes and id properly

//new AudioContext object instance
var audioContext = new(window.AudioContext || window.webkitAudioContext)(),

    //music to be loaded and played
    sampleURL = "../media/Every_Step.mp3",
    sampleBuffer, sound, 

    //gain node = volume out of 1
    gainNode = audioContext.createGain(),
    panNode = audioContext.createStereoPanner(),
    filter = audioContext.createBiquadFilter(),
    analyser = audioContext.createAnalyser(),

    //for analyzing audio, scriptProcessorNode method
    scriptProcessorNode = audioContext.createScriptProcessor(2048, 1, 1), 
    bufferLength,

    playButton = document.querySelector(".play"),
    stopButton = document.querySelector(".stop"),
    loop = true, //music loop

    gainValue = document.querySelector(".gain"), 
    gainSlider = document.querySelector(".gainSlider"),

    playbackRate = document.querySelector(".rate"),
    playbackSlider = document.querySelector(".playbackSlider"),

    panValue = document.querySelector(".pan"),
    panSlider = document.querySelector(".panSlider"),
    panDir, //to show left or right pan on HTML side

    filterType = document.querySelector(".filterType"),

    filterFreq = document.querySelector(".freq"),
    filterFreqSlider = document.querySelector(".filterSlider"),

    filterQ = document.querySelector(".filterQValue"),
    filterQSlider = document.querySelector(".filterQSlider"),

    filterGain = document.querySelector(".filterGainValue"),
    filterGainSlider = document.querySelector(".filterGainSlider"),

    container = document.getElementById("threeJSContainer");   

// load sound
init();

function init() {
    //test if browser supports web audio API
    try {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        console.log("Web audio API supported! Alphanumeric!");
        }
    catch(error) {
        alert("Web audio API is not supported in this browser. Sadface. :(");
        console.log("Error: " + error);
        }
    loadSound(sampleURL);
}

//PLAY AND STOP CONTROL FUNCTIONS
playButton.onclick = function() {
    playSound();
}

stopButton.onclick = function() {
    stopSound();
}

//SLIDER CONTROL FUNCTIONS
playbackSlider.oninput = function() {
    changeRate(playbackSlider.value);
}

gainSlider.oninput = function() {
    changeGain(gainSlider.value);
}

panSlider.oninput = function() {
    changePan(panSlider.value);
}

//function to load sounds via AJAX to create an XMLHttpRequest object
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function () {
        audioContext.decodeAudioData(request.response, function (buffer) {
            var soundLength = buffer.duration;
            sampleBuffer = buffer;
            playButton.disabled = false;
            playButton.innerHTML = "Play";
        });
    };
    request.send();
}

//set our sound buffer, loop, and connect to destination
//connect each node to each other in a chain, and then connect to audioContext.destination
//javascriptNode is decrepreciated, as is scriptProcessorNode, but there isn't much documentation on audio workers
function setupSound() {
    sound = audioContext.createBufferSource();
    sound.buffer = sampleBuffer;
    sound.loop = loop; //auto is false
    sound.playbackRate.value = playbackSlider.value;

    analyser.smoothingTimeConstant = .85, //0<->1. 0 is no time smoothing
    analyser.fftSize = 2048, //must be some number by the power of 2, ex. 512
    analyser.minDecibels = -150,
    analyser.maxDecibels = -10,

    sound.connect(filter); //can connect more than one to a node, as long as it all ends up at destination
    
    //connect source/sound var to the gain node
    filter.connect(gainNode);
    filter.connect(analyser);
    analyser.connect(scriptProcessorNode);
    scriptProcessorNode.connect(gainNode);
    gainNode.connect(panNode);
    //connect pan node to the destination (a.k.a. the speakers)
    panNode.connect(audioContext.destination);
    
    //frequencyBinCount property of the analyserNode interface is an unsigned long value half that of the fft size -MDN
    bufferLength = analyser.frequencyBinCount; 

    //animate the bars
    scriptProcessorNode.onaudioprocess = function (audioProcessingEvent) {

        array = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(array);

        boost = 0;
        for (var i = 0; i < array.length; i++) {
            boost += array[i];
        }
        boost = boost / array.length;

        var step = Math.round(array.length / numBars);

        //iterate through bars and scale the z axis
        for (var i = 0; i < numBars; i++) {
            var value = array[i * step] / 4;
            value = value < 1 ? 1 : value;
            bars[i].scale.z = value;
        }
    }
}

//MORE SLIDER CONTROLS (move to other section?)
// play sound and enable / disable buttons
function playSound() {
    setupSound();
    setPlaybackControls("play");
    sound.start(0);
    sound.onended = function () {
        setPlaybackControls("stop");
    }
}

// stop sound and enable / disable buttons
function stopSound() {
    setPlaybackControls("stop");
    sound.stop(0);
}

// change playback speed/rate
function changeRate(rate) {
    sound.playbackRate.value = rate;
    playbackRate.innerHTML = rate;
    console.log("Rate: " + rate);
}

// change volume
function changeGain(gain) {
    gainNode.gain.value = gain;
    gainValue.innerHTML = gain;
    console.log("Gain: " + gain);
}
// change pan left and right
function changePan(pan) {
    panNode.pan.value = pan;
    //changes gradient defined in CSS class to show which way the pan is going 
    if (pan == 0) {
        container.className = "panColour";
    } else if (pan > 0) {
        container.className = "panColourR";
        panDir = "Right";
    } else {
        container.className = "panColourL";
        panDir = "Left"
    }
    panValue.innerHTML = pan + " " + panDir;
    console.log("Pan: " + pan + " " + panDir);
}
//switch statement to disable all sliders when the music is NOT loaded/playing
//TO-DO: rewrite in a more DRY way 
//Ex1. apply a class to all the objects that get enabled/disabled, then do a document.querySelectorall to get all of them,
//then loop through to set each one to enabled/disabled. This would make it easier if you add another control. 
//Ex2. Or put them all into a named div: http://stackoverflow.com/questions/8423812/enable-disable-a-div-and-its-elements-in-javascript
function setPlaybackControls(state){
    switch(state){
        case "play":
            playButton.disabled = true;
            stopButton.disabled = false;
            panSlider.disabled =  false;
            gainSlider.disabled = false; //volume
            playbackSlider.disabled = false;
            filterFreqSlider.disabled = false;
            filterQSlider.disabled = false;
            filterGainSlider.disabled = false; 
            break;
        case "stop":
            playButton.disabled = false;
            stopButton.disabled = true;
            panSlider.disabled = true;
            gainSlider.disabled = true;
            playbackSlider.disabled = true;
            filterFreqSlider.disabled = true;
            filterQSlider.disabled = true;
            filterGainSlider.disabled = true;
            break;
    }
}

//ADD FILTERS
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
        case "peaking":
            filterQSlider.disabled = false;
            filterGainSlider.disabled = false;
            break;
        case "lowpass":
        case "highpass":
        case "bandpass":
        case "notch":
        case "allpass":
            filterQSlider.disabled = false;
            filterGainSlider.disabled = true;
            break;
        case "lowshelf":
        case "highshelf":
            filterQSlider.disabled = true;
            filterGainSlider.disabled = false;
            break;
    }
}

// change filter frequency and update display 
function changeFilterFreq(freq) {
    filter.frequency.value = freq;
    filterFreq.innerHTML = freq + "Hz";
}

// change filter Q and update display
function changeFilterQ(Q) {
    filter.Q.value = Q;
    filterQ.innerHTML = Q;
}

// change filter Gain and update display
function changeFilterGain(gain) {
    filter.gain.value = gain;
    filterGain.innerHTML = gain + "dB";
}

//START VISUALIZATION

//THREEJS scene start
var scene, camera, renderer, geometry, material, controls;
var bars = new Array();

var numBars = 50; //number of bars, if change, need to adjust camera as well
var boost = 0;

var containerWidth = document.getElementById("threeJSContainer").offsetWidth;
var containerHeight = document.getElementById("threeJSContainer").offsetHeight;

initialize();
render();

function initialize() {

    camera = new THREE.PerspectiveCamera( 75, containerWidth / containerHeight, 1, 1000 );
    camera.position.set(5, 20, 10);
    camera.position.z = 9; //set "distance" of camera

    controls = new THREE.OrbitControls( camera, container );
    controls.addEventListener( "change", render ); //listens for mouse input to move camera

    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false; //can't zoom into the scene, default is true

    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 ); //aerial perspective, fog to create illusion of distance

    //loop and create the number of numbars (harhar)
    for (var i = 0; i < this.numBars; i++) {

        //create a bar
        var barGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

        //create a material
        var material = new THREE.MeshPhongMaterial({
            //color:0xd1b3e8, 
            color: randomColour(), //random coloured bars
            shading: THREE.FlatShading,
            reflectivity: 5.5 
        });

        //create the geometry and set the initial position
        bars[i] = new THREE.Mesh(barGeometry, material);
        bars[i].position.set(i - numBars/2, 0, 0);

        //add the created bar to the scene
        scene.add(bars[i]);
    }

    //to-do: change lighting? kinda harsh atm
    light = new THREE.DirectionalLight( 0xffffff, .8 );
    light.position.set( 2, 1, 1 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0x002288 );
    light.position.set( -1, -1, -1 );
    scene.add( light );

    light = new THREE.AmbientLight( 0x222222 );
    scene.add( light );

    //alpha makes background transparent so CSS shows behind; anti-alias for smooth animation of bars
    renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } ); 
    //renderer.setClearColor(0xebebeb, 1);
    renderer.setSize( containerWidth, containerHeight );

    container = document.getElementById( "threeJSContainer" ); //do I need this?
    container.appendChild( renderer.domElement );

    window.addEventListener( "resize", onWindowResize, false );

}

function onWindowResize() {

    containerWidth = document.getElementById("threeJSContainer").offsetWidth;
    containerHeight = document.getElementById("threeJSContainer").offsetHeight;

    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( containerWidth, containerHeight );

    render();
}

function render() {

    //to-do: double-check this part, maybe rewrite
    if(typeof array === "object" && array.length > 0) {
    var k = 0;
    for(var i = 0; i < bars.length; i++) {
        for(var j = 0; j < bars[i].length; j++) {
            var scale = (array[k] + boost) / 30;
            bars[i][j].scale.z = (scale < 1 ? 1 : scale);
            k += (k < array.length ? 1 : 0);
        }
    }
}
    requestAnimationFrame( render );
    controls.update;
    renderer.render( scene, camera );
}

function randomColour() {
    var min = 64;
    var max = 224;
    var r = (Math.floor(Math.random() * (max - min + 1)) + min) * 65536;
    var g = (Math.floor(Math.random() * (max - min + 1)) + min) * 256;
    var b = (Math.floor(Math.random() * (max - min + 1)) + min);
    return r + g + b;
}