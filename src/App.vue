<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  { label: '平江古街', to: '/', icon: 'pingjiang' },
  { label: '古典园林', to: '/gardens', icon: 'gardens' },
  { label: '文博殿堂', to: '/museums', icon: 'museums' },
  { label: '非遗市井', to: '/heritage', icon: 'heritage' },
];

const featureButtons = [
  { id: 'friends', label: '好友同游' },
  { id: 'ai', label: 'AI 伴游' },
];

const featurePanels = {
  friends: {
    label: '好友同游',
    eyebrow: 'Travel Together',
    description: '把当前页面、集合点和慢游节奏快速同步给朋友，适合同一条路线结伴看。',
  },
  ai: {
    label: 'AI 伴游',
    eyebrow: 'Smart Guide',
    description: '根据你当前打开的页面给出导览建议，也可以直接问它“先看哪里、怎么走更顺”。',
  },
};

const routeJourneys = {
  '/': {
    meetPoint: '平江路主街 · 顾颉刚故居旁',
    pace: '先顺着主街认方向，再向园林、文博和支巷慢慢散开。',
    focus: ['先沿河看整体气质', '再分线进入园林与文博', '傍晚回到评弹与灯影最完整'],
    prompts: ['我第一次来，应该从哪一段开始走？', '想把园林和博物馆串起来，怎么安排更顺？', '平江路傍晚最适合停在哪一段？'],
  },
  '/gardens': {
    meetPoint: '拙政园外白墙花窗一侧',
    pace: '先看整体水院比例，再回头看花窗、回廊和框景细节。',
    focus: ['先整体后细节', '框景和回廊最值得停留', '午后光线更适合慢看'],
    prompts: ['古典园林这页我应该先看哪一座？', '想拍出园林层次感，站哪里更合适？', '如果时间只有半天，园林路线怎么排？'],
  },
  '/museums': {
    meetPoint: '苏州博物馆主入口外',
    pace: '先看建筑与光影，再进入展陈，最后把昆曲和旧宅声景连起来。',
    focus: ['先读建筑空间再看文物', '昆曲馆更适合带着“听”的心情', '留一点时间给庭院与过渡空间'],
    prompts: ['文博殿堂这页先看苏博还是昆曲博物馆？', '昆曲博物馆最值得留意哪些细节？', '想走一条安静一点的文博路线，怎么安排？'],
  },
  '/heritage': {
    meetPoint: '平江路书场门口',
    pace: '先吃后听，再进手作与支巷，把烟火气按节奏收拢起来。',
    focus: ['苏式汤面适合做起点', '评弹和昆曲适合放在傍晚', '手作店更适合最后慢慢看'],
    prompts: ['非遗市井这页我应该先吃还是先听？', '想体验评弹和昆曲，晚上怎么排更顺？', '有什么适合买回去的苏州小物件？'],
  },
};

const pageContextLabel = computed(() => route.meta.title || '平江古街');
const currentJourney = computed(() => routeJourneys[route.path] || routeJourneys['/']);

const activeFeature = ref('');
const activeFeatureInfo = computed(() => featurePanels[activeFeature.value] || null);
const isFeatureOpen = computed(() => Boolean(activeFeature.value));

const createInviteCode = () => `PJ-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.floor(Math.random() * 9) + 1}`;

const friendTrip = reactive({
  roomCode: createInviteCode(),
  members: 2,
  meetingPoint: routeJourneys['/'].meetPoint,
});

const inviteFeedback = ref('');
const friendHighlights = computed(() => currentJourney.value.focus);
const friendSummary = computed(() => `${pageContextLabel.value} · ${currentJourney.value.pace}`);
const guidePrompts = computed(() => currentJourney.value.prompts);

const aiDraft = ref('');
const aiMessages = ref([]);
const isAiLoading = ref(false);
const aiError = ref('');

const buildAiGreeting = () =>
  `你现在浏览的是「${pageContextLabel.value}」。我可以按当前页面告诉你先看哪里、怎么走更顺，以及哪些细节最值得慢下来。`;

