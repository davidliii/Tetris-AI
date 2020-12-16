var game;

function preload() {
    
}

function setup() {
    createCanvas(600, 1000);
    background('#ffffff');
    game = new Game();
}

function draw() {
    background('#ffffff');
    game.update();
    game.show();
}