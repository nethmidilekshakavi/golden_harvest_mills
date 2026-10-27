<script setup>
import { Head } from '@inertiajs/vue3';
import Assurance from '@/Components/Home/Assurance.vue';
import Capabilities from '@/Components/Home/Capabilities.vue';
import Community from '@/Components/Home/Community.vue';
import HeroSection from '@/Components/Home/HeroSection.vue';
import Products from '@/Components/Home/Products.vue';
import WelcomeBand from '@/Components/Home/WelcomeBand.vue';
import SiteLayout from '@/Layouts/SiteLayout.vue';
</script>

<template>
    <SiteLayout>
        <Head title="Quality flour, milled in Sri Lanka" />
        <HeroSection />
        <WelcomeBand />
        <Capabilities />
        <Community />
        <Products />
        <Assurance />
    </SiteLayout>
</template>
