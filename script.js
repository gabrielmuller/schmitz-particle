const canvas = document.getElementById("display");
const ctx = canvas.getContext('2d');
const headAngle = 0.6;

let animating = false;

let S = 0; // S is shorthand for canvas size
let headLength = 0;
let normalLength = 0;

let cellSize = 0;
let cellStart = 0;
let cellEnd = 0;
let mousePos = {x: 0, y: 0};

let resize = () => {
    rect = document.getElementById("container").getBoundingClientRect();
    S = rect.width;
    ctx.canvas.width = S;
    ctx.canvas.height = S;
    headLength = S * 0.014;
    normalLength = S * 0.1;
    cellSize = S * 0.5;
    cellStart = (S - cellSize) / 2;
    cellEnd = cellStart + cellSize;
    redraw();
}

window.onresize = resize;

function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2); 
    ctx.fill();
}

function arrow(ctx, ox, oy, dx, dy, lengthRatio = 1)  {
    let tx = ox + dx;
    let ty = oy + dy;
    let angle = Math.atan2(dy, dx);
    let lineCap = ctx.lineCap;


    let hl = headLength * lengthRatio;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(tx, ty);
    ctx.moveTo(tx, ty);
    ctx.lineTo(
        tx - Math.cos(angle - headAngle) * hl,
        ty - Math.sin(angle - headAngle) * hl
    );
    ctx.moveTo(tx, ty);
    ctx.lineTo(
        tx - Math.cos(angle + headAngle) * hl,
        ty - Math.sin(angle + headAngle) * hl
    );
    ctx.moveTo(tx, ty);
    ctx.stroke();
    ctx.lineCap = lineCap;
}

function normalPlane(ctx, ox, oy, nx, ny, showPlane=true) {
    ctx.strokeStyle = 'darkslateblue';
    ctx.fillStyle = 'darkslateblue';
    circle(ctx, ox, oy, S * 0.01);
    arrow(ctx, ox, oy, nx * normalLength, ny * normalLength);
    if (!showPlane) return;
    ctx.strokeStyle = '#2222FF90';
    ctx.fillStyle = '#2222FF40';
    ctx.beginPath();
    const px = ny;
    const py = -nx;
    ctx.moveTo(ox - px * 2*S, oy - py * 2*S);
    ctx.lineTo(ox + px * 2*S, oy + py * 2*S);
    ctx.stroke();
}

let p = 1;


const steps = [
    {
        "plane": true,
        "toPlane": false,
        "partial": false,
        "centroid": true,
        "forceCount": 32,
        "interp": false,
        "iterative": false,
        "animate": true,
    },
    {
        "plane": false,
        "toPlane": false,
        "partial": false,
        "centroid": false,
        "forceCount": 0,
        "interp": false,
        "iterative": false,
        "animate": false,
    },
    {
        "plane": true,
        "toPlane": false,
        "partial": false,
        "centroid": false,
        "forceCount": 0,
        "interp": false,
        "iterative": false,
        "animate": false,
    },
    {
        "plane": true,
        "toPlane": true,
        "partial": false,
        "centroid": false,
        "forceCount": 0,
        "interp": false,
        "iterative": false,
        "animate": false,
    },
    {
        "plane": false,
        "toPlane": true,
        "partial": true,
        "centroid": false,
        "forceCount": 0,
        "interp": false,
        "iterative": false,
        "animate": false,
    },
    {
        "plane": false,
        "toPlane": false,
        "partial": false,
        "centroid": true,
        "forceCount": 0,
        "interp": false,
        "iterative": false,
        "animate": false,
    },
    {
        "plane": false,
        "toPlane": false,
        "partial": true,
        "centroid": true,
        "forceCount": 1,
        "interp": true,
        "iterative": false,
        "animate": false,
    },
    {
        "plane": false,
        "toPlane": false,
        "partial": true,
        "centroid": true,
        "forceCount": 32,
        "interp": false,
        "iterative": true,
        "animate": false,
    },
    {
        "plane": true,
        "toPlane": false,
        "partial": true,
        "centroid": true,
        "forceCount": 32,
        "interp": false,
        "iterative": false,
        "animate": true,
    },
]

