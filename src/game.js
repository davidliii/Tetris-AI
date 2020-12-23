class Game {
    constructor() {
        this.grid_width = 10;
        this.grid_height = 22;
        this.grid = this.makeGrid();

        this.current_piece = this.getRandomPiece();
        this.next_piece = this.getRandomPiece();

        this.fall_rate = 750;
        this.secondsPassed = 0;
        this.start_t = this.getTime();
        this.score = 0;

        this.player = new Player();
        this.moves = [];
        this.usingAI = false;

        this.createRandomState(10);
    }

    getTime() {
        return new Date().getTime();
    }

    update() {
        let dx, dy, rotate_dir;

        if (this.usingAI) {

        }

        else {
            dx = keys[3] - keys[2];
            dy = keys[1];
            rotate_dir = keys[0]
        }

        let curr_t = this.getTime();
        let time_elapsed = curr_t - this.start_t;
        if (time_elapsed >= this.fall_rate) {
            this.start_t = curr_t;
            if (!this.usingAI) {
                // update move to go down in next show()
                dy += 1; 
            }
            
            // check if piece needs to be locked
            let isLocked = this.checkPieceLocked();
            if (isLocked) {
                this.lockPiece();
                this.current_piece = this.next_piece;
                this.next_piece = this.getRandomPiece();
            }
            
            // check for rows to be cleared
            let rowsToClear = this.getFilledRows();
            this.clearRows(rowsToClear)
            this.score += rowsToClear.length;

            if (isLocked && this.usingAI) {
                // look for optimal sequence of moves to move piece to best location
                this.moves = this.player.getMoves(this.grid, this.current_piece);
            }
        }

        this.current_piece.update(dx, dy, rotate_dir, this.grid_width, this.grid_height);
        if (!this.checkValid()) {
            this.current_piece.update(-dx, -dy, -rotate_dir, this.grid_width, this.grid_height);
        }
        keys = [0, 0, 0, 0];
    }

    update2() {
        let curr_t = this.getTime();
        let time_elapsed = curr_t - this.start_t;
        if (time_elapsed >= this.fall_rate) {
            this.start_t = curr_t;
            let state = this.player.convertToState(this.grid)
            this.player.evaluateState(state);
        }
    }

    show() {
        for (let i = 0; i < this.grid.length; ++i) {
            for (let j = 0; j < this.grid[i].length; ++j) {
                this.grid[i][j].show();
            }
        }

        //this.showProjection();
        this.current_piece.show();
        this.showNextPiece();
        this.showScore();
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

    createRandomState(numBlocks) {
        // sets up grid in random state (given number blocks to drop)
        for (let i = 0; i < numBlocks; ++i) {
            let x = Math.floor(Math.random() * 6 -3); // random x between 3 and -3
            let num_rotations = Math.floor(Math.random() * 4); // random x between 0 and 3

            this.current_piece = this.getRandomPiece();
            this.current_piece.x += x;
            this.current_piece.current_cfg_idx = num_rotations % this.current_piece.cfgs.length;
            

            while (!this.checkPieceLocked()) {
                this.current_piece.y += 1;
            }

            this.lockPiece();
            this.current_piece = this.next_piece;
            this.next_piece = this.getRandomPiece();
            
            // check for rows to be cleared
            let rowsToClear = this.getFilledRows();
            this.clearRows(rowsToClear);
        }
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

            if (this.grid[y][x].color != background_color) {
                return false;
            }
        }

        return true;
    }

    getRandomPiece() {
        let pieces = [I_Piece, O_Piece, T_Piece, S_Piece, Z_Piece, L_Piece, J_Piece];
        let idx = Math.floor(Math.random() * pieces.length);
        
        return new pieces[idx]();
    }

    checkPieceLocked() {
        let cfg = this.current_piece.cfgs[this.current_piece.current_cfg_idx];
        for (let i = 0; i < cfg.length; ++i) {
            let x = cfg[i][0] + this.current_piece.x;
            let y = cfg[i][1] + this.current_piece.y;

            if (y == this.grid_height - 1) { // reached bottom of screen
                return true;
            }

            if (this.grid[y+1][x].color != background_color) {
                return true;
            }
        }

        return false;
    }

    lockPiece() {
        let cfg = this.current_piece.cfgs[this.current_piece.current_cfg_idx];
        for (let i = 0; i < cfg.length; ++i) {
            let x = cfg[i][0] + this.current_piece.x;
            let y = cfg[i][1] + this.current_piece.y;

            this.grid[y][x].color = this.current_piece.color;
        }
    }

    getFilledRows() {
        let rows = [];
        for (let i = 0; i < this.grid.length; ++i) {
            let backgroundFound = false;
            for (let j = 0; j < this.grid[i].length; ++j) {
                if (this.grid[i][j].color == background_color) {
                    backgroundFound = true;
                    break;
                }
            }

            if (!backgroundFound) {
                rows.push(i)
            }
        }

        return rows;
    }

    clearRows(rowsToClear) {
        rowsToClear.sort((a, b) => a - b); // clear top rows first

        for (let i = 0; i < rowsToClear.length; ++i) { // for each row to clear
            let row = rowsToClear[i];
            
            // iterate through row and all rows above it
            for (let j = row; j > 0; --j) {
                // if the current row is empty then stop clearing (efficiency)
                if (this.isRowEmpty(j)) { 
                    break;
                }
                 // otherwise copy the colors from the row above
                for (let k = 0; k < this.grid_width; ++k) {
                    this.grid[j][k].color = this.grid[j-1][k].color;
                }
            }
            
            // clear top row colors since they aren't cleared by default
            for (let j = 0 ; j < this.grid_width; ++j) {
                this.grid[0][j].color = background_color;
            }
        }
    }

    isRowEmpty(row) {
        for (let i = 0; i < this.grid_width; ++i) {
            if (this.grid[row][i].color != background_color) {
                return false;
            }
        }
        return true;
    }

    showProjection() {
        let cfg = this.current_piece.cfgs[this.current_piece.current_cfg_idx];
        let x = this.current_piece.x;
        let projected_y = this.current_piece.y;

        let projection_found = false
        while(true) {
            for (let i = 0; i < cfg.length; ++i) {
                let cfg_x = x + cfg[i][0];
                let cfg_y = projected_y + cfg[i][1];
                
                /* we place projects at either:
                    1. bottom of the screen
                    2. right above a colored grid (thus cfg_y + 1)
                */
                if (cfg_y >= this.grid_height -1 || this.grid[cfg_y + 1][cfg_x].color != background_color) {
                    projection_found = true;
                    break;
                }
            }

            if (projection_found) {
                break;
            }
            ++projected_y;
        }

        this.current_piece.project(x, projected_y);
    }

    showNextPiece() {
        strokeWeight(2);
        stroke("#000000");
        fill("#ffffff")
        square(400, 10, 150);
        this.next_piece.preview();
    }

    showScore() {

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