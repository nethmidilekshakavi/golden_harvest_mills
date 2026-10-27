<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { gsap, prefersReducedMotion, revealHeadings, ScrollTrigger, scrollToTarget } from '@/lib/motion';
import { photo, photos } from '@/lib/images';

// `short`, `tone` and `ink` are printed on the 3D sack's label.
const products = [
    {
        name: 'Bakery flour',
        short: 'Bakery',
        body: 'Premium, high-protein flour formulated for consistent commercial baking.',
        use: 'Bread, buns and rolls',
        image: photos.breadLoaf,
        alt: 'A freshly baked crusty loaf',
        tone: '#efb121',
        ink: '#1b1610',
    },
    {
        name: 'Roti flour',
        short: 'Roti',
        body: 'Finely milled for superior elasticity, making perfectly soft and authentic flatbreads.',
        use: 'Roti, paratha and hoppers',
        image: photos.curryRoti,
        alt: 'Curry served with soft flatbreads',
        tone: '#b4532a',
        ink: '#fbf3e4',
    },
    {
        name: 'Household flour',
        short: 'Household',
        body: 'A versatile, all-purpose kitchen staple, ideal for everyday home cooking and baking.',
        use: 'Everyday cooking and baking',
        image: photos.dough,
        alt: 'Hands kneading dough on a floured table',
        tone: '#5d6b2f',
        ink: '#fbf3e4',
    },
];

const root = ref(null);
const sackHost = ref(null);
const active = ref(0);
const hovered = ref(-1);
const sackReady = ref(false);

let ctx = null;
let sack = null;
let sackRequested = false;
let unmounted = false;

function select(i, byPointer = false) {
    active.value = i;
    if (byPointer) hovered.value = i;
}

watch(active, (i) => sack?.show(i));

async function mountSack() {
    if (sackRequested) return;
    sackRequested = true;

    try {
        const { createFlourSack } = await import('@/three/flourSack');
        if (unmounted) return;
        const created = await createFlourSack(sackHost.value, products, { reducedMotion: prefersReducedMotion() });
        if (unmounted) return created.destroy();
        sack = created;
        sack.show(active.value);
        sackReady.value = true;
    } catch (e) {
        // No WebGL: the product photos stay in the panel instead.
        sack = null;
    }
}

onMounted(() => {
    const desktop = window.matchMedia('(min-width: 1024px)').matches;
    const reduced = prefersReducedMotion();

    ctx = gsap.context(() => {
        if (!reduced) revealHeadings();
        if (!desktop) return;

        ScrollTrigger.create({
            trigger: root.value,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => self.isActive && mountSack(),
            onUpdate: (self) => sack?.setScroll(self.progress),
        });

        // While scrolling through the list, the row nearest the middle drives the sack.
        gsap.utils.toArray('[data-product-row]').forEach((row, i) => {
            ScrollTrigger.create({
                trigger: row,
                start: 'top 60%',
                end: 'bottom 60%',
                onToggle: (self) => self.isActive && hovered.value === -1 && select(i),
            });
        });

        if (!reduced) {
            gsap.from('[data-product-row]', {
                autoAlpha: 0,
                y: 40,
                duration: 1,
                stagger: 0.12,
                ease: 'power3.out',
                scrollTrigger: { trigger: '[data-product-list]', start: 'top 80%', once: true },
            });
        }
    }, root.value);
});

onBeforeUnmount(() => {
    unmounted = true;
    ctx?.revert();
    sack?.destroy();
});
</script>

