var game;

function setup() {
    createCanvas(600, 800);
    background('#ffffff');
    game = new Game();
}

function draw() {
    background('#ffffff');
    game.update();
    game.show();
}