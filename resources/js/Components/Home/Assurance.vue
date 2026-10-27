<script setup>
import { photo, photos } from '@/lib/images';

const tiles = [
    {
        title: 'Traceable wheat sourcing',
        body: 'We partner with trusted growers to source clean, traceable wheat, ensuring purity from the very first grain.',
        image: photos.cropRows,
        alt: 'Rows of young crops stretching to the horizon',
        span: 'lg:col-span-7',
    },
    {
        title: 'Quality assurance',
        body: 'Every batch is lab-tested for consistency, safety and baking performance before it leaves the mill.',
        image: photos.lab,
        alt: 'Laboratory technician examining a sample under a microscope',
        span: 'lg:col-span-5',
    },
];
</script>

<template>
    <section id="quality" class="pb-24 lg:pb-32" aria-label="Sourcing and quality">
        <div class="container-site grid gap-5 lg:grid-cols-12">
            <article
                v-for="tile in tiles"
                :key="tile.title"
                class="group relative isolate flex min-h-[24rem] overflow-hidden rounded-[2rem] bg-husk text-white sm:min-h-[28rem]"
                :class="tile.span"
            >
                <img
                    :src="photo(tile.image, 1200)"
                    :alt="tile.alt"
                    loading="lazy"
                    class="absolute inset-0 -z-10 size-full object-cover transition-transform duration-[1200ms] ease-out-quint group-hover:scale-105"
                />
                <div class="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgb(27_22_16/0.88)_0%,rgb(27_22_16/0.35)_55%,rgb(27_22_16/0.1)_100%)]" />

                <div class="mt-auto p-7 sm:p-10">
                    <h2 class="text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.05] font-medium">{{ tile.title }}</h2>
                    <p class="mt-3 max-w-[40ch] text-white/80">{{ tile.body }}</p>
                </div>
            </article>
        </div>
    </section>
</template>