<template>
    <section id="products" ref="root" class="py-24 lg:py-32">
        <div class="container-site">
            <div class="grid gap-6 md:grid-cols-12 md:items-end">
                <h2 data-split class="text-[clamp(2.4rem,5.4vw,4.25rem)] leading-none font-medium md:col-span-6">Products</h2>
                <p class="max-w-md text-muted md:col-span-6 md:justify-self-end">
                    Three flours, each milled for a specific job. All of them are supplied in bulk to trade customers across the island.
                </p>
            </div>

            <div class="mt-12 grid gap-12 md:mt-16 lg:grid-cols-12 lg:items-start">
                <div class="lg:col-span-7 lg:py-[12svh]">
                    <ul data-product-list class="border-b border-line" @mouseleave="hovered = -1">
                        <li v-for="(product, i) in products" :key="product.name" data-product-row class="border-t border-line">
                            <a
                                href="#contact"
                                class="group grid grid-cols-[4.5rem_1fr] items-center gap-x-5 gap-y-2 py-7 transition-opacity duration-500 md:py-10 lg:grid-cols-[1fr_auto] lg:gap-x-8"
                                :class="hovered !== -1 && hovered !== i ? 'lg:opacity-35' : 'opacity-100'"
                                @mouseenter="select(i, true)"
                                @focus="select(i, true)"
                                @blur="hovered = -1"
                                @click.prevent="scrollToTarget('#contact')"
                            >
                                <img
                                    :src="photo(product.image, 240)"
                                    alt=""
                                    loading="lazy"
                                    class="row-span-2 aspect-square w-full rounded-2xl object-cover lg:hidden"
                                />
                                <h3
                                    class="flex items-baseline gap-4 text-[clamp(1.75rem,4vw,3.25rem)] leading-tight font-medium transition-transform duration-500 ease-out-quint lg:group-hover:translate-x-3"
                                >
                                    <span
                                        class="hidden font-sans text-sm font-semibold tabular-nums transition-colors duration-500 lg:inline"
                                        :class="active === i ? 'text-gold-deep' : 'text-muted'"
                                    >
                                        0{{ i + 1 }}
                                    </span>
                                    {{ product.name }}
                                </h3>
                                <p class="hidden text-sm font-medium text-bran lg:block lg:text-right">{{ product.use }}</p>
                                <p class="col-start-2 text-muted lg:col-span-2 lg:col-start-1 lg:max-w-[46ch] lg:pl-10">{{ product.body }}</p>
                            </a>
                        </li>
                    </ul>

                    <div class="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <a href="#contact" class="btn btn-gold" @click.prevent="scrollToTarget('#contact')">Request a price list</a>
                        <p class="text-sm text-muted">Available in trade sack sizes for bakeries and manufacturers.</p>
                    </div>
                </div>

                <!-- Sticky showcase: a 3D sack, or the product photos without WebGL -->
                <div class="sticky top-[calc(50svh-min(40svh,21rem))] hidden lg:col-span-5 lg:block" aria-hidden="true">
                    <div class="relative h-[min(80svh,42rem)]">
                        <div class="absolute inset-x-[6%] top-[12%] bottom-[4%] overflow-hidden rounded-[2rem] bg-surface transition-colors duration-500">
                            <template v-if="!sackReady">
                                <img
                                    v-for="(product, i) in products"
                                    :key="product.name"
                                    :src="photo(product.image, 800)"
                                    alt=""
                                    loading="lazy"
                                    class="absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-out-quint"
                                    :class="i === active ? 'scale-100 opacity-100' : 'scale-110 opacity-0'"
                                />
                                <div class="absolute inset-0 bg-[linear-gradient(0deg,rgb(27_22_16/0.65)_0%,transparent_40%)]" />
                            </template>
                            <template v-else>
                                <div
                                    v-for="(product, i) in products"
                                    :key="product.name"
                                    class="absolute inset-0 transition-opacity duration-700"
                                    :class="i === active ? 'opacity-100' : 'opacity-0'"
                                    :style="{ background: `radial-gradient(70% 55% at 50% 40%, ${product.tone}55, transparent 70%)` }"
                                >
                                    <p
                                        class="absolute inset-x-0 top-[6%] text-center font-serif text-[clamp(4rem,9vw,8rem)] leading-none italic opacity-25"
                                        :style="{ color: product.tone }"
                                    >
                                        {{ product.short }}
                                    </p>
                                </div>
                            </template>
                            <p class="absolute inset-x-6 bottom-5 flex items-center justify-between text-sm font-medium" :class="sackReady ? 'text-muted' : 'text-white'">
                                <span>{{ products[active].use }}</span>
                                <span class="tabular-nums">0{{ active + 1 }} / 0{{ products.length }}</span>
                            </p>
                        </div>
                        <div ref="sackHost" class="pointer-events-none absolute inset-0 [&>canvas]:size-full" />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