const buildOfflineAiReply = (prompt) => {
  if (prompt.includes('先') || prompt.includes('怎么走')) {
    return `如果你现在在「${pageContextLabel.value}」，建议 ${currentJourney.value.pace} 重点可以放在：${currentJourney.value.focus.slice(0, 2).join('、')}。`;
  }

  if (prompt.includes('拍') || prompt.includes('照片') || prompt.includes('好看')) {
    return `在「${pageContextLabel.value}」里，更耐看的往往不是正面大景，而是 ${currentJourney.value.focus[0]} 这类有层次的角度。可以先停一分钟，再决定从哪里拍。`;
  }

  return `现在这页是「${pageContextLabel.value}」。如果想慢游得更顺，可以记住这三个重点：${currentJourney.value.focus.join('、')}。`;
};

const ensureAiConversation = (forceReset = false) => {
  if (forceReset || !aiMessages.value.length) {
    aiMessages.value = [
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: buildAiGreeting(),
        hint: '当前页智能导览',
      },
    ];
  }

  aiError.value = '';
};

const openFeature = (featureId) => {
  activeFeature.value = featureId;
  inviteFeedback.value = '';

  if (featureId === 'friends') {
    friendTrip.meetingPoint = currentJourney.value.meetPoint;
  }

  if (featureId === 'ai') {
    ensureAiConversation(true);
  }
};

const closeFeature = () => {
  activeFeature.value = '';
  aiDraft.value = '';
};

const regenerateInviteCode = () => {
  friendTrip.roomCode = createInviteCode();
  inviteFeedback.value = '已刷新新的同游房间号。';
};

const copyInviteCode = async () => {
  const shareText = `我在「${pageContextLabel.value}」开了一个同游房间，口令 ${friendTrip.roomCode}，集合点：${friendTrip.meetingPoint}`;

  try {
    if (!navigator?.clipboard?.writeText) {
      throw new Error('Clipboard unavailable');
    }

    await navigator.clipboard.writeText(shareText);
    inviteFeedback.value = '邀请口令已复制，可以直接发给好友。';
  } catch {
    inviteFeedback.value = `房间口令：${friendTrip.roomCode}；集合点：${friendTrip.meetingPoint}`;
  }
};

const sendAiMessage = async (prefilledPrompt = '') => {
  const question = (prefilledPrompt || aiDraft.value).trim();

  if (!question || isAiLoading.value) {
    return;
  }

  ensureAiConversation();
  aiMessages.value = [...aiMessages.value, { id: `user-${Date.now()}`, role: 'user', content: question }];
  aiDraft.value = '';
  aiError.value = '';
  isAiLoading.value = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        gpsLocation: pageContextLabel.value,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.response) {
      throw new Error(data?.error || 'AI 服务暂不可用');
    }

    aiMessages.value = [...aiMessages.value, { id: `assistant-${Date.now()}`, role: 'assistant', content: data.response }];
  } catch {
    aiMessages.value = [
      ...aiMessages.value,
      {
        id: `assistant-offline-${Date.now()}`,
        role: 'assistant',
        content: buildOfflineAiReply(question),
        hint: '已切换本地伴游建议',
      },
    ];
    aiError.value = 'AI 接口暂时不可用，已先给你本地伴游建议。';
  } finally {
    isAiLoading.value = false;
  }
};

watch(
  () => route.fullPath,
  () => {
    friendTrip.meetingPoint = currentJourney.value.meetPoint;
    inviteFeedback.value = '';

    if (activeFeature.value === 'ai') {
      ensureAiConversation(true);
    }
  },
);

const currentUser = ref(null);
const isAuthOpen = ref(false);
const authMode = ref('login');
const authForm = reactive({
  displayName: '',
  account: '',
  password: '',
});

const openAuthDialog = (mode = 'login') => {
  authMode.value = mode;
  isAuthOpen.value = true;
};

const closeAuthDialog = () => {
  isAuthOpen.value = false;
  authForm.displayName = '';
  authForm.account = '';
  authForm.password = '';
};

