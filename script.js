const S = document.body.offsetWidth * 0.7; // S is shorthand for size
function circle(ctx, x, y, r) {
    ctx.arc(x, y, r, 0, Math.PI * 2); 
}
const headLength = S * 0.02;
const headAngle = 0.6;
function arrow(ctx, ox, oy, tx, ty)  {
    let dx = tx - ox;
    let dy = ty - oy;
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

let ctx = document.getElementById("demo").getContext('2d');
ctx.canvas.width = S;
ctx.canvas.height = S;

let cellSize = S * 0.8;
let cellStart = (S - cellSize) / 2;
let cellEnd = cellStart + cellSize;

let pos = 0;

window.requestAnimationFrame(draw);

function draw() {
    ctx.clearRect(0, 0, S, S);
    ctx.strokeStyle = '#222';
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
    //arrow(ctx, Math.abs(Math.sin(pos)) * S*0.4, cellStart, cellEnd, Math.abs(Math.cos(pos)*S*0.2));
    //window.requestAnimationFrame(draw);
}
