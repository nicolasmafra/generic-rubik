var input = {
    // essas são as teclas e a rotação que cada uma faz
    keyActions: {
        'Space': 'reset',
        'KeyR': { axis: 0, dir: 1 },
        'KeyU': { axis: 1, dir: 1 },
        'KeyF': { axis: 2, dir: 1 },
        'KeyL': { axis: 0, dir: -1 },
        'KeyD': { axis: 1, dir: -1 },
        'KeyB': { axis: 2, dir: -1 },
        'KeyM': { axis: 0, dir: -1, slice: 1 },
        'KeyE': { axis: 1, dir: -1, slice: 1 },
        'KeyS': { axis: 2, dir: 1, slice: 1 },
        'KeyX': { axis: 0, dir: 1, sliceSize: 'n' },
        'KeyY': { axis: 1, dir: 1, sliceSize: 'n' },
        'KeyZ': { axis: 2, dir: 1, sliceSize: 'n' },
    },
    callback: function (actionParam) {
        console.log("override input.callback. Action param received: " + JSON.stringify(actionParam));
    },
    addKeyListeners: function() {
        document.addEventListener("keydown", event => this.onKey(event));
    },
    onKey: function(event) {
        var actionParam = this.keyActions[event.code];
        if (actionParam === undefined) return;
        if (typeof actionParam === 'string') {
            this.callback(actionParam);
            return;
        }
        actionParam = Object.assign({}, actionParam);
        actionParam.angle = event.shiftKey
            ? 1 // counter-clockwise
            : -1; // clockwise
        this.callback(actionParam);
    },
};

export { input };