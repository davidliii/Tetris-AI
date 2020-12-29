/**
 * Game class that handles all of the logic for Tetris
 */
class Game {
    /**
     * Creates a game
     */
    constructor() {
        this.grid_width = 10;
        this.grid_height = 22;
        this.grid = this.makeGrid();

        this.current_piece = this.getRandomPiece();
        this.next_piece = this.getRandomPiece();

        this.fall_rate = 750;
        this.start_t = this.getTime();
        
        this.score = 0;

        // AI-control elements
        this.usingAI = false;
        this.ai_rate = 50;
        this.player = new Player();

        this.move_idx = 0;
        this.moves = this.player.getMoves(this.grid, this.current_piece);
    }

    /**
     * Checks to see if game is finished
     * @returns {Boolean} - Whether or not game is over
     */
    isGameOver() {
        for (let i = 0; i < this.grid_width; ++i) {
            if (this.grid[1][i].color != background_color) {
                return true;
            }
        }
        return false;
    }

    /**
     * Resets game elements
     */
    resetGame() {
        this.grid = this.makeGrid();
        this.current_piece = this.getRandomPiece();
        this.next_piece = this.getRandomPiece();

        this.move_idx = 0;
        this.moves = this.player.getMoves(this.grid, this.current_piece);
    }

    /**
     * Gets time 
     * @returns {Number} - Time in milliseconds
     */

    getTime() {
        return new Date().getTime();
    }

    /**
     * Wrapper function that updates the game depending on the player-mode
     */
    update() {
        if (this.usingAI) {
            this.updateAI();
        }
        else {
            this.updatePlayer();
        }
    }

    /**
     * Updates the game based on player keyboard inputs
     */
    updatePlayer() {
        // Get player inputs and reset them for next update
        let dx = keys[3] - keys[2];
        let dy = keys[1];
        let rotate_dir = keys[0]
        keys = [0, 0, 0, 0];

        // Updates occur in timed-increments
        let time_elapsed = this.getTime() - this.start_t;

        if (time_elapsed >= this.fall_rate) {
            this.start_t = this.getTime();
            dy += 1;
            
            if (this.checkPieceLocked()) {
                this.lockPiece();

                if (this.isGameOver()) {
                    this.resetGame();
                    return;
                }

                this.current_piece = this.next_piece;
                this.next_piece = this.getRandomPiece();
            }
            
            let rowsToClear = this.getFilledRows();
            this.clearRows(rowsToClear)
            this.score += rowsToClear.length;
        }

        // Moves current piece, but if the move is invalid then the
        // move is canceled by updating it in the opposite direction
        this.current_piece.update(dx, dy, rotate_dir);
        if (!this.checkValid()) {
            this.current_piece.update(-dx, -dy, -rotate_dir);
        }        
    }

    /**
     * Updates the game using AI
     */
    updateAI() {
        // Updates occur in timed-increments
        let time_elapsed = this.getTime() - this.start_t;
        if (time_elapsed >= this.ai_rate) {
            this.start_t = this.getTime();

            if (this.move_idx == this.moves.length) {
                this.lockPiece();

                if (this.isGameOver()) {
                    this.resetGame();
                    return;
                }

                this.current_piece = this.next_piece;
                this.next_piece = this.getRandomPiece();

                let rowsToClear = this.getFilledRows();
                this.clearRows(rowsToClear)
                this.score += rowsToClear.length;
                
                // Fetch the next sequence of moves
                this.move_idx = 0;
                this.moves = this.player.getMoves(this.grid, this.current_piece);
            }
            
            // Update piece using move
            if (this.moves[this.move_idx] == 'r') {
                this.current_piece.x += 1;
            }
            else if (this.moves[this.move_idx] == 'l') {
                this.current_piece.x -= 1;
            }
            else if (this.moves[this.move_idx] == 'd') {
                this.current_piece.y += 1;
            }
            else {
                this.current_piece.current_cfg_idx = parseInt(this.moves[this.move_idx]);
            }

            this.move_idx += 1;
        }
    }

    /**
     * Displays the game on the canvas
     */
    show() {
        for (let i = 0; i < this.grid.length; ++i) {
            for (let j = 0; j < this.grid[i].length; ++j) {
                this.grid[i][j].show();
            }
        }
        this.showProjection();
        this.current_piece.show();
        this.showNextPiece();
        this.showScore();
    }

    /**
     * Initializes an empty grid for the game
     */
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

