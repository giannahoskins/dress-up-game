const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const bodyBase = new Image();
const underwearBottom = new Image();
const underwearTop = new Image();

bodyBase.src = 'assets/body/base/base_body_q.png';
underwearBottom.src = 'assets/body/underwear/bottom/slip.webp';
underwearTop.src = 'assets/body/underwear/top/bra.webp';

// generate asset paths
function generatePaths(folder, prefix, count, extension) {
    const paths = [];
    for (let i = 1; i <= count; i++) {
        paths.push(`assets/${folder}/${prefix}${i}.${extension}`);
    }
    return paths;
}

// checking if images are loaded
function loadImages(images, callback) {
    let loaded = 0;
        images.forEach(img => {
            img.onload = function() {
            loaded++;
            if (loaded === images.length) callback();
        };
    });
}

// current outfit object
const currentOutfit = {
    background: null,
    wings: null,
    tail: null,
    body: null,
    bodyLines: null,
    face: {
        eyes: null,
        pupils: null,
        eyelashes: null,
        eyebrows: null,
        nose: null,
        mouth: null,
        detail: null,
        ears: null
    },
    clothes: {
        socks: null,
        bottom: null,
        top: null,
        jacket: null
    },
    hair: null,
    bangs: null,
    horns: null,
    accessories: null,
    weapon: null
};

// redraws the outfit after switching options
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // always draw base layers
    ctx.drawImage(bodyBase, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(underwearBottom, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(underwearTop, 0, 0, canvas.width, canvas.height);
  
    // draw whatever is selected
    Object.values(currentOutfit).forEach(src => {
        if (src) {
            const img = new Image();
            img.src = src;
            img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    });
}

loadImages([bodyBase, underwearBottom, underwearTop], function() {
    ctx.fillStyle = 'purple';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bodyBase, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(underwearBottom, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(underwearTop, 0, 0, canvas.width, canvas.height);
});