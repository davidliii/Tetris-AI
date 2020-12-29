/**
 * Player class that is the AI agent responsible for making moves
 */

class Player {
    /**
     * Creates player
     * The player selects moves based on the weighted cost of each possible
     * end state. The lower the cost, the higher chance it has to choose a
     * given state. A state's cost is computed using the following linear
     * combination:
     * a * (# holes) + b * (max column height) + c * (height variance of all columns) - d * (# filled rows) 
     */
    constructor() {
        this.a = 3;
        this.b = 1;
        this.c = 1;
        this.d = 2;
    }

    /**
     * Convert grid cell representation to a matrix of 1s and 0s
     * 1 represents a filled grid, 0 represents an empty grid
     * @param {Array.<Array.<GridSpace>>} grid - Grid representation of game as defined in Game class
     * @returns {Array.<Array.<Number>>}       - Binary representation of state 
     */
    convertToState(grid) {
        let state = []
        
        let n_rows = grid.length;
        let n_cols = grid[0].length
        for (let i = 0; i < n_rows; ++i) {
            let row = []
            for (let j = 0; j < n_cols; ++j) {
                if (grid[i][j].color != background_color) {
                    row.push(1);
                }
                else {
                    row.push(0)
                }
            }
            state.push(row);
        }
        return state;
    }

    /**
     * Prints state as string in console
     * @param {Array.<Array.<Number>>} state - Game state
     */
    printState(state) {
        let str = "";
        let n_rows = state.length;
        let n_cols = state[0].length
        for (let i = 0; i < n_rows; ++i) {
            for (let j = 0; j < n_cols; ++j) {
                if (state[i][j] == 1) {
                    str += '1';
                }
                else {
                    str += '0';
                }
            }
            str += '\n';
                
        }
        console.log(str);
    }

    /**
     * Determines optimal move sequence for the current piece in the game state
     * @param {Array.<Array.<GridSpace>>} grid - Grid representation of game as defined in Game class
     * @param {Piece} current_piece            - Currently held piece
     * @returns {Array.<Number|String>}        - List of optimal moves
     */
    getMoves(grid_state, current_piece) {
        let state = this.convertToState(grid_state);

        let curr_best_score = -1;
        let curr_best_moves = '';

        let end_state_hashes = [];

        /**
         * Helper function to check if a given state has been visited yet
         * @param {Number} x - x-coordinate of current piece
         * @param {Number} y - y-coordinate of current piece
         * @param {Number} i - Orientation of current piece
         * @return {Boolean} - Whether or not state has been visited
         */
        function isStateFound(x, y, i) {
            let pair = triple_pair(x, y, i);
            return end_state_hashes.includes(pair);
        }

        // Iterate through orientations
        for (let i = 0; i < current_piece.cfgs.length; ++i) {
            let initial_orientation_move = i.toString()

            // Determine drop starting bounds x_min and x_max
            let x_min = current_piece.x;
            let x_max = current_piece.x;
            let start_y = current_piece.y;

            while (this.checkValid(state, current_piece, i, x_min, start_y)) {
                --x_min;
            }
            ++x_min;
            while (this.checkValid(state, current_piece, i, x_max, start_y)) {
                ++x_max;
            }
            --x_max;
            

            // Drop piece from each x location
            for (let x = x_min; x <= x_max; ++x) {
                // Keep track of horizontal moves using num_shifts
                let num_shifts = current_piece.x - x;
                let shift_moves = '';
                if (num_shifts > 0) {
                    shift_moves = 'l'.repeat(Math.abs(num_shifts));
                }
                else if (num_shifts < 0) {
                    shift_moves = 'r'.repeat(Math.abs(num_shifts));
                }

                // Begin dropping
                let y = start_y;
                while (!this.checkPieceLocked(state, current_piece, i, x, y)) {
                    ++y;
                }
                
                // Keep track of the downwards moves 
                let down_moves = 'd'.repeat(Math.abs(start_y - y));

                // After dropping each possible as low as possible, perform
                // sliding or single rotations
                for (let j = 0; j <= 1; ++j) {

                    // Checking other rotations (equivalent to pressing up-arrow once)
                    let orientation = j + i;
                    if (orientation == current_piece.cfgs.length) {
                        orientation = 0;
                    }
                    
                    // Keep track of new orientation
                    let new_orientation_move = orientation.toString();
                    
                    // Trying to shift piece right and left to emulate sliding
                    let directions = [1, -1];
                    for (let dir_idx = 0; dir_idx < directions.length; ++dir_idx) {
                        let start_x = x;
                        let dx = directions[dir_idx];
                        let move_to_write = dx == 1 ? 'r' : 'l';

                        while (this.checkValid(state, current_piece, orientation, start_x, y) && 
                        this.checkPieceLocked(state, current_piece, orientation, start_x, y)) {
                            if (!isStateFound(start_x, y, orientation)) {
                                // Store hash value of the state
                                end_state_hashes.push(triple_pair(start_x, y, orientation));

                                // Generate the state representation for evaluation
                                let new_state = this.addToState(state, current_piece, orientation, start_x, y);
                                let new_state_score = this.evaluateState(new_state);
                                
                                // If new_state is better than the current best state
                                // then set the current best state value to be the
                                // new state value that was just evaluated
                                // Also, keep track of the moves needed to reach
                                // that state
                                if (curr_best_score == -1 || new_state_score < curr_best_score) {
                                    curr_best_score = new_state_score;
                                    curr_best_moves = initial_orientation_move + 
                                                    shift_moves + down_moves + 
                                                    new_orientation_move +
                                                    move_to_write.repeat(Math.abs(start_x - x));
                                }
                            }
                            start_x += dx;
                        }
                    }
                }
            }
        }

        return curr_best_moves;
    }
    /**
     * Creates a new state where the current piece is locked onto the state
     * @param {Array.<Array.<Number>>} state - Game state
     * @param {Piece} current_piece          - Currently held piece
     * @param {Number} idx                   - Current piece configuration index
     * @param {Number} px                    - Desired piece x-coordinate
     * @param {Number} py                    - Desired piece y-coordinate
     * @returns {Array.<Array.<Number>>}     - State with piece locked
     */
    addToState(state, current_piece, idx, px, py) {
        let cfg = current_piece.cfgs[idx];
        
        let new_state = [];
        for (let i = 0; i < state.length; ++i) {
            let row = []
            for (let j = 0; j < state[i].length; ++j) {
                row.push(state[i][j]);
            }

            new_state.push(row);
        }
        
        for (let i = 0; i < cfg.length; ++i) {
            let x = px + cfg[i][0];
            let y = py + cfg[i][1];
            new_state[y][x] = 1;
        }
        return new_state;
    }

