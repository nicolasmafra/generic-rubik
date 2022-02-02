import * as THREE from 'https://cdn.skypack.dev/three';

const gfx = {
    playing: false,
    pieceMesh: null,
    piecesData: [],
    pieceSize: 0.9,
    animationDuration: 500,

    prepare: function() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.createScene();
        return true;
    },

    getDomElement: function() {
        return this.renderer.domElement;
    },

    createScene: function(distance) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.camera.position.x = distance;
        this.camera.position.y = distance;
        this.camera.position.z = distance;
        var rotationMatrix = new THREE.Matrix4();
        rotationMatrix.lookAt(this.camera.position, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
        this.camera.quaternion.setFromRotationMatrix(rotationMatrix);
    },

    createPieceMesh: function(colorValues) {
        var geometry = new THREE.BoxGeometry(this.pieceSize, this.pieceSize, this.pieceSize);
        const count = geometry.attributes.position.count;
        geometry.setAttribute('color', new THREE.BufferAttribute( new Float32Array( count * 3 ), 3));

        var colors = colorValues.map(value => new THREE.Color(value));
        for (var i = 0; i < count; i++) {
            var color = colors[Math.floor((6 * i) / count)];
            geometry.attributes.color.setXYZ(i, color.r, color.g, color.b);
        }

        var material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            vertexColors: true,
        });
        this.pieceMesh = new THREE.Mesh(geometry, material);
    },

    start: function() {
        this.playing = true;
        requestAnimationFrame(() => this.loop()); // init loop
    },

    stop: function() {
        this.playing = false;
    },

    loop: function() {
        if (!this.playing) return;

        this.draw();

        requestAnimationFrame(() => this.loop()); // continue loop
    },

    draw: function() {
        this.scene.clear();
        
        var now = Date.now();
        this.piecesData.forEach(pieceData => {
            var piece = this.pieceMesh.clone();
            piece.position.fromArray(pieceData.position);
            piece.quaternion.fromArray(pieceData.rotation);
            if (pieceData.change && now - pieceData.change.time < this.animationDuration) {
                // animation
                var t = (now - pieceData.change.time) / this.animationDuration;
                var q = new THREE.Quaternion().fromArray(pieceData.change.rotation);
                var invertedSlerp = new THREE.Quaternion().identity().slerp(q.invert(), 1 - t);
                piece.position.applyQuaternion(invertedSlerp);
                piece.quaternion.premultiply(invertedSlerp);
            }
            this.scene.add(piece);
        })

        this.renderer.render(this.scene, this.camera);
    },
};

export { gfx };