<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { gsap, prefersReducedMotion, revealHeadings } from '@/lib/motion';

const steps = [
    { title: 'Import', body: 'Wheat lands at Hambantota Port, a short haul from the mill, and moves straight into clean, sealed storage.' },
    { title: 'Cleaning', body: 'Each lot is screened, scoured and conditioned so only sound, clean grain ever reaches the rollers.' },
    { title: 'Milling', body: 'Swiss roller mills grind and sift in stages for a precise, even granulation in every flour.' },
    { title: 'Testing', body: 'Every batch is lab-tested for consistency, safety and baking performance before it is released.' },
    { title: 'Packing', body: 'Automated lines fill and seal each sack, so no hand touches the flour on its way out.' },
    { title: 'Delivery', body: 'Bulk orders leave for bakeries, manufacturers and wholesalers right across Sri Lanka.' },
];

// Where each stage sits on the winding route (SVG user units).
const nodes = [
    [70, 50],
    [330, 150],
    [100, 260],
    [320, 380],
    [100, 490],
    [300, 600],
];

/** One smooth Catmull-Rom curve segment per pair of stages. */
const segments = nodes.slice(0, -1).map((p1, i) => {
    const p0 = nodes[i - 1] ?? p1;
    const p2 = nodes[i + 1];
    const p3 = nodes[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return `M${p1} C${c1} ${c2} ${p2}`;
});

const root = ref(null);
let mm = null;
let ctx = null;

onMounted(() => {
    if (prefersReducedMotion()) return;

    ctx = gsap.context(() => revealHeadings(), root.value);
    mm = gsap.matchMedia(root.value);

    // Desktop: pin the section and walk through the stages one at a time.
    mm.add('(min-width: 1024px)', () => {
        const items = gsap.utils.toArray('[data-step]');
        const titles = gsap.utils.toArray('[data-step-title]');
        const bodies = gsap.utils.toArray('[data-step-body]');
        const dots = gsap.utils.toArray('[data-node-dot]');
        const labels = gsap.utils.toArray('[data-node-label]');
        const lines = gsap.utils.toArray('[data-segment]');

        gsap.set(items.slice(1), { autoAlpha: 0 });
        gsap.set(dots.slice(1), { scale: 0, transformOrigin: '50% 50%' });
        gsap.set(labels.slice(1), { opacity: 0.4 });
        gsap.set(lines, { drawSVG: '0%' });

        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: root.value,
                pin: true,
                start: 'top top',
                end: () => `+=${window.innerHeight * (steps.length - 1) * 0.75}`,
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            },
        });

        lines.forEach((line, i) => {
            const next = i + 1;
            tl.to(line, { drawSVG: '100%', duration: 1 }, i)
                .to('[data-kernel]', { motionPath: { path: line, align: line, alignOrigin: [0.5, 0.5], autoRotate: 90 }, duration: 1 }, i)
                .to(dots[next], { scale: 1, duration: 0.2, ease: 'back.out(3)' }, next - 0.05)
                .to(labels[next], { opacity: 1, duration: 0.2 }, next - 0.05)
                .to(titles[i], { yPercent: -110, duration: 0.35, ease: 'power2.in' }, next - 0.45)
                .to(bodies[i], { autoAlpha: 0, y: -16, duration: 0.3 }, next - 0.45)
                .set(items[i], { autoAlpha: 0 }, next - 0.1)
                .set(items[next], { autoAlpha: 1 }, next - 0.1)
                .fromTo(titles[next], { yPercent: 110 }, { yPercent: 0, duration: 0.4, ease: 'power3.out' }, next - 0.1)
                .fromTo(bodies[next], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.35 }, next);
        });

        // Small hold on the final stage before the pin releases.
        tl.to({}, { duration: 0.4 });
    });

    // Mobile: a simple vertical timeline that fills as it scrolls past.
    mm.add('(max-width: 1023.98px)', () => {
        gsap.fromTo(
            '[data-rail]',
            { scaleY: 0 },
            { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-steps]', start: 'top 70%', end: 'bottom 60%', scrub: true } },
        );
        gsap.utils.toArray('[data-step]').forEach((item) => {
            gsap.from(item, { autoAlpha: 0, x: 24, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 85%', once: true } });
        });
    });
});

onBeforeUnmount(() => {
    mm?.revert();
    ctx?.revert();
});
</script>

<template>
    <section ref="root" class="relative overflow-hidden bg-surface py-24 transition-colors duration-500 lg:h-svh lg:py-0" aria-labelledby="process-title">
        <div class="container-site grid h-full gap-12 lg:grid-cols-12 lg:items-center">
            <div class="lg:col-span-6">
                <p class="font-serif text-2xl text-bran italic">From grain to flour</p>
                <h2 id="process-title" data-split class="mt-3 text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.05] font-medium">
                    Six stages, one standard
                </h2>

                <ol data-steps class="relative mt-12 space-y-10 pl-8 lg:mt-14 lg:h-[15rem] lg:space-y-0 lg:pl-0">
                    <!-- Mobile rail -->
                    <span class="absolute top-2 bottom-2 left-0 w-px bg-line lg:hidden" aria-hidden="true">
                        <span data-rail class="absolute inset-0 origin-top bg-gold" />
                    </span>

                    <li v-for="(step, i) in steps" :key="step.title" data-step class="relative lg:absolute lg:inset-0">
                        <span class="absolute top-3 -left-8 size-[9px] -translate-x-1 rounded-full bg-gold lg:hidden" aria-hidden="true" />
                        <p class="font-serif text-lg text-bran tabular-nums">0{{ i + 1 }} <span class="text-muted">/ 0{{ steps.length }}</span></p>
                        <h3 class="mt-2 overflow-hidden pb-[0.08em] text-[clamp(2.25rem,5vw,4.5rem)] leading-none font-medium">
                            <span data-step-title class="block">{{ step.title }}</span>
                        </h3>
                        <p data-step-body class="mt-4 max-w-[40ch] text-lg text-muted">{{ step.body }}</p>
                    </li>
                </ol>
            </div>

            <!-- The route, desktop only -->
            <div class="hidden lg:col-span-5 lg:col-start-8 lg:block" aria-hidden="true">
                <svg viewBox="0 0 420 650" class="h-[min(78svh,44rem)] w-full overflow-visible">
                    <path
                        v-for="d in segments"
                        :key="`base-${d}`"
                        :d="d"
                        fill="none"
                        stroke="var(--line)"
                        stroke-width="2"
                        stroke-dasharray="2 8"
                        stroke-linecap="round"
                    />
                    <path v-for="d in segments" :key="d" data-segment :d="d" fill="none" stroke="var(--gold)" stroke-width="3" stroke-linecap="round" />

                    <g v-for="([x, y], i) in nodes" :key="i">
                        <circle :cx="x" :cy="y" r="15" fill="var(--paper)" stroke="var(--line)" stroke-width="1.5" />
                        <circle data-node-dot :cx="x" :cy="y" r="7" fill="var(--gold)" />
                        <text
                            data-node-label
                            :x="x < 200 ? x + 28 : x - 28"
                            :y="y + 5"
                            :text-anchor="x < 200 ? 'start' : 'end'"
                            fill="var(--ink)"
                            class="font-sans text-[15px] font-medium"
                        >
                            {{ steps[i].title }}
                        </text>
                    </g>

                    <!-- A single grain travelling the route -->
                    <ellipse data-kernel :cx="nodes[0][0]" :cy="nodes[0][1]" rx="6" ry="10" fill="var(--gold-deep)" stroke="var(--paper)" stroke-width="2" />
                </svg>
            </div>
        </div>
    </section>
</template>
