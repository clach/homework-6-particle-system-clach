import { vec3, vec4, mat4 } from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import { setGL } from './globals';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';
import Particle from './Particle';
import OBJLoader from './OBJLoader';
import Mesh from './geometry/Mesh';


var audio = new Audio('badboy.mp3');
audio.play();

let catMesh: Mesh = new Mesh();
let birdMesh: Mesh = new Mesh();
let flowerMesh: Mesh = new Mesh();
let teapotMesh: Mesh = new Mesh();
let sharkMesh: Mesh = new Mesh();

let meshes: any = {
  'none': null,
  'cat': catMesh,
  'teapot': teapotMesh,
  'shark': sharkMesh
}

function objLoaderCallback(mesh: Mesh, vertices: Array<number>): void {
  mesh.positions = Float32Array.from(vertices);
}

// referenced from https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
function readTextFile(file: string, callback: any, mesh: Mesh): void {
  let indices: Uint32Array = new Uint32Array(0);
  let positions: Float32Array = new Float32Array(0);
  let normals: Float32Array = new Float32Array(0);

  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        var allText = rawFile.responseText;
        OBJLoader(allText, callback, mesh);
      }
    }
  }
  rawFile.send(null);
}

function loadMeshes() {
  for (var property in meshes) {
    if (meshes.hasOwnProperty(property)) {
      if (property != 'none') {
        //console.log("property = " + meshes[property]);
        let filename: string = "./" + property + ".obj";
        readTextFile(filename, objLoaderCallback, meshes[property]);
      }
    }
  }
}

var numParticles: number = 100;
var numTargets: number = 0;

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Load Scene': loadScene, // A function pointer, essentially
  'Number Particles': numParticles,
  'Mesh': 'none',
  'Disperse': disperseParticles
};

let square: Square;
let currentMesh: Mesh = new Mesh();
let time: number = 0.0;

var mouseDown: boolean = false;
var lastMouseX: number = null;
var lastMouseY: number = null;
var mouseButton: number = 0;

let particles: Particle[] = [];
let targets: Particle[] = [];

let target: Particle = new Particle(6, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 0),
  vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0), true);

function loadScene() {
  square = new Square();
  square.create();

  numTargets = 0;
  particles = [];

  let posMagnitude: number = 100;
  let velMagnitude: number = 3;
  // fill particles array
  for (let i = 0; i < numParticles; i++) {
    let posX = target.position[0] + Math.random() * posMagnitude - (posMagnitude / 2);
    let posY = target.position[1] + Math.random() * posMagnitude - (posMagnitude / 2);
    let posZ = target.position[2] + Math.random() * posMagnitude - (posMagnitude / 2);

    let velX = Math.random() * velMagnitude - (velMagnitude / 2);
    let velY = Math.random() * velMagnitude - (velMagnitude / 2);
    let velZ = Math.random() * velMagnitude - (velMagnitude / 2);

    let mass: number = Math.random() * 6 + 2;
    let p: Particle = new Particle(mass, vec3.fromValues(posX, posY, posZ),//vec3.fromValues(10,10, 10), // 
      vec3.fromValues(velX, velY, velZ),
      target.position,
      vec3.fromValues(0, 0, 0), false);
    particles.push(p);

  }

  particles.push(target);
  numTargets++;

  updateParticleVBOs();
}

// update the particles actual data (position, velocity, color, etc)
function updateParticles() {
  for (let i = 0; i < numParticles + numTargets; i++) {
    let p: Particle = particles[i];
    p.update();
  }
}

function attractParticles() {
  for (let i = 0; i < numParticles; i++) {
    let p: Particle = particles[i];
    p.attract = true;
  }
}

function repelParticles() {
  for (let i = 0; i < numParticles; i++) {
    let p: Particle = particles[i];
    p.repel = false;
  }
}

function disperseParticles() {
  for (let i = 0; i < numParticles; i++) {
    let p: Particle = particles[i];
    p.disperse();
  }
}

// update the particles offsets and colors VBOs
function updateParticleVBOs() {
  let offsetsArray = [];
  let colorsArray = [];

  for (let i = 0; i < numParticles + numTargets; i++) {
    let p: Particle = particles[i];
    offsetsArray.push(p.position[0]);
    offsetsArray.push(p.position[1]);
    offsetsArray.push(p.position[2]);

    colorsArray.push(p.color[0]);
    colorsArray.push(p.color[1]);
    colorsArray.push(p.color[2]);
    colorsArray.push(1);
  }

  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(numParticles + numTargets);

}

