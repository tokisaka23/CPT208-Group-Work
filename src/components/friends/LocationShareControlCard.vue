<script setup>
import { computed } from 'vue';
import { Button, Tag } from 'vant';
import { resolveLocalized, useLanguage } from '../../i18n';

const props = defineProps({
  overview: {
    type: Object,
    default: () => ({
      totalFriends: 0,
      activeFriendCount: 0,
      sharingMode: 'off',
      lastLocationUpdatedAt: null,
      isOnline: false,
    }),
  },
  sharingLoading: {
    type: Boolean,
    default: false,
  },
  locationLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['enable-sharing', 'disable-sharing', 'refresh-location']);
const { language } = useLanguage();

const textSource = {
  title: {
    zh: '我的位置共享',
    en: 'My Location Sharing',
  },
  desc: {
    zh: '先开启共享，再更新一次当前位置，好友就能看到你的在线状态和地图位置。',
    en: 'Enable sharing and refresh your location once so friends can see your status and map position.',
  },
  sharingOn: {
    zh: '已开启',
    en: 'On',
  },
  sharingPartial: {
    zh: '部分开启',
    en: 'Partial',
  },
  sharingOff: {
    zh: '未开启',
    en: 'Off',
  },
  online: {
    zh: '在线',
    en: 'Online',
  },
  offline: {
    zh: '离线',
    en: 'Offline',
  },
  activeFriends: {
    zh: '已共享好友',
    en: 'Shared Friends',
  },
  totalFriends: {
    zh: '好友总数',
    en: 'Total Friends',
  },
  updatedAt: {
    zh: '最近定位',
    en: 'Last Location',
  },
  noUpdate: {
    zh: '还没有位置记录',
    en: 'No location yet',
  },
  enable: {
    zh: '开启共享',
    en: 'Enable Sharing',
  },
  disable: {
    zh: '关闭共享',
    en: 'Disable Sharing',
  },
  refresh: {
    zh: '更新我的位置',
    en: 'Refresh My Location',
  },
};

const text = computed(() => resolveLocalized(textSource, language.value));
const locale = computed(() => (language.value === 'zh' ? 'zh-CN' : language.value));

const sharingTagText = computed(() => {
  if (props.overview?.sharingMode === 'all') {
    return text.value.sharingOn;
  }

  if (props.overview?.sharingMode === 'partial') {
    return text.value.sharingPartial;
  }

  return text.value.sharingOff;
});

const sharingTagType = computed(() => {
  if (props.overview?.sharingMode === 'all') {
    return 'primary';
  }

  if (props.overview?.sharingMode === 'partial') {
    return 'warning';
  }

  return 'default';
});

const formattedTime = computed(() => {
  if (!props.overview?.lastLocationUpdatedAt) {
    return text.value.noUpdate;
  }

  return new Intl.DateTimeFormat(locale.value, {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(props.overview.lastLocationUpdatedAt));
});
</script>

<template>
  <section class="panel-card">
    <div class="section-head">
      <div>
        <h2 class="section-title">{{ text.title }}</h2>
        <p class="section-desc">{{ text.desc }}</p>
      </div>

      <div class="tag-group">
        <Tag :type="sharingTagType" plain>{{ sharingTagText }}</Tag>
        <Tag :type="overview?.isOnline ? 'success' : 'default'" plain>
          {{ overview?.isOnline ? text.online : text.offline }}
        </Tag>
      </div>
    </div>

    <div class="metric-grid">
      <article class="metric-card">
        <span class="metric-label">{{ text.activeFriends }}</span>
        <strong class="metric-value">{{ overview?.activeFriendCount ?? 0 }}</strong>
      </article>
      <article class="metric-card">
        <span class="metric-label">{{ text.totalFriends }}</span>
        <strong class="metric-value">{{ overview?.totalFriends ?? 0 }}</strong>
      </article>
    </div>

    <div class="update-card">
      <span class="metric-label">{{ text.updatedAt }}</span>
      <strong class="update-time">{{ formattedTime }}</strong>
    </div>

    <div class="action-row">
      <Button
        round
        type="primary"
        plain
        :loading="sharingLoading"
        @click="emit('enable-sharing')"
      >
        {{ text.enable }}
      </Button>
      <Button
        round
        type="default"
        plain
        :loading="sharingLoading"
        @click="emit('disable-sharing')"
      >
        {{ text.disable }}
      </Button>
      <Button
        round
        type="success"
        :loading="locationLoading"
        @click="emit('refresh-location')"
      >
        {{ text.refresh }}
      </Button>
    </div>
  </section>
</template>

<style scoped>
.panel-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 16px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(31, 58, 44, 0.08);
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.section-title {
  margin: 0 0 6px;
  font-size: 18px;
  color: #1f2a22;
}

.section-desc {
  margin: 0;
  color: #6f7a71;
  font-size: 13px;
  line-height: 1.6;
}

.tag-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.metric-card,
.update-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f7faf8;
}

.metric-label {
  color: #6f7a71;
  font-size: 12px;
}

.metric-value,
.update-time {
  color: #1f2a22;
  font-size: 20px;
  font-weight: 700;
}

.update-time {
  font-size: 15px;
}

.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .section-head {
    flex-direction: column;
  }

  .tag-group,
  .action-row {
    width: 100%;
  }

  .action-row :deep(.van-button) {
    flex: 1 1 100%;
  }
}
</style>
