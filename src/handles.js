/**
 * Keycodes for the game
 */
const down_arrow = 40;
const up_arrow = 38;
const right_arrow = 39;
const left_arrow = 37;

/**
 * Global variable to store keyboard inputs
 * The are read and cleared from the Game class
 * keys[0] - up
 * keys[1] - down
 * keys[2] - left
 * keys[3] - right
 */
var keys = [0, 0, 0, 0];

document.addEventListener('keydown', event => {
    if ([down_arrow, up_arrow, right_arrow, left_arrow].includes(event.which)) {
    	event.preventDefault();
    }
    switch (event.which) {
        case down_arrow:
            keys[1] = 1;
            break;
        
        case up_arrow:
            keys[0] = 1;
            break;

        case right_arrow:
            keys[3] = 1;
            break;   

        case left_arrow:
            keys[2] = 1;
            break;      
        }
});