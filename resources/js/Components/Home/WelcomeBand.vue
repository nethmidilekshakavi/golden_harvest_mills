<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import BrandMark from '@/Components/BrandMark.vue';
import { gsap, prefersReducedMotion } from '@/lib/motion';

const root = ref(null);
const ring = ref(null);
let ctx = null;

onMounted(() => {
    if (prefersReducedMotion()) return;

    ctx = gsap.context(() => {
        gsap.to(ring.value, {
            rotate: 300,
            ease: 'none',
            scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
    }, root.value);
});

onBeforeUnmount(() => ctx?.revert());
</script>

<template>
    <section id="about" ref="root" class="relative bg-gold text-on-gold">
        <div class="container-site grid gap-6 pt-20 pb-28 sm:pt-24 md:grid-cols-12 md:gap-10 lg:pb-32">
            <h2 class="text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.02] font-medium md:col-span-6">Welcome to Golden&nbsp;Harvest</h2>
            <div class="space-y-4 text-lg leading-relaxed md:col-span-6 md:pt-3 lg:col-span-5 lg:col-start-8">
                <p>
                    Golden Harvest is built on a mission to mill confidence into every sack of flour. Powered by cutting-edge
                    machinery and proudly Sri Lankan roots, we deliver bulk wheat flour to the people who feed the country.
                </p>
                <p class="text-on-gold/75">Bakeries, food manufacturers and wholesalers rely on us for the same result, every batch.</p>
            </div>
        </div>

        <!-- Seal sitting on the seam between this band and the next section -->
        <div class="absolute bottom-0 left-1/2 z-10 size-32 -translate-x-1/2 translate-y-1/2 sm:size-36">
            <div class="absolute inset-0 rounded-full bg-paper shadow-[0_0_0_6px_var(--gold)] transition-colors duration-500" />
            <svg ref="ring" viewBox="0 0 120 120" class="absolute inset-0 size-full text-bran" aria-hidden="true">
                <defs>
                    <path id="seal-ring" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
                </defs>
                <text class="fill-current font-sans text-[8.5px] font-semibold">
                    <textPath href="#seal-ring" textLength="286" lengthAdjust="spacing">Golden Harvest Mills — Milled in Sri Lanka —</textPath>
                </text>
            </svg>
            <div class="absolute inset-[27%] grid place-items-center rounded-full bg-gold text-on-gold">
                <BrandMark class="size-[78%]" />
            </div>
        </div>
    </section>
</template>
