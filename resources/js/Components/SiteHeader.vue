<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import BrandMark from '@/Components/BrandMark.vue';
import ThemeToggle from '@/Components/ThemeToggle.vue';
import { gsap, lockScroll, prefersReducedMotion, scrollToTarget } from '@/lib/motion';

const links = [
    { label: 'About', href: '#about' },
    { label: 'Our mill', href: '#mill' },
    { label: 'Products', href: '#products' },
    { label: 'Quality', href: '#quality' },
    { label: 'Contact', href: '#contact' },
];

const scrolled = ref(false);
const hidden = ref(false);
const menuOpen = ref(false);
const menu = ref(null);

let lastY = 0;

function onScroll() {
    const y = window.scrollY;
    scrolled.value = y > 40;
    // Tuck the bar away while reading downwards, bring it back on any upward scroll.
    hidden.value = y > 480 && y > lastY && !menuOpen.value;
    lastY = y;
}

function go(href) {
    menuOpen.value = false;
    scrollToTarget(href);
}

watch(menuOpen, async (open) => {
    lockScroll(open);
    if (!open || prefersReducedMotion()) return;

    await nextTick();
    gsap.fromTo(
        menu.value.querySelectorAll('[data-menu-item]'),
        { yPercent: 110 },
        { yPercent: 0, duration: 0.7, stagger: 0.06, ease: 'expo.out' },
    );
});

function onKey(e) {
    if (e.key === 'Escape') menuOpen.value = false;
}

onMounted(() => {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('keydown', onKey);
    lockScroll(false);
});
</script>

<template>
    <header
        class="fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color,box-shadow] duration-500 ease-out-quint"
        :class="[
            scrolled || menuOpen ? 'bg-header text-ink shadow-[0_1px_0_var(--line)] backdrop-blur-xl' : 'text-white',
            hidden ? '-translate-y-full' : 'translate-y-0',
        ]"
    >
        <div class="container-site flex h-[72px] items-center justify-between gap-6">
            <a href="#top" class="flex items-center gap-3" aria-label="Golden Harvest Mills, back to top" @click.prevent="go('#top')">
                <span class="grid size-11 place-items-center rounded-full bg-gold text-on-gold">
                    <BrandMark class="size-8" />
                </span>
                <span class="font-serif text-lg leading-none font-medium tracking-tight">
                    Golden Harvest
                    <span class="mt-1 block font-sans text-[0.7rem] font-medium tracking-[0.04em] opacity-70">Flour mills, Sri Lanka</span>
                </span>
            </a>

            <nav class="hidden lg:block" aria-label="Main">
                <ul class="flex items-center gap-1">
                    <li v-for="link in links" :key="link.href">
                        <a
                            :href="link.href"
                            class="group relative px-3 py-2 text-[0.95rem] font-medium opacity-85 transition-opacity hover:opacity-100"
                            @click.prevent="go(link.href)"
                        >
                            {{ link.label }}
                            <span
                                class="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-out-quint group-hover:scale-x-100"
                            />
                        </a>
                    </li>
                </ul>
            </nav>

            <div class="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <a href="#contact" class="btn btn-gold hidden py-2.5 sm:inline-flex" @click.prevent="go('#contact')">Get a quote</a>
                <button
                    type="button"
                    class="grid size-10 place-items-center rounded-full border border-current/20 lg:hidden"
                    :aria-expanded="menuOpen"
                    aria-controls="mobile-menu"
                    :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
                    @click="menuOpen = !menuOpen"
                >
                    <span class="relative block h-3 w-4">
                        <span
                            class="absolute left-0 h-[1.5px] w-full bg-current transition-all duration-300"
                            :class="menuOpen ? 'top-1/2 rotate-45' : 'top-0'"
                        />
                        <span
                            class="absolute left-0 h-[1.5px] w-full bg-current transition-all duration-300"
                            :class="menuOpen ? 'top-1/2 -rotate-45' : 'top-full'"
                        />
                    </span>
                </button>
            </div>
        </div>

        <Transition
            enter-active-class="transition-[clip-path] duration-500 ease-out-quint"
            leave-active-class="transition-[clip-path] duration-300 ease-in"
            enter-from-class="[clip-path:inset(0_0_100%_0)]"
            enter-to-class="[clip-path:inset(0_0_0_0)]"
            leave-from-class="[clip-path:inset(0_0_0_0)]"
            leave-to-class="[clip-path:inset(0_0_100%_0)]"
        >
            <div
                v-if="menuOpen"
                id="mobile-menu"
                ref="menu"
                class="fixed inset-x-0 top-[72px] h-[calc(100dvh-72px)] overflow-y-auto bg-paper text-ink lg:hidden"
            >
                <nav class="container-site flex min-h-full flex-col justify-between pt-8 pb-10" aria-label="Mobile">
                    <ul class="space-y-1">
                        <li v-for="link in links" :key="link.href" class="overflow-hidden">
                            <a
                                :href="link.href"
                                data-menu-item
                                class="block py-2 font-serif text-4xl tracking-tight"
                                @click.prevent="go(link.href)"
                            >
                                {{ link.label }}
                            </a>
                        </li>
                    </ul>
                    <a href="#contact" class="btn btn-gold mt-10 w-full" @click.prevent="go('#contact')">Get a quote</a>
                </nav>
            </div>
        </Transition>
    </header>
</template>
