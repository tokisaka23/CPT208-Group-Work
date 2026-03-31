<script setup>
import { computed } from 'vue';
import GardenDetailPage from '../components/GardenDetailPage.vue';
import { gardenDetailsSource } from '../data/gardenDetails';
import { resolveLocalized, useLanguage } from '../i18n';

const { language } = useLanguage();
const garden = computed(() => resolveLocalized(gardenDetailsSource.zhuozhengyuan, language.value));
</script>

<template>
  <GardenDetailPage :garden="garden" />
</template>
