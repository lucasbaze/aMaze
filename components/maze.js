//Holds all the Cells
let grid = [];
//Current cell we're on
let current;
//Stack
let stack = [];

AFRAME.registerComponent('amaze', {
    schema: {
        //Changes the height and width of the maze
        // height: { type: 'int', default: 40 },
        // width: { type: 'int', default: 40 },

        //Same as mixin wall length (though it shouldn't have to be)
        //Have tried to change the wall width and height
        //of the mixing voxel through here
        w: { default: 4 },

        // From global state
        difficulty: { type: 'int' },
        started: { type: 'bool', default: false },
    },
    init: function() {
        // this.resizeGrid(this.data.difficulty);
        this.tick = AFRAME.utils.throttleTick(this.tick, 1000, this);
        this.clock = document.querySelector('#clock-container');
    },
    update: function(oldData) {
        // When we're ready to start the game, create the grid array
        // and build the maze as necessary.
        if (oldData.started == false && this.data.started == true) {
            this.setupGrid();
            this.buildMaze();
        }
    },
    setupGrid: function() {
        let sizes = [40, 54, 68];
        let difficulty = this.data.difficulty;
        let width = sizes[difficulty];
        let height = sizes[difficulty];

        //Ensure ints
        let cols = Math.floor(width / this.data.w);
        let rows = Math.floor(height / this.data.w);

        console.log('Creating a ', cols, 'x', rows, ' grid');
        console.log(this.data);

        //Loop through each col and rows and push to grid a new cell
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                let cell = new Cell(i, j, this.data.w, cols, rows);
                grid.push(cell);
            }
        }
    },

    buildMaze: function() {
        console.log('Building maze with difficulty ', this.data.difficulty);

        //Set the first cell to current
        current = grid[0];
        current.visited = true;

        //Set starting opening wall in the middle of the bottom row
        grid[7].walls[2] = false;

        //Set ending opening wall in the middle top
        grid[grid.length - 8].walls[0] = false;

        //Step forward to decide which walls to build
        for (let i = 0; i < grid.length * 2; i++) {
            //Step 1
            //Get a random neighbor cell to go to
            let next = current.checkNeighbors();
            //Make sure it's not undefined
            if (next) {
                next.visited = true;
                //Step 2
                //Push current cell to stack
                stack.push(current);

                //Step 3
                this.removeWalls(current, next);

                //Step 4
                current = next;
            } else if (stack.length > 0) {
                //Assign current to the last cell in the stack
                //Marches onward
                current = stack.pop();
            }
        }

        //Build the walls needed
        for (let i = 0; i < grid.length; i++) {
            let maze = this;
            grid[i].generateWalls(maze, i, grid.length);
        }
    },

    removeWalls: function(a, b) {
        let x = a.i - b.i;

        //If the neighbor is the right cell
        if (x === -1) {
            a.walls[1] = false;
            b.walls[3] = false;
        }
        //If the neighbor is the left cell
        else if (x === 1) {
            a.walls[3] = false;
            b.walls[1] = false;
        }

        let y = a.j - b.j;
        //If the neighbor is the top cell
        if (y === -1) {
            a.walls[0] = false;
            b.walls[2] = false;
        }
        //If the neighbor is the bottom cell
        else if (y === 1) {
            a.walls[2] = false;
            b.walls[0] = false;
        }
    },

    // Thinking about how the level actions should work
    startGame: function() {
        console.log('Game Started!');

        //
        this.isPlaying = true;
        this.time = 3 * 60 * 1000; // 3 minutes
        this.clocks = document.querySelectorAll('.clock');
        this.startedAt = new Date();

        // this.countDown();
    },

    // play() is also a default method on entities.
    play: function() {
        this.el.addEventListener('startGame', this.startGame.bind(this));
        this.el.addEventListener('gameOver', this.gameOver.bind(this));
    },
    gameOver: function() {
        if (this.time > 0) {
            console.log('Beat the level!');
        } else {
            console.log('Oh no! You lost!');
        }
    },

    tick: function(t, dt) {
        if (this.isPlaying === true && this.clocks) {
            let minutes = Math.floor(
                (this.time % (1000 * 60 * 60)) / (1000 * 60)
            );
            let seconds = Math.floor((this.time % (1000 * 60)) / 1000);

            this.clocks[0].setAttribute('text-geometry', {
                value: `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`,
            });
            this.clocks[1].setAttribute('text-geometry', {
                value: `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`,
            });

            this.time -= dt;

            //Gong sound
            this.clock.components.sound.playSound();

            if (this.time < 0) {
                this.el.emit('gameOver');
            }
        }
    },

    //
    // countDown: function() {
    //     this.clock = document.querySelector('#clock-container');
    //     this.timeOut = setInterval(() => {
    //         let minutes = Math.floor(
    //             (this.time % (1000 * 60 * 60)) / (1000 * 60)
    //         );
    //         let seconds = Math.floor((this.time % (1000 * 60)) / 1000);
    //
    //         //Do this for each and not forEach so it doesn't double stack the calls
    //         this.clocks[0].setAttribute('text-geometry', {
    //             value: `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`,
    //         });
    //         this.clocks[1].setAttribute('text-geometry', {
    //             value: `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`,
    //         });
    //         this.time -= 1000;
    //
    //         //Gong sound
    //         this.clock.components.sound.playSound();
    //
    //         //Once time gets to 0 stop game
    //         if (this.time < 0) {
    //             clearInterval(this.timeOut);
    //             this.el.emit('gameOver');
    //         }
    //     }, 1000);
    // },
});

