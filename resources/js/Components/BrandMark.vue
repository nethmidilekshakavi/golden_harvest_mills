<script setup>
// A "G" drawn as an open arc around a single wheat ear.
const kernels = [21, 26.5, 32, 37.5];
</script>

<template>
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path
            d="M47.3 19.1 A20 20 0 1 0 52 32 H40"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
        <path d="M30 46 V17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <g fill="currentColor">
            <ellipse cx="30" cy="14.5" rx="2.1" ry="3.6" />
            <template v-for="y in kernels" :key="y">
                <ellipse :cx="26.6" :cy="y" rx="2.1" ry="3.9" :transform="`rotate(-32 26.6 ${y})`" />
                <ellipse :cx="33.4" :cy="y" rx="2.1" ry="3.9" :transform="`rotate(32 33.4 ${y})`" />
            </template>
        </g>
    </svg>
</template>
