import {
    AdditiveBlending,
    AmbientLight,
    BoxGeometry,
    BufferAttribute,
    BufferGeometry,
    CanvasTexture,
    DirectionalLight,
    Group,
    HemisphereLight,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Points,
    PointsMaterial,
    RepeatWrapping,
    Scene,
    SRGBColorSpace,
    Timer,
    WebGLRenderer,
} from 'three';

const SIZE = { w: 2.3, h: 3.1, d: 1.1 };
const CLOTH = '#efe6d2';

// The "G" around a wheat ear, the same drawing as BrandMark.vue (64 × 64 box).
const MARK_RING = new Path2D('M47.3 19.1 A20 20 0 1 0 52 32 H40');
const MARK_STEM = new Path2D('M30 46 V17');
const MARK_KERNELS = [21, 26.5, 32, 37.5];

/**
 * A box pulled into a filled sack: it bulges in the middle, pinches flat to
 * seams at the sides, and is crimped and stitched along the top.
 */
function createSackGeometry() {
    const geo = new BoxGeometry(SIZE.w, SIZE.h, SIZE.d, 40, 56, 14);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
        const nx = pos.getX(i) / (SIZE.w / 2);
        const ny = pos.getY(i) / (SIZE.h / 2);
        const nz = pos.getZ(i) / (SIZE.d / 2);

        const bulgeX = Math.pow(1 - Math.pow(Math.abs(nx), 3), 0.55);
        const bulgeY = Math.pow(1 - Math.pow(Math.abs(ny), ny > 0 ? 2.2 : 5), 0.45);
        // Flour settles to the bottom, so the sack is fuller low down.
        const fill = 0.82 + 0.18 * (1 - ny) * 0.5;

        let x = pos.getX(i) * (1 + 0.05 * (1 - ny) * 0.5);
        let y = pos.getY(i);
        let z = pos.getZ(i) * Math.max(0.03, bulgeX * bulgeY * fill);

        // Soft creases across the cloth.
        z += nz * 0.018 * Math.sin(nx * 7 + ny * 3) * Math.cos(ny * 9);

        // Stitched, slightly wavy top seam.
        if (ny > 0.96) {
            y += Math.sin(nx * 30) * 0.012;
            x *= 0.98;
        }

        pos.setXYZ(i, x, y, z);
    }

    geo.computeVertexNormals();
    return geo;
}

function drawWeave(ctx, width, height, cell = 6) {
    ctx.fillStyle = CLOTH;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = '#7a5a2e';
    for (let y = 0; y < height; y += cell) {
        for (let x = (y / cell) % 2 ? 0 : cell; x < width; x += cell * 2) {
            ctx.fillRect(x, y, cell, cell * 0.5);
        }
    }
    ctx.globalAlpha = 0.05;
    for (let x = 0; x < width; x += cell) {
        ctx.fillRect(x, 0, 1, height);
    }
    ctx.globalAlpha = 1;
}

function createWeaveTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    drawWeave(canvas.getContext('2d'), 256, 256);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(4, 5);
    return texture;
}

function spaced(ctx, text, x, y, spacing) {
    if ('letterSpacing' in ctx) {
        ctx.letterSpacing = `${spacing}px`;
        ctx.fillText(text, x, y);
        ctx.letterSpacing = '0px';
    } else {
        ctx.fillText(text, x, y);
    }
}

