import {
    Mesh,
    OrthographicCamera,
    PlaneGeometry,
    Scene,
    ShaderMaterial,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    WebGLRenderer,
} from 'three';

const vertexShader = /* glsl */ `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

// Samples the photo like `object-fit: cover`, then bends it with a ripple
// centred on the pointer and splits the colour channels while it moves fast.
const fragmentShader = /* glsl */ `
    uniform sampler2D uMap;
    uniform vec2 uCover;
    uniform vec2 uMouse;
    uniform float uAspect;
    uniform float uHover;
    uniform float uVelocity;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
        vec2 d = vUv - uMouse;
        d.x *= uAspect;
        float dist = length(d);
        vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0);
        dir.x /= uAspect;

        float wave = sin(dist * 26.0 - uTime * 4.0) * exp(-dist * 4.5);
        vec2 offset = dir * wave * (0.006 * uHover + 0.03 * uVelocity);

        float zoom = 1.0 - 0.05 * uHover;
        vec2 uv = (vUv - 0.5) * uCover * zoom + 0.5 + offset;
        float shift = 0.004 * uVelocity;

        vec4 base = texture2D(uMap, uv);
        gl_FragColor = vec4(texture2D(uMap, uv + dir * shift).r, base.g, texture2D(uMap, uv - dir * shift).b, 1.0);
        #include <colorspace_fragment>
    }
`;

/**
 * Lays a WebGL copy of `img` directly over it and ripples it under the
 * pointer while `hoverTarget` is hovered. At rest the copy is pixel-identical
 * to the photo, so it fades in once loaded without a visible swap.
 */
export function createImageRipple(img, { hoverTarget = img.parentElement } = {}) {
    const host = img.parentElement;
    const renderer = new WebGLRenderer({ alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;

    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        zIndex: getComputedStyle(img).zIndex,
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 0.5s ease',
    });
    img.after(canvas);

    const uniforms = {
        uMap: { value: null },
        uCover: { value: new Vector2(1, 1) },
        uMouse: { value: new Vector2(0.5, 0.5) },
        uAspect: { value: 1 },
        uHover: { value: 0 },
        uVelocity: { value: 0 },
        uTime: { value: 0 },
    };

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    scene.add(new Mesh(geometry, material));

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let hovered = false;
    let frame = 0;
    let running = false;
    let last = 0;

    function fitCover() {
        const image = uniforms.uMap.value?.image;
        const aspect = uniforms.uAspect.value;
        if (!image) return;
        const imageAspect = image.width / image.height;
        uniforms.uCover.value.set(aspect > imageAspect ? 1 : aspect / imageAspect, aspect > imageAspect ? imageAspect / aspect : 1);
    }

    function resize() {
        const { clientWidth: w, clientHeight: h } = host;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        uniforms.uAspect.value = w / h;
        fitCover();
        renderer.render(scene, camera);
    }

    function tick(time) {
        const dt = last ? Math.min((time - last) / 1000, 0.05) : 0.016;
        last = time;

        const px = pointer.x;
        const py = pointer.y;
        pointer.x += (pointer.tx - pointer.x) * 0.12;
        pointer.y += (pointer.ty - pointer.y) * 0.12;
        const speed = Math.hypot(pointer.x - px, pointer.y - py) / dt;

        const u = uniforms;
        u.uMouse.value.set(pointer.x, pointer.y);
        u.uTime.value += dt;
        u.uHover.value += ((hovered ? 1 : 0) - u.uHover.value) * 0.08;
        u.uVelocity.value += (Math.min(speed * 0.6, 1) - u.uVelocity.value) * 0.1;
        renderer.render(scene, camera);

        // Sleep once the effect has fully settled.
        if (!hovered && u.uHover.value < 0.002 && u.uVelocity.value < 0.002) {
            u.uHover.value = 0;
            u.uVelocity.value = 0;
            renderer.render(scene, camera);
            running = false;
            return;
        }
        frame = requestAnimationFrame(tick);
    }

    function wake() {
        if (running || !uniforms.uMap.value) return;
        running = true;
        last = 0;
        frame = requestAnimationFrame(tick);
    }

    function onMove(e) {
        const box = host.getBoundingClientRect();
        pointer.tx = (e.clientX - box.left) / box.width;
        pointer.ty = 1 - (e.clientY - box.top) / box.height;
        wake();
    }

    function onEnter(e) {
        hovered = true;
        onMove(e);
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
    }

    function onLeave() {
        hovered = false;
    }

    hoverTarget.addEventListener('pointerenter', onEnter);
    hoverTarget.addEventListener('pointermove', onMove);
    hoverTarget.addEventListener('pointerleave', onLeave);

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const loader = new TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(img.currentSrc || img.src, (texture) => {
        texture.colorSpace = SRGBColorSpace;
        uniforms.uMap.value = texture;
        resize();
        canvas.style.opacity = '1';
        wake();
    });

    return {
        /** Start as hovered, for when the ripple is created mid-hover. */
        enter: onEnter,
        destroy() {
            cancelAnimationFrame(frame);
            hoverTarget.removeEventListener('pointerenter', onEnter);
            hoverTarget.removeEventListener('pointermove', onMove);
            hoverTarget.removeEventListener('pointerleave', onLeave);
            ro.disconnect();
            uniforms.uMap.value?.dispose();
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            canvas.remove();
        },
    };
}