    /**
     * Determines if a given piece is valid in the current state
     * @param {Array.<Array.<Number>>} state - Game state
     * @param {Piece} current_piece          - Currently held piece
     * @param {Number} idx                   - Current piece configuration index
     * @param {Number} px                    - Desired piece x-coordinate
     * @param {Number} py                    - Desired piece y-coordinate
     * @returns {Boolean}                    - Whether or not piece is valid in state
     */
    checkValid(state, current_piece, idx, px, py) {
        let cfg = current_piece.cfgs[idx];
        for (let i = 0; i < cfg.length; ++i) {
            let x = cfg[i][0] + px;
            let y = cfg[i][1] + py;

            if (x >= state[0].length || x <= -1 || y <= -1) {
                return false;
            }

            if (y >= state.length || state[y][x] != 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * Determines if a given piece can be locked in current state
     * @param {Array.<Array.<Number>>} state - Game state
     * @param {Piece} current_piece          - Currently held piece
     * @param {Number} idx                   - Current piece configuration index
     * @param {Number} px                    - Desired piece x-coordinate
     * @param {Number} py                    - Desired piece y-coordinate
     * @returns {Boolean}                    - Whether or not piece is locked
     */
    checkPieceLocked(state, current_piece, idx, px, py) {
        let cfg = current_piece.cfgs[idx];
        for (let i = 0; i < cfg.length; ++i) {
            let x = cfg[i][0] + px;
            let y = cfg[i][1] + py;

            if (y == state.length - 1 || state[y+1][x] != 0) { // reached bottom of screen
                return true;
            }
        }

        return false;
    }

    /**
     * Cost function that is used for evaluating a given state
     * @param {Array.<Array.<Number>>} state - Game state
     * @returns {Number}                     - Cost of state
     */
    evaluateState(state) {
        let n_filled = this.getCompletedRows(state);
        let heights = this.getHeights(state);

        let n_holes = this.getNumHoles2(state);
        let avg_h = this.getAvgHeight(heights);
        let var_h = this.getHeightVariance(heights);

        return this.a * n_holes + 
               this.b * avg_h + 
               this.c * var_h -
               this.d * n_filled;
    }

    /**
     * Finds the number of holes in a game state
     * @param {Array.<Array.<Number>>} state - Game state
     * @returns {Number}                     - Number of holes in the state
     */
    getNumHoles(state) {
        let max_y = state.length;
        let max_x = state[0].length;

        /**
         * Helper function to get the adjacent coordinates of a grid cell in the
         * state
         * @param {Array.<Number>} cell     - Array containing x and y coordinates of cell 
         * @return {Array.<Array.<Number>>} - Array of adjacent coordinates
         */
        function getAdjacent(cell) { // helper function to get valid adjacent cells in state
            let [x0, y0] = cell;
            let adjacent = [[x0+1, y0], [x0-1, y0], [x0, y0+1], [x0, y0-1]];
            let valid_adjacent = []
            for (let i = 0; i < adjacent.length; ++i) {
                let x1 = adjacent[i][0];
                let y1 = adjacent[i][1];
                if (0 <= x1 && x1 < max_x && 0 <= y1 && y1 < max_y && state[y1][x1] == 0) {
                    valid_adjacent.push(adjacent[i]);
                }
            }
            return valid_adjacent;
        }

        // Use BFS to find holes
        let queue = [];
        let visited = new Set();
        visited.add(cantor(0, 0));
        queue.push([0, 0]);

        while (queue.length != 0) {
            let [x, y] = queue.shift();
            let adjacent = getAdjacent([x, y]);
            for (let i = 0; i < adjacent.length; ++i) {
                let c_value = cantor(adjacent[i][0], adjacent[i][1])
                if (!visited.has(c_value)) {
                    visited.add(c_value);
                    queue.push(adjacent[i]);
                }
            }
        }

        let num_empty = 0;

        for (let i = 0; i < max_y; ++i) {
            for (let j = 0; j < max_x; ++j) {
                if (state[i][j] == 0) {
                    ++num_empty;
                }
            }
        }
        return num_empty - visited.size;
    }

    /**
     * Returns the heights of each column in the game state
     * @param {Array.<Array.<Number>>} state - Game state
     * @returns {Array.<Number>}             - Array of column heights
     */
    getHeights(state) {
        let num_rows = state.length;
        let num_cols = state[0].length;
        let heights = []

        for (let i = 0; i < num_cols; ++i) {
            for (let j = 0; j < num_rows + 1; j++) {
                if (j == num_rows || state[j][i] == 1) {
                    heights.push(num_rows - j);
                    break;
                }
            }
        }

        return heights;
    }

    /**
     * Returns the mean of the column heights
     * @param {Array.<Number>} heights - Array of column heights
     * @param {Number}                 - Average column height
     */
    getAvgHeight(heights) {
        return heights.reduce((a, b) => a+b, 0) / heights.length;
    }


    /**
     * Returns the variance of the column heights
     * @param {Array.<Number>} heights - Array of column heights
     * @param {Number}                 - Variance of the column heights
     */
    getHeightVariance(heights) {
        let mean = heights.reduce((a, b) => a+b, 0) / heights.length;
        let sum_sq_error = 0
        for (let i = 0; i < heights.length; ++i) {
            sum_sq_error += pow(mean - heights[i], 2);
        }
        return sum_sq_error / (heights.length - 1);
    }

    /**
     * Returns the number of completed rows in a state
     * @param {Array.<Array.<Number>>} state - Game state
     * @returns {Array.<Number>}             - Number of completed rows
     */
    getCompletedRows(state) {
        let n = 0;
        for (let i = 0; i < state.length; ++i) {
            let backgroundFound = false;
            for (let j = 0; j < state[i].length; ++j) {
                if (state[i][j] == 0) {
                    backgroundFound = true;
                    break;
                }
            }

            if (!backgroundFound) {
                n += 1;
            }
        }

        return n; 
    }

    /**
     * Returns the number of holes in a game state, where the number of 
     * holes here are defined to be any empty gridspace with a filled
     * gridspace above it as well as the empty gridspaces below it (tunnels)
     * @param {Array.<Array.<Number>>} state - Game state
     * @returns {Array.<Number>}             - Number of holes in state
     */
    getNumHoles2(state) {
        let num_rows = state.length;
        let num_cols = state[0].length;

        let n_holes = 0;
        for (let i = 1; i < num_rows; ++i) {
            for (let j = 0; j < num_cols; ++j) {
                if (state[i][j] == 0 && state[i-1][j] == 1) {
                    let curr_row = i;
                    while (curr_row < num_rows && state[curr_row][j] == 0) {
                        ++n_holes;
                        ++curr_row;
                    }
                }
            }
        }
        return n_holes;
    }
}