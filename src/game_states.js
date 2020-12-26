// example game states for testing


// define states to be a series of moves [x, piece type, orientation]
// last one is current piece
const game_state_1 = [
    [4, I_Piece, 1],
    [7, J_Piece, 0],[8, L_Piece, 3],[0, L_Piece, 2],
    
    [3, L_Piece, 0]
]

// this one is for tspin
const game_state_2 = [
    [2, I_Piece, 0],[5, Z_Piece, 1],[-1, L_Piece, 1],
    
    
    [3, T_Piece, 0]
]