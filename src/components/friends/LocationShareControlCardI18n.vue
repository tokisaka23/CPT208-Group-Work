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
    ja: '自分の位置共有',
    ko: '내 위치 공유',
  },
  desc: {
    zh: '先开启共享，再更新一次当前位置，好友就能看到你的在线状态和地图位置。',
    en: 'Enable sharing and refresh your location once so friends can see your status and map position.',
    ja: '共有を有効にして現在地を一度更新すると、友だちがあなたの状態と地図上の位置を確認できます。',
    ko: '공유를 켜고 현재 위치를 한 번 업데이트하면 친구들이 상태와 지도 위치를 볼 수 있습니다.',
  },
  sharingOn: {
    zh: '已开启',
    en: 'On',
    ja: 'オン',
    ko: '켜짐',
  },
  sharingPartial: {
    zh: '部分开启',
    en: 'Partial',
    ja: '一部共有',
    ko: '부분 공유',
  },
  sharingOff: {
    zh: '未开启',
    en: 'Off',
    ja: 'オフ',
    ko: '꺼짐',
  },
  online: {
    zh: '在线',
    en: 'Online',
    ja: 'オンライン',
    ko: '온라인',
  },
  offline: {
    zh: '离线',
    en: 'Offline',
    ja: 'オフライン',
    ko: '오프라인',
  },
  activeFriends: {
    zh: '已共享好友',
    en: 'Shared Friends',
    ja: '共有中の友だち',
    ko: '공유 중인 친구',
  },
  totalFriends: {
    zh: '好友总数',
    en: 'Total Friends',
    ja: '友だち総数',
    ko: '전체 친구 수',
  },
  updatedAt: {
    zh: '最近定位',
    en: 'Last Location',
    ja: '最新位置',
    ko: '최근 위치',
  },
  noUpdate: {
    zh: '还没有位置记录',
    en: 'No location yet',
    ja: '位置記録はまだありません',
    ko: '아직 위치 기록이 없습니다',
  },
  enable: {
    zh: '开启共享',
    en: 'Enable Sharing',
    ja: '共有をオン',
    ko: '공유 켜기',
  },
  disable: {
    zh: '关闭共享',
    en: 'Disable Sharing',
    ja: '共有をオフ',
    ko: '공유 끄기',
  },
  refresh: {
    zh: '更新我的位置',
    en: 'Refresh My Location',
    ja: '自分の位置を更新',
    ko: '내 위치 업데이트',
  },
};

const text = computed(() => resolveLocalized(textSource, language.value));
const locale = computed(() => (
  language.value === 'zh'
    ? 'zh-CN'
    : language.value === 'ja'
      ? 'ja-JP'
      : language.value === 'ko'
        ? 'ko-KR'
        : 'en-US'
));

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
      <Button round type="primary" plain :loading="sharingLoading" @click="emit('enable-sharing')">
        {{ text.enable }}
      </Button>
      <Button round type="default" plain :loading="sharingLoading" @click="emit('disable-sharing')">
        {{ text.disable }}
      </Button>
      <Button round type="success" :loading="locationLoading" @click="emit('refresh-location')">
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
  padding: 14px;
  border-radius: 16px;
  background: #f6faf7;
}

.metric-label {
  font-size: 12px;
  color: #6f7a71;
}

.metric-value,
.update-time {
  font-size: 18px;
  color: #1f2a22;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-row :deep(.van-button) {
  flex: 1 1 150px;
}

@media (max-width: 480px) {
  .section-head {
    flex-direction: column;
  }

  .tag-group {
    justify-content: flex-start;
  }
}
</style>
