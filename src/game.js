class Game {
    constructor() {
        this.grid_width = 10;
        this.grid_height = 22;
        this.grid = this.makeGrid();

        this.current_piece = new L_Piece();
        this.next_piece;
    }

    update() {
        let dx = keys[3] - keys[2];
        let dy = keys[1];
        let rotate_dir = keys[0]
        

        for (let i = 0; i < this.grid.length; ++i) {
            for (let j = 0; j < this.grid[i].length; ++j) {
                this.grid[i][j].update();
            }
        }
        
        this.current_piece.update(dx, dy, rotate_dir, this.grid_width, this.grid_height);
        if (!this.checkValid()) {
            this.current_piece.update(-dx, -dy, -rotate_dir, this.grid_width, this.grid_height);
        }
        keys = [0, 0, 0, 0];
    }

    show() {
        for (let i = 0; i < this.grid.length; ++i) {
            for (let j = 0; j < this.grid[i].length; ++j) {
                this.grid[i][j].show();
            }
        }

        this.current_piece.show();
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

    checkValid() {
        let cfg = this.current_piece.cfgs[this.current_piece.current_cfg_idx];
        for (let i = 0; i < cfg.length; ++i) {
            let x = cfg[i][0] + this.current_piece.x;
            let y = cfg[i][1] + this.current_piece.y;

            if (x >= this.grid_width || x <= -1 || y <= -1) {
                return false;
            }

            if (y >= this.grid_height) {
                return false;
            }
        }

        return true;
    }
}

class GridSpace {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = background_color;
    }

    update() {
        return;
    }

    show() {
        strokeWeight(grid_line_width);
        stroke(grid_line_color);
        fill(this.color);
        square(this.x * block_size + grid_line_width, 
               this.y * block_size + grid_line_width, 
               block_size);
    }
}