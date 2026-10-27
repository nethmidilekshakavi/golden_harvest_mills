import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

/**
 * Gives the photo inside each card the WebGL hover ripple. Three.js is only
 * fetched, and each WebGL context only created, the first time that card is
 * hovered. Returns a cleanup function.
 */
export function attachImageRipples(cards) {
    if (!hasFinePointer() || prefersReducedMotion()) return () => {};

    const ripples = [];
    let disposed = false;

    async function onFirstEnter(e) {
        const card = e.currentTarget;
        card.removeEventListener('pointerenter', onFirstEnter);

        try {
            const { createImageRipple } = await import('@/three/imageRipple');
            if (disposed) return;
            const ripple = createImageRipple(card.querySelector('img'), { hoverTarget: card });
            ripples.push(ripple);
            if (card.matches(':hover')) ripple.enter(e);
        } catch (error) {
            // No WebGL: the plain photo stays as it is.
        }
    }

    cards.forEach((card) => card.addEventListener('pointerenter', onFirstEnter));

    return () => {
        disposed = true;
        cards.forEach((card) => card.removeEventListener('pointerenter', onFirstEnter));
        ripples.forEach((ripple) => ripple.destroy());
    };
}
