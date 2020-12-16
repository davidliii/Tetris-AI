class Piece {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.cfgs;
        this.current_cfg_idx;
        this.color;

        this.set = false;
    }

    update(dx, dy, rotate_dir) {
        this.y += dy;
        this.rotate(rotate_dir);
        this.x += dx;
    }

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

    rotate(direction) {
        this.current_cfg_idx += direction;
        if (this.current_cfg_idx >= this.cfgs.length) {
            this.current_cfg_idx = 0;
        }
        else if (this.current_cfg_idx <= -1) {
            this.current_cfg_idx = this.cfgs.length - 1;
        }
    }
}

class I_Piece extends Piece{
    constructor() {
        super(3, 3);

        this.cfgs = I_PIECE_CFG;
        this.current_cfg_idx = 0;
        this.color = light_blue;
    }
}