class Player {
    constructor() {
        /* 
        This player selects moves based on the weighted cost of each possible
        end state. The lower the cost, the higher chance it has to choose a
        given state. A state's cost is computed using the following linear
        combination:
        a * (# holes) + b * (max column height) + c * (height variance of all columns) + d * (# filled blocks)
        */
        this.a = 1;
        this.b = 1;
        this.c = 1;
        this.d = 1;
    }

    convertToState(grid) {
        // convert grid cell representation to state that is easier to work with
        let state = []
        
        let n_rows = grid.length;
        let n_cols = grid[0].length
        for (let i = 0; i < n_rows; ++i) {
            let row = []
            for (let j = 0; j < n_cols; ++j) {
                if (grid[i][j].color != background_color) {
                    row.push(1); // 1 for filled
                }
                else {
                    row.push(0); // 0 for empty
                }
            }
            state.push(row);
        }
        return state;
    }

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

    getMoves(gridState, currentPiece) {
        /* 
        strategy:
        1. use flood fill to determine surface upon which pieces can land
        2. determine all possible locations/orientations where pieces can land 
           and lock
        3. compute the cost of each state where pieces land and lock
        4. sort states in order of increasing cost
        5. go through states and using pathing finding to get from piece lock 
           location to spawn location
        6. parse the path and return it in reverse if a path is found, otherwise 
           move to next piece
        */

    }

    evaluateState(state) {
        let n_filled = this.getNumFilledBlocks(state);
        let heights = this.getHeights(state);

        let n_holes = this.getNumHoles(state, n_filled);
        let avg_h = this.getAvgHeight(heights);
        let var_h = this.getHeightVariance(heights);

        return this.a * n_holes + 
               this.b * n_filled + 
               this.c * avg_h +
               this.d * var_h;
    }

    getNumHoles(state, num_filled) {
        let max_y = state.length;
        let max_x = state[0].length;

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

        function cantor(cell) { // pairing function because js element-finding sucks
            let [k1, k2] = cell;
            return 0.5 * (k1+k2) * (k1 + k2 + 1) + k2
        }

        // bfs to find holes
        let queue = [];
        let visited = new Set();
        visited.add(cantor([0, 0]));
        queue.push([0, 0]);

        while (queue.length != 0) {
            let [x, y] = queue.shift();
            let adjacent = getAdjacent([x, y]);
            for (let i = 0; i < adjacent.length; ++i) {
                let c_value = cantor(adjacent[i])
                if (!visited.has(c_value)) {
                    visited.add(c_value);
                    queue.push(adjacent[i]);
                }
            }
        }

        let num_empty = state.length * state[0].length - num_filled;
        return num_empty - visited.size;
    }

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

    getAvgHeight(heights) {
        return heights.reduce((a, b) => a+b, 0) / heights.length;
    }

    getHeightVariance(heights) {
        let mean = heights.reduce((a, b) => a+b, 0) / heights.length;
        let sum_sq_error = 0
        for (let i = 0; i < heights.length; ++i) {
            sum_sq_error += pow(mean - heights[i], 2);
        }
        return sum_sq_error / (heights.length - 1);
    }

    getNumFilledBlocks(state) {
        let n_rows = state.length;
        let n_cols = state[0].length;
        let num_filled = 0;

        for (let i = 0; i < n_rows; ++i) {
            for (let j = 0; j < n_cols; ++j) {
                if (state[i][j] == 1) {
                    ++num_filled;
                }
            }
        }
        return num_filled;
    }
}