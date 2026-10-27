<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { gsap, ScrollTrigger, prefersReducedMotion, scrollToTarget } from '@/lib/motion';
import { photo, photos, srcset } from '@/lib/images';

const slides = [
    { id: photos.fieldSunset, caption: 'Sunrise over the wheat fields' },
    { id: photos.wheatGold, caption: 'Ripe ears, ready for harvest' },
    { id: photos.wheatSky, caption: 'Grown for clean, consistent flour' },
];

const SLIDE_MS = 7000;

const root = ref(null);
const canvasHost = ref(null);
const current = ref(0);
const paused = ref(false);
const autoplay = ref(false);

let field = null;
let ctx = null;
let unmounted = false;

// Slides advance when the active progress bar finishes, so pausing the bar pauses the slider too.
function show(index) {
    current.value = (index + slides.length) % slides.length;
}

// Three.js is loaded separately so the page paints before the 3D scene arrives.
async function mountGrainField(reduced) {
    try {
        const { createGrainField } = await import('@/three/grainField');
        if (unmounted) return;
        field = createGrainField(canvasHost.value, { reducedMotion: reduced });
        if (!reduced) gsap.from(canvasHost.value, { autoAlpha: 0, duration: 2.2, ease: 'power2.out' });
    } catch (e) {
        // No WebGL: the photo slider carries the hero on its own.
        field = null;
    }
}

onMounted(() => {
    const reduced = prefersReducedMotion();

    mountGrainField(reduced);
    autoplay.value = !reduced;

    ctx = gsap.context(() => {
        if (!reduced) {
            gsap.timeline({ defaults: { ease: 'expo.out' } })
                .from('[data-hero-line]', { yPercent: 115, duration: 1.4, stagger: 0.12 }, 0.2)
                .from('[data-hero-fade]', { autoAlpha: 0, y: 24, duration: 1.1, stagger: 0.1 }, 0.75);

            gsap.to('[data-hero-content]', {
                yPercent: -18,
                autoAlpha: 0.2,
                ease: 'none',
                scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true },
            });
        }

        ScrollTrigger.create({
            trigger: root.value,
            start: 'top top',
            end: 'bottom top',
            onUpdate: (self) => field?.setScroll(self.progress),
        });
    }, root.value);
});

onBeforeUnmount(() => {
    unmounted = true;
    ctx?.revert();
    field?.destroy();
});
</script>

<template>
    <section
        id="top"
        ref="root"
        class="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-husk text-white"
        aria-roledescription="carousel"
        aria-label="Golden Harvest highlights"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
    >
        <!-- Background slides -->
        <div class="absolute inset-0 -z-20">
            <div
                v-for="(slide, i) in slides"
                :key="slide.id"
                class="absolute inset-0 transition-opacity duration-[1600ms] ease-in-out"
                :class="i === current ? 'opacity-100' : 'opacity-0'"
                role="group"
                aria-roledescription="slide"
                :aria-label="`${i + 1} of ${slides.length}: ${slide.caption}`"
                :aria-hidden="i !== current"
            >
                <img
                    :src="photo(slide.id, 1800)"
                    :srcset="srcset(slide.id)"
                    sizes="100vw"
                    alt=""
                    class="size-full object-cover transition-transform duration-[9000ms] ease-out"
                    :class="i === current ? 'scale-105' : 'scale-100'"
                    :fetchpriority="i === 0 ? 'high' : 'low'"
                    :loading="i === 0 ? 'eager' : 'lazy'"
                />
            </div>
        </div>

        <!-- Legibility wash, warm rather than grey -->
        <div
            class="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(27_22_16/0.92)_0%,rgb(27_22_16/0.7)_45%,rgb(27_22_16/0.25)_100%),linear-gradient(0deg,rgb(27_22_16/0.85)_0%,transparent_45%)]"
        />

        <!-- 3D grain field -->
        <div ref="canvasHost" class="pointer-events-none absolute inset-0 -z-10 [&>canvas]:size-full" />

        <div data-hero-content class="container-site relative pt-32 pb-16 sm:pb-20 lg:pb-24">
            <h1 class="max-w-[13ch] text-[clamp(3.1rem,9vw,7.5rem)] leading-[0.95] font-medium">
                <span class="block overflow-hidden pb-[0.08em]"><span data-hero-line class="block">Quality you</span></span>
                <span class="block overflow-hidden pb-[0.08em]"><span data-hero-line class="block text-gold">can trust</span></span>
            </h1>

            <p data-hero-fade class="mt-6 max-w-[34rem] text-lg text-white/80 sm:text-xl">
                Milled locally in our state-of-the-art facility, for the bakeries, manufacturers and kitchens of Sri Lanka.
            </p>

            <div data-hero-fade class="mt-9 flex flex-wrap items-center gap-3">
                <a href="#contact" class="btn btn-gold" @click.prevent="scrollToTarget('#contact')">Reach us</a>
                <a href="#products" class="btn btn-ghost-light" @click.prevent="scrollToTarget('#products')">See our flours</a>
            </div>

            <div data-hero-fade class="mt-14 flex flex-col gap-6 border-t border-white/15 pt-6 sm:flex-row sm:items-end sm:justify-between">
                <p class="max-w-xs text-sm text-white/65">Bulk order? Our sales team listens first, then quotes fast.</p>

                <div class="flex items-center gap-4">
                    <p class="hidden text-sm text-white/70 md:block" aria-live="polite">{{ slides[current].caption }}</p>
                    <div class="flex gap-2">
                        <button
                            v-for="(slide, i) in slides"
                            :key="slide.id"
                            type="button"
                            class="group relative h-8 w-10 sm:w-14"
                            :aria-label="`Show slide ${i + 1}`"
                            :aria-current="i === current"
                            @click="show(i)"
                        >
                            <span class="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25">
                                <span
                                    :key="`${i}-${current}`"
                                    class="absolute inset-y-0 left-0 bg-gold"
                                    :class="i === current ? (autoplay ? 'hero-progress' : 'w-full') : i < current ? 'w-full' : 'w-0'"
                                    :style="{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }"
                                    @animationend="show(current + 1)"
                                />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hero-progress {
    animation-name: hero-progress;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
}

@keyframes hero-progress {
    from {
        width: 0;
    }
    to {
        width: 100%;
    }
}
</style>
