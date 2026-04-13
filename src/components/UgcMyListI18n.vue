<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Button, showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
import { resolveLocalized, useLanguage } from '../i18n';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/clientRuntime';

const props = defineProps({
  uploaderId: {
    type: String,
    default: '',
  },
  refreshKey: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  emptyText: {
    type: String,
    default: '',
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const { language } = useLanguage();

const records = ref([]);
const loading = ref(false);
const deletingId = ref('');
const canLoad = computed(() => Boolean(props.uploaderId) && isSupabaseConfigured());

const textSource = {
  defaultTitle: {
    zh: '我的上传',
    en: 'My Uploads',
    ja: '自分の投稿',
    ko: '내 업로드',
  },
  defaultSubtitle: {
    zh: '浏览并管理自己上传的图片记录。',
    en: 'Browse and manage the images you uploaded.',
    ja: '自分がアップロードした画像記録を確認して管理します。',
    ko: '내가 업로드한 이미지 기록을 확인하고 관리합니다.',
  },
  refresh: {
    zh: '刷新',
    en: 'Refresh',
    ja: '更新',
    ko: '새로고침',
  },
  loadingEmpty: {
    zh: '正在读取上传记录...',
    en: 'Loading uploaded records...',
    ja: 'アップロード記録を読み込み中...',
    ko: '업로드 기록을 불러오는 중...',
  },
  defaultEmpty: {
    zh: '还没有上传记录',
    en: 'No uploaded records yet',
    ja: 'まだアップロード記録がありません',
    ko: '아직 업로드 기록이 없습니다',
  },
  loadFailed: {
    zh: '读取上传记录失败',
    en: 'Failed to load uploaded records',
    ja: 'アップロード記録の読み込みに失敗しました',
    ko: '업로드 기록을 불러오지 못했습니다',
  },
  deleteDialogTitle: {
    zh: '删除记录',
    en: 'Delete record',
    ja: '記録を削除',
    ko: '기록 삭제',
  },
  deleteDialogMessage: {
    zh: '确定删除“{name}”吗？',
    en: 'Are you sure you want to delete "{name}"?',
    ja: '「{name}」を削除しますか？',
    ko: '"{name}"을(를) 삭제할까요?',
  },
  deleteConfirm: {
    zh: '删除',
    en: 'Delete',
    ja: '削除',
    ko: '삭제',
  },
  cancel: {
    zh: '取消',
    en: 'Cancel',
    ja: 'キャンセル',
    ko: '취소',
  },
  deleteSuccess: {
    zh: '删除成功',
    en: 'Deleted successfully',
    ja: '削除しました',
    ko: '삭제되었습니다',
  },
  deleteFailed: {
    zh: '删除失败',
    en: 'Failed to delete',
    ja: '削除に失敗しました',
    ko: '삭제하지 못했습니다',
  },
};

const text = computed(() => resolveLocalized(textSource, language.value));
const displayTitle = computed(() => props.title || text.value.defaultTitle);
const displaySubtitle = computed(() => props.subtitle || text.value.defaultSubtitle);
const displayEmpty = computed(() => props.emptyText || text.value.defaultEmpty);

const localeMap = {
  zh: 'zh-CN',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

function formatMessage(template, name) {
  return template.replace('{name}', name || '');
}

function formatRecordTime(value) {
  if (!value) {
    return '';
  }

  try {
    return new Date(value).toLocaleString(localeMap[language.value] || 'en-US');
  } catch {
    return String(value);
  }
}

function extractStoragePath(imageUrl) {
  if (!imageUrl) {
    return '';
  }

  const marker = '/storage/v1/object/public/ugc-images/';
  const index = imageUrl.indexOf(marker);
  return index >= 0 ? imageUrl.slice(index + marker.length) : '';
}

async function loadRecords() {
  if (!canLoad.value) {
    records.value = [];
    return;
  }

  loading.value = true;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ugc_pois')
      .select('id, name, description, image_url, created_at')
      .eq('user_id', props.uploaderId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    records.value = data || [];
  } catch (error) {
    showFailToast(error.message || text.value.loadFailed);
  } finally {
    loading.value = false;
  }
}

async function deleteRecord(record) {
  if (props.readOnly) {
    return;
  }

  try {
    await showConfirmDialog({
      title: text.value.deleteDialogTitle,
      message: formatMessage(text.value.deleteDialogMessage, record.name),
      confirmButtonText: text.value.deleteConfirm,
      cancelButtonText: text.value.cancel,
    });
  } catch {
    return;
  }

  deletingId.value = record.id;

  try {
    const supabase = getSupabaseClient();
    const storagePath = extractStoragePath(record.image_url);

    const { error } = await supabase
      .from('ugc_pois')
      .delete()
      .eq('id', record.id)
      .eq('user_id', props.uploaderId);

    if (error) {
      throw error;
    }

    if (storagePath) {
      await supabase.storage.from('ugc-images').remove([storagePath]);
    }

    records.value = records.value.filter((item) => item.id !== record.id);
    showSuccessToast(text.value.deleteSuccess);
  } catch (error) {
    showFailToast(error.message || text.value.deleteFailed);
  } finally {
    deletingId.value = '';
  }
}

onMounted(loadRecords);

watch(
  () => [props.uploaderId, props.refreshKey],
  () => {
    loadRecords();
  },
);
</script>

<template>
  <section class="ugc-list">
    <div class="list-header">
      <div>
        <h2 class="list-title">{{ displayTitle }}</h2>
        <p class="list-subtitle">{{ displaySubtitle }}</p>
      </div>
      <Button plain type="primary" size="small" :loading="loading" @click="loadRecords">
        {{ text.refresh }}
      </Button>
    </div>

    <div v-if="!records.length" class="empty-state">
      {{ loading ? text.loadingEmpty : displayEmpty }}
    </div>

    <article v-for="record in records" :key="record.id" class="record-card">
      <img v-if="record.image_url" :src="record.image_url" :alt="record.name" class="record-image" />

      <div class="record-main">
        <div class="record-body">
          <h3 class="record-name">{{ record.name }}</h3>
          <p class="record-description">{{ record.description }}</p>
          <p class="record-time">{{ formatRecordTime(record.created_at) }}</p>
        </div>

        <Button
          v-if="!readOnly"
          plain
          type="danger"
          size="small"
          :loading="deletingId === record.id"
          @click="deleteRecord(record)"
        >
          {{ text.deleteConfirm }}
        </Button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.ugc-list {
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.list-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.list-title {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.list-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #64748b;
}

.empty-state {
  padding: 20px 0;
  color: #64748b;
  font-size: 14px;
}

.record-card {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid #e5e7eb;
}

.record-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  background: #e2e8f0;
}

.record-main {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  min-height: 180px;
}

.record-name {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.record-description {
  margin: 8px 0 0;
  font-size: 14px;
  color: #334155;
  white-space: pre-wrap;
}

.record-time {
  margin: 10px 0 0;
  font-size: 12px;
  color: #94a3b8;
}

@media (max-width: 640px) {
  .record-card {
    grid-template-columns: 1fr;
  }

  .record-image {
    height: 220px;
  }

  .record-main {
    min-height: 0;
  }
}
</style>
