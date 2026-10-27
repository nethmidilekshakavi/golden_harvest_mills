/**
 * Placeholder photography from Unsplash. Swap these ids (or replace the
 * helper with local paths under /public/images) once real assets exist.
 */
export const photos = {
    fieldSunset: '1500382017468-9049fed747ef',
    wheatGold: '1499529112087-3cb3b73cec95',
    wheatSky: '1437252611977-07f74518abd7',
    grains: '1574323347407-f5e1ad6d020b',
    cropRows: '1560493676-04071c5f467b',
    factory: '1581091226825-a6a2a5aee158',
    port: '1578575437130-527eed3abbec',
    warehouse: '1586528116311-ad8dd3c8310d',
    farmers: '1574943320219-553eb213f72d',
    breadLoaf: '1586444248902-2f64eddc13df',
    curryRoti: '1505253758473-96b7015fcd40',
    dough: '1517686469429-8bdb88b9f907',
    lab: '1582719471384-894fbb16e074',
    trucks: '1565793298595-6a879b1d9492',
};

export function photo(id, width = 1200, quality = 75) {
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=${quality}`;
}

export function srcset(id, widths = [480, 800, 1200, 1800]) {
    return widths.map((w) => `${photo(id, w)} ${w}w`).join(', ');
}
