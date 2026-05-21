// main.js
import { currentOutfit } from './outfit.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageCache = new Map();
let redrawId = 0;

const skinTintPaths = [
    '/body/skin/',
    '/body/details/',
    '/face/eyes/',
];

ctx.fillStyle = '#080610';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// checking if images are loaded
export function loadImages(images, callback) {
    let loaded = 0;
        images.forEach(img => {
            img.onload = function() {
            loaded++;
            if (loaded === images.length) callback();
        };
    });
}

// redraws the outfit after switching options
export function getOutfitLayers() {
    const layers = [];
    
    function flatten(obj) {
        Object.entries(obj).forEach(([key, value]) => {
            if (value === null) return;
            if (key === 'color') return;
            if (key === 'skinColor') return;
            if (typeof value === 'object') {
                flatten(value);
            } else if (!value.startsWith('#')) {
                layers.push({
                    src: value,
                    tint: getLayerTint(value),
                });
            }
        });
    }
    
    flatten(currentOutfit);
    return layers;
}

function getLayerTint(src) {
    if (src.includes('/hair/')) {
        return {
            color: currentOutfit.hair.color,
            mode: 'shaded',
        };
    }

    if (skinTintPaths.some(path => src.includes(path))) {
        return {
            color: currentOutfit.skinColor,
            mode: 'shaded',
        };
    }

    return null;
}

function loadImage(src) {
    if (imageCache.has(src)) {
        return imageCache.get(src);
    }

    const imagePromise = new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });

    imageCache.set(src, imagePromise);
    return imagePromise;
}

function drawTintedImage(targetCtx, img, tint) {
    const layerCanvas = document.createElement('canvas');
    const layerCtx = layerCanvas.getContext('2d');
    const tintColor = typeof tint === 'string' ? tint : tint.color;
    const tintMode = typeof tint === 'string' ? 'shaded' : tint.mode;

    layerCanvas.width = canvas.width;
    layerCanvas.height = canvas.height;

    layerCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    layerCtx.globalCompositeOperation = 'source-atop';
    layerCtx.fillStyle = tintColor;
    layerCtx.fillRect(0, 0, canvas.width, canvas.height);

    if (tintMode === 'shaded') {
        layerCtx.globalCompositeOperation = 'multiply';
        layerCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    layerCtx.globalCompositeOperation = 'source-over';

    targetCtx.drawImage(layerCanvas, 0, 0);
}

export async function redraw() {
    const currentRedrawId = ++redrawId;
    const layers = getOutfitLayers();
    const images = await Promise.all(layers.map(layer => loadImage(layer.src)));

    if (currentRedrawId !== redrawId) return;

    const bufferCanvas = document.createElement('canvas');
    const bufferCtx = bufferCanvas.getContext('2d');

    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;
    bufferCtx.fillStyle = currentOutfit.canvasColor;
    bufferCtx.fillRect(0, 0, bufferCanvas.width, bufferCanvas.height);

    layers.forEach((layer, index) => {
        const img = images[index];

        if (layer.tint) {
            drawTintedImage(bufferCtx, img, layer.tint);
        } else {
            bufferCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bufferCanvas, 0, 0);
}

export function exportCanvas(filename = 'wardrobe-whimsy-outfit.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

redraw();
