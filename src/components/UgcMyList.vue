<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Button, showConfirmDialog, showFailToast, showSuccessToast } from 'vant';
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
    default: '我的上传',
  },
  subtitle: {
    type: String,
    default: '浏览并删除自己上传的照片记录。',
  },
  emptyText: {
    type: String,
    default: '你还没有上传任何照片。',
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const records = ref([]);
const loading = ref(false);
const deletingId = ref('');
const canLoad = computed(() => Boolean(props.uploaderId) && isSupabaseConfigured());

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
    showFailToast(error.message || '读取上传记录失败');
  } finally {
    loading.value = false;
  }
}

async function deleteRecord(record) {
  try {
    await showConfirmDialog({
      title: '删除记录',
      message: `确定删除“${record.name}”吗？`,
      confirmButtonText: '删除',
      cancelButtonText: '取消',
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
    showSuccessToast('删除成功');
  } catch (error) {
    showFailToast(error.message || '删除失败');
  } finally {
    deletingId.value = '';
  }
}

onMounted(loadRecords);

watch(
  () => [props.uploaderId, props.refreshKey],
  () => {
    loadRecords();
  }
);
</script>

<template>
  <section class="ugc-list">
    <div class="list-header">
      <div>
        <h2 class="list-title">{{ title }}</h2>
        <p class="list-subtitle">{{ subtitle }}</p>
      </div>
      <Button plain type="primary" size="small" :loading="loading" @click="loadRecords">
        刷新
      </Button>
    </div>

    <div v-if="!records.length" class="empty-state">
      {{ loading ? '正在读取上传记录...' : emptyText }}
    </div>

    <article v-for="record in records" :key="record.id" class="record-card">
      <img v-if="record.image_url" :src="record.image_url" :alt="record.name" class="record-image" />

      <div class="record-main">
        <div class="record-body">
          <h3 class="record-name">{{ record.name }}</h3>
          <p class="record-description">{{ record.description }}</p>
          <p class="record-time">{{ new Date(record.created_at).toLocaleString() }}</p>
        </div>

        <Button
          v-if="!readOnly"
          plain
          type="danger"
          size="small"
          :loading="deletingId === record.id"
          @click="deleteRecord(record)"
        >
          删除
        </Button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.ugc-list {
  padding: 1.15rem;
  background: rgba(255, 252, 246, 0.9);
  border-radius: 22px;
  border: 1px solid rgba(145, 136, 118, 0.12);
  box-shadow: 0 20px 44px rgba(43, 35, 21, 0.08);
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
  font-size: 1.22rem;
  color: #2d241a;
}

.list-subtitle {
  margin: 6px 0 0;
  font-size: 0.88rem;
  color: rgba(70, 60, 47, 0.7);
}

.empty-state {
  padding: 20px 0;
  color: rgba(70, 60, 47, 0.7);
  font-size: 0.95rem;
}

.record-card {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 14px;
  padding: 14px 0;
  border-top: 1px solid rgba(145, 136, 118, 0.12);
}

.record-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 16px;
  background: #e7ece7;
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
  font-size: 1.18rem;
  color: #2d241a;
}

.record-description {
  margin: 8px 0 0;
  font-size: 0.95rem;
  color: rgba(70, 60, 47, 0.86);
  line-height: 1.75;
  white-space: pre-wrap;
}

.record-time {
  margin: 10px 0 0;
  font-size: 0.78rem;
  color: rgba(70, 60, 47, 0.5);
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
