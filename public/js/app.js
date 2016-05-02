//Note: run with python -m SimpleHTTPServer to test, not from file, or else won't work

//loading file with XMLHttpRequest
//to-do: what to do about more than one piece of audio

// initializing a new context
//To-do: use below two var to create visualization (MDN example link version)


// LOADING AUDIO ONLY

//To-DO: change to camelcase, for UI buttons maybe rewrite
//new AudioContext object instance
var audioContext = new(window.AudioContext || window.webkitAudioContext)(),
    filter = audioContext.createBiquadFilter(),

    sampleURL = '../media/Every_Step.mp3',
    sampleBuffer, sound, playButton = document.querySelector('.play'),

    // gain node = volume out of 1
    gainNode = audioContext.createGain(),
    
    //for analyzing audio, analyserNode method
    analyser = audioContext.createAnalyser(),
    scriptProcessorNode = audioContext.createScriptProcessor(2048, 1, 1), 
    source, 
    bufferLength,

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
// connect each node to each other in a chain, and then connect to audioContext.destination
// javascriptNode is decrepreciated, as is scriptProcessorNode, but there isn't much documentation on audio workers
function setupSound() {
    sound = audioContext.createBufferSource();
    sound.buffer = sampleBuffer;
    sound.loop = loop; //auto is false
    sound.playbackRate.value = playbackSlider.value;

    analyser.smoothingTimeConstant = 0.85, //0<->1. 0 is no time smoothing
    analyser.fftSize = 2048, //analyser.fftSize = 1024,
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
    
    bufferLength = analyser.frequencyBinCount;
    // scriptProcessorNode.onaudioprocess = function(audioProcessingEvent) {

    // array = new Uint8Array(analyser.frequencyBinCount);
    // analyser.getByteFrequencyData(array);
    // boost = 0;
    // for (var i = 0; i < array.length; i++) {
    //     boost += array[i];
    // }
    //     boost = boost / array.length;
    //     }

        //this is where we animates the bars
    scriptProcessorNode.onaudioprocess = function (audioProcessingEvent) {

        // get the average for the first channel
        array = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(array);

        boost = 0;
        for (var i = 0; i < array.length; i++) {
            boost += array[i];
        }
        boost = boost / array.length;

        var step = Math.round(array.length / numberOfBars);

        //Iterate through the bars and scale the z axis
        for (var i = 0; i < numberOfBars; i++) {
            var value = array[i * step] / 4;
            value = value < 1 ? 1 : value;
            bars[i].scale.z = value;
        }
    }

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
    //sound.disconnect(scriptProcessorNode); //disconnect when stopped
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

//START VISUALIZATION

//THREEJS scene start
var scene, camera, renderer, geometry, material, controls;
//var cubes = new Array();
//console.log(cubes);
var bars = new Array();
console.log(bars);
var numberOfBars = 16;
var boost = 0;

// var width = window.innerWidth;
// var height = window.innerHeight;

var container = document.getElementById("threeJSContainer");

var containerWidth = document.getElementById("threeJSContainer").offsetWidth;
var containerHeight = document.getElementById("threeJSContainer").offsetHeight;

initialize();
//animate();
render();

function initialize() {

    camera = new THREE.PerspectiveCamera( 75, containerWidth / containerHeight, 1, 1000 );
    //camera.position.set(0, 3.5, 0);
    camera.position.z = 10;

    controls = new THREE.OrbitControls( camera, container );
    controls.addEventListener( 'change', render ); 

    // controls.pan(new THREE.Vector3( 1, 0, 0 ));
    // controls.pan(new THREE.Vector3( 0, 1, 0 ));

    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    // geometry = new THREE.IcosahedronGeometry(2, 0, 2);
    // material =  new THREE.MeshPhongMaterial( { color:0xd1b3e8, shading: THREE.FlatShading } );

    // shape = new THREE.Mesh( geometry, material );
    // scene.add( shape );

    //re-add this for randomly located shapes later + randomly generate color
    //Use container + function to make Object3D group, so can rotate together
    // for ( var i = 0; i < 10; i ++ ) {
    //     shape = new THREE.Mesh( geometry, material );
    //     shape.position.x = ( Math.random() - 0.5 ) * 10;
    //     shape.position.y = ( Math.random() - 0.5 ) * 10;
    //     shape.position.z = ( Math.random() - 0.5 ) * 10;
    //     shape.updateMatrix();
    //     shape.matrixAutoUpdate = false;
    //     scene.add( shape );
    // }

    //loop and reate bars
    for (var i = 0; i < this.numberOfBars; i++) {

        //create a bar
        var barGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

        //create a material
        var material = new THREE.MeshPhongMaterial({
            //color:0xd1b3e8, 
            color: randomColor(),
            shading: THREE.FlatShading,
            reflectivity: 5.5 
        });

        //create the geometry and set the initial position
        bars[i] = new THREE.Mesh(barGeometry, material);
        bars[i].position.set(i - numberOfBars/2, 0, 0);

        //add the created bar to the scene
        scene.add(bars[i]);
        console.log(bars[i]);
    }

// var i = 0;
// for(var x = 0; x < 30; x += 2) {
//     var j = 0;
//     cubes[i] = new Array();
//     for(var y = 0; y < 30; y += 2) {
//         var geometry = new THREE.CubeGeometry(.5, .5, .5);
        
//         var material = new THREE.MeshPhongMaterial({
//             //color: randomColor(),
//             color:0xd1b3e8, 
//             shading: THREE.FlatShading,
//             reflectivity: 5.5 
//         });
        
//         cubes[i][j] = new THREE.Mesh(geometry, material);
//         cubes[i][j].position = new THREE.Vector3(x, y, 0);
        
//         scene.add(cubes[i][j]);
//         j++;
//     }

//     i++;
// }

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0x002288 );
    light.position.set( -1, -1, -1 );
    scene.add( light );

    light = new THREE.AmbientLight( 0x222222 );
    scene.add( light );

    renderer = new THREE.WebGLRenderer( { alpha: true } );
    renderer.setClearColor(0xebebeb, 1);
    renderer.setSize( containerWidth, containerHeight );

    container = document.getElementById( "threeJSContainer" );
    container.appendChild( renderer.domElement );


    window.addEventListener( 'resize', onWindowResize, false );

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

//     if(typeof array === 'object' && array.length > 0) {
//     var k = 0;
//     for(var i = 0; i < cubes.length; i++) {
//         for(var j = 0; j < cubes[i].length; j++) {
//             var scale = (array[k] + boost) / 30;
//             cubes[i][j].scale.z = (scale < 1 ? 1 : scale);
//             k += (k < array.length ? 1 : 0);
//         }
//     }
// }



    if(typeof array === 'object' && array.length > 0) {
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
    //shape.rotation.x += 0.001;
    //shape.rotation.y += 0.001;
    //shape.rotation.z += 0.001;
    renderer.render( scene, camera );
}


function randomColor() {
    var min = 64;
    var max = 224;
    var r = (Math.floor(Math.random() * (max - min + 1)) + min) * 65536;
    var g = (Math.floor(Math.random() * (max - min + 1)) + min) * 256;
    var b = (Math.floor(Math.random() * (max - min + 1)) + min);
    return r + g + b;
}