<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { usePage } from '@inertiajs/vue3';
import BrandMark from '@/Components/BrandMark.vue';
import { gsap, prefersReducedMotion, revealHeadings, scrollToTarget, SplitText } from '@/lib/motion';

const site = computed(() => usePage().props.site);
const telHref = computed(() => `tel:${site.value.contact.phone.replace(/[^+\d]/g, '')}`);
const year = new Date().getFullYear();

const root = ref(null);
const wordmark = ref(null);
let ctx = null;

onMounted(() => {
    if (prefersReducedMotion()) return;

    ctx = gsap.context(() => {
        revealHeadings();

        // The oversized wordmark rises letter by letter as the footer scrolls in.
        SplitText.create(wordmark.value, {
            type: 'chars',
            mask: 'chars',
            onSplit: (self) =>
                gsap.from(self.chars, {
                    yPercent: 100,
                    stagger: 0.04,
                    ease: 'none',
                    scrollTrigger: { trigger: wordmark.value, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
                }),
        });
    }, root.value);
});

onBeforeUnmount(() => ctx?.revert());
</script>

<template>
    <footer id="contact" ref="root" class="overflow-hidden bg-husk text-flour">
        <div class="container-site grid gap-14 py-20 md:grid-cols-12 lg:py-28">
            <div class="md:col-span-7">
                <h2 data-split class="text-[clamp(2.4rem,5.6vw,4.5rem)] leading-[1] font-medium text-gold">Bulk orders &amp; distribution</h2>
                <p class="mt-6 max-w-[44ch] text-lg text-flour/75">
                    Golden Harvest serves B2B clients across Sri Lanka. For orders, partnerships and export enquiries, reach out to our
                    team directly.
                </p>
                <div class="mt-9 flex flex-wrap gap-3">
                    <a :href="telHref" class="btn btn-gold">Call sales</a>
                    <a :href="`mailto:${site.contact.email}`" class="btn btn-ghost-light">Email us</a>
                </div>
            </div>

            <dl class="grid gap-8 self-end text-flour/85 sm:grid-cols-2 md:col-span-5 md:grid-cols-1">
                <div>
                    <dt class="text-sm text-flour/50">Head office</dt>
                    <dd class="mt-2">
                        <address class="leading-relaxed not-italic">
                            <template v-for="line in site.contact.address" :key="line">{{ line }}<br /></template>
                        </address>
                    </dd>
                </div>
                <div>
                    <dt class="text-sm text-flour/50">Phone</dt>
                    <dd class="mt-2">
                        <a :href="telHref" class="transition-colors hover:text-gold">{{ site.contact.phone }}</a>
                    </dd>
                    <dt class="mt-6 text-sm text-flour/50">Email</dt>
                    <dd class="mt-2">
                        <a :href="`mailto:${site.contact.email}`" class="transition-colors hover:text-gold">{{ site.contact.email }}</a>
                    </dd>
                </div>
            </dl>
        </div>

        <p
            ref="wordmark"
            class="container-site text-center font-serif text-[12.4vw] leading-[0.85] font-medium tracking-[-0.03em] whitespace-nowrap text-flour/[0.07] select-none 2xl:text-[11rem]"
            aria-hidden="true"
        >
            Golden Harvest
        </p>

        <div class="border-t border-white/10">
            <div class="container-site flex flex-col gap-6 py-8 text-sm text-flour/55 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-3">
                    <span class="grid size-9 place-items-center rounded-full bg-gold text-on-gold">
                        <BrandMark class="size-6" />
                    </span>
                    <p>&copy; {{ year }} {{ site.name }}. All rights reserved.</p>
                </div>
                <div class="flex items-center gap-6">
                    <a href="#" class="transition-colors hover:text-gold">Privacy policy</a>
                    <a href="#" class="transition-colors hover:text-gold">Terms of service</a>
                    <button
                        type="button"
                        class="grid size-10 place-items-center rounded-xl bg-gold text-on-gold transition-transform duration-300 hover:-translate-y-1"
                        aria-label="Back to top"
                        @click="scrollToTarget('#top', 0)"
                    >
                        <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </footer>
</template>
