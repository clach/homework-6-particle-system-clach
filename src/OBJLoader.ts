// webgl-obj-loader.js
import Drawable from './rendering/gl/Drawable';

export default function OBJLoader(objectData: string, callback: any, mesh: Drawable): void {
    /*
        With the given elementID or string of the OBJ, this parses the
        OBJ and creates the mesh.
    */

    var verts = [];

    // unpacking stuff
    var packed = {};
    var packedVerts = [];
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

                if (line[j] in packedHashIndices) {
                    packedIndices.push(packedHashIndices[line[j]]);
                } else {
                    var face: Array<string> = line[j].split('/');
                    // vertex position
                    packedVerts.push(verts[(parseInt(face[0]) - 1) * 3 + 0]);
                    packedVerts.push(verts[(parseInt(face[0]) - 1) * 3 + 1]);
                    packedVerts.push(verts[(parseInt(face[0]) - 1) * 3 + 2]);
                    packedVerts.push(1);

                    // add the newly created vertex to the list of indices
                    packedHashIndices[line[j]] = index;
                    packedIndices.push(index);
                    // increment the counter
                    index += 1;
                }
            }
        }
    }

    var finalPositions = packedVerts;
    var finalIndices = packedIndices;

    callback(mesh, verts);
}