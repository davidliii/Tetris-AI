const down_arrow = 40;
const up_arrow = 38;
const right_arrow = 39;
const left_arrow = 37;

var keys = [0, 0, 0, 0];
// keys[0] - up
// keys[1] - down
// keys[2] - left
// keys[3] - right

document.addEventListener('keydown', event => {
    if ([32, 37, 38, 39, 40].includes(event.which)) {
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