function toMesh() {

  if (currentMesh == null) {
    for (var i = 0; i < particles.length; i++) {
      let p: Particle = particles[i];
      p.attract = false;
      p.toMesh = false;
    }
  } else {
    // collect all the vertices of a mesh
    let vertices: vec3[] = [];
    for (var i = 0; i < currentMesh.positions.length; i += 3) {
      let vertex: vec3 = vec3.fromValues(currentMesh.positions[i], currentMesh.positions[i + 1], currentMesh.positions[i + 2]);
      vec3.scale(vertex, vertex, 10);
      vertices.push(vertex);
    }

    for (var i = 0; i < particles.length; i++) {
      let p: Particle = particles[i];
      p.updateTarget(vertices[i % vertices.length]);
      p.attract = true;
      p.toMesh = true;
    }
  }

}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  var particleNumberSlider = gui.add(controls, 'Number Particles', 0, 100000).step(1);
  particleNumberSlider.onChange(function (value: number) {
    numParticles = value;
    // reload scene
    loadScene();
  });
  gui.add(controls, 'Disperse');
  var selectedMesh = gui.add(controls, 'Mesh', ['none', 'cat', 'teapot', 'shark']);
  selectedMesh.onChange(function (value: string) {
    currentMesh = meshes[value];
    toMesh();
  });

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement>document.getElementById('canvas');
  const gl = <WebGL2RenderingContext>canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  loadMeshes();

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 60), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.1, 0.1, 0.1, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/particle-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/particle-frag.glsl')),
  ]);

  function handleMouseDown(event: any) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    mouseButton = event.which;

    //console.log("x = " + lastMouseX);
    //console.log("y = " + lastMouseY);

    /*
    // let's do some ray casting
    let pointClicked: vec4 = vec4.fromValues(lastMouseX, lastMouseY, 1, 1);

    // convert to NDC
    pointClicked[0] = (2 * pointClicked[0] / window.innerWidth) - 1;
    pointClicked[1] = 1 - (2 * pointClicked[1] / window.innerHeight);

    // multiply by far clip plane
    vec4.scale(pointClicked, pointClicked, camera.far);

    // multiply by invViewProj
    let invProj: mat4 = mat4.create();
    mat4.invert(invProj, camera.projectionMatrix);
    vec4.transformMat4(pointClicked, pointClicked, invProj);
    let invView: mat4 = mat4.create();
    mat4.invert(invView, camera.viewMatrix);
    vec4.transformMat4(pointClicked, pointClicked, invView);

    let cameraEye: vec4 = vec4.fromValues(camera.controls.eye[0], camera.controls.eye[1], camera.controls.eye[2], 1);
    vec4.subtract(pointClicked, pointClicked, cameraEye);
    vec4.normalize(pointClicked, pointClicked);

    // point = eye + dir * t
    var finalP: vec4 = vec4.create();
    vec4.add(finalP, cameraEye, vec4.scale(pointClicked, pointClicked, 63));

    if (event.which == 1) { // left click, attract particles
      // update target position
      target.updatePosition(vec3.fromValues(finalP[0], finalP[1], finalP[2]));

      for (let i = 0; i < numParticles + numTargets; i++) {
        let p: Particle = particles[i];
        p.updateTarget(target.position);
      }

    } else if (event.which == 3) { // right click, repel particles

    }*/

    if (event.which == 1) {
      for (let i = 0; i < numParticles; i++) {
        let p: Particle = particles[i];
        p.attract = true;
        p.repel = false;
      }
    } else if (event.which == 3) {
      for (let i = 0; i < numParticles; i++) {
        let p: Particle = particles[i];
        p.repel = true;
        p.attract = false;
      }
    }

  }

  function handleMouseUp(event: any) {
    mouseDown = false;
    for (let i = 0; i < numParticles; i++) {
      let p: Particle = particles[i];
      p.attract = false;
      p.repel = false;
    }

  }

  function handleMouseMove(event: any) {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  }

  canvas.onmousedown = handleMouseDown;
  canvas.onmouseup = handleMouseUp;
  canvas.onmousemove = handleMouseMove;

  /*
  camera.controls.rotationSpeed = 0;
  camera.controls.translationSpeed = 0;
  camera.controls.zoomSpeed = 0;
  */

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    lambert.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, lambert, [
      square,
    ]);
    stats.end();

    if (mouseDown) {
      // let's do some ray casting
      let pointClicked: vec4 = vec4.fromValues(lastMouseX, lastMouseY, 1, 1);

      // convert to NDC
      pointClicked[0] = (2 * pointClicked[0] / window.innerWidth) - 1;
      pointClicked[1] = 1 - (2 * pointClicked[1] / window.innerHeight);

      // multiply by far clip plane
      vec4.scale(pointClicked, pointClicked, camera.far);

      // multiply by invViewProj
      let invProj: mat4 = mat4.create();
      mat4.invert(invProj, camera.projectionMatrix);
      vec4.transformMat4(pointClicked, pointClicked, invProj);
      let invView: mat4 = mat4.create();
      mat4.invert(invView, camera.viewMatrix);
      vec4.transformMat4(pointClicked, pointClicked, invView);

      let cameraEye: vec4 = vec4.fromValues(camera.controls.eye[0], camera.controls.eye[1], camera.controls.eye[2], 1);
      vec4.subtract(pointClicked, pointClicked, cameraEye);
      vec4.normalize(pointClicked, pointClicked);

      // point = eye + dir * t
      var finalP: vec4 = vec4.create();
      vec4.add(finalP, cameraEye, vec4.scale(pointClicked, pointClicked, 63));

      // update target position
      target.updatePosition(vec3.fromValues(finalP[0], finalP[1], finalP[2]));

      for (let i = 0; i < numParticles; i++) {
        let p: Particle = particles[i];
        p.updateTarget(target.position);
      }

    }

    // update particle positions/colors!
    updateParticles();

    // update the offset VBO each tick!
    updateParticleVBOs();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