/** The printed front of the sack for one product. */
function createLabelTexture(product, maxAnisotropy) {
    const W = 1024;
    const H = Math.round((W * SIZE.h) / SIZE.w);
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const cx = W / 2;

    drawWeave(ctx, W, H, 10);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Brand seal
    const markY = H * 0.29;
    ctx.fillStyle = '#efb121';
    ctx.beginPath();
    ctx.arc(cx, markY, 118, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(cx - 96, markY - 96);
    ctx.scale(3, 3);
    ctx.strokeStyle = ctx.fillStyle = '#1b1610';
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.stroke(MARK_RING);
    ctx.lineWidth = 1.8;
    ctx.stroke(MARK_STEM);
    const kernel = (x, y, ry, angle) => {
        ctx.beginPath();
        ctx.ellipse(x, y, 2.1, ry, MathUtils.degToRad(angle), 0, Math.PI * 2);
        ctx.fill();
    };
    kernel(30, 14.5, 3.6, 0);
    MARK_KERNELS.forEach((y) => {
        kernel(26.6, y, 3.9, -32);
        kernel(33.4, y, 3.9, 32);
    });
    ctx.restore();

    ctx.fillStyle = '#1b1610';
    ctx.font = '600 84px Fraunces, Georgia, serif';
    spaced(ctx, 'Golden Harvest', cx, H * 0.29 + 215, -1);
    ctx.fillStyle = '#7a5a2e';
    ctx.font = '600 28px "Hanken Grotesk", system-ui, sans-serif';
    spaced(ctx, 'FLOUR MILLS · SRI LANKA', cx, H * 0.29 + 268, 7);

    // Product band
    const bandTop = H * 0.56;
    const bandH = H * 0.2;
    ctx.fillStyle = product.tone;
    ctx.fillRect(0, bandTop, W, bandH);
    ctx.fillStyle = product.ink;
    ctx.font = 'italic 500 132px Fraunces, Georgia, serif';
    spaced(ctx, product.short, cx, bandTop + bandH * 0.58, -2);
    ctx.font = '600 30px "Hanken Grotesk", system-ui, sans-serif';
    spaced(ctx, 'WHEAT FLOUR', cx, bandTop + bandH * 0.84, 10);

    ctx.fillStyle = '#5a554c';
    ctx.font = '500 34px "Hanken Grotesk", system-ui, sans-serif';
    ctx.fillText(product.use, cx, bandTop + bandH + 90);

    // Stitch line under the top seam
    ctx.strokeStyle = 'rgb(122 90 46 / 0.55)';
    ctx.lineWidth = 4;
    ctx.setLineDash([18, 12]);
    ctx.beginPath();
    ctx.moveTo(40, H * 0.06);
    ctx.lineTo(W - 40, H * 0.06);
    ctx.stroke();

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    return texture;
}

function createShadowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgb(0 0 0 / 0.55)');
    g.addColorStop(1, 'rgb(0 0 0 / 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new CanvasTexture(canvas);
}

function createPuff(count) {
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
    const points = new Points(
        geo,
        new PointsMaterial({ color: '#fff6e2', size: 0.05, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
    );
    const velocities = new Float32Array(count * 3);
    return { points, velocities, life: 0 };
}

/**
 * A 3D sack of flour that turns to show whichever product is selected.
 * `products` need `short`, `use`, `tone` and `ink`. Returns `show(index)`,
 * `setScroll(progress)` and `destroy()`.
 */
export async function createFlourSack(container, products, { reducedMotion = false } = {}) {
    // Draw labels with the site's own fonts.
    await Promise.race([
        Promise.all([document.fonts.load('600 84px Fraunces'), document.fonts.load('italic 500 132px Fraunces'), document.fonts.load('600 30px "Hanken Grotesk"')]),
        new Promise((resolve) => setTimeout(resolve, 1500)),
    ]).catch(() => {});

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0.35, 10);

    scene.add(new HemisphereLight('#fff4dc', '#5a4022', 1.1));
    scene.add(new AmbientLight('#ffffff', 0.25));
    const key = new DirectionalLight('#fff0d6', 2.2);
    key.position.set(4, 6, 8);
    scene.add(key);
    const rim = new DirectionalLight('#ffb84a', 2.4);
    rim.position.set(-6, 3, -5);
    scene.add(rim);

    const anisotropy = renderer.capabilities.getMaxAnisotropy();
    const labels = products.map((p) => createLabelTexture(p, anisotropy));
    const weave = createWeaveTexture();

    const cloth = new MeshStandardMaterial({ map: weave, roughness: 0.92, metalness: 0 });
    const front = new MeshStandardMaterial({ map: labels[0], roughness: 0.88, metalness: 0 });
    // BoxGeometry groups: +x, -x, +y, -y, +z (front), -z (back).
    const geometry = createSackGeometry();
    const sack = new Mesh(geometry, [cloth, cloth, cloth, cloth, front, cloth]);

    const rig = new Group();
    rig.add(sack);
    scene.add(rig);

    const shadowTexture = createShadowTexture();
    const shadow = new Mesh(
        new PlaneGeometry(3.6, 1.4),
        new MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -SIZE.h / 2 - 0.05;
    scene.add(shadow);

    const puff = createPuff(140);
    scene.add(puff.points);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const spin = { angle: 0, from: 0, to: 0, t: 1, pending: -1 };
    let scroll = 0;
    let visible = true;
    let frame = 0;
    const timer = new Timer();

    function burst() {
        const pos = puff.points.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            pos.setXYZ(i, MathUtils.randFloatSpread(SIZE.w * 0.8), SIZE.h / 2 - 0.1, MathUtils.randFloatSpread(0.6));
            puff.velocities[i * 3] = MathUtils.randFloatSpread(1.6);
            puff.velocities[i * 3 + 1] = MathUtils.randFloat(0.4, 1.8);
            puff.velocities[i * 3 + 2] = MathUtils.randFloatSpread(1.2);
        }
        pos.needsUpdate = true;
        puff.life = 1;
    }

    function render(time) {
        timer.update(time);
        const dt = Math.min(timer.getDelta(), 0.05);
        const elapsed = timer.getElapsed();

        pointer.x += (pointer.tx - pointer.x) * 0.06;
        pointer.y += (pointer.ty - pointer.y) * 0.06;

        // A full turn per product change; the label is swapped while it faces away.
        if (spin.t < 1) {
            spin.t = Math.min(1, spin.t + dt / 1.1);
            const eased = 1 - Math.pow(1 - spin.t, 4);
            spin.angle = MathUtils.lerp(spin.from, spin.to, eased);
            if (spin.pending > -1 && Math.cos(spin.angle) < -0.2) {
                front.map = labels[spin.pending];
                spin.pending = -1;
            }
        }

        const idle = reducedMotion ? 0 : Math.sin(elapsed * 0.6) * 0.18;
        rig.rotation.y = spin.angle + idle + pointer.x * 0.35 + (scroll - 0.5) * 0.6;
        rig.rotation.x = pointer.y * 0.12;
        rig.rotation.z = reducedMotion ? 0 : Math.sin(elapsed * 0.8) * 0.025;
        rig.position.y = reducedMotion ? 0 : Math.sin(elapsed * 1.1) * 0.06;
        shadow.scale.setScalar(1 - rig.position.y * 0.6);

        if (puff.life > 0) {
            puff.life = Math.max(0, puff.life - dt / 1.6);
            const pos = puff.points.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                puff.velocities[i * 3 + 1] -= dt * 0.6;
                pos.setXYZ(
                    i,
                    pos.getX(i) + puff.velocities[i * 3] * dt,
                    pos.getY(i) + puff.velocities[i * 3 + 1] * dt,
                    pos.getZ(i) + puff.velocities[i * 3 + 2] * dt,
                );
            }
            pos.needsUpdate = true;
            puff.points.material.opacity = puff.life * 0.9;
            puff.points.rotation.y = rig.rotation.y;
        }

        renderer.render(scene, camera);
    }

    function loop(time) {
        frame = requestAnimationFrame(loop);
        if (visible && !document.hidden) render(time);
    }

    function resize() {
        const { clientWidth: w, clientHeight: h } = container;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Keep the whole sack in frame whatever the panel's shape.
        const fitHeight = (SIZE.h * 1.45) / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)));
        camera.position.z = Math.max(fitHeight, fitHeight / Math.min(1, camera.aspect / 0.75));
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        render(performance.now());
    }

    function onPointer(e) {
        const box = container.getBoundingClientRect();
        pointer.tx = MathUtils.clamp(((e.clientX - box.left) / box.width) * 2 - 1, -1.5, 1.5);
        pointer.ty = MathUtils.clamp(((e.clientY - box.top) / box.height) * 2 - 1, -1.5, 1.5);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(container);

    resize();
    if (!reducedMotion) window.addEventListener('pointermove', onPointer, { passive: true });
    frame = requestAnimationFrame(loop);

    let current = 0;

    return {
        show(index) {
            if (index === current || !labels[index]) return;
            current = index;
            if (reducedMotion) {
                front.map = labels[index];
                return;
            }
            spin.from = spin.angle;
            spin.to = Math.round(spin.angle / (Math.PI * 2)) * Math.PI * 2 + Math.PI * 2;
            spin.t = 0;
            spin.pending = index;
            burst();
        },
        setScroll(progress) {
            scroll = progress;
        },
        destroy() {
            cancelAnimationFrame(frame);
            window.removeEventListener('pointermove', onPointer);
            ro.disconnect();
            io.disconnect();
            labels.forEach((t) => t.dispose());
            [weave, shadowTexture].forEach((t) => t.dispose());
            [cloth, front, shadow.material, puff.points.material].forEach((m) => m.dispose());
            [geometry, shadow.geometry, puff.points.geometry].forEach((g) => g.dispose());
            renderer.dispose();
            renderer.domElement.remove();
        },
    };
}
