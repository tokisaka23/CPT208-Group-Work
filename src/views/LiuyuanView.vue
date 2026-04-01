<script setup>
import { computed } from 'vue';
import GardenDetailPage from '../components/GardenDetailPage.vue';
import { gardenDetailsSource } from '../data/gardenDetails';
import { resolveLocalized, useLanguage } from '../i18n';

const { language } = useLanguage();
const garden = computed(() => ({
  ...resolveLocalized(gardenDetailsSource.liuyuan, language.value),
  mapSlug: 'liuyuan',
}));
</script>

<template>
  <GardenDetailPage :garden="garden" />
</template>
