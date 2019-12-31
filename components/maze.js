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
        difficulty: { type: 'int', default: 1 },
        started: { type: 'bool', default: false },
    },
    init: function() {
        // this.resizeGrid(this.data.difficulty);
        this.level = 1;
        this.tick = AFRAME.utils.throttleTick(this.tick, 1000, this);
        this.clock = document.querySelector('#clock-container');
        this.clocks = document.querySelectorAll('.clock');
        this.player = document.querySelector('#player');
        this.levelText = document.querySelector('#levelText');
    },
    update: function(oldData) {
        // When we're ready to start the game, create the grid array
        // and build the maze as necessary.
        if (oldData.started == false && this.data.started == true) {
            this.setupGrid();
            this.buildMaze();
            this.placeMonsters();
        }
    },
    setupGrid: function() {
        this.baseSize = 24;
        // needs to be a multiple of 8
        // this.difficulty = this.data.difficulty;
        this.width = this.baseSize + this.level * 8;
        this.height = this.baseSize + this.level * 8;

        //Ensure ints
        this.cols = Math.floor(this.width / this.data.w);
        this.rows = Math.floor(this.height / this.data.w);

        console.log('Creating a ', this.cols, 'x', this.rows, ' grid');
        console.log(this.data);

        //Loop through each col and rows and push to grid a new cell
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                let cell = new Cell(i, j, this.data.w, this.cols, this.rows);
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
        //This is why size needs to be a multiple of 8
        grid[grid.length - this.cols / 2].walls[0] = false;

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

        //Put the endPlate in it's proper location
        let endPlate = document.querySelector('#endPlate');
        endPlate.object3D.position.set(this.width / 2, 0.01, -this.height);
    },

    placeMonsters: function() {
        for (let i = 0; i < 5; i++) {
            let randX = Math.floor(Math.random() * this.width);
            let randY = Math.floor(Math.random() * this.height);

            let slender = document.createElement('a-entity');
            slender.setAttribute('gltf-model', '#slender_man');
            slender.setAttribute('clock', { offset: Math.PI });
            slender.object3D.position.set(randX, 0, -randY);
            slender.object3D.scale.set(0.4, 0.4, 0.4);

            this.el.appendChild(slender);
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
    },

    // play() is also a default method on entities.
    play: function() {
        this.el.addEventListener('startGame', this.startGame.bind(this));
        this.el.addEventListener('gameOver', this.gameOver.bind(this));
    },

    gameOver: function() {
        this.isPlaying = false;

        if (this.time > 0) {
            console.log('Beat the level!');
            this.level++;
            setTimeout(() => {
                this.resetGame();
            }, 1000);
        } else {
            setTimeout(() => {
                this.resetGame();
            }, 1000);
        }
    },

    resetGame: function() {
        console.log('resetting Game');
        let children = [...this.el.childNodes];

        //Solution using setTimeout based on this issue
        //https://github.com/donmccurdy/aframe-physics-system/issues/36
        children.forEach(child => {
            setTimeout(() => {
                child.parentNode.removeChild(child);
            }, 0);
        });

        //Reset to game start
        AFRAME.scenes[0].emit('setStarted', { started: false });

        //Reset player position
        let player = document.getElementById('player');
        setTimeout(() => {
            player.object3D.position.set(28, 1, 3);
        }, 0);
        player.object3D.rotation.set(0, 0, 0);

        //Reset Clock
        this.clocks[0].setAttribute('text-geometry', { value: '3:00' });

        //Reset the grid current and stack
        grid = [];
        current = grid[0];
        stack = [];

        //update Level
        this.levelText.setAttribute('text-geometry', {
            value: `Level: ${this.level}`,
        });
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

            this.time -= dt;

            //Gong sound
            this.clock.components.sound.playSound();

            if (this.time < 0) {
                this.el.emit('gameOver');
            }
        }
    },
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
