import { vec3, vec4, mat4 } from 'gl-matrix';

class Particle {
    mass: number;
    position: vec3;
    oldPosition: vec3;
    velocity: vec3;
    acceleration: vec3;
    color: vec4;
    target: vec3;
    attract: boolean;
    repel: boolean;

    constructor(m: number, pos: vec3, vel: vec3, targetPos: vec3, col: vec4) {
        this.mass = m;
        this.color = col;
        this.position = pos;
        this.oldPosition = vec3.create();
        this.velocity = vel;
        this.acceleration = vec3.fromValues(0.0, 0.0, 0.0);

        this.attract = false;
        this.repel = false;

        this.target = targetPos; // point of attraction
    }

    lerp(a: number, b: number, t: number) {
        return a * (1 - t) + b * t;
    }

    updateTarget(newTarget: vec3) {
        this.target = newTarget;
    }

    updatePosition(pos: vec3) {
        this.position = pos;
    }

    update() {
        let dt: number = 0.1;
        //console.log("dt = " + dt);

        // direction from particle to attractor point
        let dir: vec3 = vec3.create();
        vec3.subtract(dir, this.target, this.position);
        //console.log("dir = " + dir);

        // update acceleration using force, a = F/m
        if (this.attract == true) {
            this.acceleration = vec3.scale(this.acceleration, dir, 1.0 / (2.0 * this.mass));

            // dampening
            if (vec3.len(dir) > 5) {
                vec3.scale(this.velocity, this.velocity, 0.97);
            }
    
        } else if (this.repel == true) {
            this.acceleration = vec3.scale(this.acceleration, dir, -1.0 / (2.0 * this.mass));
        } else {
            this.acceleration = vec3.fromValues(0, 0, 0);
        }
        //console.log("acceleration = " + this.acceleration);

        
        if (vec3.len(this.position) > 100) {
            vec3.scale(this.acceleration, this.position, -0.01);
        }

        let oldDir: vec3 = vec3.create();
        vec3.subtract(oldDir, this.target, this.oldPosition);

        // euler integration

        // v' = v + a * dt
        let scaleA: vec3 = vec3.fromValues(0, 0, 0);
        scaleA = vec3.scale(scaleA, this.acceleration, dt);
        this.velocity = vec3.add(this.velocity, this.velocity, scaleA);
        //console.log("velocity = " + this.velocity);

        
        // p' = p + v * dt
        let scaleV: vec3 = vec3.fromValues(0, 0, 0);
        scaleV = vec3.scale(scaleV, this.velocity, dt);
        this.position = vec3.add(this.position, this.position, scaleV);
        //console.log("position = " + this.position);

        
        // COLOR
        let startCol: vec3 = vec3.fromValues(0.8, 0.4, 0.6);
        let edgeCol: vec3 = vec3.fromValues(0.2, 0.5, 0.8);
        let dist: number = vec3.len(dir);

        //vec3.lerp(startCol, startCol, edgeCol, dist / 20);
        vec3.lerp(startCol, startCol, edgeCol, (this.mass - 2) / 6);
        // update color based on distance to target
        this.color[0] = startCol[0];
        this.color[1] = startCol[1];
        this.color[2] = startCol[2];

    }

};

export default Particle;
