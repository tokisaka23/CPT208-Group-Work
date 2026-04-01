<script setup>
import { computed } from 'vue';
import GardenDetailPage from '../components/GardenDetailPage.vue';
import { gardenDetailsSource } from '../data/gardenDetails';
import { resolveLocalized, useLanguage } from '../i18n';

const { language } = useLanguage();
const garden = computed(() => ({
  ...resolveLocalized(gardenDetailsSource.wangshiyuan, language.value),
  mapSlug: 'wangshiyuan',
}));
</script>

<template>
  <GardenDetailPage :garden="garden" />
</template>
