import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let lenis = null;

/**
 * Start Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger
 * stays in sync. Skipped entirely when the visitor prefers reduced motion.
 */
export function startSmoothScroll() {
    if (lenis || prefersReducedMotion()) return lenis;

    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return lenis;
}

export function stopSmoothScroll() {
    if (!lenis) return;
    gsap.ticker.remove(raf);
    lenis.destroy();
    lenis = null;
}

function raf(time) {
    lenis?.raf(time * 1000);
}

/** Scroll to an in-page target, through Lenis when it is running. */
export function scrollToTarget(target, offset = -72) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    if (lenis) {
        lenis.scrollTo(el, { offset, duration: 1.2 });
    } else {
        const top = el.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
}

/** Pause or resume scrolling, e.g. while the mobile menu is open. */
export function lockScroll(locked) {
    if (lenis) {
        locked ? lenis.stop() : lenis.start();
    }
    document.documentElement.style.overflow = locked ? 'hidden' : '';
}
