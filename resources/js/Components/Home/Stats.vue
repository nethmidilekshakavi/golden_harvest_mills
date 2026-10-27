<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { gsap, prefersReducedMotion, revealHeadings } from '@/lib/motion';

/**
 * `from` is where the counter starts rolling. The daily capacity figure is a
 * placeholder: replace it with the mill's confirmed number before launch.
 */
const stats = [
    { value: 250, from: 0, suffix: 't', label: 'Of wheat milled every day' },
    { value: 3, from: 0, suffix: '', label: 'Specialised flours, each milled for one job' },
    { value: 100, from: 0, suffix: '%', label: 'Of batches lab-tested before dispatch' },
    { value: 0, from: 99, suffix: '', label: 'Hands touching the flour between mill and sack' },
];

const root = ref(null);
const numbers = ref([]);
let ctx = null;

onMounted(() => {
    if (prefersReducedMotion()) return;

    ctx = gsap.context(() => {
        revealHeadings();

        const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-stats]', start: 'top 80%', once: true } });

        tl.from('[data-stat-rule]', { scaleX: 0, duration: 1.2, stagger: 0.12, ease: 'expo.inOut' }, 0).from(
            '[data-stat-label]',
            { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
            0.4,
        );

        stats.forEach((stat, i) => {
            const el = numbers.value[i];
            const counter = { n: stat.from };
            tl.to(
                counter,
                {
                    n: stat.value,
                    duration: 2.2,
                    ease: 'expo.out',
                    onUpdate: () => (el.textContent = Math.round(counter.n)),
                },
                0.2 + i * 0.12,
            );
            el.textContent = stat.from;
        });
    }, root.value);
});

onBeforeUnmount(() => ctx?.revert());
</script>

<template>
    <section ref="root" class="bg-husk py-24 text-flour lg:py-32" aria-labelledby="stats-title">
        <div class="container-site">
            <div class="grid gap-6 md:grid-cols-12 md:items-end">
                <p class="font-serif text-2xl text-gold italic md:col-span-12">By the numbers</p>
                <h2 id="stats-title" data-split class="text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.05] font-medium md:col-span-8">
                    Scale that bakeries can plan around
                </h2>
            </div>

            <dl data-stats class="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
                <!-- Label first for screen readers, shown under the number. -->
                <div v-for="(stat, i) in stats" :key="stat.label" class="relative flex flex-col-reverse justify-end gap-4 pt-8">
                    <span data-stat-rule class="absolute inset-x-0 top-0 h-px origin-left bg-flour/20" aria-hidden="true" />
                    <dt data-stat-label class="max-w-[24ch] text-flour/70">{{ stat.label }}</dt>
                    <dd class="font-serif text-[clamp(3.5rem,7vw,6rem)] leading-none font-medium text-gold tabular-nums">
                        <span :ref="(el) => (numbers[i] = el)">{{ stat.value }}</span><span class="text-flour/90">{{ stat.suffix }}</span>
                    </dd>
                </div>
            </dl>
        </div>
    </section>
</template>
