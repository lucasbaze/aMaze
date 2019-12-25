AFRAME.registerComponent('clock', {
    init: function() {
        this.player = document.getElementById('player');
        this.clockPosition = this.el.object3D.position;
        this.playerPosition = this.player.object3D.position;
    },
    tick: function() {
        //Constantly make sure the clock is facing the player as they move about the maze
        let { x: cx, y: cy, z: cz } = this.clockPosition;
        let { x: px, y: py, z: pz } = this.playerPosition;

        //Calculate the angle between the clock and player position;
        let rotation = Math.atan((cx - px) / (cz - pz)) + Math.PI / 2;

        if (cz - pz < 0) {
            rotation += Math.PI;
        }

        //Assign rotation in radians to y rotation component of clock
        this.el.object3D.rotation.y = rotation;
    },
});
