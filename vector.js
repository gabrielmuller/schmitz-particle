class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector(
            this.x + v.x,
            this.y + v.y,
        );
    }
    
    sub(v) {
        return new Vector(
            this.x - v.x,
            this.y - v.y,
        );
    }

    clamp(start, end) {
        return new Vector(
            Math.min(Math.max(this.x, start), end),
            Math.min(Math.max(this.y, start), end),
        );
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    mul(s) {
        return new Vector(
            this.x * s,
            this.y * s,
        );
    }

    div(s) {
        return new Vector(
            this.x / s,
            this.y / s,
        );
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    length() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    normalized() {
        return this.div(this.length());
    }

    perpendicular() {
        return new Vector(this.y, -this.x);
    }
}