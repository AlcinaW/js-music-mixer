//Note: run with python -m SimpleHTTPServer to test
//If use Node server, would probably need Gulp to auto reload the server every time something is saved


//scene, then camera, then renderer

 //Declare three.js variables
var camera, scene, renderer, cube;
 
//assign three.js objects to each variable
function init(){
    //camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
     
    //scene
    scene = new THREE.Scene();
     
    //renderer
    renderer = new THREE.WebGLRenderer();
    //set the size of the renderer
    renderer.setSize( window.innerWidth, window.innerHeight );
     
    //add the renderer to the html document body
    document.body.appendChild( renderer.domElement );
}

function addCube(){
    //create box geometry object
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    //create material with colour
    var material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    //combine geometry with material to create the cube
    cube = new THREE.Mesh( geometry, material );
    //add the cube to the scene
    scene.add( cube );

    //set the camera position
    camera.position.z = 5;
}

function render() {
    //get the frame
    requestAnimationFrame( render );

    //animate the cube
    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;

    //render the scene
    renderer.render( scene, camera );
}

init();
addCube();
render();