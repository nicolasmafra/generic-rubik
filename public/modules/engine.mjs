import { Quaternion, Vector3 } from 'https://cdn.skypack.dev/three';

const engine = {
    colorValues: [
        0xff0000, // red
        0xff8800, // orange
        0xffff00, // yellow
        0xffffff, // white
        0x0000ff, // blue
        0x00ff00, // green
    ],
    pieceCounts: [3, 3, 3],
    piecesData: [],
    createPiecesData: function() {
        this.piecesData.length = 0;
        listCoords(this.pieceCounts).map(coord => ({
            position: mapCoordToPosition(coord, this.pieceCounts),
            rotation: initialRotation.slice() // copy
        })).forEach(data => this.piecesData.push(data));
    },
    applyMove: function(moveParams) {
        if (typeof moveParams === 'string') {
            if (moveParams === 'reset') {
                this.createPiecesData();
            }
            return;
        }
        // clear last animation
        this.piecesData.forEach(data => {
            delete data.change;
        });

        let axis = moveParams.axis;
        let dir = moveParams.dir;
        let size0 = this.pieceCounts[axis];
        let size1 = this.pieceCounts[(axis + 1) % 3];
        let size2 = this.pieceCounts[(axis + 2) % 3];
        let isSquareFace = (size1 == size2);

        if (!moveParams.slice) moveParams.slice = 0;
        if (!moveParams.sliceSize) moveParams.sliceSize = 1;
        if (moveParams.sliceSize == 'n') moveParams.sliceSize = size0;
        if (moveParams.sliceSize == 'n-1') moveParams.sliceSize = size0 - 1;

        // calc pieces of slice
        let basePosition = -dir * mapCoordValueToPositionValue(moveParams.slice, size0);
        let coordRange = moveParams.sliceSize - 1;
        let startPositionValue;
        let endPositionValue;
        if (dir < 0) {
            startPositionValue = basePosition;
            endPositionValue = basePosition + coordRange;
        } else {
            startPositionValue = basePosition - coordRange;
            endPositionValue = basePosition;
        }
        let pieces = this.piecesData.filter(data => data.position[axis] >= startPositionValue && data.position[axis] <= endPositionValue);
         
        if (!moveParams.angle) moveParams.angle = -1;
        let angle = moveParams.angle * (isSquareFace ? (Math.PI / 2) : Math.PI);
        let axisArray = axisIndexToArray(3, axis, dir);
        let axisVector = new Vector3().fromArray(axisArray);
        let q = new Quaternion().setFromAxisAngle(axisVector, angle);

        pieces.forEach(data => {
            data.change = {
                time: Date.now(),
                rotation: q.toArray(),
                lastPosition: data.position.slice(),
                lastRotation: data.rotation.slice(),
            };
            // apply quaternion q
            new Vector3().fromArray(data.position)
                .applyQuaternion(q)
                .toArray(data.position);
            new Quaternion().fromArray(data.rotation)
                .premultiply(q).normalize()
                .toArray(data.rotation);
            roundData(data);
        });
    },
};

function listCoords(dimensions) {
    let cumulatives = new Array(dimensions.length);
    let total = 1;
    for (let d = dimensions.length - 1; d >= 0; d--) {
        cumulatives[d] = total;
        total *= dimensions[d];
    }
    let coords = new Array(total);
    for (let i = 0; i < total; i++) {
        let coord = new Array(dimensions.length);
        for (let d = dimensions.length - 1; d >= 0; d--) {
            coord[d] = Math.floor(i / cumulatives[d]) % dimensions[d];
        }
        coords[i] = coord;
    }
    return coords;
}

function mapCoordValueToPositionValue(coordValue, dimensionValue) {
    return coordValue - (dimensionValue - 1) / 2;
}

function mapCoordToPosition(coord, dimensions) {
    let position = new Array(coord.length);
    for (let i = 0; i < coord.length; i++) {
        position[i] = mapCoordValueToPositionValue(coord[i], dimensions[i]);
    }
    return position;
}

function axisIndexToArray(dimensions, index, signal) {
    let array = new Array(dimensions).fill(0);
    array[index] = signal < 0 ? -1 : 1;
    return array;
}

function roundData(pieceData) {
    pieceData.position = pieceData.position.map(x => roundWithFactor(2, x));
    pieceData.rotation = pieceData.rotation.map(x => Math.sign(x) * Math.sqrt(roundWithFactor(4, x*x)));
}

function roundWithFactor(factor, x) {
    return  Math.round(factor * x) / factor;
}

const initialRotation = new Quaternion().identity().toArray();

export { engine };