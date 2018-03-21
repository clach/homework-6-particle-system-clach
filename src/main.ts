import { vec3, vec4 } from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import { setGL } from './globals';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';
import Particle from './Particle';


// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  'Sqrt Number Particles': 10
};

let square: Square;
let time: number = 0.0;

let particles: Particle[] = [];



let target: Particle = new Particle(3, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, 0), 
  vec4.fromValues(1, 1, 0, 1));

function loadScene() {
  square = new Square();
  square.create();

  // fill particles array
  for (let i = 0; i < controls["Sqrt Number Particles"]; i++) {
    for (let j = 0; j < controls["Sqrt Number Particles"]; j++) {
      let magnitude : number = 20;
      let x = Math.random() * magnitude - (magnitude / 2);
      let y = Math.random() * magnitude - (magnitude / 2);
      let z = Math.random() * magnitude - (magnitude / 2);

      let magnitudeV : number = 20;
      let xV = Math.random() * magnitudeV - (magnitudeV / 2);
      let yV = Math.random() * magnitudeV - (magnitudeV / 2);
      let zV = Math.random() * magnitudeV - (magnitudeV / 2);

      let mass: number = Math.random() * 4 + 2;
      let p: Particle = new Particle(mass, vec3.fromValues(x, y, z),//vec3.fromValues(10,10, 10), // 
        vec3.fromValues(xV, yV, zV),
        vec4.fromValues(i / controls["Sqrt Number Particles"], j / controls["Sqrt Number Particles"], 1.0, 1.0));
      particles.push(p);
    }
  }

  particles.push(target);

  updateParticleVBOs();
}

// update the particles actual data (position, velocity, color, etc)
function updateParticles(t: number) {
  for (let i = 0; i < controls["Sqrt Number Particles"] * controls["Sqrt Number Particles"] + 1; i++) {
    let p: Particle = particles[i];
    p.update(t);
  }
}

// update the particles offsets and colors VBOs
function updateParticleVBOs() {
  let offsetsArray = [];
  let colorsArray = [];

  for (let i = 0; i < controls["Sqrt Number Particles"] * controls["Sqrt Number Particles"] + 1; i++) {
    let p: Particle = particles[i];
    offsetsArray.push(p.position[0]);
    offsetsArray.push(p.position[1]);
    offsetsArray.push(p.position[2]);

    colorsArray.push(p.color[0]);
    colorsArray.push(p.color[1]);
    colorsArray.push(p.color[2]);
    colorsArray.push(p.color[3]);
  }

  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(controls["Sqrt Number Particles"] * controls["Sqrt Number Particles"] + 1); // grid of "particles"
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
  var particleNumberSlisder = gui.add(controls, 'Sqrt Number Particles', 0, 100);
  particleNumberSlisder.onChange(function(value : SVGAnimatedNumberList) {
    particles = [];
    loadScene();
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

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(25, 25, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/particle-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/particle-frag.glsl')),
  ]);

  function handleMouseDown(event: any) {
    /*
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;*/
    console.log("HEYYYYY");
  }
  canvas.onmousedown = handleMouseDown;

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

    // update particle positions/colors!
    updateParticles(time);

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
