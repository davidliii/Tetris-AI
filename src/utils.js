/* COLORS */
const light_blue = '#08deff';
const yellow = '#f7ff00';
const red = '#ff0000';
const orange = '#ff7700';
const dark_blue = '#2134ff';
const green = '#00ff51'
const purple = '#b700ff';

const background_color = '#e3e3e3';
const grid_line_color = '#b5b5b5';
const projection_color = '#8f8f8f';

const block_size = 30;
const grid_line_width = 2;

const fall_dist = 100;

function cantor(k1, k2) { // pairing 
    return 0.5 * (k1+k2) * (k1 + k2 + 1) + k2
}

function triple_pair(a, b, c) {
    return cantor(cantor(a, b), c); 
}