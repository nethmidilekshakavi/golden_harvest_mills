import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Color,
    MathUtils,
    PerspectiveCamera,
    Points,
    Scene,
    ShaderMaterial,
    Timer,
    Vector2,
    WebGLRenderer,
} from 'three';

const vertexShader = /* glsl */ `
    attribute float aSize;
    attribute float aSeed;
    uniform float uTime;
    uniform float uScroll;
    uniform float uPixelRatio;
    uniform vec2 uPointer;
    varying float vAlpha;

    void main() {
        vec3 p = position;
        // Slow upward drift that wraps, with a lazy side-to-side sway.
        p.y = mod(p.y + uTime * (0.15 + aSeed * 0.25) + 6.0, 12.0) - 6.0;
        p.x += sin(uTime * 0.3 + aSeed * 12.0) * 0.4;
        // Nearer motes move further with scroll and the pointer: cheap parallax.
        float depth = (p.z + 6.0) / 10.0;
        p.y -= uScroll * 3.0 * depth;
        p.xy += uPointer * 0.6 * depth;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixelRatio * (12.0 / -mv.z);
        vAlpha = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 1.6 + aSeed * 40.0));
    }
`;

const fragmentShader = /* glsl */ `
    uniform vec3 uColor;
    varying float vAlpha;

    void main() {
        float d = length(gl_PointCoord - 0.5);
        float glow = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor, glow * glow * vAlpha);
    }
`;

/**
 * Warm, glowing motes of flour dust drifting through a beam of light.
 * Returns `setScroll(progress)` (0 → 1 across the section) and `destroy()`.
 */
export function createDustMotes(container) {
    const small = container.clientWidth < 768;
    const count = small ? 260 : 650;

    const renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(45, 1, 0.1, 40);
    camera.position.z = 8;

    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        // Bias towards the right, where the light falls on the photo.
        positions[i * 3] = MathUtils.randFloat(-9, 11) * (Math.random() < 0.65 ? 1 : 0.5);
        positions[i * 3 + 1] = MathUtils.randFloatSpread(12);
        positions[i * 3 + 2] = MathUtils.randFloat(-6, 4);
        sizes[i] = MathUtils.randFloat(1.5, 6) * (Math.random() < 0.08 ? 2.2 : 1);
        seeds[i] = Math.random();
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new BufferAttribute(sizes, 1));
    geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));

    const uniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uPointer: { value: new Vector2() },
        // Written straight to the screen by the shader, so these are display values.
        uColor: { value: new Color(1.0, 0.86, 0.55) },
    };

    const material = new ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
    });
    scene.add(new Points(geometry, material));

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const timer = new Timer();
    let visible = false;
    let frame = 0;

    function loop(time) {
        frame = requestAnimationFrame(loop);
        if (!visible || document.hidden) return;

        timer.update(time);
        uniforms.uTime.value = timer.getElapsed();
        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;
        uniforms.uPointer.value.set(pointer.x, pointer.y);
        renderer.render(scene, camera);
    }

    function resize() {
        const { clientWidth: w, clientHeight: h } = container;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    function onPointer(e) {
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(container);

    resize();
    window.addEventListener('pointermove', onPointer, { passive: true });
    frame = requestAnimationFrame(loop);

    return {
        setScroll(progress) {
            uniforms.uScroll.value = progress;
        },
        destroy() {
            cancelAnimationFrame(frame);
            window.removeEventListener('pointermove', onPointer);
            ro.disconnect();
            io.disconnect();
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        },
    };
}