const submitAuth = () => {
  currentUser.value = {
    name: authMode.value === 'register' ? authForm.displayName || '平江旅人' : '平江旅人',
  };
  closeAuthDialog();
};

const avatarLabel = computed(() => currentUser.value?.name?.slice(0, 1) || '游');
const profileLabel = computed(() => currentUser.value?.name || '登录 / 注册');
const profileStatus = computed(() => (currentUser.value ? '已登录' : '游客模式'));
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <div class="header-inner">
        <RouterLink to="/" class="brand-link">
          <span class="brand-seal">平</span>
          <span class="brand-copy">
            <strong class="brand-title">平江慢游</strong>
            <small class="brand-subtitle">Pingjiang · Gardens · Museums · Heritage</small>
          </span>
        </RouterLink>

        <nav class="site-nav" aria-label="主导航">
          <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-link">
            <span class="nav-link__icon" aria-hidden="true">
              <svg v-if="item.icon === 'pingjiang'" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4.5 10.75 12 4.5l7.5 6.25V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20v-9.25Z"
                  stroke="currentColor"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                />
                <path
                  d="M9.2 21.4v-6.2a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1v6.2"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.6"
                />
              </svg>
              <svg v-else-if="item.icon === 'gardens'" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6.5 15.8c6.6.7 10.2-3.3 11-10.6-6.5-.3-11 3.2-11 10.6Z"
                  stroke="currentColor"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                />
                <path
                  d="M6.5 15.8c2.4-3.7 6.2-6.3 11-10.6"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.6"
                />
                <path
                  d="M6.5 15.8V21"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.6"
                />
              </svg>
              <svg v-else-if="item.icon === 'museums'" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4.5 9.25 12 4.5l7.5 4.75"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                />
                <path
                  d="M6.5 10.2V19.2m3.8-9V19.2m3.4-9V19.2m3.8-9V19.2"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.6"
                />
                <path
                  d="M5.4 21h13.2"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.6"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none">
                <path
                  d="M8.1 10.3V7.8a3.9 3.9 0 0 1 7.8 0v2.5"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.6"
                />
                <path
                  d="M7.25 10.3h9.5c.65 0 1.18.53 1.18 1.18v7.25c0 1.03-.84 1.87-1.87 1.87H7.94c-1.03 0-1.87-.84-1.87-1.87v-7.25c0-.65.53-1.18 1.18-1.18Z"
                  stroke="currentColor"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                />
                <path
                  d="M12 13.2v4.2"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.6"
                />
              </svg>
            </span>
            <span class="nav-link__text">{{ item.label }}</span>
          </RouterLink>

          <button
            v-for="feature in featureButtons"
            :key="feature.id"
            type="button"
            class="nav-link"
            @click="openFeature(feature.id)"
          >
            <span class="nav-link__icon" aria-hidden="true">
              <svg v-if="feature.id === 'friends'" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8.75 10.25a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Zm6.5 1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-10 7a4.75 4.75 0 0 1 7 0m1.5 0a4 4 0 0 1 5.75-.75"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4.75 13.68 8.7l4.27.36-3.25 2.77.98 4.12L12 13.8l-3.68 2.15.98-4.12-3.25-2.77 4.27-.36L12 4.75Zm0 0v-1.5m0 17.5v-1.5m8-7.25h1.5m-19 0H4"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                />
              </svg>
            </span>
            <span class="nav-link__text">{{ feature.label }}</span>
          </button>
        </nav>

        <div class="header-actions">
          <button
            type="button"
            class="profile-button"
            :aria-label="currentUser ? '打开账户信息' : '打开登录弹窗'"
            @click="openAuthDialog('login')"
          >
            <span class="profile-avatar" :class="{ 'profile-avatar--filled': currentUser }">
              <span class="profile-status-dot" :class="{ 'profile-status-dot--active': currentUser }" />
              <span>{{ avatarLabel }}</span>
            </span>
            <span class="profile-copy">
              <span class="profile-label">{{ profileLabel }}</span>
              <small class="profile-note">{{ profileStatus }}</small>
            </span>
          </button>
        </div>
      </div>
    </header>

    <main class="page-body">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in" appear>
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </RouterView>
    </main>

    <footer class="global-footer">
      <div class="footer-content">
        <section class="footer-signature" aria-label="页脚落款">
          <div class="footer-signature__headline">
            <span class="seal-stamp">苏</span>
            <h3>一街读姑苏，四页见气韵。</h3>
          </div>
          <p>以宣纸白为底，以水墨黑为骨，以青瓷绿与朱砂红轻轻点醒苏州的静与雅。</p>
        </section>

        <nav class="footer-nav" aria-label="页脚导航">
          <RouterLink v-for="item in navItems" :key="`footer-${item.to}`" :to="item.to" class="footer-link">
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>

      <div class="footer-bottom">
        <p>© 2026 Jiangnan Gardens. 姑苏漫游指南 保留所有权利。</p>
      </div>
    </footer>

    <transition name="veil" appear>
      <div v-if="isFeatureOpen" class="overlay" role="dialog" aria-modal="true" @click.self="closeFeature">
        <section class="dialog dialog--feature" @click.stop>
          <header class="dialog__header">
            <div class="dialog__intro">
              <p class="dialog__eyebrow">{{ activeFeatureInfo?.eyebrow }}</p>
              <h2 class="dialog__title">{{ activeFeatureInfo?.label }}</h2>
            </div>
            <button type="button" class="dialog__close" @click="closeFeature">关闭</button>
          </header>

          <p class="dialog__copy">{{ activeFeatureInfo?.description }}</p>

          <template v-if="activeFeature === 'friends'">
            <div class="feature-context">
              <span>当前同步页面</span>
              <strong>{{ pageContextLabel }}</strong>
              <p>{{ friendSummary }}</p>
            </div>

            <div class="feature-stat-grid">
              <article class="feature-stat-card">
                <span>同游房间</span>
                <strong>{{ friendTrip.roomCode }}</strong>
              </article>
              <article class="feature-stat-card">
                <span>建议人数</span>
                <strong>{{ friendTrip.members }} - 4 人</strong>
              </article>
              <article class="feature-stat-card">
                <span>集合点</span>
                <strong>{{ friendTrip.meetingPoint }}</strong>
              </article>
            </div>

            <label class="field field--full">
              <span>自定义集合点</span>
              <input v-model.trim="friendTrip.meetingPoint" type="text" placeholder="例如：白塔东路桥边" />
            </label>

            <ul class="dialog__list">
              <li v-for="item in friendHighlights" :key="item">{{ item }}</li>
            </ul>

            <p v-if="inviteFeedback" class="feature-feedback">{{ inviteFeedback }}</p>

            <div class="dialog__actions">
              <button type="button" class="dialog__primary" @click="copyInviteCode">复制邀请口令</button>
              <button type="button" class="dialog__ghost" @click="regenerateInviteCode">刷新房间号</button>
            </div>
          </template>

          <template v-else-if="activeFeature === 'ai'">
            <div class="feature-context">
              <span>当前导览页面</span>
              <strong>{{ pageContextLabel }}</strong>
              <p>{{ currentJourney.pace }}</p>
            </div>

            <div class="prompt-chips">
              <button v-for="prompt in guidePrompts" :key="prompt" type="button" class="prompt-chip" @click="sendAiMessage(prompt)">
                {{ prompt }}
              </button>
            </div>

            <div class="ai-chat" aria-live="polite">
              <article
                v-for="message in aiMessages"
                :key="message.id"
                :class="['message-bubble', message.role === 'user' ? 'message-bubble--user' : 'message-bubble--assistant']"
              >
                <span class="message-bubble__role">{{ message.role === 'user' ? '我' : 'AI 伴游' }}</span>
                <p>{{ message.content }}</p>
                <small v-if="message.hint">{{ message.hint }}</small>
              </article>

              <article v-if="isAiLoading" class="message-bubble message-bubble--assistant is-loading">
                <span class="message-bubble__role">AI 伴游</span>
                <p>正在整理当前页面的慢游建议…</p>
              </article>
            </div>

            <p v-if="aiError" class="feature-feedback">{{ aiError }}</p>

            <form class="dialog__form dialog__form--ai" @submit.prevent="sendAiMessage()">
              <label class="field field--full">
                <span>问问当前页面</span>
                <input v-model.trim="aiDraft" type="text" placeholder="比如：我现在应该先看哪里？" />
              </label>

              <div class="dialog__actions dialog__actions--compact">
                <button type="submit" class="dialog__primary" :disabled="isAiLoading">发送问题</button>
                <button type="button" class="dialog__ghost" @click="ensureAiConversation(true)">重置对话</button>
              </div>
            </form>
          </template>
        </section>
      </div>
    </transition>

    <transition name="veil" appear>
      <div v-if="isAuthOpen" class="overlay" role="dialog" aria-modal="true" @click.self="closeAuthDialog">
        <section class="dialog" @click.stop>
          <header class="dialog__header">
            <h2 class="dialog__title">{{ authMode === 'login' ? '登录账户' : '创建账户' }}</h2>
            <button type="button" class="dialog__close" @click="closeAuthDialog">关闭</button>
          </header>

          <div class="dialog__tabs">
            <button
              type="button"
              class="tab-button"
              :class="{ 'is-active': authMode === 'login' }"
              @click="authMode = 'login'"
            >
              登录
            </button>
            <button
              type="button"
              class="tab-button"
              :class="{ 'is-active': authMode === 'register' }"
              @click="authMode = 'register'"
            >
              注册
            </button>
          </div>

          <form class="dialog__form" @submit.prevent="submitAuth">
            <label v-if="authMode === 'register'" class="field">
              <span>昵称</span>
              <input v-model.trim="authForm.displayName" type="text" placeholder="平江旅人" autocomplete="nickname" />
            </label>

            <label class="field">
              <span>账号</span>
              <input v-model.trim="authForm.account" type="text" placeholder="邮箱或手机号" autocomplete="username" />
            </label>

            <label class="field">
              <span>密码</span>
              <input
                v-model="authForm.password"
                type="password"
                placeholder="请输入密码"
                :autocomplete="authMode === 'login' ? 'current-password' : 'new-password'"
              />
            </label>

            <div class="dialog__actions">
              <button type="submit" class="dialog__primary">{{ authMode === 'login' ? '立即登录' : '创建账号' }}</button>
              <button type="button" class="dialog__ghost" @click="closeAuthDialog">取消</button>
            </div>
          </form>
        </section>
      </div>
    </transition>
  </div>
