<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { gsap, prefersReducedMotion, scrollToTarget } from '@/lib/motion';
import { photo, photos } from '@/lib/images';

const products = [
    {
        name: 'Bakery flour',
        body: 'Premium, high-protein flour formulated for consistent commercial baking.',
        use: 'Bread, buns and rolls',
        image: photos.breadLoaf,
        alt: 'A freshly baked crusty loaf',
    },
    {
        name: 'Roti flour',
        body: 'Finely milled for superior elasticity, making perfectly soft and authentic flatbreads.',
        use: 'Roti, paratha and hoppers',
        image: photos.curryRoti,
        alt: 'Curry served with soft flatbreads',
    },
    {
        name: 'Household flour',
        body: 'A versatile, all-purpose kitchen staple, ideal for everyday home cooking and baking.',
        use: 'Everyday cooking and baking',
        image: photos.dough,
        alt: 'Hands kneading dough on a floured table',
    },
];

const root = ref(null);
const list = ref(null);
const preview = ref(null);
const active = ref(-1);

let moveX = null;
let moveY = null;
let canFollow = false;

function enter(i) {
    active.value = i;
    if (!canFollow) return;
    gsap.to(preview.value, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
}

function leave() {
    active.value = -1;
    if (!canFollow) return;
    gsap.to(preview.value, { autoAlpha: 0, scale: 0.85, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
}

function follow(e) {
    if (!canFollow) return;
    const box = list.value.getBoundingClientRect();
    moveX(e.clientX - box.left);
    moveY(e.clientY - box.top);
}

onMounted(() => {
    canFollow = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion();
    if (!canFollow) return;

    gsap.set(preview.value, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.85 });
    moveX = gsap.quickTo(preview.value, 'x', { duration: 0.6, ease: 'power3' });
    moveY = gsap.quickTo(preview.value, 'y', { duration: 0.6, ease: 'power3' });
});

onBeforeUnmount(() => gsap.killTweensOf(preview.value));
</script>

<template>
    <section id="products" ref="root" class="py-24 lg:py-32">
        <div class="container-site">
            <div class="grid gap-6 md:grid-cols-12 md:items-end">
                <h2 class="text-[clamp(2.4rem,5.4vw,4.25rem)] leading-none font-medium md:col-span-6">Products</h2>
                <p class="max-w-md text-muted md:col-span-6 md:justify-self-end">
                    Three flours, each milled for a specific job. All of them are supplied in bulk to trade customers across the island.
                </p>
            </div>

            <div ref="list" class="relative mt-12 md:mt-16" @mousemove="follow" @mouseleave="leave">
                <ul class="border-b border-line">
                    <li v-for="(product, i) in products" :key="product.name" class="border-t border-line">
                        <a
                            href="#contact"
                            class="group grid grid-cols-[4.5rem_1fr] items-center gap-x-5 gap-y-2 py-7 transition-opacity duration-500 md:grid-cols-12 md:gap-x-8 md:py-10"
                            :class="active !== -1 && active !== i ? 'md:opacity-35' : 'opacity-100'"
                            @mouseenter="enter(i)"
                            @focus="enter(i)"
                            @blur="leave"
                            @click.prevent="scrollToTarget('#contact')"
                        >
                            <img
                                :src="photo(product.image, 240)"
                                alt=""
                                loading="lazy"
                                class="row-span-2 aspect-square w-full rounded-2xl object-cover md:hidden"
                            />
                            <h3
                                class="text-[clamp(1.75rem,4vw,3.25rem)] leading-tight font-medium transition-transform duration-500 ease-out-quint md:col-span-5 md:group-hover:translate-x-3"
                            >
                                {{ product.name }}
                            </h3>
                            <p class="col-start-2 text-muted md:col-span-4 md:col-start-auto">{{ product.body }}</p>
                            <p class="hidden text-sm font-medium text-bran md:col-span-3 md:block md:text-right">{{ product.use }}</p>
                        </a>
                    </li>
                </ul>

                <!-- Cursor-following preview (fine pointers only) -->
                <div
                    ref="preview"
                    class="pointer-events-none invisible absolute top-0 left-0 z-10 hidden aspect-[4/5] w-64 overflow-hidden rounded-[1.5rem] shadow-2xl md:block lg:w-72"
                    aria-hidden="true"
                >
                    <img
                        v-for="(product, i) in products"
                        :key="product.name"
                        :src="photo(product.image, 600)"
                        alt=""
                        loading="lazy"
                        class="absolute inset-0 size-full object-cover transition-[opacity,transform] duration-500 ease-out-quint"
                        :class="i === active ? 'scale-100 opacity-100' : 'scale-110 opacity-0'"
                    />
                </div>
            </div>

            <div class="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a href="#contact" class="btn btn-gold" @click.prevent="scrollToTarget('#contact')">Request a price list</a>
                <p class="text-sm text-muted">Available in trade sack sizes for bakeries and manufacturers.</p>
            </div>
        </div>
    </section>
</template>
