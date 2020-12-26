# Tetris-AI

## Overview

This is a fun AI project I decided to make over vacation. No fancy machine/deep
learning in here, just some good ol' search. 

### Built using
* [p5.js](https://p5js.org/)
* Javascript 
* HTML
* CSS

### Try it here
You can clone the repo and run the index.html locally or access it through
this [link]() (TODO add link).

## How It Works
The goal here is for an AI to play Tetris. I formalized the game as a
search problem, where the goal state is a grid with no blocks remaining.
(Obviously this is a naive interpreration of the game. Usually we'd want to clear as 
many rows possible before the blocks reach the top of the screen, with preferece to 
4-row clears to maximize the score). 

Tetris is a non-deterministic game, as the player is not given the entire sequence 
of pieces at the beginning; after each piece is placed, a new piece is (pseudo) 
randomly generated. For that reason we cannot use searching techniques such as 
UCS, A*, or IDS to beat the game - the action space is always changing. To solve
this, I used state evaluation and optimized action choices based on the current
and next piece. The state evaluation function is as follows:

(TODO insert function)

Mathematically evaluation function defines the cost required to reach the goal state
from the current state. Cost in Tetris is not extremely intuitive, so it is better
to think of it as how preferable a given state is compared to other states. The 
lower the value, the better the state is.

### Holes
Holes are defined to be empty grid cells that are enclosed by locked pieces from 
the initial piece spawn location. To find the number of holes, I performed BFS 
starting from the top-left grid cell and keep track of each visited cell. Then I 
subtract that value from the total number of empty cells, yielding the holes. 
When choosing states, we want to minimize the number of holes present. 
Here are some examples of hole-counting:
<p align="center">
    <img src="assets/images/hole-ex-1.PNG" width=400 />
    <img src="assets/images/hole-ex-2.PNG" width=400 />  
</p>

### Average Column Height / Variance
Taller filled columns are generally not favorable since the higher a stack of blocks, 
the closer that state is to losing. However, the average column height alone is
not a sufficient indicator as the uniformity of height of each column may affect
the average height. Therefore the column height variance is also used in state
selection. These values are minimzied when choosing states.

### Filled Blocks
While the other state evaluation methods are designed as heuristics that 
approximate the cost to a goal state, the number of filled blocks in state is
interpreted as the true cost from the current state to the goal state. This value
should is also minimized when choosing states.

### Filled Rows
In Tetris, when a row is completed filled, it gets cleared and every piece above 
the row gets shifted downwards. Thus the more rows that are filled in a given state,
the more preferable that state is. In the cost evaluation function, this value is
weighted by a negative value since a higher number of filled rows is better.


### State Iteration
To determine the best sequence of actions the AI should take, it needs to result
in the best possible state achievable (whichever state incurs the least cost). To
do this, every possible future state is determined, its cost is computed, and the
least costly state is chosen. From there a sequence of actions is found to get to
the desired state.

To find every possible state, we not only take into account the possible locations
of the current piece, but also the next piece. Thus the search tree has depth 2, 
where the root is the current state, the nodes at depth 1 correspond to the possible
states due to placing the current piece, and the leaf nodes represent the states 
after placing the next piece. The leaf node states are evaluated using the cost
function and the least costly state is chosen. 

To emulate possible states, each piece is dropped vertically from each location 
in every orientation until it hits a filled grid from below. At that point, 
any additional horizontal/spinning moves are made without changing elevation 
(thus allowing for T-spins, sliding, etc.). The same process is used for the next piece. 
Finally, we take the best final state from the next piece and compute the moves 
required to reach that state. Although the states are expanded like a tree, 
only the current best final state is kept.

Here is the state expansion algorithm in action:

1. Initial block placements are determined and dropped vertically in every
possible orientation
<div style="margin: 0 auto; text-align: center;">
    <div style="display: inline-block; vertical-align: top; margin-right: 10px">
        <p align="center">
            <img src="assets/videos/initial-selector.gif" width=250 />
        </p>
        <p align="center">
            <i> Initial Block Placements </i>
        </p>
    </div>
    <div style="display: inline-block; vertical-align: top; margin-left: 10px">
        <p align="center">
                <img src="assets/videos/drop-locations.gif" width=250 />
        </p>
        <p align="center">
            <i> Drop Locations </i>
        </p>
    </div>
</p>

2. After blocks are dropped, any additional horizontal/rotational moves are made 
and are considered in end-state selection. This makes moves such as sliding/T-spinning
possible for the AI
<div style="margin: 0 auto; text-align: center;">
    <div style="display: inline-block; vertical-align: top; margin-right: 10px">
        <p align="center">
            <img src="assets/videos/slide.gif" width=250 />
        </p>
        <p align="center">
            <i> Sliding from a soft drop </i>
        </p>
    </div>
    <div style="display: inline-block; vertical-align: top; margin-left: 10px">
        <p align="center">
                <img src="assets/videos/t-spin.gif" width=250 />
        </p>
        <p align="center">
            <i> T-spin (bottom-right corner) </i>
        </p>
    </div>
</div>
