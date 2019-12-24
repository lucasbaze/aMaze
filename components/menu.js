AFRAME.registerComponent('menu-button', {
    schema: {
        active: { type: 'bool', default: false },
        index: { type: 'int' },
    },
    init: function() {
        var data = this.data;
        var el = this.el;  // <a-text>
        var matl = el.getAttribute('material'); // this doesn't parse to an object for some reason
        // var defaultColor = matl.color;
        // var defaultOpacity = matl.opacity;
        //
        // console.log(matl);
        // console.log('default opacity', defaultOpacity)

        el.addEventListener('mouseenter', function () {
            // el.setAttribute('material', { opacity: 1 });
        });

        el.addEventListener('mouseleave', function () {
            // console.log('leave', defaultOpacity);
            // console.log(defaultOpacity)
            // el.setAttribute('material', {
            //     opacity: defaultOpacity,
            // });
        });

        el.addEventListener('mouseup', function () {
            AFRAME.scenes[0].emit('setDifficulty', {difficulty: data.index});
        })

    },
    update: function (oldData) {
        // console.log('updating button: ', this.data);
        this.el.setAttribute('material', {
            color: this.data.active ? 'red' : 'black'
        });
    },
});

AFRAME.registerComponent('start-button', {
    schema: {},
    init: function() {
        var el = this.el;

        el.addEventListener('mouseup', function () {
            // start game!
            console.log('starting game!');
            AFRAME.scenes[0].emit('setStarted', {started: true});
        })
    }
});

// helper function for debugging in browser
function dif(i) {
    AFRAME.scenes[0].emit('setDifficulty', {difficulty: i});
}
function start(b) {
    AFRAME.scenes[0].emit('setStarted', {started: b});
}
