// current outfit object
export const defaultOutfit = {
    canvasColor: '#d0c0c0',
    background: null,
    wings: null,
    tail: null,
    hairBack: 'assets/hair/back/img4.webp',
    skin: 'assets/body/skin/16.png',
    skinColor: '#b1846d',
    bodyDetails: null,
    face: {
        pupils: 'assets/face/pupils/3.png',
        eyes: 'assets/face/eyes/1.png',
        eyelashes: null,
        eyebrows: 'assets/face/eyebrows/6.png',
        nose: 'assets/face/nose/1.png',
        mouth: 'assets/face/mouth/1.png',
        details: null
    },
    clothes: {
        socks: null,
        bottoms: 'assets/clothes/bottom/4.png',
        tops: 'assets/clothes/top/1.png',
        dresses: null,
        jackets: null,
        shoes: null
    },
    hair: {
        bangs: 'assets/hair/bangs/1.webp',
        color: '#6b3f28'
    },
    accessories: {
        head: null,
        body: null,
        face: null
    },
    foreground: null
};

export const currentOutfit = structuredClone(defaultOutfit);

export function resetOutfit() {
    Object.keys(currentOutfit).forEach(key => {
        delete currentOutfit[key];
    });

    Object.assign(currentOutfit, structuredClone(defaultOutfit));
}
