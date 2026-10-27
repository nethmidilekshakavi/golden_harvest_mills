<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { gsap, prefersReducedMotion } from '@/lib/motion';
import { photo, photos, srcset } from '@/lib/images';

const root = ref(null);
const bg = ref(null);
const inset = ref(null);
let ctx = null;

onMounted(() => {
    if (prefersReducedMotion()) return;

    ctx = gsap.context(() => {
        const scrub = { trigger: root.value, start: 'top bottom', end: 'bottom top', scrub: true };
        gsap.fromTo(bg.value, { yPercent: -12 }, { yPercent: 12, ease: 'none', scrollTrigger: scrub });
        gsap.fromTo(inset.value, { y: 80, rotate: -8 }, { y: -60, rotate: 6, ease: 'none', scrollTrigger: { ...scrub } });
    }, root.value);
});

onBeforeUnmount(() => ctx?.revert());
</script>

<template>
    <section ref="root" class="relative isolate overflow-hidden bg-husk text-white" aria-labelledby="community-title">
        <div class="absolute inset-0 -z-10">
            <img
                ref="bg"
                :src="photo(photos.farmers, 1800)"
                :srcset="srcset(photos.farmers)"
                sizes="100vw"
                alt=""
                loading="lazy"
                class="absolute inset-x-0 -top-[15%] h-[130%] w-full object-cover"
            />
            <div class="absolute inset-0 bg-[linear-gradient(90deg,rgb(27_22_16/0.9)_0%,rgb(27_22_16/0.6)_55%,rgb(27_22_16/0.2)_100%)]" />
        </div>

        <div class="container-site grid min-h-[38rem] items-center gap-12 py-24 md:grid-cols-12 lg:min-h-[44rem]">
            <div class="md:col-span-7 lg:col-span-6">
                <p class="font-serif text-2xl text-gold italic">What's fresh</p>
                <h2 id="community-title" class="mt-3 text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.04] font-medium">
                    How we help regional communities thrive
                </h2>
                <p class="mt-6 max-w-[46ch] text-lg text-white/80">
                    From sourcing through local partners to creating jobs at our mill, Golden Harvest is more than a factory. It is a
                    long-term commitment to the regions that grow with us.
                </p>
            </div>

            <div class="flex justify-center md:col-span-5 md:justify-end lg:col-span-6">
                <figure
                    ref="inset"
                    class="relative size-56 overflow-hidden rounded-full shadow-[0_0_0_8px_rgb(255_255_255/0.9),0_30px_60px_-20px_rgb(0_0_0/0.6)] sm:size-72 lg:size-80"
                >
                    <img :src="photo(photos.grains, 700)" alt="Close-up of freshly harvested wheat grains" loading="lazy" class="size-full object-cover" />
                </figure>
            </div>
        </div>
    </section>
</template>
