<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import BrandMark from '@/Components/BrandMark.vue';
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/motion';

const rows = [
    { words: ['Bakery flour', 'Roti flour', 'Household flour'], outline: false, direction: -1 },
    { words: ['Milled in Sri Lanka', 'Quality you can trust'], outline: true, direction: 1 },
];

const root = ref(null);
let ctx = null;

onMounted(() => {
    if (prefersReducedMotion()) return;

    ctx = gsap.context(() => {
        // Each track holds its words twice, so sliding it by half loops seamlessly.
        const loops = gsap.utils.toArray('[data-marquee-track]').map((track, i) => {
            const leftwards = rows[i].direction < 0;
            const loop = gsap.fromTo(track, { xPercent: leftwards ? 0 : -50 }, { xPercent: leftwards ? -50 : 0, duration: 32, ease: 'none', repeat: -1 });
            // Start deep into the repeats so a negative timeScale can run backwards indefinitely.
            return loop.totalTime(loop.duration() * 1000);
        });

        const skew = gsap.quickTo('[data-marquee-row]', 'skewX', { duration: 0.5, ease: 'power3' });
        const settle = () => skew(0);

        // Scrolling speeds the rows up and leans them into the motion;
        // scrolling back up flips their direction.
        ScrollTrigger.create({
            trigger: root.value,
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: (self) => {
                const velocity = self.getVelocity();
                const direction = self.direction;
                const boost = direction * (1 + Math.min(Math.abs(velocity) / 220, 6));

                loops.forEach((loop) =>
                    gsap.to(loop, {
                        timeScale: boost,
                        duration: 0.2,
                        overwrite: true,
                        onComplete: () => gsap.to(loop, { timeScale: direction, duration: 1.2, ease: 'power2.out' }),
                    }),
                );
                skew(gsap.utils.clamp(-10, 10, velocity / -260));
            },
        });

        ScrollTrigger.addEventListener('scrollEnd', settle);
        return () => ScrollTrigger.removeEventListener('scrollEnd', settle);
    }, root.value);
});

onBeforeUnmount(() => ctx?.revert());
</script>

<template>
    <section ref="root" class="overflow-hidden border-y border-line py-10 sm:py-14" aria-label="Our flours">
        <p class="sr-only">Bakery flour, roti flour and household flour, milled in Sri Lanka.</p>

        <div v-for="row in rows" :key="row.words[0]" data-marquee-row class="flex whitespace-nowrap" aria-hidden="true">
            <div data-marquee-track class="flex shrink-0">
                <template v-for="copy in 2" :key="copy">
                    <span
                        v-for="word in row.words"
                        :key="`${copy}-${word}`"
                        class="flex shrink-0 items-center gap-[0.35em] pr-[0.35em] font-serif text-[clamp(3.25rem,9vw,8.5rem)] leading-[1.1] font-medium tracking-tight"
                        :class="row.outline ? 'marquee-outline italic' : 'text-ink'"
                    >
                        {{ word }}
                        <BrandMark class="size-[0.62em] shrink-0 text-gold" />
                    </span>
                </template>
            </div>
        </div>
    </section>
</template>

<style scoped>
.marquee-outline {
    color: transparent;
    -webkit-text-stroke: 1.5px var(--bran);
}
</style>
