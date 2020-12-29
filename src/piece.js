/**
 * Parent class for all tetrominoes
 */
class Piece {
    /**
     * Create a piece
     * @param {Number} x - Starting x-coordinate of piece
     * @param {Number} y - Starting y-coordinate of piece
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.cfgs;
        this.current_cfg_idx;
        this.color;
    }

    /**
     * Moves a piece
     * @param {Number} dx         - Horizontal offset
     * @param {Number} dy         - Vertical offset
     * @param {Number} rotate_dir - Rotational offset (either 1 or -1)
     */
    update(dx, dy, rotate_dir) {
        this.y += dy;
        this.rotate(rotate_dir);
        this.x += dx;

        let cfg = this.cfgs[this.current_cfg_idx];
        for (let i = 0; i < cfg.length; ++i) {
            let x = cfg[i][0] + this.x
        }
    }

    /**
     * Displays piece on canvas
     */
    show() {
        let cfg = this.cfgs[this.current_cfg_idx];
        for (let i = 0; i < cfg.length; ++i) {
            let x = cfg[i][0];
            let y = cfg[i][1];
            strokeWeight(grid_line_width);
            stroke(grid_line_color);
            fill(this.color);
            square((this.x + x) * block_size + grid_line_width, 
                   (this.y + y) * block_size + grid_line_width, 
                   block_size);
        }
    }

    /**
     * Shows piece in the "next piece" Location
     */
    preview() {
        let cfg = this.cfgs[this.current_cfg_idx];
        for (let i = 0; i < cfg.length; ++i) {
            let x = cfg[i][0];
            let y = cfg[i][1];
            strokeWeight(grid_line_width);
            stroke(grid_line_color);
            fill(this.color);
            square((14 + x) * block_size + grid_line_width, 
                   (1 + y) * block_size + grid_line_width, 
                   block_size);
        }
    }

    /**
     * Shows future drop location of the piece
     * @param {Number} px - x-coordinate of projection 
     * @param {Number} py - y-coordinate of projection
     */
    project(px, py) {
        let cfg = this.cfgs[this.current_cfg_idx];
        for (let i = 0; i < cfg.length; ++i) {
            let x = cfg[i][0];
            let y = cfg[i][1];
            strokeWeight(grid_line_width);
            stroke(grid_line_color);
            fill(projection_color);
            square((px + x) * block_size + grid_line_width, 
                   (py + y) * block_size + grid_line_width, 
                   block_size);
        }
    }
    /**
     * Shows future drop location of the piece
     * @param {Number} px - x-coordinate of piece
     * @param {Number} py - y-coordinate of piece
     * @param {Number} orientation - orientation of piece
     */
    showPossible(px, py, orientation) {
        let cfg = this.cfgs[orientation];
        for (let i = 0; i < cfg.length; ++i) {
            let x = cfg[i][0];
            let y = cfg[i][1];
            strokeWeight(grid_line_width);
            stroke(grid_line_color);
            fill(this.color);
            square((px + x) * block_size + grid_line_width, 
                   (py + y) * block_size + grid_line_width, 
                   block_size);
        }
    }
    
    /**
     * 
     * @param {Number} direction - Direction to rotate (either 1 or -1)
     */
    rotate(direction) {
        this.current_cfg_idx += direction;
        this.current_cfg_idx %= this.cfgs.length;
        if (this.current_cfg_idx < 0) {
            this.current_cfg_idx += this.cfgs.length;
        }
    }
}

class I_Piece extends Piece{
    constructor() {
        super(3, 0);

        this.cfgs = I_PIECE_CFG;
        this.current_cfg_idx = 0;
        this.color = light_blue;
    }
}

class O_Piece extends Piece {
    constructor() {
        super(3, 0);

        this.cfgs = O_PIECE_CFG;
        this.current_cfg_idx = 0;
        this.color = yellow;
    }
}

class T_Piece extends Piece {
    constructor() {
        super(3, 0);

        this.cfgs = T_PIECE_CFG;
        this.current_cfg_idx = 0;
        this.color = purple;
    }
}

class S_Piece extends Piece {
    constructor() {
        super(3, 0);

        this.cfgs = S_PIECE_CFG;
        this.current_cfg_idx = 0;
        this.color = green;
    }
}

class Z_Piece extends Piece {
    constructor() {
        super(3, 0);

        this.cfgs = Z_PIECE_CFG;
        this.current_cfg_idx = 0;
        this.color = red;
    }
}

class L_Piece extends Piece {
    constructor() {
        super(3, 0);

        this.cfgs = L_PIECE_CFG;
        this.current_cfg_idx = 0;
        this.color = orange;
    }
}

class J_Piece extends Piece {
    constructor() {
        super(3, 0);

        this.cfgs = J_PIECE_CFG;
        this.current_cfg_idx = 0;
        this.color = dark_blue;
    }
}