function Cell(i, j, w, cols, rows) {
    this.i = i;
    this.j = j;
    this.walls = [true, true, true, true];
    this.visited = false;

    //Helper function because object3D.rotation.set takes radians
    //and degrees make more sense to me bc I'm a big dumb.
    function degToRads(degrees) {
        return (degrees * Math.PI) / 180;
    }

    //Because the cells are in a single array
    //This will get the right index
    function index(i, j) {
        //Handle the edge case
        if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
            return -1;
        }
        return i + j * cols;
    }

    this.checkNeighbors = function() {
        var neighbors = [];

        //Will return undefined if grid[-1];
        let top = grid[index(i, j - 1)];
        let right = grid[index(i + 1, j)];
        let bottom = grid[index(i, j + 1)];
        let left = grid[index(i - 1, j)];

        //Check if not undefined and not visited
        //For each one
        if (top && !top.visited) {
            neighbors.push(top);
        }
        if (right && !right.visited) {
            neighbors.push(right);
        }
        if (bottom && !bottom.visited) {
            neighbors.push(bottom);
        }
        if (left && !left.visited) {
            neighbors.push(left);
        }

        //Get a random neighbor and return the cell
        if (neighbors.length > 0) {
            let r = Math.floor(Math.random() * neighbors.length);
            return neighbors[r];
        } else {
            return undefined;
        }
    };

    this.generateWalls = function(maze, idx, size) {
        //x-coordinate and y-coordinate
        let x = i * w;
        let y = j * w;

        //wall generator
        function generateWall(xpos, ypos, theta) {
            var wall = document.createElement('a-entity');

            //Wall set to the wallVoxel mixin in assets
            wall.setAttribute('mixin', 'wallVoxel');

            //Update position (based on this URL)
            //https://aframe.io/docs/1.0.0/components/position.html#updating-position
            //Using the z as the "y-axis"
            wall.object3D.position.set(xpos, w / 2.3, -ypos);
            wall.object3D.rotation.set(0, degToRads(-theta), 0);

            //Check if visited
            if (this.visited) {
                wall.setAttribute('material', 'roughness', 1);
            }

            // Failed attempt to animate everything in
            // let str = `${xpos} ${w/2.3} ${-ypos}`;
            // wall.setAttribute('animation', { property: 'position', });
            // wall.setAttribute('animation__to', str);
            // wall.setAttribute('animation__delay', 2000)
            // wall.setAttribute('animation__autoplay', true)
            //  {
            //     property: 'position',
            //     to: { x: xpos + 3, y: w / 2.3, z: -ypos },
            //     delay: 3000,
            //     duration: 1000,
            // });

            //Add wall to the maze;
            maze.el.appendChild(wall);
        }

        //Top wall
        if (this.walls[0]) {
            //I'm calling the function so I can bind "this" to the this.visited value to the generateWall function
            generateWall.call(this, x, y + w, 90);
        }
        //Right wall
        if (this.walls[1]) {
            //Because positioning is based on centroid
            generateWall.call(this, x + w / 2, y + w / 2, 0);
        }
        //Bottom wall
        if (this.walls[2]) {
            generateWall.call(this, x, y, 90);
        }
        //Left Walll
        if (this.walls[3]) {
            //Because positioning is based on centroid
            generateWall.call(this, x - w / 2, y + w / 2, 0);
        }
    };
}