class Hermite {
    constructor(ox, oy, ax, ay) {
        this.t = 0;
        this.ox = ox;
        this.oy = oy;
        this.setNormal(1, 1);
        this.setAxis(ax, ay);
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

    update() {
        this.posX = cellStart + this.ox * cellSize + this.ax * this.t * cellSize;
        this.posY = cellStart + this.oy * cellSize + this.ay * this.t * cellSize;
        this.d = this.posX*this.nx+this.posY*this.ny;
    }

    vectorTo(x, y) {
        let dist = x*this.nx +
                   y*this.ny - this.d;
        return [this.nx * dist,
                this.ny * dist];
    }
}

let input = [
    new Hermite(0, 0, 0, 1),
    new Hermite(0, 1, 1, 0),
    new Hermite(1, 0, -1, 0),
    new Hermite(1, 1, 0, -1),
];

const strength = Math.sqrt(0.05);

let step = 0;
let st;

function nextStep() {
    if (step >= steps.length) return;
    if (step > 0) {
        document.getElementById('s' + (step-1)).style.display = "none";
    }
    document.getElementById('s' + step).style.display = "block";
    st = steps[step]
    step++;
    p = 0;
    redraw();
}

nextStep();

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

document.onmousemove = function (e) {
    mousePos = getMousePos(canvas, e);
};

function draw() {
    animating = true;
    ctx.clearRect(0, 0, S, S);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = Math.round(S * 0.005);
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

    ctx.lineWidth = S * 0.006;
    if (st.animate) {
        input[0].setNormal(Math.sin(p), Math.cos(p));
        input[1].setNormal(Math.sin(p * 1.618), Math.cos(p * 1.618));
        input[2].setNormal(Math.sin(p * 1.618 * 0.1), Math.cos(p * 1.618 * 0.8));
        input[3].setNormal(Math.sin(p * 1.618 * 0.01), Math.cos(p * 1.618) * 0.02);
        input[0].t = Math.abs(Math.sin(p));
        input[1].t = Math.abs(Math.cos(p));
        input[3].t = Math.abs(Math.sin(p * 0.1518));
        input[2].t = Math.abs(Math.cos(p * 0.4683));
    }
    let centerX = 0;
    let centerY = 0;
    ctx.lineWidth = 3;
    input.forEach((hermite, _) => {
        hermite.update();
        normalPlane(ctx, hermite.posX, hermite.posY, hermite.nx, hermite.ny, st.plane);
        centerX += hermite.posX;
        centerY += hermite.posY;
    });

    centerX /= input.length;
    centerY /= input.length;

    let partialForcesX = [0, 0, 0, 0];
    let partialForcesY = [0, 0, 0, 0];

    ctx.strokeStyle = 'green';
    ctx.fillStyle = 'green';

    [cellStart, cellEnd].forEach((x, i) => {
        [cellStart, cellEnd].forEach((y, j) => {
            if (st.partial || st.toPlane) {
                circle(ctx, x, y, S * 0.01);
            }
            let k = i * 2 + j;
            ctx.lineWidth = 2;
            input.forEach((hermite, _) => {
                const [vx, vy] = hermite.vectorTo(x, y);
                if (st.toPlane) {
                    arrow(ctx, x, y, -vx, -vy);
                }
                partialForcesX[k] -= vx;
                partialForcesY[k] -= vy;
            });
            ctx.lineWidth = 4;
            partialForcesX[k] *= strength;
            partialForcesY[k] *= strength;
            if (st.partial) {
                arrow(ctx, x, y, partialForcesX[k], partialForcesY[k]);
            }
        });
    });

    ctx.lineWidth = 2;
    if (st.interp) {
        ctx.strokeStyle = "#aaa";
        ctx.beginPath();

        ctx.moveTo(cellStart, centerY);
        ctx.lineTo(cellEnd, centerY);

        ctx.moveTo(centerX, cellStart);
        ctx.lineTo(centerX, cellEnd);

        ctx.stroke();
    }

    ctx.strokeStyle = 'crimson';
    ctx.fillStyle = 'crimson';

    if (st.centroid) {
        circle(ctx, centerX, centerY, S * 0.004);
    }


    let forceCount = st.forceCount;
    if (st.iterative) {
        const period = 2;
        forceCount *= (p % period) / period;
    }
    for (let i = 0; i < forceCount; i++) {
        forceX = 0;
        forceY = 0;
        [cellStart, cellEnd].forEach((x, i) => {
            [cellStart, cellEnd].forEach((y, j) => {
                let k = i * 2 + j;
                let area = (1-Math.abs(centerX-x)/cellSize) * (1-Math.abs(centerY-y)/cellSize)
                forceX += partialForcesX[k] * area;
                forceY += partialForcesY[k] * area;
            });
        });

        arrow(ctx, centerX, centerY, forceX, forceY, 0.5);

        centerX += forceX;
        centerY += forceY;
        centerX = Math.min(Math.max(centerX, cellStart), cellEnd);
        centerY = Math.min(Math.max(centerY, cellStart), cellEnd);
        circle(ctx, centerX, centerY, S * 0.004);
    }

    mousePos.x = Math.min(cellEnd, Math.max(cellStart, mousePos.x));
    mousePos.y = Math.min(cellEnd, Math.max(cellStart, mousePos.y));

    dists = [cellStart - mousePos.x,
             cellEnd - mousePos.x,
             cellStart - mousePos.y,
             cellEnd - mousePos.y];


    if (st.animate || st.iterative) {
        p += 0.005;
        window.requestAnimationFrame(draw);
    } else {
        animating = false;
    }

}

function redraw() { if (!animating) draw() };
resize();
