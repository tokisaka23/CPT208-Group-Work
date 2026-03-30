<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import UgcMyList from '../components/UgcMyList.vue';
import { authApi } from '../services/api';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/clientRuntime';

const route = useRoute();
const currentUser = ref(null);
const loading = ref(true);
const authError = ref('');
const favoriteOwner = ref(null);

const favoriteUserId = computed(() => String(route.query.userId || '').trim());
const isFriendView = computed(() => Boolean(favoriteUserId.value));
const uploaderId = computed(() => favoriteUserId.value || currentUser.value?.id || '');
const pageTitle = computed(() => (
  isFriendView.value
    ? `${favoriteOwner.value?.displayName || favoriteOwner.value?.username || '这位好友'}的收藏夹`
    : '收藏夹'
));
const pageSummary = computed(() => (
  isFriendView.value
    ? '这里展示这位好友上传过的照片内容，你可以查看图片、标题和描述，但不能删除。'
    : '这里会展示当前登录用户上传过的照片记录，包括图片、标题和描述。你也可以在这里删除不再想保留的内容。'
));
const listSubtitle = computed(() => (
  isFriendView.value
    ? '浏览这位好友上传过的照片记录。'
    : '浏览并删除自己上传的照片记录。'
));
const emptyText = computed(() => (
  isFriendView.value
    ? '这位好友暂时还没有上传任何照片。'
    : '你还没有上传任何照片。'
));

async function loadFavoriteOwner() {
  if (!isFriendView.value || !isSupabaseConfigured()) {
    favoriteOwner.value = null;
    return;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, username, display_name')
    .eq('id', favoriteUserId.value)
    .maybeSingle();

  if (error) {
    throw error;
  }

  favoriteOwner.value = data
    ? {
        id: data.id,
        username: data.username || '',
        displayName: data.display_name || '',
      }
    : null;
}

onMounted(async () => {
  loading.value = true;
  authError.value = '';

  try {
    currentUser.value = await authApi.restore();

    if (isFriendView.value) {
      await loadFavoriteOwner();
    }
  } catch (error) {
    authError.value = error.message || '读取当前登录状态失败，请稍后再试。';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="favorites-page">
    <div class="favorites-hero">
      <p class="favorites-hero__eyebrow">My Uploads</p>
      <h1>{{ pageTitle }}</h1>
      <p class="favorites-hero__summary">{{ pageSummary }}</p>
      <div class="favorites-hero__actions">
        <RouterLink to="/" class="favorites-link favorites-link--primary">返回主页</RouterLink>
      </div>
    </div>

    <div v-if="loading" class="favorites-state">
      正在读取上传记录…
    </div>

    <div v-else-if="authError" class="favorites-state favorites-state--error">
      {{ authError }}
    </div>

    <div v-else-if="!currentUser" class="favorites-state">
      当前还没有检测到登录用户，请先登录后再查看收藏夹。
    </div>

    <UgcMyList
      v-else
      :uploader-id="uploaderId"
      :title="pageTitle"
      :subtitle="listSubtitle"
      :empty-text="emptyText"
      :read-only="isFriendView"
    />
  </section>
</template>

<style scoped>
.favorites-page {
  width: min(1120px, calc(100vw - 2.4rem));
  margin: 0 auto;
  padding: 2.1rem 0 3rem;
  display: grid;
  gap: 1.4rem;
}

.favorites-hero {
  padding: 1.6rem 1.7rem;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 252, 246, 0.94), rgba(248, 244, 236, 0.92)),
    radial-gradient(circle at top right, rgba(206, 221, 210, 0.22), transparent 42%);
  border: 1px solid rgba(145, 136, 118, 0.14);
  box-shadow: 0 22px 48px rgba(43, 35, 21, 0.08);
}

.favorites-hero__eyebrow {
  margin: 0 0 0.55rem;
  color: rgba(93, 85, 69, 0.7);
  font-size: 0.82rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.favorites-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 2.8vw, 3rem);
  color: #2d241a;
}

.favorites-hero__summary {
  margin: 0.9rem 0 0;
  max-width: 44rem;
  color: rgba(70, 60, 47, 0.78);
  line-height: 1.8;
}

.favorites-hero__actions {
  margin-top: 1.2rem;
}

.favorites-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0 1.2rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
}

.favorites-link--primary {
  background: #2f5849;
  color: #f8f2e8;
}

.favorites-state {
  padding: 1.25rem 1.35rem;
  border-radius: 20px;
  background: rgba(255, 252, 246, 0.84);
  border: 1px solid rgba(145, 136, 118, 0.12);
  color: rgba(70, 60, 47, 0.78);
}

.favorites-state--error {
  color: #8a3b34;
  border-color: rgba(138, 59, 52, 0.2);
  background: rgba(255, 244, 241, 0.9);
}

@media (max-width: 720px) {
  .favorites-page {
    width: min(100vw - 1.2rem, 1120px);
    padding: 1.2rem 0 2rem;
  }

  .favorites-hero {
    padding: 1.25rem 1.1rem;
    border-radius: 22px;
  }
}
</style>
