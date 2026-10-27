<script setup>
import { useTheme } from '@/composables/useTheme';

const { isDark, toggle } = useTheme();
</script>

<template>
    <button
        type="button"
        class="group relative grid size-10 place-items-center rounded-full border border-current/20 transition-colors duration-300 hover:border-current/50"
        :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
        :aria-pressed="isDark"
        @click="toggle"
    >
        <!-- Sun -->
        <svg
            viewBox="0 0 24 24"
            class="absolute size-[1.15rem] transition-all duration-500 ease-out-quint"
            :class="isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5" />
        </svg>
        <!-- Moon -->
        <svg
            viewBox="0 0 24 24"
            class="absolute size-[1.1rem] transition-all duration-500 ease-out-quint"
            :class="isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
    </button>
</template>
