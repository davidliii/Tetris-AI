class Game {
    constructor() {
        this.grid_width = 10;
        this.grid_height = 22;
        this.grid = this.makeGrid();
    }

    update() {
        for (let i = 0; i < this.grid.length; ++i) {
            for (let j = 0; j < this.grid[i].length; ++j) {
                this.grid[i][j].update();
            }
        }
    }

    show() {
        for (let i = 0; i < this.grid.length; ++i) {
            for (let j = 0; j < this.grid[i].length; ++j) {
                this.grid[i][j].show();
            }
        }
    }

    makeGrid() {
        let grid = [];
        
        for (let i = 0; i < this.grid_height; ++i) {
            let grid_row = [];
            for (let j = 0; j < this.grid_width; ++j) {
                grid_row.push(new GridSpace(j, i));
            }

            grid.push(grid_row);
        }

        return grid;
    }
}

class GridSpace {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = background_color;
        this.grid_line_color = grid_line_color;
    }

    update() {
        if (this.color == background_color) {
            this.grid_line_color = grid_line_color;
        }

        else {
            this.grid_line_color = background_color;
        }
    }

    show() {
        strokeWeight(grid_line_width);
        stroke(this.grid_line_color);
        fill(this.color);
        square(this.x * block_size + grid_line_width, 
               this.y * block_size + grid_line_width, 
               block_size);
    }
}