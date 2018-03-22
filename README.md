
# Project 6: Particle System

**Goal:** to make physics-based procedural animation of particles and to practice using OpenGL's instanced rendering system.

**Inspiration:** DMD and CGGT alumnus Nop Jiarathanakul's [Particle Dream application](http://www.iamnop.com/particles/).

## Submission
Caroline Lachanski, clach

Demo: https://clach.github.io/homework-6-particle-system-clach/

I made a particle class that contains variables such as position, velocity, color, etc. The particles movement is controlled by Euler integration. Their initial position and velocity are randomized; they also have randomized masses. I took a lot of inspiration for their physics from springs and Hooke's Law; for example, I make use of a dampening constant and a k value (from F = kx). The particles are colored based on their distance to the origin, or a target point if there is one. The color palette was based on one I made using Adobe's color tool; I lerped between four different colors to get the color gradation seen. The user can left click to attract particles and right click to repel them (warning: if you zoom out or in too much, this will start freaking out). The user can select from several meshes to attract the particles to. If you wish to disperse the particles, you can click disperse which assigns each particle a random velocity. You can also edit the number of particles in the scene. I reverted the particles to their square shape (so they resemble pixels) and added some 8-bit music to create a retro video game vibe. The music cannot be turned off; this is intentional.