</template>

<style>
.global-footer {
  --accent-red: #a33b29;
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(28, 25, 23, 0.06);
  padding-top: 64px;
  background: rgba(250, 250, 249, 0.78);
}

.global-footer::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    repeating-radial-gradient(circle at 0 0, rgba(28, 25, 23, 0.02) 0 1px, transparent 1px 6px),
    radial-gradient(circle at 18% 22%, rgba(159, 63, 52, 0.06), transparent 54%),
    radial-gradient(circle at 84% 12%, rgba(95, 127, 114, 0.055), transparent 52%),
    repeating-linear-gradient(18deg, rgba(28, 25, 23, 0.028) 0 1px, transparent 1px 8px),
    repeating-linear-gradient(-14deg, rgba(28, 25, 23, 0.022) 0 1px, transparent 1px 11px);
  opacity: 0.78;
  mix-blend-mode: multiply;
}

.footer-content,
.footer-bottom {
  width: min(100%, calc(var(--max-width) + 3rem));
  margin: 0 auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  position: relative;
  z-index: 1;
}

.footer-content {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(220px, 0.8fr);
  gap: 2.5rem;
  align-items: start;
  padding-bottom: 2rem;
}

.footer-signature {
  display: grid;
  gap: 0.85rem;
  padding-left: 20px;
  border-left: 1px solid rgba(28, 25, 23, 0.1);
}

