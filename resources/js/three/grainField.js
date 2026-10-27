import {
    AdditiveBlending,
    AmbientLight,
    BufferAttribute,
    BufferGeometry,
    Color,
    DirectionalLight,
    Fog,
    Group,
    InstancedMesh,
    MathUtils,
    MeshStandardMaterial,
    Object3D,
    PerspectiveCamera,
    Points,
    PointsMaterial,
    Scene,
    SphereGeometry,
    SRGBColorSpace,
    Timer,
    WebGLRenderer,
} from 'three';

const BOUNDS = { x: 11, y: 7, zNear: 4, zFar: -8 };

/**
 * A wheat kernel: a stretched sphere with a shallow crease running down
 * its front, the way a real grain of wheat looks.
 */
function createKernelGeometry() {
    const geo = new SphereGeometry(1, 32, 20);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i) * 0.56;
        const y = pos.getY(i);
        let z = pos.getZ(i) * 0.5;

        // Slight taper towards the tip, rounder at the germ end.
        x *= 1 - Math.max(0, y) * 0.18;

        if (z > 0) {
            const crease = Math.exp(-(x * x) / 0.01) * (1 - y * y);
            z -= crease * 0.2;
        }
        pos.setXYZ(i, x, y, z);
    }

    geo.computeVertexNormals();
    return geo;
}

function createDust(count) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        positions[i * 3] = MathUtils.randFloatSpread(BOUNDS.x * 2.4);
        positions[i * 3 + 1] = MathUtils.randFloatSpread(BOUNDS.y * 2.4);
        positions[i * 3 + 2] = MathUtils.randFloat(BOUNDS.zFar, BOUNDS.zNear);
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));

    return new Points(
        geo,
        new PointsMaterial({
            color: '#ffe3a3',
            size: 0.035,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
            blending: AdditiveBlending,
        }),
    );
}

/**
 * Mounts the floating grain scene inside `container`.
 * Returns `setScroll(progress)` (0 → 1 across the hero) and `destroy()`.
 */
export function createGrainField(container, { reducedMotion = false } = {}) {
    const small = container.clientWidth < 768;
    const count = small ? 60 : 140;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    scene.fog = new Fog(new Color('#1b1610'), 14, 36);

    const camera = new PerspectiveCamera(35, 1, 0.1, 60);
    camera.position.set(0, 0, 16);

    scene.add(new AmbientLight('#ffe6bf', 0.55));
    const key = new DirectionalLight('#ffe2a8', 2.4);
    key.position.set(6, 8, 10);
    scene.add(key);
    const rim = new DirectionalLight('#ff9d2e', 1.6);
    rim.position.set(-8, -2, -6);
    scene.add(rim);

    const group = new Group();
    scene.add(group);

    const geometry = createKernelGeometry();
    const material = new MeshStandardMaterial({ color: '#d9a24a', roughness: 0.58, metalness: 0.04 });
    const kernels = new InstancedMesh(geometry, material, count);
    group.add(kernels);

    const dust = createDust(small ? 160 : 380);
    group.add(dust);

    // Per-kernel state. Kernels sit mostly to the right so the headline stays clear.
    const items = Array.from({ length: count }, () => {
        const biasRight = Math.random() < 0.7;
        return {
            x: biasRight ? MathUtils.randFloat(-1, BOUNDS.x) : MathUtils.randFloatSpread(BOUNDS.x * 2),
            y: MathUtils.randFloatSpread(BOUNDS.y * 2),
            z: MathUtils.randFloat(BOUNDS.zFar, BOUNDS.zNear),
            rx: Math.random() * Math.PI,
            ry: Math.random() * Math.PI,
            rz: Math.random() * Math.PI,
            spin: MathUtils.randFloat(0.1, 0.45) * (Math.random() < 0.5 ? -1 : 1),
            rise: MathUtils.randFloat(0.12, 0.38),
            sway: Math.random() * Math.PI * 2,
            scale: MathUtils.randFloat(0.13, 0.26),
            spread: MathUtils.randFloat(0.6, 1.4),
        };
    });

    const dummy = new Object3D();
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let scroll = 0;
    let visible = true;
    let frame = 0;
    const timer = new Timer();

    function layout(elapsed, delta) {
        for (let i = 0; i < count; i++) {
            const k = items[i];

            if (!reducedMotion) {
                k.y += k.rise * delta;
                k.rx += k.spin * delta;
                k.ry += k.spin * 0.6 * delta;
                if (k.y > BOUNDS.y + 1) k.y = -BOUNDS.y - 1;
            }

            // Scrolling away from the hero scatters the kernels outwards and up.
            const s = scroll * k.spread;
            dummy.position.set(
                k.x * (1 + s * 0.6) + Math.sin(elapsed * 0.4 + k.sway) * 0.25,
                k.y + s * 5,
                k.z + s * 3,
            );
            dummy.rotation.set(k.rx, k.ry, k.rz);
            dummy.scale.setScalar(k.scale);
            dummy.updateMatrix();
            kernels.setMatrixAt(i, dummy.matrix);
        }
        kernels.instanceMatrix.needsUpdate = true;
    }

    function render(time) {
        timer.update(time);
        const delta = Math.min(timer.getDelta(), 0.05);
        const elapsed = timer.getElapsed();

        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;
        group.rotation.y = pointer.x * 0.16;
        group.rotation.x = pointer.y * 0.1;
        dust.rotation.z = elapsed * 0.01;
        material.opacity = 1 - scroll * 0.6;

        layout(elapsed, delta);
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
        // Pull back a little on narrow screens so the field still reads.
        camera.position.z = w < 768 ? 20 : 16;
        camera.updateProjectionMatrix();
        if (reducedMotion) render(performance.now());
    }

    function onPointer(e) {
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(container);

    resize();
    if (reducedMotion) {
        render(performance.now());
    } else {
        material.transparent = true;
        window.addEventListener('pointermove', onPointer, { passive: true });
        frame = requestAnimationFrame(loop);
    }

    return {
        setScroll(progress) {
            scroll = progress;
            if (reducedMotion) render(performance.now());
        },
        destroy() {
            cancelAnimationFrame(frame);
            window.removeEventListener('pointermove', onPointer);
            ro.disconnect();
            io.disconnect();
            geometry.dispose();
            material.dispose();
            dust.geometry.dispose();
            dust.material.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        },
    };
}
