import { gfx } from './gfx.mjs';
import { engine } from './engine.mjs';
import { input } from './input.mjs';

function onload() {
    if (!gfx.prepare()) return;
    
    // esse é o tamanho do puzzle. Altere como quiser
    engine.pieceCounts = [3, 3, 3];
    var distance = Math.max.apply(Math, engine.pieceCounts);
    engine.createPiecesData();

    gfx.animationDuration = 200;
    gfx.piecesData = engine.piecesData;
    gfx.createScene(distance);
    gfx.createPieceMesh(engine.colorValues);
    gfx.start();

    input.callback = (params) => engine.applyMove(params);
    input.addKeyListeners();
}

window.onload = onload;
