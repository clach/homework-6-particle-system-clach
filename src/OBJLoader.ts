// webgl-obj-loader.js
import Drawable from './rendering/gl/Drawable';

export default function OBJLoader(objectData: string, callback: any, mesh: Drawable): void {
    /*
        With the given elementID or string of the OBJ, this parses the
        OBJ and creates the mesh.
    */

    var verts = [];
    var vertNormals = [];

    // unpacking stuff
    var packed = {};
    var packedVerts = [];
    var packedNorms = [];
    var packedHashIndices: any = {};
    var packedIndices = [];
    var index: number = 0;

    // array of lines separated by the newline
    var lines = objectData.split('\n')
    for (var i = 0; i < lines.length; i++) {
        // if this is a vertex
        if (lines[i].startsWith('v ')) {
            var line = lines[i].split(/\s+/);
            verts.push(line[1]);
            verts.push(line[2]);
            verts.push(line[3]);
        }
        // if this is a vertex normal
        else if (lines[i].startsWith('vn')) {
            line = lines[i].split(/\s+/);
            vertNormals.push(line[1]);
            vertNormals.push(line[2]);
            vertNormals.push(line[3]);
        }
        // if this is a face
        else if (lines[i].startsWith('f ')) {
            line = lines[i].split(/\s+/);
            var emptyStringIndex = line.indexOf('');
            if (emptyStringIndex > -1) {
                line.splice(emptyStringIndex, 1);
            }

            var fIndex = line.indexOf('f');
            if (fIndex > -1) {
                line.splice(fIndex, 1);
            }

            // JUST ASSUME IT'S A TRIANGLE MESH
            var quad = false;
            for (var j = 0; j < line.length; j++) {
                /*
                  // Triangulating quads
                // quad: 'f v0/t0/vn0 v1/t1/vn1 v2/t2/vn2 v3/t3/vn3/'
                // corresponding triangles:
                //      'f v0/t0/vn0 v1/t1/vn1 v2/t2/vn2'
                //      'f v2/t2/vn2 v3/t3/vn3 v0/t0/vn0'
                if(j == 3 && !quad) {
                    // add v2/t2/vn2 in again before continuing to 3
                    j = 2;
                    quad = true;
                }*/

                if (line[j] in packedHashIndices) {
                    packedIndices.push(packedHashIndices[line[j]]);
                } else {
                    var face: Array<string> = line[j].split('/');
                    // vertex position
                    packedVerts.push(verts[(parseInt(face[0]) - 1) * 3 + 0]);
                    packedVerts.push(verts[(parseInt(face[0]) - 1) * 3 + 1]);
                    packedVerts.push(verts[(parseInt(face[0]) - 1) * 3 + 2]);
                    packedVerts.push(1);
                    // vertex normals
                    packedNorms.push(vertNormals[(parseInt(face[2]) - 1) * 3 + 0]);
                    packedNorms.push(vertNormals[(parseInt(face[2]) - 1) * 3 + 1]);
                    packedNorms.push(vertNormals[(parseInt(face[2]) - 1) * 3 + 2]);
                    packedNorms.push(0);
                    // add the newly created vertex to the list of indices
                    packedHashIndices[line[j]] = index;
                    packedIndices.push(index);
                    // increment the counter
                    index += 1;
                }
                /*
                if(j == 3 && quad) {
                    // add v0/t0/vn0 onto the second triangle
                    packedIndices.push( packedHashIndices[ line[ 0 ] ] );
                } */
            }
        }
    }

    var finalPositions = packedVerts;
    var finalNormals = packedNorms;
    var finalIndices = packedIndices;

    callback(mesh, finalIndices, finalPositions, finalNormals);
}