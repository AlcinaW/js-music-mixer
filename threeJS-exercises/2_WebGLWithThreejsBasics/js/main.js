var width = window.innerWidth;
var height = window.innerHeight;

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);
 
var scene = new THREE.Scene;

var cubeGeometry = new THREE.CubeGeometry(100, 100, 100);
var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x1ec876 });
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
 
cube.rotation.y = Math.PI * 45 / 180;
 
scene.add(cube);

var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

camera.position.y = 160;
camera.position.z = 400;

camera.lookAt(cube.position);

var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

var pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, 300, 200);
 
scene.add(pointLight);
 
scene.add(skybox);

scene.add(camera);
 
var clock = new THREE.Clock;

function render() {
    renderer.render(scene, camera);
     	
	cube.rotation.y -= clock.getDelta();
	
    requestAnimationFrame(render);
}
 
render();