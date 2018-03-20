import { vec3, vec4, mat4 } from 'gl-matrix';

class Particle {
    mass: number = 2.0;
    position: vec3;
    velocity: vec3;
    force: vec3;
    acceleration: vec3;
    color: vec4;

    lastTime: number;

    target: vec3;

    constructor(pos: vec3, col: vec4) {
        this.lastTime = 0.0;
        this.position = pos;
        this.color = col;
        this.velocity = vec3.fromValues(0.0, 0.0, 0.0);
        this.acceleration = vec3.fromValues(0.0, 0.0, 0.0);
        this.force = vec3.fromValues(0.0, 0.0, 0.0);


        this.target = vec3.fromValues(5, 5, 5); // point of attraction
    }

    lerp(a: number, b: number, t: number) {
        return a * (1 - t) + b * t;
    }

    update(t: number) {
        let dt: number = (t - this.lastTime);// / 10.0; // / 10.0;
        //console.log("dt = " + dt);

        // calculate force F
        // distance from particle to attractor point
        let dist: number = vec3.distance(this.position, this.target);
        //console.log("dist = " + dist);

        // direction from particle to attractor point
        let dir: vec3 = vec3.fromValues(0.0, 0.0, 0.0);
        dir = vec3.subtract(dir, this.target, this.position);
        this.force = dir;
        ///this.force = vec3.normalize(this.force, this.force);

        // scale force by distance to point (closer to point, faster you go)
        if (dist != 0) {
            this.force = vec3.scale(this.force, this.force, 1.0 / dist);
        } else {
            this.force = vec3.scale(this.force, this.force, 1.0);
        }
        //this.force = vec3.scale(this.force, this.force, 10);

        //console.log("force = " + this.force);

        // update acceleration using force, a = F/m
        this.acceleration = vec3.scale(this.acceleration, this.force, 1.0 / this.mass);
        //console.log("acceleration = " + this.acceleration);

        // simple euler integration for now

        // p' = p + v * dt
        let scaleV: vec3 = vec3.scale(this.velocity, this.velocity, dt);
        this.position = vec3.add(this.position, this.position, scaleV);
        //console.log("position = " + this.position);

        // v' = v + a * dt
        let scaleA: vec3 = vec3.scale(this.acceleration, this.acceleration, dt);
        this.velocity = vec3.add(this.velocity, this.velocity, scaleA);
        //console.log("velocity = " + this.velocity);

        this.lastTime = t;



        // update color based on distance to target
        //this.color[0] = this.lerp(0, 1, Math.abs(this.target[0] - this.position[0]));
        //this.color[1] = this.lerp(0, 1, Math.abs(this.target[1] - this.position[1]));
        //this.color[2] = this.lerp(0, 1, Math.abs(this.target[2] - this.position[2]));

    }

};

export default Particle;
