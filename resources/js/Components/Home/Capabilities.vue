<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { attachImageRipples } from '@/lib/imageRipples';
import { gsap, prefersReducedMotion, revealHeadings } from '@/lib/motion';
import { photo, photos } from '@/lib/images';

const items = [
    {
        title: 'Swiss milling technology',
        body: 'Powered by world-class Swiss engineering, our fully automated facility ensures precise granulation and superior hygiene for every batch.',
        image: photos.factory,
        alt: 'Engineer monitoring automated mill equipment',
    },
    {
        title: 'Strategic logistics',
        body: 'Located close to the Hambantota Port, we benefit from rapid wheat imports and streamlined distribution that keep lead times short.',
        image: photos.port,
        alt: 'Container ship being unloaded at a port',
    },
    {
        title: 'Automated processing',
        body: 'Built for industrial scale, our automated processing and packing lines deliver flawless consistency for large manufacturers.',
        image: photos.warehouse,
        alt: 'Packed goods stacked in a distribution warehouse',
    },
];

const root = ref(null);
const track = ref(null);
const bar = ref(null);
const counter = ref('01');

let ctx = null;
let mm = null;
let detachRipples = () => {};

function revealFrame(frame, vars = {}) {
    const img = frame.querySelector('img');
    return gsap
        .timeline(vars)
        .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
        .fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.2);
}

onMounted(() => {
    detachRipples = attachImageRipples(gsap.utils.toArray('[data-card]', root.value));
    if (prefersReducedMotion()) return;

    ctx = gsap.context(() => revealHeadings(), root.value);

    mm = gsap.matchMedia(root.value);

    // Desktop: pin the section and slide the cards sideways as the page scrolls.
    mm.add('(min-width: 1024px)', () => {
        const distance = () => track.value.scrollWidth - window.innerWidth;
        const frames = gsap.utils.toArray('[data-reveal]');

        frames.forEach((frame, i) => revealFrame(frame, { delay: i * 0.15, scrollTrigger: { trigger: root.value, start: 'top 65%', once: true } }));

        if (distance() < 120) return;

        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: root.value,
                pin: true,
                start: 'top top',
                end: () => `+=${distance()}`,
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    counter.value = `0${Math.min(items.length, Math.floor(self.progress * items.length) + 1)}`;
                },
            },
        });

        tl.to(track.value, { x: () => -distance() }, 0).fromTo(bar.value, { scaleX: 0 }, { scaleX: 1 }, 0);

        // Cards drift vertically at different rates for depth.
        gsap.utils.toArray('[data-card]').forEach((card, i) => {
            tl.fromTo(card, { y: i % 2 ? 70 : -30 }, { y: i % 2 ? -50 : 40 }, 0);
        });
    });

    mm.add('(max-width: 1023.98px)', () => {
        gsap.utils.toArray('[data-reveal]').forEach((frame) => revealFrame(frame, { scrollTrigger: { trigger: frame, start: 'top 85%', once: true } }));
    });
});

onBeforeUnmount(() => {
    detachRipples();
    mm?.revert();
    ctx?.revert();
});
</script>

<template>
    <section id="mill" ref="root" class="relative overflow-hidden pt-36 pb-24 sm:pt-40 lg:py-0">
        <div class="lg:flex lg:h-svh lg:items-center">
            <div
                ref="track"
                class="container-site lg:mx-0 lg:flex lg:w-max lg:max-w-none lg:items-center lg:gap-[6vw] lg:pr-[10vw] lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]"
            >
                <div class="grid gap-6 md:grid-cols-12 md:items-end lg:block lg:w-[min(30rem,32vw)] lg:shrink-0">
                    <h2 data-split class="text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.05] font-medium md:col-span-7">
                        Built for consistency, batch after batch
                    </h2>
                    <p class="max-w-md text-muted md:col-span-5 md:justify-self-end lg:mt-6">
                        Every sack leaves our mill the same way: precisely engineered, quickly delivered and sealed without a hand
                        touching the flour.
                    </p>

                    <div class="mt-12 hidden items-center gap-4 lg:flex" aria-hidden="true">
                        <span class="font-serif text-lg tabular-nums">{{ counter }}<span class="text-muted"> / 0{{ items.length }}</span></span>
                        <span class="relative h-px flex-1 overflow-hidden bg-line">
                            <span ref="bar" class="absolute inset-0 origin-left scale-x-0 bg-gold" />
                        </span>
                    </div>
                </div>

                <ul class="mt-14 grid gap-12 sm:grid-cols-2 md:mt-20 lg:mt-0 lg:flex lg:gap-[4vw]">
                    <li
                        v-for="(item, i) in items"
                        :key="item.title"
                        data-card
                        class="group lg:w-[calc(min(58svh,40rem)*0.8)] lg:shrink-0"
                        :class="{ 'sm:col-span-2 sm:mx-auto sm:w-1/2 lg:mx-0': i === 2 }"
                    >
                        <div data-reveal class="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-surface">
                            <img
                                :src="photo(item.image, 900)"
                                :alt="item.alt"
                                width="900"
                                height="1125"
                                loading="lazy"
                                crossorigin="anonymous"
                                class="size-full object-cover"
                            />
                            <span
                                class="absolute top-5 left-5 rounded-full bg-paper/85 px-3 py-1 font-serif text-sm text-ink tabular-nums backdrop-blur"
                                aria-hidden="true"
                            >
                                0{{ i + 1 }}
                            </span>
                        </div>
                        <h3 class="mt-6 text-2xl font-medium">{{ item.title }}</h3>
                        <p class="mt-2 max-w-[36ch] text-muted">{{ item.body }}</p>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>
