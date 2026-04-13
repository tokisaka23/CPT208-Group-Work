<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import UgcMyListI18n from '../components/UgcMyListI18n.vue';
import { authApi } from '../services/api';
import { resolveLocalized, useLanguage } from '../i18n';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/clientRuntime';

const route = useRoute();
const { language } = useLanguage();

const currentUser = ref(null);
const loading = ref(true);
const authError = ref('');
const favoriteOwner = ref(null);

const favoriteUserId = computed(() => String(route.query.userId || '').trim());
const isFriendView = computed(() => Boolean(favoriteUserId.value));
const uploaderId = computed(() => favoriteUserId.value || currentUser.value?.id || '');

const textSource = {
  eyebrow: {
    zh: '我的收藏与上传',
    en: 'Favorites & Uploads',
    ja: 'お気に入りと投稿',
    ko: '즐겨찾기와 업로드',
  },
  pageTitleSelf: {
    zh: '收藏夹',
    en: 'Favorites',
    ja: 'お気に入り',
    ko: '즐겨찾기',
  },
  pageTitleFriendSuffix: {
    zh: '的收藏夹',
    en: "'s Favorites",
    ja: 'のお気に入り',
    ko: '님의 즐겨찾기',
  },
  unknownFriend: {
    zh: '这位好友',
    en: 'This friend',
    ja: 'この友だち',
    ko: '이 친구',
  },
  pageSummarySelf: {
    zh: '这里会显示你上传过的图片记录，包括图片、标题和描述，你也可以在这里整理或删除不再想保留的内容。',
    en: 'This page shows the images you uploaded, including the picture, title, and description. You can also tidy up and remove items you no longer want to keep.',
    ja: 'ここには自分がアップロードした画像記録が表示されます。画像、タイトル、説明を見返したり、不要になった内容を整理したりできます。',
    ko: '여기에는 내가 업로드한 이미지 기록이 표시됩니다. 이미지와 제목, 설명을 다시 보고 더 이상 보관하지 않을 항목을 정리할 수 있습니다.',
  },
  pageSummaryFriend: {
    zh: '这里会展示这位好友上传过的图片内容，你可以查看图片、标题和描述，但不能删除对方的记录。',
    en: 'This page shows images uploaded by your friend. You can browse the picture, title, and description, but you cannot delete their records.',
    ja: 'ここには友だちがアップロードした画像が表示されます。画像やタイトル、説明は見られますが、相手の記録を削除することはできません。',
    ko: '여기에는 친구가 업로드한 이미지가 표시됩니다. 사진과 제목, 설명은 볼 수 있지만 상대 기록을 삭제할 수는 없습니다.',
  },
  listSubtitleSelf: {
    zh: '浏览并管理自己上传的图片记录。',
    en: 'Browse and manage the images you uploaded.',
    ja: '自分がアップロードした画像記録を確認して管理します。',
    ko: '내가 업로드한 이미지 기록을 확인하고 관리합니다.',
  },
  listSubtitleFriend: {
    zh: '浏览这位好友上传过的图片记录。',
    en: 'Browse the images uploaded by this friend.',
    ja: 'この友だちがアップロードした画像記録を確認します。',
    ko: '이 친구가 업로드한 이미지 기록을 확인합니다.',
  },
  emptyTextSelf: {
    zh: '你还没有上传任何图片。',
    en: 'You have not uploaded any images yet.',
    ja: 'まだ画像をアップロードしていません。',
    ko: '아직 업로드한 이미지가 없습니다.',
  },
  emptyTextFriend: {
    zh: '这位好友暂时还没有上传任何图片。',
    en: 'This friend has not uploaded any images yet.',
    ja: 'この友だちはまだ画像をアップロードしていません。',
    ko: '이 친구는 아직 이미지를 업로드하지 않았습니다.',
  },
  backHome: {
    zh: '返回主页',
    en: 'Back to Home',
    ja: 'ホームへ戻る',
    ko: '홈으로 돌아가기',
  },
  loadingState: {
    zh: '正在读取上传记录...',
    en: 'Loading uploaded records...',
    ja: 'アップロード記録を読み込み中...',
    ko: '업로드 기록을 불러오는 중...',
  },
  authMissing: {
    zh: '当前还没有检测到登录用户，请先登录后再查看收藏夹。',
    en: 'No signed-in user was detected. Please sign in before opening the favorites page.',
    ja: '現在ログイン中のユーザーが見つかりません。お気に入りを見る前にログインしてください。',
    ko: '현재 로그인된 사용자를 찾지 못했습니다. 즐겨찾기를 보기 전에 먼저 로그인해 주세요.',
  },
  authRestoreFailed: {
    zh: '读取当前登录状态失败，请稍后再试。',
    en: 'Failed to restore the current sign-in state. Please try again later.',
    ja: '現在のログイン状態を復元できませんでした。しばらくしてからもう一度お試しください。',
    ko: '현재 로그인 상태를 복원하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  },
};

const text = computed(() => resolveLocalized(textSource, language.value));

const ownerName = computed(
  () => favoriteOwner.value?.displayName || favoriteOwner.value?.username || text.value.unknownFriend,
);

const pageTitle = computed(() => (
  isFriendView.value
    ? `${ownerName.value}${text.value.pageTitleFriendSuffix}`
    : text.value.pageTitleSelf
));

const pageSummary = computed(() => (
  isFriendView.value ? text.value.pageSummaryFriend : text.value.pageSummarySelf
));

const listSubtitle = computed(() => (
  isFriendView.value ? text.value.listSubtitleFriend : text.value.listSubtitleSelf
));

const emptyText = computed(() => (
  isFriendView.value ? text.value.emptyTextFriend : text.value.emptyTextSelf
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
    authError.value = error.message || text.value.authRestoreFailed;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="favorites-page">
    <div class="favorites-hero">
      <p class="favorites-hero__eyebrow">{{ text.eyebrow }}</p>
      <h1>{{ pageTitle }}</h1>
      <p class="favorites-hero__summary">{{ pageSummary }}</p>
      <div class="favorites-hero__actions">
        <RouterLink to="/" class="favorites-link favorites-link--primary">{{ text.backHome }}</RouterLink>
      </div>
    </div>

    <div v-if="loading" class="favorites-state">
      {{ text.loadingState }}
    </div>

    <div v-else-if="authError" class="favorites-state favorites-state--error">
      {{ authError }}
    </div>

    <div v-else-if="!currentUser" class="favorites-state">
      {{ text.authMissing }}
    </div>

    <UgcMyListI18n
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
