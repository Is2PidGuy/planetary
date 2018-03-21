
import keys from './keys';
import Rect from './shape';

import { centroid, distance, vec, sub, add, normalize, dot, intersect, getDistance, scale } from './math';

import './styles.css';

const root = document.getElementById('root');
const w = root.clientWidth;
const h = root.clientHeight;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = w;
canvas.height = h;

const drawLine = (a, b, color = 'black', width = 1) => {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
};

const drawCircle = (c, color) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.ellipse(c.center.x, c.center.y, c.radius, c.radius, 0, 0, 2 * Math.PI);
    ctx.fill();
};

const getRc = (sx, sy, mass, radius, vel, color) => {
    return { center: vec(sx, sy), radius, vel, mass, accln: vec(0, 0), color };
};

const planets = [
    getRc(w / 2, h / 2, 1000000000, 30, vec(0, 0), 'yellow'),
    getRc(w / 2 - 650, h / 2, 10000000, 20, vec(0, -6), 'skyblue'),
    getRc(w / 2 - 550, h / 2, 2000000, 10, vec(0, -12.5), 'grey'),
    getRc(w / 2 - 585, h / 2, 2, 5, vec(0, -19), 'red'),
];

document.addEventListener('mousedown', e => {
    if (e.button === 1) {
        planets.pop();
        return;
    }
    const rc = getRc(e.pageX, e.pageY);
    rc.mass = 1000000000;
    if (planets.length > 0) {
        rc.mass = 500000 - planets.length * 1000;
        const lp = planets[planets.length - 1];
        rc.vel = vec(lp.vel.y, -lp.vel.x);
        if (planets.length === 1) {
            const d = scale(normalize(sub(lp.center, vec(e.pageX, e.pageY))), 4);
            rc.vel = vec(d.y, -d.x);
        }
    }
    planets.push(rc);
});

setInterval(
    () => {
        // if (keys['ArrowLeft']) {
        //     rc.vel.x -= 0.2;
        // }
        // if (keys['ArrowRight']) {
        //     rc.vel.x += 0.2;
        // }
        // if (keys[' ']) {
        //     if (lcoll) {
        //         rc.vel.y -= 8;
        //     }
        // }
        // if (keys['ArrowUp']) {
        //     rc.vel.y -= 0.2;
        // }
        // if (keys['ArrowDown']) {
        //     rc.vel.y += 0.2;
        // }
        // rc.vel.y += 0.1;
        // rc.vel = scale(rc.vel, 0.99);


        for (let i = 0; i < planets.length; i += 1) {
            planets[i].accln = vec(0, 0);
        }

        for (let i = 0; i < planets.length; i += 1) {
            for (let j = i + 1; j < planets.length; j += 1) {
                const a = planets[i].center;
                const b = planets[j].center;
                const s = i === 0 ? 52 : 12;
                const dist = (distance(a, b) || 1) * s;
                const N = normalize(sub(a, b));
                const force = 0.01 * 6.67 * planets[i].mass * planets[j].mass / (dist * dist);
                planets[j].accln = add(planets[j].accln, scale(N, -force / planets[j].mass));
            }
        }
        planets.forEach((d, i) => {
            planets[i].vel = add(d.vel, d.accln);
            planets[i].trail = planets[i].trail || [];
            planets[i].trail.push(planets[i].center);
            planets[i].center = add(d.center, d.vel);
        });
        // render
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, w, h);
        planets.forEach(d => {
            drawCircle(d, d.color);
            const a = d.trail;
            for (let i = 1; i < a.length; i += 1) {
                drawLine(a[i - 1], a[i], d.color);
            }
        });
    },
    20,
);
