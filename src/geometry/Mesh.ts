import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Mesh extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;

  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {

    var colorsArr: number[] = [];
    for (var i = 0; i < this.positions.length; i +=4) {
      colorsArr.push(0.30);
      colorsArr.push(0.6);
      colorsArr.push(0.26);
      colorsArr.push(1);
    }
    this.colors = new Float32Array(colorsArr);

    this.generateIdx();
    this.generatePos();
    this.generateCol();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

  }
};

export default Mesh;