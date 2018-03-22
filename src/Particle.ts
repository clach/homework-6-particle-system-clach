import { vec3, vec4, mat4 } from 'gl-matrix';

class Particle {
    mass: number;
    position: vec3;
    oldPosition: vec3;
    velocity: vec3;
    acceleration: vec3;
    color: vec3;
    target: vec3;
    attract: boolean;
    repel: boolean;
    toMesh: boolean;
    constantColor: boolean;

    constructor(m: number, pos: vec3, vel: vec3, targetPos: vec3, col: vec3, constColor: boolean) {
        this.mass = m;
        this.color = col;
        this.constantColor = constColor;
        this.position = pos;
        this.oldPosition = vec3.create();
        this.velocity = vel;
        this.acceleration = vec3.fromValues(0.0, 0.0, 0.0);

        this.attract = false;
        this.repel = false;

        this.toMesh = false;

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
        let dir: vec3 = vec3.fromValues(0, 0, 0);
        vec3.subtract(dir, this.target, this.position);
        //console.log("dir = " + dir);

        // update acceleration using force, a = F/m
        if (this.attract == true) {
            this.acceleration = vec3.scale(this.acceleration, dir, 1.0 / (2.0 * this.mass));

            // dampening
            if (vec3.len(dir) > 5 && !this.toMesh) {
                vec3.scale(this.velocity, this.velocity, 0.97);
            } else if (vec3.len(dir) > 0.5 && this.toMesh) {
                vec3.scale(this.velocity, this.velocity, 0.97);
            }
    
        } else if (this.repel == true) {
            this.acceleration = vec3.scale(this.acceleration, dir, -1.0 / (2.0 * this.mass));
        } else {
            this.acceleration = vec3.fromValues(0, 0, 0);
        }
        //console.log("acceleration = " + this.acceleration);

        
        if (vec3.len(this.position) > 100) {
            vec3.scale(this.acceleration, this.position, -0.001);
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
        if (!this.constantColor) {

            let dist: number;
            if (this.repel || this.attract) {
                dist = vec3.len(dir);
            } else {
                dist = vec3.len(this.position);
            }
            let col1: vec3 = vec3.fromValues(1, 0.76, 0);
            let col2: vec3 = vec3.fromValues(0.91, 0.41, 0.05);
            let col3: vec3 = vec3.fromValues(1, 0, 0);
            let col4: vec3 = vec3.fromValues(0.69, 0.05, 0.91);
            let col5: vec3 = vec3.fromValues(0.051, 0.09, 1);

            let p1: vec3 = vec3.create();
            let p2: vec3 = vec3.create();
            let p3: vec3 = vec3.create();
            let p4: vec3 = vec3.create();
            vec3.lerp(p1, col1, col2, dist / 100);
            vec3.lerp(p2, col2, col3, dist / 100);
            vec3.lerp(p3, col3, col4, dist / 100);
            vec3.lerp(p1, p1, p2, dist / 100);
            vec3.lerp(p2, p2, p3, dist / 100);
            vec3.lerp(this.color, p1, p2, dist / 100);
        }

    }

};

export default Particle;
