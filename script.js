let ctx = document.getElementById("demo").getContext('2d');
const S = document.body.offsetWidth * 0.7; // S is shorthand for size
ctx.canvas.width  = S;
ctx.canvas.height  = S;
Object.getPrototypeOf(ctx).circle = (x, y, r) => ctx.arc(x, y, r, 0, Math.PI * 2);

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
            ctx.circle(x, y, 0.04 * S);
            ctx.fill();
            ctx.stroke()
        });
    });

    pos++;
    //window.requestAnimationFrame(draw);
}
