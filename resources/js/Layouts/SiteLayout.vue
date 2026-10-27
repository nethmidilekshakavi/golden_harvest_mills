<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import SiteFooter from '@/Components/SiteFooter.vue';
import SiteHeader from '@/Components/SiteHeader.vue';
import { gsap, ScrollTrigger, startSmoothScroll, stopSmoothScroll } from '@/lib/motion';

const progress = ref(null);
let progressTween = null;

onMounted(() => {
    startSmoothScroll();
    progressTween = gsap.to(progress.value, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    });
    // Images above the fold can shift trigger positions once they load.
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
});

onBeforeUnmount(() => {
    progressTween?.scrollTrigger?.kill();
    progressTween?.kill();
    stopSmoothScroll();
});
</script>

<template>
    <div>
        <a
            href="#main"
            class="sr-only z-[60] rounded-full bg-gold px-5 py-3 font-semibold text-on-gold focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
            Skip to content
        </a>
        <div ref="progress" class="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left scale-x-0 bg-gold" aria-hidden="true" />
        <SiteHeader />
        <main id="main">
            <slot />
        </main>
        <SiteFooter />
    </div>
</template>
