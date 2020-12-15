class Piece {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.configuation = null;
    }

    show() {

    }

    update() {

    }
}

class I_Piece {
    constructor(x, y) {
        Piece.call(this, x, y);

        this.configuration = 0;
    }

    update() {

    }

    show() {
        
    }
}

class Block {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    update() {
        this.y += 100;

    }

    show() {
        strokeWeight(10)
        stroke(0);
        fill('#08deff');
        square(this.x, this.y, block_size);
    }
}