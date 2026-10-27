<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { gsap, prefersReducedMotion } from '@/lib/motion';
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
let ctx = null;

onMounted(() => {
    if (prefersReducedMotion()) return;

    ctx = gsap.context(() => {
        gsap.utils.toArray('[data-reveal]').forEach((frame) => {
            const img = frame.querySelector('img');
            gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 85%', once: true } })
                .fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
                .fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0.2);
        });
    }, root.value);
});

onBeforeUnmount(() => ctx?.revert());
</script>

<template>
    <section id="mill" ref="root" class="pt-36 pb-24 sm:pt-40 lg:pb-32">
        <div class="container-site">
            <div class="grid gap-6 md:grid-cols-12 md:items-end">
                <h2 class="text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.05] font-medium md:col-span-7">
                    Built for consistency, batch after batch
                </h2>
                <p class="max-w-md text-muted md:col-span-5 md:justify-self-end">
                    Every sack leaves our mill the same way: precisely engineered, quickly delivered and sealed without a hand
                    touching the flour.
                </p>
            </div>

            <ul class="mt-14 grid gap-12 sm:grid-cols-2 md:mt-20 lg:grid-cols-3 lg:gap-8">
                <li
                    v-for="(item, i) in items"
                    :key="item.title"
                    class="group"
                    :class="{ 'lg:mt-20': i === 1, 'sm:col-span-2 sm:mx-auto sm:w-1/2 lg:col-span-1 lg:mx-0 lg:w-auto': i === 2 }"
                >
                    <div data-reveal class="aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-surface">
                        <img
                            :src="photo(item.image, 900)"
                            :alt="item.alt"
                            width="900"
                            height="1125"
                            loading="lazy"
                            class="size-full object-cover transition-[filter] duration-700 group-hover:saturate-[1.15]"
                        />
                    </div>
                    <h3 class="mt-6 text-2xl font-medium">{{ item.title }}</h3>
                    <p class="mt-2 max-w-[36ch] text-muted">{{ item.body }}</p>
                </li>
            </ul>
        </div>
    </section>
</template>
