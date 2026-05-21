import { outfitCategories, skinColors } from './assets.js';
import { currentOutfit } from './outfit.js';
import { redraw } from './main.js';

const mainTabs = document.querySelectorAll('.tab');
const subTabContainer = document.getElementById('sub-tabs');
const thumbnailContainer = document.getElementById('thumbnails');
let lastTop = currentOutfit.clothes.tops;
let lastBottom = currentOutfit.clothes.bottoms;

function getThumbnailSrc(src) {
    const thumbnailSrc = src.replace('assets/', 'assets/thumbnails/');

    if (src.endsWith('.webp')) {
        return `${thumbnailSrc}.png`;
    }

    return thumbnailSrc;
}

function selectClothing(subTab, src) {
    if (subTab === 'dresses') {
        lastTop = currentOutfit.clothes.tops ?? lastTop;
        lastBottom = currentOutfit.clothes.bottoms ?? lastBottom;
        currentOutfit.clothes.dresses = src;
        currentOutfit.clothes.tops = null;
        currentOutfit.clothes.bottoms = null;
        return;
    }

    if (subTab === 'tops') {
        currentOutfit.clothes.dresses = null;
        currentOutfit.clothes.tops = src;
        currentOutfit.clothes.bottoms = lastBottom;
        lastTop = src;
        return;
    }

    if (subTab === 'bottoms') {
        currentOutfit.clothes.dresses = null;
        currentOutfit.clothes.tops = lastTop;
        currentOutfit.clothes.bottoms = src;
        lastBottom = src;
        return;
    }

    currentOutfit.clothes[subTab] = src;
}

function canClearSelection(tabName, subTab) {
    if (tabName === 'body') return subTab === 'bodyDetails';
    if (tabName === 'face') return ['eyelashes', 'ears', 'details'].includes(subTab);
    if (tabName === 'clothes') return !['tops', 'bottoms', 'dresses'].includes(subTab);
    if (tabName === 'hair') return subTab === 'back' || subTab === 'bangs';
    if (tabName === 'accessories' || tabName === 'extras') return true;

    return tabName === 'foreground';
}

function clearSelection(tabName, subTab) {
    if (tabName === 'body' || tabName === 'extras') {
        currentOutfit[subTab] = null;
    } else if (tabName === 'hair' && subTab === 'back') {
        currentOutfit.hairBack = null;
    } else if (tabName === 'hair' && subTab === 'bangs') {
        currentOutfit.hair.bangs = null;
    } else if (tabName === 'clothes') {
        currentOutfit.clothes[subTab] = null;
    } else if (tabName === 'accessories') {
        currentOutfit.accessories[subTab] = null;
    } else if (tabName === 'face') {
        currentOutfit.face[subTab] = null;
    } else {
        currentOutfit[tabName] = null;
    }

    redraw();
}

function selectItem(tabName, subTab, src) {
    if (tabName === 'body' || tabName === 'extras') {
        currentOutfit[subTab] = src;
        if (tabName === 'body' && subTab === 'skin') {
            currentOutfit.skinColor = skinColors[src];
        }
    } else if (tabName === 'hair' && subTab === 'back') {
        currentOutfit.hairBack = src;
    } else if (tabName === 'hair' && subTab === 'color') {
        currentOutfit.hair.color = src;
    } else if (tabName === 'clothes') {
        selectClothing(subTab, src);
    } else if (subTab === null) {
        currentOutfit[tabName] = src;
    } else {
        currentOutfit[tabName][subTab] = src;
    }

    redraw();
}

function createClearButton(tabName, subTab) {
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.classList.add('thumbnail', 'clear-thumbnail');
    clearButton.textContent = '⊘';
    clearButton.setAttribute('aria-label', `Clear ${subTab}`);
    clearButton.addEventListener('click', () => clearSelection(tabName, subTab));
    return clearButton;
}

function shouldShowSubTab(tabName, subTab) {
    return !(tabName === 'face' && subTab === 'eyes');
}

// main tabs
mainTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        mainTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const tabName = this.dataset.tab;
        showSubTabs(tabName);
    });
});

// subtabs
function showSubTabs(tabName) {
    subTabContainer.innerHTML = '';
    thumbnailContainer.innerHTML = '';
    
    const category = outfitCategories[tabName];
    if (!category) return;

    if (Array.isArray(category)) {
        showThumbnails(tabName, null);
        return;
    }
    
    Object.keys(category).filter(subTab => shouldShowSubTab(tabName, subTab)).forEach(subTab => {
        const btn = document.createElement('button');
        btn.classList.add('subtab');
        btn.textContent = subTab;
        btn.addEventListener('click', () => showThumbnails(tabName, subTab));
        subTabContainer.appendChild(btn);
    });
}

// thumbnails
function showThumbnails(tabName, subTab) {
    thumbnailContainer.innerHTML = '';
    
    const items = subTab === null ? outfitCategories[tabName] : outfitCategories[tabName][subTab];

    if (canClearSelection(tabName, subTab)) {
        thumbnailContainer.appendChild(createClearButton(tabName, subTab));
    }
    
    items.forEach((src, index) => {
        const isSkinSwatch = tabName === 'body' && subTab === 'skin';
        const isHairColorSwatch = tabName === 'hair' && subTab === 'color';
        const thumbnail = document.createElement(isSkinSwatch || isHairColorSwatch ? 'button' : 'img');

        // swatches
        function setupSwatch(thumbnail, className, color, label) {
            thumbnail.type = 'button';
            thumbnail.classList.add('thumbnail', className);
            thumbnail.style.backgroundColor = color;
            thumbnail.style.width = '72px';
            thumbnail.style.height = '72px';
            thumbnail.setAttribute('aria-label', label);
        }

        // sets up skin and hair swatches
        if (isSkinSwatch) {
            setupSwatch(
                thumbnail,
                'skin-swatch',
                skinColors[src],
                `Select skin ${index + 1}`
            );
        } else if (isHairColorSwatch) {
            setupSwatch(
                thumbnail,
                'hair-color-swatch',
                src,
                `Select hair color ${index + 1}`
            );
        } else {
            thumbnail.src = getThumbnailSrc(src);
            thumbnail.classList.add('thumbnail');
        }

        // redraw canvas on thumbnail click
        thumbnail.addEventListener('click', () => {
            selectItem(tabName, subTab, src);
        });

        thumbnailContainer.appendChild(thumbnail);
    });
}