    /**
     * Creates a random game state by dropping numBlocks number of blocks
     * in random orientations and random positions on the grid
     * @param {Number} numBlocks 
     */
    createRandomState(numBlocks) {
        for (let i = 0; i < numBlocks; ++i) {
            let x = Math.floor(Math.random() * 6 - 3);
            let num_rotations = Math.floor(Math.random() * 4);

            this.current_piece = this.getRandomPiece();
            this.current_piece.x += x;
            this.current_piece.current_cfg_idx = num_rotations % this.current_piece.cfgs.length;

            while (!this.checkPieceLocked()) {
                this.current_piece.y += 1;
            }

            this.lockPiece();
            this.current_piece = this.next_piece;
            this.next_piece = this.getRandomPiece();
            
            let rowsToClear = this.getFilledRows();
            this.clearRows(rowsToClear);
        }
    }

     /**
     * Checks if current game state is valid, handles collision detection
     * @returns {Boolean} - Whether or not the state is valid
     */
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

    /**
     * Instatiates a random piece
     * @returns {Piece} - Piece object
     */
    getRandomPiece() {
        let pieces = [I_Piece, O_Piece, T_Piece, S_Piece, Z_Piece, L_Piece, J_Piece];
        let idx = Math.floor(Math.random() * pieces.length);
        
        return new pieces[idx]();
    }

    /**
     * Checks if a piece has reached the bottom of the screen or if directly
     * above another locked piece. If so, the piece should be locked
     * @returns {Boolean} - Whether or not a piece should be locked
     */
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

    /**
     * Locks the current piece onto the grid
     */
    lockPiece() {
        let cfg = this.current_piece.cfgs[this.current_piece.current_cfg_idx];
        for (let i = 0; i < cfg.length; ++i) {
            let x = cfg[i][0] + this.current_piece.x;
            let y = cfg[i][1] + this.current_piece.y;

            this.grid[y][x].color = this.current_piece.color;
        }
    }

    /**
     * Searches through the grid for filled rows
     * @returns {Array.<Number>} - Array of the indeces of filled rows
     */
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
    /**
     * Clears rows in grid indicated by values in rowsToClear
     * @param {Array.<Number>} rowsToClear - Array of the indeces of filled rows
     */
    clearRows(rowsToClear) {
        // Clear rows from top to bottom
        rowsToClear.sort((a, b) => a - b);

        for (let i = 0; i < rowsToClear.length; ++i) {
            let row = rowsToClear[i];
            
            // iterate through row and all rows above it
            for (let j = row; j > 0; --j) {
                // If the current row is already empty then stop clearing
                if (this.isRowEmpty(j)) { 
                    break;
                }
                 // Copy the colors from the row above
                for (let k = 0; k < this.grid_width; ++k) {
                    this.grid[j][k].color = this.grid[j-1][k].color;
                }
            }
            
            // Clear top row colors since they aren't cleared by default
            for (let j = 0 ; j < this.grid_width; ++j) {
                this.grid[0][j].color = background_color;
            }
        }
    }

     /**
     * Determines if the row indicated by row is empty
     * @returns {Boolean} - Whether or not a given row is empty
     */
    isRowEmpty(row) {
        for (let i = 0; i < this.grid_width; ++i) {
            if (this.grid[row][i].color != background_color) {
                return false;
            }
        }
        return true;
    }

    /**
     * Shows projections of the current piece at either:
     * 1. bottom of the screen
     * 2. right above a colored grid
     */
    showProjection() {
        let cfg = this.current_piece.cfgs[this.current_piece.current_cfg_idx];
        let x = this.current_piece.x;
        let projected_y = this.current_piece.y;

        let projection_found = false
        while(true) {
            for (let i = 0; i < cfg.length; ++i) {
                let cfg_x = x + cfg[i][0];
                let cfg_y = projected_y + cfg[i][1];
                
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

    /**
     * Previews the next piece
     */
    showNextPiece() {
        strokeWeight(2);
        stroke("#000000");
        fill("#ffffff")
        square(400, 10, 150);
        this.next_piece.preview();
    }

    showScore() {
        document.getElementById('scoreValue').innerHTML = this.score.toString();
    }

    /**
     * Given a game_state, create it in the game
     */
    parseGameState(game_state) {
        for (let i = 0; i < game_state.length - 1; ++i) {
            let [x, piece_cls, orientation] = game_state[i];
            this.current_piece = new piece_cls();
            this.current_piece.x = x;
            this.current_piece.current_cfg_idx = orientation;

            while (!this.checkPieceLocked()) {
                this.current_piece.y += 1;
            }

            this.lockPiece();
        }

        this.current_piece = new game_state[game_state.length - 1][1]();
    }
}

/** Class for displaying gridspaces on tetris board */
class GridSpace {
    /**
     * Create gridspace
     * @param {Number} x - x-coordinate of gridspace
     * @param {Number} y - y-coordinate of gridspace
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = background_color;
    }
    /**
     * Displays grid on the canvas
     */
    show() {
        strokeWeight(grid_line_width);
        stroke(grid_line_color);
        fill(this.color);
        square(this.x * block_size + grid_line_width, 
               this.y * block_size + grid_line_width, 
               block_size);
    }
}