.footer-signature__headline {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.seal-stamp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 4px;
  background: var(--accent-red, #a33b29);
  color: #fff;
  font-family: var(--font-serif);
  font-size: 0.88rem;
  line-height: 1;
  box-shadow: 0 8px 20px rgba(163, 59, 41, 0.18);
}

.footer-signature h3 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 20px;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: var(--ink-900);
}

.footer-signature p {
  max-width: 34rem;
  margin: 0;
  color: var(--ink-600);
}

.footer-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem 1.6rem;
  align-content: start;
  justify-items: start;
  padding-top: 0.1rem;
}

.footer-link {
  display: inline-flex;
  align-items: center;
  color: var(--ink-600);
  font-size: 14px;
  letter-spacing: 0.06em;
  transition:
    color 0.32s ease,
    transform 0.32s ease;
}

.footer-link:hover,
.footer-link.router-link-exact-active {
  color: var(--celadon-700);
  transform: translateX(-4px);
}

.footer-bottom {
  padding-top: 1rem;
  padding-bottom: 1.6rem;
  border-top: 1px solid rgba(28, 25, 23, 0.06);
}

.footer-bottom p {
  margin: 0;
  color: var(--ink-500);
  font-size: 0.82rem;
  letter-spacing: 0.06em;
}

.fade-enter-active {
  transition:
    opacity 0.96s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.96s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.96s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform, filter;
}

