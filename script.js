"use strict"
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
let mousePos = new Vector(0, 0);

function resize() {
    let rect = document.getElementById("container").getBoundingClientRect();
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

function circle(ctx, center, r) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, Math.PI * 2); 
    ctx.fill();
}

function moveTo(ctx, v) {
    ctx.moveTo(v.x, v.y);
}

function lineTo(ctx, v) {
    ctx.lineTo(v.x, v.y);
}


function arrow(ctx, origin, direction, lengthRatio = 1)  {
    let target = origin.add(direction);
    let angle = direction.angle();
    let lineCap = ctx.lineCap;


    let hl = headLength * lengthRatio;
    ctx.lineCap = 'round';

    ctx.beginPath();
    moveTo(ctx, origin);
    lineTo(ctx, target);
    moveTo(ctx, target);
    ctx.lineTo(
        target.x - Math.cos(angle - headAngle) * hl,
        target.y - Math.sin(angle - headAngle) * hl
    );
    moveTo(ctx, target);
    ctx.lineTo(
        target.x - Math.cos(angle + headAngle) * hl,
        target.y - Math.sin(angle + headAngle) * hl
    );
    moveTo(ctx, target);
    ctx.stroke();
    ctx.lineCap = lineCap;
}

function normalPlane(ctx, origin, normal, showPlane=true) {
    ctx.strokeStyle = 'darkslateblue';
    ctx.fillStyle = 'darkslateblue';
    circle(ctx, origin, S * 0.01);
    arrow(ctx, origin, normal.mul(normalLength));

    if (!showPlane) return;

    ctx.strokeStyle = '#2222FF90';
    ctx.fillStyle = '#2222FF40';

    ctx.beginPath();

    const plane = normal.perpendicular();
    const start = origin.sub(plane.mul(S));
    const end = origin.add(plane.mul(S));
    moveTo(ctx, start);
    lineTo(ctx, end);
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
        "interp": true,
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
    constructor(origin, axis) {
        this.t = 0;
        this.origin = origin;
        this.normal = new Vector(Math.random() - 0.5, Math.random() - 0.5);
        this.axis = axis;
    }

    get normal() { return this._normal };

    get axis() { return this._axis };

    set normal(n) {
        this._normal = n.normalized();
    }

    set axis(a) {
        this._axis = a.normalized();
    }

    update() {
        let start = new Vector(cellStart, cellStart);
        this.pos = start
                .add(this.origin.mul(cellSize))
                .add(this.axis.mul(this.t * cellSize));
        this.d = this.pos.dot(this.normal);
    }

    vectorTo(v) {
        let distance = v.dot(this.normal) - this.d;
        return this.normal.mul(distance);
    }
}

let input = [
    new Hermite(new Vector(0, 0), new Vector(0, 1)),
    new Hermite(new Vector(0, 1), new Vector(1, 0)),
    new Hermite(new Vector(1, 0), new Vector(-1, 0)),
    new Hermite(new Vector(1, 1), new Vector(0, -1)),
];

const strength = Math.sqrt(0.05);

let url = new URL(window.location.href);
var step = 0;

function changeStep(newStep) {
    if (newStep >= steps.length || newStep < 0) newStep = 0;
    /*
    if (step > 0) {
        document.getElementById('s' + (step-1)).style.display = "none";
    }
    */
    document.getElementById('s' + step).style.display = "none";
    document.getElementById('s' + newStep).style.display = "block";
    window.history.pushState(null, '', "?step=" + newStep);
    p = 0;
    step = newStep;
    redraw();
}

let nextStep = () => changeStep(step + 1);
let prevStep = () => changeStep(step - 1);

changeStep(parseInt(url.searchParams.get("step") || 0, 10));

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return new Vector(
        evt.clientX - rect.left,
        evt.clientY - rect.top
    );
}

document.onmousemove = function (e) {
    mousePos = getMousePos(canvas, e);
};

function draw() {
    animating = true;
    let st = steps[step];
    console.log(step);
    console.log(steps);

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
        input[0].normal = new Vector(Math.sin(p), Math.cos(p));
        input[1].normal = new Vector(Math.sin(p * 1.618), Math.cos(p * 1.618));
        input[2].normal = new Vector(Math.sin(p * 1.618 * 0.1), Math.cos(p * 1.618 * 0.8));
        input[3].normal = new Vector(Math.sin(p * 1.618 * 0.01), Math.cos(p * 1.618) * 0.02);
        input[0].t = Math.abs(Math.sin(p));
        input[1].t = Math.abs(Math.cos(p));
        input[3].t = Math.abs(Math.sin(p * 0.1518));
        input[2].t = Math.abs(Math.cos(p * 0.4683));
    }
    let center = new Vector(0, 0);
    ctx.lineWidth = 3;

    input.forEach((hermite, _) => {
        hermite.update();
        normalPlane(ctx, hermite.pos, hermite.normal, st.plane);
        center = center.add(hermite.pos);
    });

    center = center.div(input.length);

    let partialForces = [];
    for (let i = 0; i < 4; i++) partialForces[i] = new Vector(0, 0);

    ctx.strokeStyle = 'green';
    ctx.fillStyle = 'green';

    [cellStart, cellEnd].forEach((x, i) => {
        [cellStart, cellEnd].forEach((y, j) => {
            let corner = new Vector(x, y);
            if (st.partial || st.toPlane) {
                circle(ctx, corner, S * 0.01);
            }
            let k = i * 2 + j;
            ctx.lineWidth = 2;
            input.forEach((hermite, _) => {
                const v = hermite.vectorTo(corner);
                if (st.toPlane) {
                    arrow(ctx, corner, v.mul(-1));
                }
                partialForces[k] = partialForces[k].sub(v);
            });
            ctx.lineWidth = 4;
            partialForces[k] = partialForces[k].mul(strength);
            if (st.partial) {
                arrow(ctx, corner, partialForces[k]);
            }
        });
    });

    ctx.lineWidth = 2;

    ctx.strokeStyle = 'crimson';
    ctx.fillStyle = 'crimson';

    if (st.centroid) {
        circle(ctx, center, S * 0.004);
    }


    let forceCount = st.forceCount;

    if (st.iterative) {
        const period = 2;
        forceCount *= (p % period) / period;
    }

    for (let i = 0; i < forceCount; i++) {
        let force = new Vector(0, 0);
        [cellStart, cellEnd].forEach((x, i) => {
            [cellStart, cellEnd].forEach((y, j) => {
                let k = i * 2 + j;
                let area = (1-Math.abs(center.x-x)/cellSize) * (1-Math.abs(center.y-y)/cellSize)
                force = force.add(partialForces[k].mul(area));
            });
        });

        arrow(ctx, center, force, 0.5);

        center = center.add(force);
        center = center.clamp(cellStart, cellEnd); 
        circle(ctx, center, S * 0.004);
    }

    if (st.interp) {
        ctx.strokeStyle = "#aaa";
        ctx.beginPath();

        ctx.moveTo(cellStart, center.y);
        ctx.lineTo(cellEnd, center.y);

        ctx.moveTo(center.x, cellStart);
        ctx.lineTo(center.x, cellEnd);

        ctx.stroke();
    }

    mousePos = mousePos.clamp(cellStart, cellEnd);

    let dists = [cellStart - mousePos.x,
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
