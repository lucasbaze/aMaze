AFRAME.registerComponent('menu-button', {
    schema: {
        active: { type: 'bool', default: false }
    },
    init: function() {},
    update: function (oldData) {
        console.log('updating button: ', this.data);
        this.el.setAttribute('material', {
            color: this.data.active ? 'red' : 'black'
        });
    },
});

// helper function for debugging in browser
function dif(i) {
    AFRAME.scenes[0].emit('setDifficulty', {difficulty: i});
}
