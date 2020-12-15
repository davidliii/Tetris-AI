var game;

function preload() {
    
}

function setup() {
    createCanvas(600, 1000);
    game = new Game();

    
    
    
}

function draw() {
    game.update();
    game.show();
}