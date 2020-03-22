"use strict"

const canvas = document.getElementById("display");
const ctx = canvas.getContext('2d');

const headAngle = 0.6;
const strength = Math.sqrt(0.05);

let g = {
    animating: false,
    elapsed: 0,

    S: 0, // g.S is shorthand for canvas size
    headLength: 0,
    normalLength: 0,

    cellSize: 0,
    cellStart: 0,
    cellEnd: 0,
    corners: [],
    mousePos: new Vector(0, 0),

    step: 0,
};

function resize() {
    let rect = document.getElementById("container").getBoundingClientRect();
    g.S = rect.width;
    ctx.canvas.width = g.S;
    ctx.canvas.height = g.S;
    g.headLength = g.S * 0.014;
    g.normalLength = g.S * 0.1;
    g.cellSize = g.S * 0.5;
    g.cellStart = (g.S - g.cellSize) / 2;
    g.cellEnd = g.cellStart + g.cellSize;

    [g.cellStart, g.cellEnd].forEach((x, i) => {
        [g.cellStart, g.cellEnd].forEach((y, j) => {
            g.corners[i*2 + j] = new Vector(x, y);
        });
    });

    redraw();
}

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


    let hl = g.headLength * lengthRatio;
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
    circle(ctx, origin, g.S * 0.01);
    ctx.lineWidth = g.S * 0.006;
    arrow(ctx, origin, normal.mul(g.normalLength));

    if (!showPlane) return;

    ctx.strokeStyle = '#2222FF90';
    ctx.fillStyle = '#2222FF40';
    ctx.lineWidth = g.S * 0.004;

    ctx.beginPath();

    const plane = normal.perpendicular();
    const start = origin.sub(plane.mul(g.S));
    const end = origin.add(plane.mul(g.S));
    moveTo(ctx, start);
    lineTo(ctx, end);
    ctx.stroke();
}


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
        let start = new Vector(g.cellStart, g.cellStart);
        this.pos = start
                .add(this.origin.mul(g.cellSize))
                .add(this.axis.mul(this.t * g.cellSize));
        this.d = this.pos.dot(this.normal);
    }

    vectorTo(v) {
        let distance = v.dot(this.normal) - this.d;
        return this.normal.mul(distance);
    }
}

g.input = [
    new Hermite(new Vector(0, 0), new Vector(0, 1)),
    new Hermite(new Vector(0, 1), new Vector(1, 0)),
    new Hermite(new Vector(1, 0), new Vector(-1, 0)),
    new Hermite(new Vector(1, 1), new Vector(0, -1)),
];

resize();

function changeStep(newStep) {
    if (newStep >= steps.length || newStep < 0) newStep = 0;
    document.getElementById('prev').style.display = newStep > 0 ? "block" : "none";
    document.getElementById('next').style.display = newStep < steps.length-1 ? "block" : "none";
    document.getElementById('s' + g.step).style.display = "none";
    document.getElementById('s' + newStep).style.display = "block";
    window.history.pushState(null, '', "?step=" + newStep);
    g.elapsed = 0;
    g.step = newStep;
    redraw();
}

let nextStep = () => changeStep(g.step + 1);
let prevStep = () => changeStep(g.step - 1);

function updateStepFromURL() {
    const url = new URL(window.location.href);
    changeStep(parseInt(url.searchParams.get("step") || 0, 10));
};


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return new Vector(
        evt.clientX - rect.left,
        evt.clientY - rect.top
    );
}

document.onmousemove = function (e) {
    g.mousePos = getMousePos(canvas, e);
};

