const S = document.body.offsetWidth * 0.7; // S is shorthand for size
function circle(ctx, x, y, r) {
    ctx.arc(x, y, r, 0, Math.PI * 2); 
}
const headLength = S * 0.02;
const headAngle = 0.6;
function arrow(ctx, ox, oy, dx, dy)  {
    let tx = ox + dx;
    let ty = oy + dy;
    let angle = Math.atan2(dy, dx);
    let lineCap = ctx.lineCap;

    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(tx, ty);
    ctx.moveTo(tx, ty);
    ctx.lineTo(
        tx - Math.cos(angle - headAngle) * headLength,
        ty - Math.sin(angle - headAngle) * headLength
    );
    ctx.moveTo(tx, ty);
    ctx.lineTo(
        tx - Math.cos(angle + headAngle) * headLength,
        ty - Math.sin(angle + headAngle) * headLength
    );
    ctx.moveTo(tx, ty);
    ctx.stroke();
    ctx.lineCap = lineCap;
}

const normalLength = S * 0.15;
function normalPlane(ctx, ox, oy, nx, ny) {
    ctx.strokeStyle = 'darkblue';
    arrow(ctx, ox, oy, nx * normalLength, ny * normalLength);
    ctx.strokeStyle = '#2222FF90';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const px = ny;
    const py = -nx;
    ctx.moveTo(ox - px * 2*S, oy - py * 2*S);
    ctx.lineTo(ox + px * 2*S, oy + py * 2*S);
    ctx.stroke();
}
let ctx = document.getElementById("demo").getContext('2d');
ctx.canvas.width = S;
ctx.canvas.height = S;

let cellSize = S * 0.65;
let cellStart = (S - cellSize) / 2;
let cellEnd = cellStart + cellSize;

let p = 0;

window.requestAnimationFrame(draw);

class Hermite {
    constructor(ox, oy, ax, ay) {
        this.t = 0;
        this.ox = ox;
        this.oy = oy;
        this.setNormal(1, 1);
        this.setAxis(ax, ay);
    }

    get posX() {
        return this.ox + this.ax * this.t * cellSize;
    }

    get posY() {
        return this.oy + this.ay * this.t * cellSize;
    }

    setNormal(nx, ny) {
        const length = Math.sqrt(nx*nx + ny*ny);
        this.nx = nx / length;
        this.ny = ny / length;
    }

    setAxis(ax, ay) {
        const length = Math.sqrt(ax*ax + ay*ay);
        this.ax = ax / length;
        this.ay = ay / length;
    }

    distanceTo(x, y) {

    }
}

let input = [
    new Hermite(cellStart, cellStart, 1, 0),
    new Hermite(cellStart, cellEnd, 0, -1),
    //new Hermite(0.5, cellEnd, cellStart, -1, 0),
    //new Hermite(0.5, cellEnd, cellEnd, 0, -1),
];

function draw() {
    ctx.clearRect(0, 0, S, S);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = Math.round(S * 0.01);
    ctx.beginPath();

    ctx.moveTo(0, cellStart);
    ctx.lineTo(S, cellStart);

    ctx.moveTo(0, cellEnd);
    ctx.lineTo(S, cellEnd);

    ctx.moveTo(cellStart, 0);
    ctx.lineTo(cellStart, S);

    ctx.moveTo(cellEnd, 0);
    ctx.lineTo(cellEnd, S);

    ctx.stroke()

    ctx.fillStyle = 'white';

    [cellStart, cellEnd].forEach((x, _) => {
        [cellStart, cellEnd].forEach((y, _) => {
            ctx.beginPath();
            circle(ctx, x, y, 0.04 * S);
            ctx.fill();
            ctx.stroke()
        });
    });

    ctx.lineWidth = S * 0.006;
    input[0].setNormal(Math.sin(p), Math.cos(p));
    input[1].setNormal(Math.sin(p * 1.618), Math.cos(p * 1.618));
    input[0].t = Math.abs(Math.sin(p));
    input[1].t = Math.abs(Math.cos(p));
    console.log(input[0].t);
    let sumX = 0;
    let sumY = 0;
    input.forEach((hermite, _) => {
        normalPlane(ctx, hermite.posX, hermite.posY, hermite.nx, hermite.ny);
        sumX += hermite.posX;
        sumY += hermite.posY;
    });

    sumX /= input.length;
    sumY /= input.length;

    ctx.fillStyle = 'green';
    ctx.strokeStyle = '#222';
    ctx.beginPath();
    circle(ctx, sumX, sumY, S * 0.01);
    ctx.fill();
    ctx.stroke();

    
    p += 0.01;
    window.requestAnimationFrame(draw);
}
