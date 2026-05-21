import path from 'node:path';
import { readdir, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const INPUT_DIR = path.join(projectRoot, 'assets');
const OUTPUT_DIR = path.join(INPUT_DIR, 'thumbnails');
const SIZE = Number.parseInt(process.argv[2] ?? '72', 10);
const BACKGROUND_WIDTH = SIZE;
const BACKGROUND_HEIGHT = Math.round(SIZE * 1.5);
const ALPHA_THRESHOLD = 8;
const EXTENSIONS = new Set(['.png', '.webp']);
const foldersToSkip = new Set(['thumbnails']);

async function* walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(INPUT_DIR, fullPath);
        const normalizedPath = relativePath.split(path.sep).join('/');

        if (entry.isDirectory()) {
            if (foldersToSkip.has(normalizedPath)) continue;
            yield* walk(fullPath);
            continue;
        }

        if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
            yield fullPath;
        }
    }
}

async function getContentBounds(filePath) {
    const { data, info } = await sharp(filePath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    let minX = info.width;
    let minY = info.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
            const alpha = data[(y * info.width + x) * info.channels + 3];
            if (alpha <= ALPHA_THRESHOLD) continue;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
    }

    if (maxX === -1) return null;

    return {
        left: minX,
        top: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
    };
}

function isBackground(filePath) {
    return path.relative(INPUT_DIR, filePath).split(path.sep).join('/').startsWith('canvas/background/');
}

function getOutputPath(filePath) {
    const relativePath = path.relative(INPUT_DIR, filePath);

    if (path.extname(filePath).toLowerCase() === '.webp') {
        return path.join(OUTPUT_DIR, `${relativePath}.png`);
    }

    return path.join(OUTPUT_DIR, relativePath);
}

async function makeThumbnail(filePath) {
    const relativePath = path.relative(INPUT_DIR, filePath);
    const outputPath = getOutputPath(filePath);

    await mkdir(path.dirname(outputPath), { recursive: true });

    if (isBackground(filePath)) {
        await sharp(filePath)
            .resize(BACKGROUND_WIDTH, BACKGROUND_HEIGHT, {
                fit: 'cover',
                position: 'center',
            })
            .png()
            .toFile(outputPath);

        console.log(`Created ${path.relative(projectRoot, outputPath)}`);
        return true;
    }

    const bounds = await getContentBounds(filePath);

    if (!bounds) {
        console.warn(`Skipped empty transparent image: ${relativePath}`);
        return false;
    }

    await sharp(filePath)
        .extract(bounds)
        .resize(SIZE, SIZE, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(outputPath);

    console.log(`Created ${path.relative(projectRoot, outputPath)}`);
    return true;
}

let created = 0;

for await (const filePath of walk(INPUT_DIR)) {
    const didCreate = await makeThumbnail(filePath);
    if (didCreate) created++;
}

console.log(`Done. Created ${created} thumbnails at ${path.relative(projectRoot, OUTPUT_DIR)}/`);
