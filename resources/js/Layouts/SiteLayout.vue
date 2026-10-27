<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import SiteFooter from '@/Components/SiteFooter.vue';
import SiteHeader from '@/Components/SiteHeader.vue';
import { ScrollTrigger, startSmoothScroll, stopSmoothScroll } from '@/lib/motion';

onMounted(() => {
    startSmoothScroll();
    // Images above the fold can shift trigger positions once they load.
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
});

onBeforeUnmount(stopSmoothScroll);
</script>

<template>
    <div>
        <a
            href="#main"
            class="sr-only z-[60] rounded-full bg-gold px-5 py-3 font-semibold text-on-gold focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
            Skip to content
        </a>
        <SiteHeader />
        <main id="main">
            <slot />
        </main>
        <SiteFooter />
    </div>
</template>