.fade-leave-active {
  transition:
    opacity 0.42s ease,
    transform 0.42s ease,
    filter 0.42s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(34px) scale(0.985);
  filter: blur(14px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(1.005);
  filter: blur(10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

.veil-enter-active,
.veil-leave-active {
  transition: opacity 0.42s cubic-bezier(0.33, 1, 0.68, 1);
}

.veil-enter-from,
.veil-leave-to {
  opacity: 0;
}

.overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(28, 25, 23, 0.5);
  backdrop-filter: blur(16px);
  z-index: 80;
}

.dialog {
  width: min(92vw, 500px);
  border-radius: 28px;
  border: 1px solid rgba(250, 250, 249, 0.18);
  background: rgba(250, 250, 249, 0.94);
  box-shadow: 0 32px 72px rgba(28, 25, 23, 0.22);
  padding: 1.25rem 1.3rem 1.35rem;
}

.dialog--feature {
  width: min(94vw, 680px);
}

.dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.dialog__intro {
  display: grid;
  gap: 0.3rem;
}

.dialog__eyebrow {
  margin: 0;
  color: var(--ink-500);
  font-size: 0.75rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.dialog__title {
  margin: 0;
  font-size: 1.45rem;
}

.dialog__close {
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(28, 25, 23, 0.14);
  background: rgba(255, 255, 255, 0.7);
}

.dialog__copy {
  margin-top: 0.9rem;
  color: rgba(68, 64, 60, 0.92);
}

.feature-context {
  margin-top: 1rem;
  padding: 1rem 1.05rem;
  border-radius: 22px;
  border: 1px solid rgba(95, 127, 114, 0.16);
  background: rgba(95, 127, 114, 0.08);
  display: grid;
  gap: 0.3rem;
}

.feature-context span,
.feature-stat-card span,
.message-bubble__role {
  color: var(--ink-500);
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.feature-context strong,
.feature-stat-card strong {
  font-size: 1rem;
  color: var(--ink-900);
}

.feature-context p {
  color: var(--ink-700);
}

.feature-stat-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.feature-stat-card {
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid rgba(28, 25, 23, 0.08);
  background: rgba(255, 255, 255, 0.8);
  display: grid;
  gap: 0.4rem;
}

.dialog__list {
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.55rem;
}

.dialog__list li {
  position: relative;
  padding-left: 1rem;
  color: rgba(68, 64, 60, 0.88);
}

.dialog__list li::before {
  content: '';
  position: absolute;
  top: 0.78rem;
  left: 0;
  width: 0.45rem;
  height: 1px;
  background: rgba(95, 127, 114, 0.72);
}

.dialog__tabs {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tab-button {
  flex: 1;
  min-height: 2.6rem;
  border-radius: 999px;
  border: 1px solid rgba(28, 25, 23, 0.14);
  background: rgba(255, 255, 255, 0.6);
  color: var(--ink-700);
  transition:
    background-color 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease;
}

.tab-button.is-active {
  border-color: rgba(95, 127, 114, 0.3);
  background: rgba(95, 127, 114, 0.12);
  color: var(--ink-900);
}

.dialog__form {
  margin-top: 1rem;
  display: grid;
  gap: 0.9rem;
}

.dialog__form--ai {
  margin-top: 1.1rem;
}

.field {
  display: grid;
  gap: 0.36rem;
}

.field--full {
  margin-top: 1rem;
}

.field span {
  color: var(--ink-600);
  letter-spacing: 0.12em;
  font-size: 0.76rem;
  text-transform: uppercase;
}

.field input {
  width: 100%;
  min-height: 2.85rem;
  padding: 0 0.95rem;
  border-radius: 18px;
  border: 1px solid rgba(28, 25, 23, 0.12);
  background: rgba(255, 255, 255, 0.72);
  outline: none;
}

.field input:focus {
  border-color: rgba(95, 127, 114, 0.42);
  box-shadow: 0 0 0 4px rgba(95, 127, 114, 0.12);
}

.dialog__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.15rem;
}

.dialog__actions--compact {
  margin-top: 0;
}

.dialog__primary,
.dialog__ghost,
.prompt-chip {
  min-height: 2.85rem;
  border-radius: 999px;
  letter-spacing: 0.08em;
  transition:
    transform 0.25s ease,
    background-color 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease,
    opacity 0.25s ease;
}

.dialog__primary,
.dialog__ghost {
  flex: 1;
  min-width: 9rem;
}

.dialog__primary {
  background: rgba(95, 127, 114, 0.92);
  color: var(--paper-50);
}

.dialog__ghost,
.prompt-chip {
  border: 1px solid rgba(28, 25, 23, 0.14);
  background: rgba(255, 255, 255, 0.6);
  color: var(--ink-800);
}

.dialog__primary:hover,
.dialog__ghost:hover,
.prompt-chip:hover {
  transform: translateY(-1px);
}

.dialog__primary:disabled,
.dialog__ghost:disabled {
  opacity: 0.58;
  cursor: not-allowed;
  transform: none;
}

.prompt-chips {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.prompt-chip {
  min-height: 2.45rem;
  padding: 0.5rem 0.95rem;
}

.ai-chat {
  margin-top: 1rem;
  max-height: min(46vh, 360px);
  overflow: auto;
  display: grid;
  gap: 0.75rem;
  padding-right: 0.15rem;
}

.message-bubble {
  max-width: min(100%, 30rem);
  padding: 0.95rem 1rem;
  border-radius: 22px;
  display: grid;
  gap: 0.32rem;
}

.message-bubble p,
.message-bubble small {
  margin: 0;
}

.message-bubble--assistant {
  border: 1px solid rgba(95, 127, 114, 0.14);
  background: rgba(95, 127, 114, 0.08);
}

.message-bubble--user {
  margin-left: auto;
  border: 1px solid rgba(159, 63, 52, 0.12);
  background: rgba(159, 63, 52, 0.08);
}

.message-bubble small {
  color: var(--ink-500);
}

.is-loading {
  opacity: 0.88;
}

.feature-feedback {
  margin-top: 0.9rem;
  padding: 0.8rem 0.95rem;
  border-radius: 18px;
  background: rgba(159, 63, 52, 0.08);
  color: var(--cinnabar-700);
}

@media (max-width: 720px) {
  .dialog--feature {
    padding: 1.1rem;
  }

  .feature-stat-grid {
    grid-template-columns: 1fr;
  }

  .dialog__actions,
  .dialog__actions--compact {
    flex-direction: column;
  }

  .dialog__primary,
  .dialog__ghost {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .global-footer {
    padding-top: 52px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.8rem;
  }

  .footer-nav {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
