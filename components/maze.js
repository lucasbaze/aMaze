//Holds all the Cells
let grid = [];
let current;

AFRAME.registerComponent('amaze', {
    schema: {
        height: { default: 20 },
        width: { default: 20 },
        //Same as mixin wall length (though it shouldn't have to be)
        //Have tried to change the wall width and height
        //of the mixing voxel through here
        w: { default: 4 },
    },
    init: function() {
        let cols = this.data.width / this.data.w;
        let rows = this.data.height / this.data.w;

        //Loop through each col and rows and push to grid a new cell
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                let cell = new Cell(i, j, this.data.w, cols, rows);
                grid.push(cell);
            }
        }

        //Then build the maze
        this.buildMaze();
    },
    buildMaze: function() {
        //Set the first cell to current
        current = grid[0];
        current.visited = true;
        current.generateWalls(this);

        //Step forward to generate walls
        for (let i = 1; i < grid.length; i++) {
            //Get a random neighbor to go to
            let next = current.checkNeighbors();
            //Make sure it's not undefined
            if (next) {
                next.visited = true;
                //Pass this(maze) to add walls to maze component
                next.generateWalls(this);
                current = next;
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

        //Bc I'm lazy
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

    this.generateWalls = function(maze) {
        //x-coordinate and y-coordinate
        let x = i * w;
        let y = j * w;

        //wall generator
        function generateWall(xpos, ypos, theta) {
            var wall = document.createElement('a-entity');

            //Wall set to the wallVoxel mixin in assets
            wall.setAttribute('mixin', 'wallVoxel');

            console.log(`${this.visited}`);

            //Update position based on this URL
            //https://aframe.io/docs/1.0.0/components/position.html#updating-position
            //Using the z as the "y-axis"
            wall.object3D.position.set(xpos, w / 2, -ypos);
            wall.object3D.rotation.set(0, degToRads(theta), 0);

            //Check if visited
            if (this.visited) {
                wall.setAttribute('material', 'color', 'orange');
            }

            //Add wall to the maze;
            maze.el.appendChild(wall);
        }

        //Top wall
        if (this.walls[0]) {
            //I'm call the function so I can bind "this" to the this.visited value to the generateWall function
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