function draw() {
    g.animating = true;
    let st = steps[g.step];

    ctx.clearRect(0, 0, g.S, g.S);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = Math.round(g.S * 0.005);
    ctx.beginPath();

    ctx.moveTo(0, g.cellStart);
    ctx.lineTo(g.S, g.cellStart);

    ctx.moveTo(0, g.cellEnd);
    ctx.lineTo(g.S, g.cellEnd);

    ctx.moveTo(g.cellStart, 0);
    ctx.lineTo(g.cellStart, g.S);

    ctx.moveTo(g.cellEnd, 0);
    ctx.lineTo(g.cellEnd, g.S);

    ctx.stroke()

    if (st.animate) {
        g.input[0].normal = new Vector(Math.sin(g.elapsed), Math.cos(g.elapsed));
        g.input[1].normal = new Vector(Math.sin(g.elapsed * 1.618), Math.cos(g.elapsed * 1.618));
        g.input[2].normal = new Vector(Math.sin(g.elapsed * 1.618 * 0.1), Math.cos(g.elapsed * 1.618 * 0.8));
        g.input[3].normal = new Vector(Math.sin(g.elapsed * 1.618 * 0.01), Math.cos(g.elapsed * 1.618) * 0.02);
        g.input[0].t = Math.abs(Math.sin(g.elapsed));
        g.input[1].t = Math.abs(Math.cos(g.elapsed));
        g.input[3].t = Math.abs(Math.sin(g.elapsed * 0.1518));
        g.input[2].t = Math.abs(Math.cos(g.elapsed * 0.4683));
    }
    let center = new Vector(0, 0);

    g.input.forEach((hermite, _) => {
        hermite.update();
        normalPlane(ctx, hermite.pos, hermite.normal, st.plane);
        center = center.add(hermite.pos);
    });

    center = center.div(g.input.length);

    let partialForces = [];
    for (let i = 0; i < 4; i++) partialForces[i] = new Vector(0, 0);

    ctx.strokeStyle = 'green';
    ctx.fillStyle = 'green';

    g.corners.forEach((corner, i) => {
        if (st.partial || st.toPlane) {
            circle(ctx, corner, g.S * 0.01);
        }
        ctx.lineWidth = 2;
        g.input.forEach((hermite, _) => {
            const v = hermite.vectorTo(corner);
            if (st.toPlane) {
                arrow(ctx, corner, v.mul(-1));
            }
            partialForces[i] = partialForces[i].sub(v);
        });
        ctx.lineWidth = 4;
        partialForces[i] = partialForces[i].mul(strength);
        if (st.partial) {
            arrow(ctx, corner, partialForces[i]);
        }
    });

    ctx.lineWidth = 2;

    ctx.strokeStyle = 'crimson';
    ctx.fillStyle = 'crimson';

    if (st.centroid) {
        circle(ctx, center, g.S * 0.004);
    }


    let forceCount = st.forceCount;

    if (st.iterative) {
        const period = 2;
        forceCount *= (g.elapsed % period) / period;
    }

    for (let i = 0; i < forceCount; i++) {
        let force = new Vector(0, 0);
        g.corners.forEach((corner, i) => {
            let area = (1-Math.abs(center.x-corner.x)/g.cellSize) * (1-Math.abs(center.y-corner.y)/g.cellSize)
            force = force.add(partialForces[i].mul(area));
        });

        arrow(ctx, center, force, 0.5);

        center = center.add(force);
        center = center.clamp(g.cellStart, g.cellEnd); 
        circle(ctx, center, g.S * 0.004);
    }

    if (st.interp) {
        ctx.strokeStyle = "#aaa";
        ctx.beginPath();

        ctx.moveTo(g.cellStart, center.y);
        ctx.lineTo(g.cellEnd, center.y);

        ctx.moveTo(center.x, g.cellStart);
        ctx.lineTo(center.x, g.cellEnd);

        ctx.stroke();
    }

    let selection = null;
    let minDistance = g.S * 0.15;

    g.corners.forEach((corner, i) => {
        let normal = g.input[i].axis.perpendicular();
        let distance = g.mousePos.distanceToPlane(g.corners[i], normal);

        if (Math.abs(distance) < minDistance) {
            minDistance = distance;
            selection = g.mousePos.sub(normal.mul(distance));
        }
    });

    if (selection) {
        let clamped = selection.clamp(g.cellStart, g.cellEnd);
        if (selection.distance(clamped) < g.S * 0.1) {
            circle(ctx, clamped, g.S * 0.01);
        }
    }

    if (st.animate || st.iterative) {
        g.elapsed += 0.005;
        window.requestAnimationFrame(draw);
    } else {
        g.animating = false;
    }

}

function redraw() { if (!g.animating) draw() };

resize();
window.onresize = resize;
window.onpopstate = updateStepFromURL;