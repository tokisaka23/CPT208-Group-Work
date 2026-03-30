<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { showFailToast, showSuccessToast } from 'vant';
import FriendRequestPopup from './components/friends/FriendRequestPopup.vue';
import FriendsPage from './pages/friends/FriendsPage.vue';
import { aiApi, authApi, uploadApi } from './services/api';
import {
  getPendingFriendRequests,
  respondToFriendRequest,
} from './services/friends/friendServiceRuntime';
import { getGroupChats } from './services/friends/groupChatService';
import { SECURITY_QUESTION_FIELDS, SECURITY_QUESTION_PROMPTS } from './shared/securityQuestions';
import { isSupabaseConfigured } from './services/supabase/clientRuntime';
import { deleteCurrentAccount } from './services/supabase/authRuntime';

const route = useRoute();
const router = useRouter();

const navItems = [
  { label: '苏州慢游', to: '/', icon: 'pingjiang' },
  { label: '古典园林', to: '/gardens', icon: 'gardens' },
  { label: '文博殿堂', to: '/museums', icon: 'museums' },
  { label: '非遗市井', to: '/heritage', icon: 'heritage' },
];

const featureButtons = [
  { id: 'friends', label: '好友同游' },
  { id: 'ai', label: 'AI 伴游' },
  { id: 'upload', label: '上传照片' },
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
  upload: {
    label: '上传照片',
    eyebrow: 'Photo Upload',
    description: '把你在园林里的随手拍传上来，上传成功后会在这里显示。',
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

const pageContextLabel = computed(() => route.meta.title || '苏州慢游');
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
const pendingFriendRequests = ref([]);
const pendingRequestPopupVisible = ref(false);
const processingRequestId = ref('');
const pendingRequestSignature = ref('');
const unreadGroupChatCount = ref(0);
const aiDraft = ref('');
const aiConversations = ref([]);
const activeAiConversationId = ref('');
const aiLoadingConversationId = ref('');
const aiConversationDeletingId = ref('');
const aiConversationsLoadedUserId = ref('');
const aiError = ref('');
const aiChatScroller = ref(null);
const aiComposerInput = ref(null);
const isAiComposing = ref(false);
const isAiFullscreen = ref(false);
const profileMenuRef = ref(null);

const MAX_AI_CONTEXT_MESSAGES = 12;
const MAX_PERSISTED_CHAT_ROUNDS = 30;
const AI_GREETING_HINT = '当前页智能导览';
const DEFAULT_AI_CONVERSATION_TITLE = '新建对话';

function createAiMessageId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createAiConversationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function focusAiComposer() {
  nextTick(() => {
    aiComposerInput.value?.focus?.();
  });
}

function normalizeAiText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateAiText(value, maxLength = 20) {
  const normalized = normalizeAiText(value);

  if (!normalized) {
    return '';
  }

  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
}

function getJourneyByContextKey(contextKey) {
  return routeJourneys[contextKey] || routeJourneys['/'];
}

const activeAiConversation = computed(
  () => aiConversations.value.find((item) => item.id === activeAiConversationId.value) || null,
);
const aiMessages = computed(() => activeAiConversation.value?.messages || []);
const isAiLoading = computed(() => Boolean(aiLoadingConversationId.value));
const isActiveAiConversationLoading = computed(
  () => aiLoadingConversationId.value === activeAiConversationId.value,
);
const activeAiJourney = computed(() => getJourneyByContextKey(activeAiConversation.value?.contextKey || route.fullPath));
const activeAiPageLabel = computed(() => activeAiConversation.value?.pageLabel || pageContextLabel.value);
const activeAiPrompts = computed(() => activeAiJourney.value.prompts || currentJourney.value.prompts);
const aiShouldShowStarter = computed(() => !aiMessages.value.some((item) => item.role === 'user'));
const hasPendingFriendRequests = computed(() => pendingFriendRequests.value.length > 0);
const hasUnreadGroupChats = computed(() => unreadGroupChatCount.value > 0);
const hasFriendFeatureNotification = computed(
  () => hasPendingFriendRequests.value || hasUnreadGroupChats.value,
);

function buildAiGreeting(pageLabel = pageContextLabel.value) {
  return `你现在浏览的是「${pageLabel}」。我可以按当前页面告诉你先看哪里、怎么走更顺，以及哪些细节最值得慢下来。`;
}

function buildOfflineAiReply(prompt, conversation = activeAiConversation.value) {
  const pageLabel = conversation?.pageLabel || pageContextLabel.value;
  const journey = getJourneyByContextKey(conversation?.contextKey || route.fullPath);

  if (prompt.includes('先') || prompt.includes('怎么走')) {
    return `如果你现在在「${pageLabel}」，建议 ${journey.pace} 重点可以放在：${journey.focus.slice(0, 2).join('、')}。`;
  }

  if (prompt.includes('拍') || prompt.includes('照片') || prompt.includes('好看')) {
    return `在「${pageLabel}」里，更耐看的往往不是正面大景，而是 ${journey.focus[0]} 这类有层次的角度。可以先停一分钟，再决定从哪里拍。`;
  }

  return `现在这页是「${pageLabel}」。如果想慢游得更顺，可以记住这三个重点：${journey.focus.join('、')}。`;
}

function createAiGreetingMessage(pageLabel = pageContextLabel.value) {
  return {
    id: createAiMessageId('assistant'),
    role: 'assistant',
    content: buildAiGreeting(pageLabel),
    hint: AI_GREETING_HINT,
  };
}

function createAiConversation({
  id = createAiConversationId(),
  pageLabel = pageContextLabel.value,
  contextKey = route.fullPath,
  title = DEFAULT_AI_CONVERSATION_TITLE,
  createdAt = Date.now(),
  updatedAt = Date.now(),
  titleManuallyEdited = false,
  messages = null,
} = {}) {
  return {
    id,
    title,
    contextKey,
    pageLabel,
    createdAt,
    updatedAt,
    titleManuallyEdited,
    messages: messages?.length ? messages : [createAiGreetingMessage(pageLabel)],
  };
}

function deriveAiConversationTitle(messages, pageLabel) {
  const firstUserMessage = messages.find((item) => item.role === 'user');
  return truncateAiText(firstUserMessage?.content, 18) || `${pageLabel} 导览`;
}

function deriveAiConversationPreview(conversation) {
  const lastMessage = [...conversation.messages]
    .reverse()
    .find((item) => item.role === 'user' || item.role === 'assistant');

  return truncateAiText(lastMessage?.content, 28) || '从这里继续聊苏州园林。';
}

function trimConversationMessages(conversation) {
  if (!conversation) {
    return;
  }

  const greetingMessage = conversation.messages.find((item) => item.hint === AI_GREETING_HINT) || null;
  const regularMessages = conversation.messages
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
    .filter((item) => item.hint !== AI_GREETING_HINT)
    .slice(-(MAX_PERSISTED_CHAT_ROUNDS * 2));

  conversation.messages = greetingMessage ? [greetingMessage, ...regularMessages] : regularMessages;
}

function buildConversationMessagesForApi(conversation = activeAiConversation.value) {
  if (!conversation) {
    return [];
  }

  return conversation.messages
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
    // 初始欢迎语只是 UI 引导，不必回传给模型，避免噪音。
    .filter((item) => item.hint !== AI_GREETING_HINT)
    .map((item) => ({ role: item.role, content: item.content }))
    .filter((item) => String(item.content || '').trim())
    .slice(-MAX_AI_CONTEXT_MESSAGES);
}

function scrollAiConversationToBottom(behavior = 'smooth') {
  nextTick(() => {
    const scroller = aiChatScroller.value;

    if (!scroller) {
      return;
    }

    scroller.scrollTo({
      top: scroller.scrollHeight,
      behavior,
    });
  });
}

function buildConversationFromHistoryItem(item) {
  const historyMessages = (item?.messages || [])
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .map((message) => ({
      id: message.id || createAiMessageId(message.role),
      role: message.role,
      content: message.content,
      createdAt: message.createdAt || item?.updatedAt || Date.now(),
    }));

  return createAiConversation({
    id: item?.id || createAiConversationId(),
    title: item?.title || DEFAULT_AI_CONVERSATION_TITLE,
    contextKey: route.fullPath,
    pageLabel: pageContextLabel.value,
    createdAt: item?.updatedAt ? new Date(item.updatedAt).getTime() : Date.now(),
    updatedAt: item?.updatedAt ? new Date(item.updatedAt).getTime() : Date.now(),
    titleManuallyEdited: Boolean(item?.title),
    messages: historyMessages.length ? historyMessages : [createAiGreetingMessage(pageContextLabel.value)],
  });
}

const ensureAiConversation = (forceReset = false) => {
  if (forceReset || !activeAiConversation.value) {
    const nextConversation = createAiConversation();

    aiConversations.value = [nextConversation, ...aiConversations.value];
    activeAiConversationId.value = nextConversation.id;
  }

  aiError.value = '';
  scrollAiConversationToBottom('auto');
  return activeAiConversation.value;
};

function ensureAiConversationForCurrentPage(forceReset = false) {
  if (currentUser.value?.id) {
    return activeAiConversation.value || ensureAiConversation(forceReset);
  }

  if (
    forceReset ||
    !activeAiConversation.value ||
    activeAiConversation.value.contextKey !== route.fullPath
  ) {
    return ensureAiConversation(true);
  }

  return ensureAiConversation();
}

function moveAiConversationToTop(conversationId) {
  const conversationIndex = aiConversations.value.findIndex((item) => item.id === conversationId);

  if (conversationIndex <= 0) {
    return;
  }

  const nextConversations = [...aiConversations.value];
  const [conversation] = nextConversations.splice(conversationIndex, 1);
  nextConversations.unshift(conversation);
  aiConversations.value = nextConversations;
}

function syncAiConversationMeta(conversation) {
  if (!conversation) {
    return;
  }

  conversation.updatedAt = Date.now();
  if (!conversation.titleManuallyEdited || !currentUser.value?.id) {
    conversation.title = deriveAiConversationTitle(conversation.messages, conversation.pageLabel);
  }
  moveAiConversationToTop(conversation.id);
}

async function renameAiConversation(conversation, nextTitle) {
  if (!conversation) {
    return;
  }

  const normalizedTitle = normalizeAiText(nextTitle);

  if (!normalizedTitle) {
    return;
  }

  const trimmedTitle = truncateAiText(normalizedTitle, 24);

  if (currentUser.value?.id) {
    await aiApi.renameChatConversation({
      conversationId: conversation.id,
      conversationName: trimmedTitle,
    });
  }

  conversation.title = trimmedTitle;
  conversation.titleManuallyEdited = true;
}

async function loadAiConversations(forceReload = false) {
  const userId = currentUser.value?.id || '';

  if (!userId) {
    aiConversationsLoadedUserId.value = '';
    return ensureAiConversation();
  }

  if (!forceReload && aiConversationsLoadedUserId.value === userId && aiConversations.value.length) {
    return activeAiConversation.value || aiConversations.value[0];
  }

  const result = await aiApi.getChatHistory();
  const conversations = (result.conversations || []).map((item) => buildConversationFromHistoryItem(item));

  aiConversations.value = conversations.length ? conversations : [createAiConversation()];
  activeAiConversationId.value = aiConversations.value[0]?.id || '';
  aiConversationsLoadedUserId.value = userId;
  aiError.value = '';
  scrollAiConversationToBottom('auto');
  return activeAiConversation.value || aiConversations.value[0];
}

function selectAiConversation(conversationId) {
  activeAiConversationId.value = conversationId;
  moveAiConversationToTop(conversationId);
  aiError.value = '';
  scrollAiConversationToBottom('auto');
  focusAiComposer();
}

async function startNewAiConversation() {
  aiDraft.value = '';
  const nextConversation = createAiConversation();
  aiConversations.value = [nextConversation, ...aiConversations.value];
  activeAiConversationId.value = nextConversation.id;
  aiError.value = '';

  if (currentUser.value?.id) {
    aiConversationsLoadedUserId.value = currentUser.value.id;
  }

  scrollAiConversationToBottom('auto');
  focusAiComposer();
}

async function promptRenameAiConversation(conversation) {
  if (!conversation) {
    return;
  }

  const nextTitle = window.prompt('请输入新的对话标题', conversation.title || DEFAULT_AI_CONVERSATION_TITLE);

  if (nextTitle === null) {
    return;
  }

  try {
    await renameAiConversation(conversation, nextTitle);
    aiError.value = '';
  } catch (error) {
    console.error('[AI] 修改会话标题失败', error);
    aiError.value = error.message || '修改会话标题失败，请稍后再试。';
  }
}

async function deleteAiConversation(conversationId) {
  if (!conversationId || aiConversationDeletingId.value) {
    return;
  }

  aiConversationDeletingId.value = conversationId;

  try {
    if (currentUser.value?.id) {
      await aiApi.deleteChatConversation({ conversationId });
    }

    const nextConversations = aiConversations.value.filter((item) => item.id !== conversationId);
    aiConversations.value = nextConversations.length ? nextConversations : [createAiConversation()];

    if (activeAiConversationId.value === conversationId) {
      activeAiConversationId.value = aiConversations.value[0]?.id || '';
    }

    aiError.value = '';
    scrollAiConversationToBottom('auto');
  } catch (error) {
    console.error('[AI] 删除会话失败', error);
    aiError.value = error.message || '删除会话失败，请稍后再试。';
  } finally {
    if (aiConversationDeletingId.value === conversationId) {
      aiConversationDeletingId.value = '';
    }
  }

  focusAiComposer();
}

function toggleAiFullscreen() {
  isAiFullscreen.value = !isAiFullscreen.value;
  nextTick(() => {
    scrollAiConversationToBottom('auto');
    focusAiComposer();
  });
}

function handleAiComposerKeydown(event) {
  if (event?.key !== 'Enter' || event?.shiftKey || event?.isComposing || isAiComposing.value) {
    return;
  }

  event.preventDefault();
  sendAiMessage();
}

const openFeature = async (featureId) => {
  activeFeature.value = featureId;
  inviteFeedback.value = '';

  if (featureId === 'friends') {
    friendTrip.meetingPoint = currentJourney.value.meetPoint;
  }

  if (featureId === 'ai') {
    try {
      if (currentUser.value?.id) {
        await loadAiConversations();
      } else {
        ensureAiConversationForCurrentPage();
      }
    } catch (error) {
      console.error('[AI] 加载历史会话失败', error);
      aiError.value = error.message || '加载历史会话失败，已切换到临时会话。';
      ensureAiConversation(true);
    }

    focusAiComposer();
  }

  if (featureId === 'upload') {
    uploadError.value = '';
    requestUploadLocation();
  }
};

const closeFeature = () => {
  activeFeature.value = '';
  aiDraft.value = '';
  uploadError.value = '';
  clearUploadDraft();
  resetUploadLocation();
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

const openFavorites = () => {
  router.push('/favorites');
};

const sendAiMessage = async (prefilledPrompt = '') => {
  const question = (prefilledPrompt || aiDraft.value).trim();

  if (!question || isAiLoading.value) {
    return;
  }

  if (currentUser.value?.id) {
    try {
      await loadAiConversations();
    } catch (error) {
      console.error('[AI] 加载历史会话失败', error);
      aiError.value = error.message || '加载历史会话失败，已切换到临时会话。';
    }
  }

  const conversation = currentUser.value?.id
    ? activeAiConversation.value || ensureAiConversation(true)
    : ensureAiConversation();

  if (!conversation) {
    return;
  }

  conversation.contextKey = route.fullPath;
  conversation.pageLabel = pageContextLabel.value;
  conversation.messages.push({ id: createAiMessageId('user'), role: 'user', content: question });
  trimConversationMessages(conversation);
  syncAiConversationMeta(conversation);
  aiDraft.value = '';
  aiError.value = '';
  aiLoadingConversationId.value = conversation.id;
  scrollAiConversationToBottom();
  focusAiComposer();

  try {
    // 中文注释：这里连接后端千问接口 /api/chat，把用户输入发给后端并拿到 AI 回复。
    const data = await aiApi.askQianwen({
      conversationId: conversation.id,
      conversationName: conversation.title,
      message: question,
      messages: buildConversationMessagesForApi(conversation),
      gpsLocation: conversation.pageLabel,
    });

    conversation.messages.push({ id: createAiMessageId('assistant'), role: 'assistant', content: data.response });
    trimConversationMessages(conversation);
    syncAiConversationMeta(conversation);

    if (activeAiConversationId.value === conversation.id) {
      scrollAiConversationToBottom();
    }
  } catch (error) {
    console.error('[AI] 调用 /api/chat 失败', error);
    conversation.messages.push({
      id: createAiMessageId('assistant-offline'),
      role: 'assistant',
      content: buildOfflineAiReply(question, conversation),
      hint: '已切换本地伴游建议',
    });
    trimConversationMessages(conversation);
    syncAiConversationMeta(conversation);
    aiError.value = error.message || 'AI 接口暂时不可用，已先给你本地伴游建议。';
    if (activeAiConversationId.value === conversation.id) {
      scrollAiConversationToBottom();
    }
  } finally {
    if (aiLoadingConversationId.value === conversation.id) {
      aiLoadingConversationId.value = '';
    }
    focusAiComposer();
  }
};

watch(
  () => route.fullPath,
  () => {
    friendTrip.meetingPoint = currentJourney.value.meetPoint;
    inviteFeedback.value = '';

    if (activeFeature.value === 'ai' && !currentUser.value?.id) {
      ensureAiConversationForCurrentPage(true);
      focusAiComposer();
    }
  },
);

watch(
  activeAiConversationId,
  () => {
    scrollAiConversationToBottom('auto');
  },
);

watch(
  () => aiMessages.value.length,
  (nextLength, prevLength) => {
    if (nextLength > prevLength) {
      scrollAiConversationToBottom();
    }
  },
);

watch(isActiveAiConversationLoading, (loading) => {
  if (loading) {
    scrollAiConversationToBottom();
  }
});

const currentUser = ref(null);
const isProfileMenuOpen = ref(false);
const isAuthOpen = ref(false);
const authMode = ref('login');
const securityQuestionItems = SECURITY_QUESTION_FIELDS.map((field) => ({
  field,
  prompt: SECURITY_QUESTION_PROMPTS[field],
  type: field === 'birthday' ? 'date' : 'text',
  autocomplete: field === 'birthday' ? 'bday' : 'off',
}));
const authForm = reactive({
  displayName: '',
  account: '',
  password: '',
  confirmPassword: '',
  favoriteColor: '',
  birthday: '',
  studentId: '',
});
const authSubmitting = ref(false);
const authDeletingAccount = ref(false);
const authFeedback = ref('');
const authFeedbackType = ref('info');
const profileForm = reactive({
  displayName: '',
  password: '',
  confirmPassword: '',
});
const profileSubmitting = ref(false);
const profileFeedback = ref('');
const profileFeedbackType = ref('info');

const openAuthDialog = (mode = 'login') => {
  authMode.value = mode;
  isAuthOpen.value = true;
  authFeedback.value = '';
  authFeedbackType.value = 'info';
};

function toggleProfileMenu() {
  if (!currentUser.value) {
    openAuthDialog('login');
    return;
  }

  isProfileMenuOpen.value = !isProfileMenuOpen.value;

  if (isProfileMenuOpen.value) {
    profileForm.displayName = currentUser.value.username || '';
    profileForm.password = '';
    profileForm.confirmPassword = '';
    profileFeedback.value = '';
    profileFeedbackType.value = 'info';
  }
}

function closeProfileMenu() {
  isProfileMenuOpen.value = false;
  profileFeedback.value = '';
  profileFeedbackType.value = 'info';
  profileForm.password = '';
  profileForm.confirmPassword = '';
}

function handleWindowClickForProfileMenu(event) {
  if (!isProfileMenuOpen.value) {
    return;
  }

  const menuRoot = profileMenuRef.value;

  if (!menuRoot || menuRoot.contains(event.target)) {
    return;
  }

  closeProfileMenu();
}

function setAuthMode(mode) {
  authMode.value = mode;
  authForm.password = '';
  authForm.confirmPassword = '';
  authForm.favoriteColor = '';
  authForm.birthday = '';
  authForm.studentId = '';
  authFeedback.value = '';
  authFeedbackType.value = 'info';
}

function clearPendingRequestState() {
  pendingFriendRequests.value = [];
  pendingRequestPopupVisible.value = false;
  processingRequestId.value = '';
  pendingRequestSignature.value = '';
}

let pendingRequestPollTimer = null;
let groupChatUnreadPollTimer = null;

function stopPendingRequestPolling() {
  if (pendingRequestPollTimer) {
    window.clearInterval(pendingRequestPollTimer);
    pendingRequestPollTimer = null;
  }
}

function startPendingRequestPolling() {
  stopPendingRequestPolling();

  if (typeof window === 'undefined') {
    return;
  }

  pendingRequestPollTimer = window.setInterval(() => {
    loadPendingRequests({ silent: true });
  }, 10000);
}

function clearGroupChatUnreadState() {
  unreadGroupChatCount.value = 0;
}

function stopGroupChatUnreadPolling() {
  if (groupChatUnreadPollTimer) {
    window.clearInterval(groupChatUnreadPollTimer);
    groupChatUnreadPollTimer = null;
  }
}

function startGroupChatUnreadPolling() {
  stopGroupChatUnreadPolling();

  if (typeof window === 'undefined') {
    return;
  }

  groupChatUnreadPollTimer = window.setInterval(() => {
    loadGroupChatUnreadState({ silent: true });
  }, 12000);
}

function applyPendingRequests(requests, { forceOpen = false } = {}) {
  const nextRequests = Array.isArray(requests) ? requests : [];
  const nextSignature = nextRequests.map((item) => item.id).join(',');
  const hasNewRequests =
    Boolean(nextSignature) && nextSignature !== pendingRequestSignature.value;

  pendingFriendRequests.value = nextRequests;
  pendingRequestSignature.value = nextSignature;

  if (!nextRequests.length) {
    pendingRequestPopupVisible.value = false;
    return;
  }

  if (forceOpen || hasNewRequests) {
    pendingRequestPopupVisible.value = true;
  }
}

async function loadPendingRequests({ silent = false, forceOpen = false } = {}) {
  if (!currentUser.value?.id || !isSupabaseConfigured()) {
    stopPendingRequestPolling();
    clearPendingRequestState();
    return;
  }

  try {
    const requests = await getPendingFriendRequests();
    applyPendingRequests(requests, { forceOpen });
  } catch (error) {
    if (!silent) {
      showFailToast(error.message || '读取好友请求失败，请稍后再试');
    }
  }
}

async function loadGroupChatUnreadState({ silent = false } = {}) {
  if (!currentUser.value?.id) {
    stopGroupChatUnreadPolling();
    clearGroupChatUnreadState();
    return;
  }

  try {
    const groups = await getGroupChats({
      currentUserId: currentUser.value.id,
    });
    unreadGroupChatCount.value = groups.filter((group) => group?.hasUnread).length;
  } catch (error) {
    if (!silent) {
      showFailToast(error.message || '读取群聊未读状态失败，请稍后再试');
    }
  }
}

function handleGroupChatUnreadChanged() {
  loadGroupChatUnreadState({ silent: true });
}

async function handleFriendRequestDecision(request, decision) {
  processingRequestId.value = request.id;

  try {
    const result = await respondToFriendRequest({
      requestId: request.id,
      decision,
    });

    pendingFriendRequests.value = pendingFriendRequests.value.filter((item) => item.id !== request.id);
    pendingRequestSignature.value = pendingFriendRequests.value.map((item) => item.id).join(',');
    pendingRequestPopupVisible.value = pendingFriendRequests.value.length > 0;
    showSuccessToast(result.message);
  } catch (error) {
    showFailToast(error.message || '处理好友请求失败，请稍后再试');
  } finally {
    processingRequestId.value = '';
  }
}

const closeAuthDialog = () => {
  isAuthOpen.value = false;
  authForm.displayName = '';
  authForm.account = '';
  authForm.password = '';
  authForm.confirmPassword = '';
  authForm.favoriteColor = '';
  authForm.birthday = '';
  authForm.studentId = '';
  authFeedback.value = '';
  authFeedbackType.value = 'info';
};

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setAuthFeedback(message, type = 'info') {
  authFeedback.value = message;
  authFeedbackType.value = type;
}

function getSecurityAnswersPayload() {
  return {
    favoriteColor: authForm.favoriteColor,
    birthday: authForm.birthday,
    studentId: authForm.studentId,
  };
}

async function submitAuth() {
  if (authSubmitting.value) {
    return;
  }

  const email = authForm.account.trim();
  const password = authForm.password;

  if (!email) {
    setAuthFeedback('请输入邮箱。', 'error');
    return;
  }

  if (!validateEmail(email)) {
    setAuthFeedback('邮箱格式不正确。', 'error');
    return;
  }

  if (!password) {
    setAuthFeedback(authMode.value === 'reset' ? '请输入新密码。' : '请输入密码。', 'error');
    return;
  }

  if (authMode.value === 'register' || authMode.value === 'reset') {
    if (password.length < 6) {
      setAuthFeedback(authMode.value === 'reset' ? '新密码长度至少 6 位。' : '密码长度至少 6 位。', 'error');
      return;
    }

    if (!authForm.confirmPassword) {
      setAuthFeedback(authMode.value === 'reset' ? '请再次输入新密码。' : '请再次输入密码。', 'error');
      return;
    }

    if (password !== authForm.confirmPassword) {
      setAuthFeedback('两次输入的密码不一致。', 'error');
      return;
    }
  }

  if (authMode.value === 'register') {
    if (!authForm.displayName.trim()) {
      setAuthFeedback('注册时需要填写昵称。', 'error');
      return;
    }

    const hasMissingSecurityAnswer = SECURITY_QUESTION_FIELDS.some(
      (field) => !String(authForm[field] || '').trim(),
    );

    if (hasMissingSecurityAnswer) {
      setAuthFeedback('创建账号前请先完整回答三个安全问题。', 'error');
      return;
    }
  }

  if (authMode.value === 'reset') {
    const hasMissingSecurityAnswer = SECURITY_QUESTION_FIELDS.some(
      (field) => !String(authForm[field] || '').trim(),
    );

    if (hasMissingSecurityAnswer) {
      setAuthFeedback('重置密码前请先完整回答三个安全问题。', 'error');
      return;
    }
  }

  if (!isSupabaseConfigured()) {
    setAuthFeedback(
      '当前还没有配置真实 Supabase 登录环境变量。请在 .env.local 中填写 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY。',
      'warning'
    );
    return;
  }

  authSubmitting.value = true;
  setAuthFeedback('');

  try {
    if (authMode.value === 'login') {
      // 中文注释：这里执行 Supabase Auth 真实登录，并把 access_token 等信息写入 localStorage。
      const authState = await authApi.login({ email, password });
      currentUser.value = authState;
      setAuthFeedback('登录成功，正在进入好友功能。', 'success');
    } else if (authMode.value === 'register') {
      // 中文注释：这里执行 Supabase Auth 真实注册，并把会话信息写入 localStorage。
      const authState = await authApi.register({
        displayName: authForm.displayName.trim(),
        email,
        password,
        securityAnswers: getSecurityAnswersPayload(),
      });

      if (authState.requiresEmailConfirmation) {
        authMode.value = 'login';
        authForm.password = '';
        authForm.confirmPassword = '';
        authForm.favoriteColor = '';
        authForm.birthday = '';
        authForm.studentId = '';
        setAuthFeedback('注册已提交，请先完成邮箱验证，然后再登录。', 'success');
        return;
      }

      currentUser.value = authState;
      setAuthFeedback('注册成功，正在进入好友功能。', 'success');
    } else {
      const result = await authApi.resetPassword({
        email,
        newPassword: password,
        securityAnswers: getSecurityAnswersPayload(),
      });

      authMode.value = 'login';
      authForm.password = '';
      authForm.confirmPassword = '';
      authForm.favoriteColor = '';
      authForm.birthday = '';
      authForm.studentId = '';
      setAuthFeedback(result?.message || '安全问题验证通过，请使用新密码登录。', 'success');
      return;
    }

    closeAuthDialog();
    await router.push(route.fullPath || '/').catch(() => {});
  } catch (error) {
    console.error('[Auth] 认证请求失败', error);
    setAuthFeedback(error.message || '认证请求失败，请稍后重试。', 'error');
  } finally {
    authSubmitting.value = false;
  }
}

async function logout() {
  try {
    await authApi.logout();
  } catch (error) {
    console.error('[Auth] 退出登录失败', error);
  } finally {
    stopPendingRequestPolling();
    stopGroupChatUnreadPolling();
    clearPendingRequestState();
    clearGroupChatUnreadState();
    currentUser.value = null;
    closeProfileMenu();
    closeAuthDialog();
  }
}

function setProfileFeedback(message, type = 'info') {
  profileFeedback.value = message;
  profileFeedbackType.value = type;
}

async function submitProfileUpdate() {
  if (profileSubmitting.value || !currentUser.value) {
    return;
  }

  const displayName = profileForm.displayName.trim();
  const password = profileForm.password;
  const confirmPassword = profileForm.confirmPassword;

  if (!displayName) {
    setProfileFeedback('昵称不能为空。', 'error');
    return;
  }

  if (password && password.length < 6) {
    setProfileFeedback('新密码长度至少 6 位。', 'error');
    return;
  }

  if (password && password !== confirmPassword) {
    setProfileFeedback('两次输入的新密码不一致。', 'error');
    return;
  }

  profileSubmitting.value = true;
  setProfileFeedback('');

  try {
    const nextAuthState = await authApi.updateProfile({ displayName });
    currentUser.value = nextAuthState;

    if (password) {
      await authApi.updatePassword({ password });
    }

    profileForm.password = '';
    profileForm.confirmPassword = '';
    setProfileFeedback(password ? '昵称和密码已更新。' : '昵称已更新。', 'success');
  } catch (error) {
    console.error('[Auth] 更新账户信息失败', error);
    setProfileFeedback(error.message || '更新账户信息失败，请稍后再试。', 'error');
  } finally {
    profileSubmitting.value = false;
  }
}

async function deleteAccount() {
  if (!currentUser.value || authDeletingAccount.value) {
    return;
  }

  const shouldDelete = globalThis.confirm?.(
    '注销后将删除当前账号及其关联资料，且无法恢复。确定继续吗？',
  );

  if (!shouldDelete) {
    return;
  }

  authDeletingAccount.value = true;
  setAuthFeedback('');

  try {
    const result = await deleteCurrentAccount();
    stopPendingRequestPolling();
    stopGroupChatUnreadPolling();
    clearPendingRequestState();
    clearGroupChatUnreadState();
    currentUser.value = null;
    closeAuthDialog();
    setAuthFeedback(result?.message || '账号已注销。', 'success');
  } catch (error) {
    console.error('[Auth] 注销账号失败', error);
    setAuthFeedback(error.message || '注销账号失败，请稍后重试。', 'error');
  } finally {
    authDeletingAccount.value = false;
  }
}

const avatarLabel = computed(() => currentUser.value?.username?.slice(0, 1) || '游');
const profileLabel = computed(() => currentUser.value?.username || '登录 / 注册');
const profileStatus = computed(() => {
  if (currentUser.value) {
    return '已登录';
  }

  return isSupabaseConfigured() ? '未登录' : '未配置认证';
});

// 上传图片相关状态
const selectedImageFile = ref(null);
const selectedImagePreviewUrl = ref('');
const uploadedImageUrl = ref('');
const uploadedImageTitle = ref('');
const uploadedImageDescription = ref('');
const isUploadingImage = ref(false);
const uploadError = ref('');
const uploadForm = reactive({
  title: '',
  description: '',
});
const uploadLocation = reactive({
  lat: null,
  lng: null,
  status: 'idle',
  message: '',
});
const cropImageElement = ref(null);
const cropFrameRect = ref({ left: 0, top: 0, width: 0, height: 0 });
const cropImageMetrics = ref({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
const isCropDragging = ref(false);
const cropDragOrigin = ref({ x: 0, y: 0 });
const isCropEditorOpen = ref(false);
const isCropReady = computed(
  () => cropFrameRect.value.width > 12 && cropFrameRect.value.height > 12 && Boolean(selectedImagePreviewUrl.value),
);

function resetCropState() {
  cropFrameRect.value = { left: 0, top: 0, width: 0, height: 0 };
  cropImageMetrics.value = { width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 };
  isCropDragging.value = false;
  cropDragOrigin.value = { x: 0, y: 0 };
}

function revokeSelectedPreviewUrl() {
  if (selectedImagePreviewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(selectedImagePreviewUrl.value);
  }
}

function clearUploadDraft() {
  selectedImageFile.value = null;
  revokeSelectedPreviewUrl();
  selectedImagePreviewUrl.value = '';
  resetCropState();
  isCropEditorOpen.value = false;
}

function resetUploadLocation() {
  uploadLocation.lat = null;
  uploadLocation.lng = null;
  uploadLocation.status = 'idle';
  uploadLocation.message = '';
}

function requestUploadLocation() {
  if (!navigator?.geolocation) {
    uploadLocation.status = 'error';
    uploadLocation.message = '当前浏览器不支持定位，请换一个浏览器再试。';
    return;
  }

  uploadLocation.status = 'loading';
  uploadLocation.message = '正在获取当前位置…';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      uploadLocation.lat = Number(position.coords.latitude);
      uploadLocation.lng = Number(position.coords.longitude);
      uploadLocation.status = 'success';
      uploadLocation.message = '已获取当前位置，提交时会自动一并保存。';
    },
    (error) => {
      uploadLocation.lat = null;
      uploadLocation.lng = null;
      uploadLocation.status = 'error';

      if (error?.code === error.PERMISSION_DENIED) {
        uploadLocation.message = '你拒绝了定位权限，请允许定位后再上传。';
        return;
      }

      if (error?.code === error.POSITION_UNAVAILABLE) {
        uploadLocation.message = '暂时无法获取位置，请稍后重试。';
        return;
      }

      if (error?.code === error.TIMEOUT) {
        uploadLocation.message = '定位超时了，请再试一次。';
        return;
      }

      uploadLocation.message = '获取位置失败，请稍后重试。';
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000,
    },
  );
}

function clampCropPosition(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function handleCropImageLoad(event) {
  const element = event?.target;

  if (!element) {
    return;
  }

  cropImageMetrics.value = {
    width: element.clientWidth,
    height: element.clientHeight,
    naturalWidth: element.naturalWidth,
    naturalHeight: element.naturalHeight,
  };

  if (!cropFrameRect.value.width || !cropFrameRect.value.height) {
    const frameWidth = Math.max(120, Math.round(element.clientWidth * 0.68));
    const frameHeight = Math.max(120, Math.round(element.clientHeight * 0.68));
    cropFrameRect.value = {
      left: Math.max(0, Math.round((element.clientWidth - frameWidth) / 2)),
      top: Math.max(0, Math.round((element.clientHeight - frameHeight) / 2)),
      width: Math.min(frameWidth, element.clientWidth),
      height: Math.min(frameHeight, element.clientHeight),
    };
  }
}

function startCropSelection(event) {
  if (!selectedImagePreviewUrl.value || !cropImageElement.value) {
    return;
  }

  const rect = cropImageElement.value.getBoundingClientRect();
  const startX = clampCropPosition(event.clientX - rect.left, 0, rect.width);
  const startY = clampCropPosition(event.clientY - rect.top, 0, rect.height);

  cropDragOrigin.value = { x: startX, y: startY };
  cropFrameRect.value = { left: startX, top: startY, width: 0, height: 0 };
  isCropDragging.value = true;
}

function updateCropSelection(event) {
  if (!isCropDragging.value || !cropImageElement.value) {
    return;
  }

  const rect = cropImageElement.value.getBoundingClientRect();
  const currentX = clampCropPosition(event.clientX - rect.left, 0, rect.width);
  const currentY = clampCropPosition(event.clientY - rect.top, 0, rect.height);
  const origin = cropDragOrigin.value;

  cropFrameRect.value = {
    left: Math.min(origin.x, currentX),
    top: Math.min(origin.y, currentY),
    width: Math.abs(currentX - origin.x),
    height: Math.abs(currentY - origin.y),
  };
}

function stopCropSelection() {
  isCropDragging.value = false;
}

async function applyCropSelection() {
  if (!isCropReady.value || !selectedImageFile.value || !cropImageElement.value) {
    return;
  }

  const frame = cropFrameRect.value;
  const metrics = cropImageMetrics.value;

  if (!metrics.width || !metrics.height || !metrics.naturalWidth || !metrics.naturalHeight) {
    return;
  }

  const scaleX = metrics.naturalWidth / metrics.width;
  const scaleY = metrics.naturalHeight / metrics.height;
  const sourceX = Math.round(frame.left * scaleX);
  const sourceY = Math.round(frame.top * scaleY);
  const sourceWidth = Math.max(1, Math.round(frame.width * scaleX));
  const sourceHeight = Math.max(1, Math.round(frame.height * scaleY));

  const canvas = document.createElement('canvas');
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    showFailToast('暂时无法裁剪图片，请稍后再试');
    return;
  }

  ctx.drawImage(
    cropImageElement.value,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    sourceWidth,
    sourceHeight,
  );

  const mimeType = selectedImageFile.value.type || 'image/jpeg';
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, 0.92));

  if (!blob) {
    showFailToast('裁剪失败，请重新框选一次');
    return;
  }

  const nextFile = new File([blob], selectedImageFile.value.name, {
    type: blob.type || mimeType,
    lastModified: Date.now(),
  });

  selectedImageFile.value = nextFile;
  revokeSelectedPreviewUrl();
  selectedImagePreviewUrl.value = URL.createObjectURL(blob);
  resetCropState();
  isCropEditorOpen.value = false;
  showSuccessToast('已应用裁剪');
}

function handleSelectImage(event) {
  const file = event?.target?.files?.[0];

  if (!file) {
    clearUploadDraft();
    return;
  }

  selectedImageFile.value = file;
  revokeSelectedPreviewUrl();
  selectedImagePreviewUrl.value = URL.createObjectURL(file);
  resetCropState();
  isCropEditorOpen.value = true;
  uploadError.value = '';
}

async function submitUploadImage() {
  if (isUploadingImage.value) {
    return;
  }

  if (!uploadForm.title.trim()) {
    uploadError.value = '请填写照片标题。';
    return;
  }

  if (!uploadForm.description.trim()) {
    uploadError.value = '请填写照片描述。';
    return;
  }

  if (!selectedImageFile.value) {
    uploadError.value = '请选择图片文件。';
    return;
  }

  if (uploadLocation.status !== 'success' || uploadLocation.lat === null || uploadLocation.lng === null) {
    uploadError.value = uploadLocation.message || '请先允许定位，获取当前位置后再上传。';
    showFailToast(uploadError.value);
    return;
  }

  isUploadingImage.value = true;
  uploadError.value = '';
  uploadedImageUrl.value = '';
  uploadedImageTitle.value = '';
  uploadedImageDescription.value = '';

  try {
    const formData = new FormData();
    formData.append('image', selectedImageFile.value);
    formData.append('title', uploadForm.title.trim());
    formData.append('description', uploadForm.description.trim());
    formData.append('lat', String(uploadLocation.lat));
    formData.append('lng', String(uploadLocation.lng));

    // 中文注释：这里连接后端图片上传接口 /api/ugc，使用 FormData 以 multipart/form-data 发送图片文件。
    // 注意：使用 fetch/axios 发送 FormData 时，不要手动写死 Content-Type，浏览器会自动补上 boundary。
    const result = await uploadApi.uploadGardenImage(formData);
    uploadedImageUrl.value = result?.image_url || result?.imageUrl || '';
    uploadedImageTitle.value = result?.title || uploadForm.title.trim();
    uploadedImageDescription.value = result?.description || uploadForm.description.trim();

    if (!uploadedImageUrl.value) {
      throw new Error('上传成功但未拿到图片地址，请检查后端返回字段 image_url/imageUrl。');
    }

    showSuccessToast('上传成功');
  } catch (error) {
    console.error('[Upload] 上传图片失败', error);
    uploadError.value = error.message || '上传失败，请稍后再试。';
    showFailToast(uploadError.value);
  } finally {
    isUploadingImage.value = false;
  }
}

let authSubscription = null;

onMounted(async () => {
  try {
    const restored = await authApi.restore();
    if (restored?.id) {
      currentUser.value = restored;
      startPendingRequestPolling();
      loadPendingRequests({ silent: true, forceOpen: true });
      startGroupChatUnreadPolling();
      loadGroupChatUnreadState({ silent: true });
    }
  } catch {
    // 这里不打断用户浏览体验，详细错误在 authApi 内部已有 console.error
  }

  authSubscription = authApi.subscribe((nextUser) => {
    currentUser.value = nextUser;

    if (nextUser?.id) {
      startPendingRequestPolling();
      loadPendingRequests({ silent: true, forceOpen: true });
      startGroupChatUnreadPolling();
      loadGroupChatUnreadState({ silent: true });
      return;
    }

    stopPendingRequestPolling();
    stopGroupChatUnreadPolling();
    clearPendingRequestState();
    clearGroupChatUnreadState();
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleWindowClickForProfileMenu);
  }
  window.addEventListener('group-chats-updated', handleGroupChatUnreadChanged);
});

onUnmounted(() => {
  stopPendingRequestPolling();
  stopGroupChatUnreadPolling();
  window.removeEventListener('group-chats-updated', handleGroupChatUnreadChanged);
  authSubscription?.data?.subscription?.unsubscribe?.();
  revokeSelectedPreviewUrl();

  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleWindowClickForProfileMenu);
  }
});

watch(
  () => currentUser.value?.id || '',
  async (nextUserId, prevUserId) => {
    if (nextUserId === prevUserId) {
      return;
    }

    aiConversationsLoadedUserId.value = '';

    if (nextUserId) {
      if (activeFeature.value === 'ai') {
        await loadAiConversations(true);
      }

      return;
    }

    aiConversations.value = [];
    activeAiConversationId.value = '';

    if (activeFeature.value === 'ai') {
      ensureAiConversationForCurrentPage(true);
    }
  },
);
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <div class="header-inner">
        <RouterLink to="/" class="brand-link">
          <span class="brand-seal">平</span>
          <span class="brand-copy">
            <strong class="brand-title">苏州慢游</strong>
            <small class="brand-subtitle">Suzhou · Gardens · Museums · Heritage</small>
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
              <span
                v-if="feature.id === 'friends' && hasFriendFeatureNotification"
                class="nav-link__dot"
                aria-label="存在好友或群聊未读提醒"
              />
            </span>
            <span class="nav-link__text">{{ feature.label }}</span>
          </button>
        </nav>

        <div class="header-actions">
          <div ref="profileMenuRef" class="profile-menu-wrap">
            <button
              type="button"
              class="profile-button"
              :aria-label="currentUser ? '打开账户菜单' : '打开登录弹窗'"
              @click.stop="toggleProfileMenu"
            >
                <span class="profile-avatar" :class="{ 'profile-avatar--filled': currentUser }">
                  <span class="profile-status-dot" :class="{ 'profile-status-dot--active': currentUser }" />
                  <span v-if="hasPendingFriendRequests" class="profile-request-badge">
                    {{ pendingFriendRequests.length > 9 ? '9+' : pendingFriendRequests.length }}
                  </span>
                  <span>{{ avatarLabel }}</span>
                </span>
                <span class="profile-copy">
                  <span class="profile-label">{{ profileLabel }}</span>
                  <small class="profile-note">{{ profileStatus }}</small>
              </span>
            </button>

            <div v-if="currentUser && isProfileMenuOpen" class="profile-dropdown" @click.stop>
              <div class="profile-dropdown__head">
                <strong>{{ currentUser.username }}</strong>
                <span>{{ currentUser.email }}</span>
              </div>

              <form class="profile-dropdown__form" @submit.prevent="submitProfileUpdate">
                <label class="field">
                  <span>昵称</span>
                  <input
                    v-model.trim="profileForm.displayName"
                    type="text"
                    placeholder="输入新的昵称"
                    autocomplete="nickname"
                  />
                </label>

                <label class="field">
                  <span>新密码</span>
                  <input
                    v-model="profileForm.password"
                    type="password"
                    placeholder="留空则不修改密码"
                    autocomplete="new-password"
                  />
                </label>

                <label class="field">
                  <span>确认新密码</span>
                  <input
                    v-model="profileForm.confirmPassword"
                    type="password"
                    placeholder="再次输入新密码"
                    autocomplete="new-password"
                  />
                </label>

                <p v-if="profileFeedback" :class="['auth-feedback', `is-${profileFeedbackType}`]">
                  {{ profileFeedback }}
                </p>

                <div class="profile-dropdown__actions">
                  <button type="submit" class="dialog__primary" :disabled="profileSubmitting">
                    {{ profileSubmitting ? '保存中…' : '保存修改' }}
                  </button>
                  <button type="button" class="dialog__ghost" @click="logout" :disabled="profileSubmitting">
                    退出登录
                  </button>
                </div>
                <div class="profile-dropdown__actions">
                  <button type="button" class="dialog__ghost" @click="openAuthDialog('profile')">
                    更多账户操作
                  </button>
                </div>
              </form>
            </div>
          </div>
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

    <button type="button" class="favorites-fab" aria-label="打开收藏夹" @click="openFavorites">
      <span class="favorites-fab__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="m12 4.8 2.18 4.41 4.87.71-3.52 3.43.83 4.85L12 15.91 7.64 18.2l.83-4.85-3.52-3.43 4.87-.71L12 4.8Z"
            stroke="currentColor"
            stroke-linejoin="round"
            stroke-width="1.7"
          />
        </svg>
      </span>
      <span class="favorites-fab__label">收藏夹</span>
    </button>

    <transition name="veil" appear>
      <div
        v-if="isFeatureOpen"
        class="overlay"
        :class="{ 'overlay--fullscreen': activeFeature === 'ai' && isAiFullscreen }"
        role="dialog"
        aria-modal="true"
        @click.self="closeFeature"
      >
        <section
          class="dialog dialog--feature"
          :class="{ 'dialog--ai': activeFeature === 'ai', 'dialog--ai-fullscreen': activeFeature === 'ai' && isAiFullscreen }"
          @click.stop
        >
          <header class="dialog__header">
            <div class="dialog__intro">
              <p class="dialog__eyebrow">{{ activeFeatureInfo?.eyebrow }}</p>
              <h2 class="dialog__title">{{ activeFeatureInfo?.label }}</h2>
            </div>
            <button type="button" class="dialog__close" @click="closeFeature">关闭</button>
          </header>

          <p class="dialog__copy">{{ activeFeatureInfo?.description }}</p>

          <template v-if="activeFeature === 'friends'">
            <div v-if="!currentUser" class="feature-context">
              <span>需要登录</span>
              <strong>好友功能需要先登录</strong>
              <p>请先完成真实登录后再添加好友、查看好友列表。</p>

              <div class="dialog__actions">
                <button type="button" class="dialog__primary" @click="openAuthDialog('login')">去登录</button>
                <button type="button" class="dialog__ghost" @click="openAuthDialog('register')">去注册</button>
              </div>
            </div>

            <div v-else class="friends-embed">
              <!-- 中文注释：这里嵌入好友页面组件，它会调用后端接口 /api/friends/add 与 /api/friends/list 完成加好友与好友列表。 -->
              <FriendsPage :show-nav-bar="false" />
            </div>
          </template>

          <template v-else-if="activeFeature === 'ai'">
            <div class="ai-shell">
              <aside class="ai-sidebar" aria-label="历史会话">
                <button type="button" class="ai-sidebar__new" @click="startNewAiConversation">
                  <span aria-hidden="true">+</span>
                  新建对话
                </button>

                <div class="ai-sidebar__list" role="list">
                  <div
                    v-for="conversation in aiConversations"
                    :key="conversation.id"
                    role="listitem"
                    class="ai-sidebar__row"
                  >
                    <button
                      type="button"
                      class="ai-sidebar__item"
                      :class="{ 'is-active': conversation.id === activeAiConversationId }"
                      @click="selectAiConversation(conversation.id)"
                    >
                      <strong class="ai-sidebar__title">{{ conversation.title }}</strong>
                      <span class="ai-sidebar__subtitle">{{ deriveAiConversationPreview(conversation) }}</span>
                    </button>
                    <div class="ai-sidebar__actions">
                      <button
                        type="button"
                        class="ai-sidebar__rename"
                        :disabled="isAiLoading"
                        :aria-label="`重命名会话 ${conversation.title}`"
                        @click="promptRenameAiConversation(conversation)"
                      >
                        改
                      </button>
                      <button
                        type="button"
                        class="ai-sidebar__delete"
                        :disabled="isAiLoading || aiConversationDeletingId === conversation.id"
                        :aria-label="`删除会话 ${conversation.title}`"
                        @click="deleteAiConversation(conversation.id)"
                      >
                        {{ aiConversationDeletingId === conversation.id ? '...' : '删' }}
                      </button>
                    </div>
                  </div>
                </div>
              </aside>

              <section class="ai-main" aria-label="AI 伴游对话">
                <header class="ai-main__header">
                  <div class="ai-main__context">
                    <span>当前导览页面</span>
                    <strong>{{ activeAiPageLabel }}</strong>
                    <p>{{ activeAiJourney.pace }}</p>
                  </div>

                  <div class="ai-main__header-actions">
                    <button type="button" class="ai-main__resize" @click="toggleAiFullscreen">
                      {{ isAiFullscreen ? '退出全屏' : '全屏放大' }}
                    </button>
                  </div>
                </header>

                <div class="ai-main__body">
                  <div class="ai-starters" v-if="aiShouldShowStarter">
                    <p class="ai-starters__label">你可以从这些问题开始</p>
                    <div class="prompt-chips">
                      <button
                        v-for="prompt in activeAiPrompts"
                        :key="prompt"
                        type="button"
                        class="prompt-chip"
                        @click="sendAiMessage(prompt)"
                      >
                        {{ prompt }}
                      </button>
                    </div>
                  </div>

                  <div ref="aiChatScroller" class="ai-chat ai-chat--main" aria-live="polite">
                    <article
                      v-for="message in aiMessages"
                      :key="message.id"
                      :class="[
                        'message-row',
                        message.role === 'user' ? 'message-row--user' : 'message-row--assistant',
                      ]"
                    >
                      <div class="message-avatar" aria-hidden="true">
                        {{ message.role === 'user' ? '我' : 'AI' }}
                      </div>
                      <div
                        :class="[
                          'message-bubble',
                          message.role === 'user' ? 'message-bubble--user' : 'message-bubble--assistant',
                        ]"
                      >
                        <span class="message-bubble__role">{{ message.role === 'user' ? '我' : 'AI 伴游' }}</span>
                        <p>{{ message.content }}</p>
                        <small v-if="message.hint">{{ message.hint }}</small>
                      </div>
                    </article>

                    <article
                      v-if="isActiveAiConversationLoading"
                      class="message-row message-row--assistant message-row--loading"
                    >
                      <div class="message-avatar" aria-hidden="true">AI</div>
                      <div class="message-bubble message-bubble--assistant is-loading">
                        <span class="message-bubble__role">AI 伴游</span>
                        <p>正在整理当前页面的慢游建议…</p>
                      </div>
                    </article>
                  </div>
                </div>

                <p v-if="aiError" class="feature-feedback feature-feedback--ai">{{ aiError }}</p>

                <form class="ai-composer" @submit.prevent="sendAiMessage()">
                  <label class="ai-composer__field">
                    <textarea
                      ref="aiComposerInput"
                      v-model="aiDraft"
                      rows="1"
                      aria-label="输入你的问题"
                      placeholder="输入问题，Enter 发送，Shift + Enter 换行"
                      @compositionstart="isAiComposing = true"
                      @compositionend="isAiComposing = false"
                      @keydown="handleAiComposerKeydown"
                    />
                  </label>

                  <button
                    type="submit"
                    class="dialog__primary ai-composer__send"
                    :disabled="isAiLoading || !aiDraft.trim()"
                  >
                    发送
                  </button>
                </form>
              </section>
            </div>
          </template>

          <template v-else-if="activeFeature === 'upload'">
            <div class="feature-context">
              <span>上传提示</span>
              <strong>上传园林照片</strong>
              <p>上传照片时补充标题和描述，上传成功后会在下方显示成完整卡片。</p>
              <p
                class="upload-location-status"
                :class="{
                  'is-loading': uploadLocation.status === 'loading',
                  'is-success': uploadLocation.status === 'success',
                  'is-error': uploadLocation.status === 'error',
                }"
              >
                {{ uploadLocation.message || '打开表单后会自动获取当前位置。' }}
              </p>
            </div>

            <form class="dialog__form" @submit.prevent="submitUploadImage">
              <label class="field field--full">
                <span>照片标题</span>
                <input v-model="uploadForm.title" type="text" placeholder="例如：雨后的拙政园回廊" />
              </label>

              <label class="field field--full">
                <span>照片描述</span>
                <textarea
                  v-model="uploadForm.description"
                  rows="3"
                  placeholder="写一句你拍下这张照片时的感受或画面描述"
                />
              </label>

              <label class="field field--full">
                <span>选择图片文件</span>
                <input class="upload-picker__input" type="file" accept="image/*" @change="handleSelectImage" />
                <div class="upload-picker">
                  <span class="upload-picker__camera" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 6.5 9.2 5h5.6L16 6.5H18A2.5 2.5 0 0 1 20.5 9v7A2.5 2.5 0 0 1 18 18.5H6A2.5 2.5 0 0 1 3.5 16V9A2.5 2.5 0 0 1 6 6.5h2Z"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linejoin="round"
                      />
                      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" stroke-width="1.6" />
                    </svg>
                  </span>
                  <div class="upload-picker__copy">
                    <strong>{{ selectedImageFile ? '更换照片' : '选择照片' }}</strong>
                    <p>{{ selectedImageFile?.name || '支持 JPG / PNG，选择后会直接显示在这里' }}</p>
                  </div>
                </div>
              </label>

              <div v-if="selectedImagePreviewUrl && !uploadedImageUrl" class="upload-preview upload-preview--draft">
                <p class="upload-preview__label">你选择的照片</p>
                <img :src="selectedImagePreviewUrl" alt="selected" class="upload-preview__image" />
                <div class="crop-stage__actions">
                  <span>如果想调整画面范围，可以再重新裁一下。</span>
                  <button type="button" class="dialog__ghost" @click="isCropEditorOpen = true">重新调整范围</button>
                </div>
              </div>

              <div class="dialog__actions dialog__actions--compact">
                <button
                  type="button"
                  class="dialog__primary"
                  :disabled="!selectedImageFile || !uploadForm.title.trim() || !uploadForm.description.trim() || isUploadingImage"
                  @click="submitUploadImage"
                >
                  {{ isUploadingImage ? '正在上传…' : '开始上传' }}
                </button>
                <button
                  type="button"
                  class="dialog__ghost"
                  @click="
                    clearUploadDraft();
                    uploadedImageUrl = '';
                    uploadedImageTitle = '';
                    uploadedImageDescription = '';
                  "
                >
                  清空内容
                </button>
              </div>
            </form>

            <p v-if="uploadError" class="feature-feedback">{{ uploadError }}</p>

            <div v-if="uploadedImageUrl" class="upload-preview">
              <p class="upload-preview__label">上传后的显示效果</p>
              <img :src="uploadedImageUrl" alt="uploaded" class="upload-preview__image" />
              <div class="upload-preview__meta">
                <strong>{{ uploadedImageTitle }}</strong>
                <p>{{ uploadedImageDescription }}</p>
              </div>
            </div>
          </template>
        </section>
      </div>
    </transition>

    <transition name="veil">
      <div
        v-if="isCropEditorOpen && selectedImagePreviewUrl"
        class="overlay"
        role="dialog"
        aria-modal="true"
        @click.self="isCropEditorOpen = false"
      >
        <section class="dialog dialog--feature dialog--crop" @click.stop>
          <header class="dialog__header">
            <div class="dialog__intro">
              <p class="dialog__eyebrow">Crop Photo</p>
              <h2 class="dialog__title">裁剪照片</h2>
            </div>
            <button type="button" class="dialog__close" @click="isCropEditorOpen = false">关闭</button>
          </header>

          <p class="dialog__copy">选图后先框选范围，点“应用裁剪”后再回到上传表单。</p>

          <div
            class="crop-stage crop-stage--modal"
            @mousedown.prevent="startCropSelection"
            @mousemove.prevent="updateCropSelection"
            @mouseup="stopCropSelection"
            @mouseleave="stopCropSelection"
          >
            <img
              ref="cropImageElement"
              :src="selectedImagePreviewUrl"
              alt="crop target"
              class="upload-preview__image crop-stage__image"
              @load="handleCropImageLoad"
            />
            <div
              v-if="cropFrameRect.width > 0 && cropFrameRect.height > 0"
              class="crop-stage__selection"
              :style="{
                left: `${cropFrameRect.left}px`,
                top: `${cropFrameRect.top}px`,
                width: `${cropFrameRect.width}px`,
                height: `${cropFrameRect.height}px`,
              }"
            />
          </div>

          <div class="dialog__actions">
            <button type="button" class="dialog__ghost" @click="isCropEditorOpen = false">暂不裁剪</button>
            <button type="button" class="dialog__primary" :disabled="!isCropReady" @click="applyCropSelection">
              应用裁剪
            </button>
          </div>
        </section>
      </div>
    </transition>

    <transition name="veil" appear>
      <div v-if="isAuthOpen" class="overlay" role="dialog" aria-modal="true" @click.self="closeAuthDialog">
        <section class="dialog" @click.stop>
          <header class="dialog__header">
            <h2 class="dialog__title">
              {{
                currentUser
                  ? '账户信息'
                  : authMode === 'login'
                    ? '登录账户'
                    : authMode === 'register'
                      ? '创建账户'
                      : '重置密码'
              }}
            </h2>
            <button type="button" class="dialog__close" @click="closeAuthDialog">关闭</button>
          </header>

          <div v-if="!currentUser" class="dialog__tabs">
            <button
              type="button"
              class="tab-button"
              :class="{ 'is-active': authMode === 'login' }"
              @click="setAuthMode('login')"
            >
              登录
            </button>
            <button
              type="button"
              class="tab-button"
              :class="{ 'is-active': authMode === 'register' }"
              @click="setAuthMode('register')"
            >
              注册
            </button>
            <button
              type="button"
              class="tab-button"
              :class="{ 'is-active': authMode === 'reset' }"
              @click="setAuthMode('reset')"
            >
              重置密码
            </button>
          </div>

          <p v-if="!currentUser && !isSupabaseConfigured()" class="auth-feedback is-warning">
            当前尚未配置真实 Supabase 登录环境变量，所以登录、注册和重置密码现在都不可用。请在
            `.env.local` 中填写 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 后重启前端。
          </p>

          <template v-if="currentUser">
            <div class="feature-context">
              <span>当前账户</span>
              <strong>{{ currentUser.username }}</strong>
              <p>{{ currentUser.email }}</p>
            </div>

            <div class="dialog__actions">
              <button
                v-if="hasPendingFriendRequests"
                type="button"
                class="dialog__ghost"
                @click="pendingRequestPopupVisible = true"
              >
                好友请求 {{ pendingFriendRequests.length }}
              </button>
              <button type="button" class="dialog__primary" @click="logout">退出登录</button>
              <button
                type="button"
                class="dialog__ghost"
                :disabled="authDeletingAccount"
                @click="deleteAccount"
              >
                {{ authDeletingAccount ? '注销中…' : '注销账号' }}
              </button>
              <button type="button" class="dialog__ghost" @click="closeAuthDialog">关闭</button>
            </div>
          </template>

          <form v-else class="dialog__form" @submit.prevent="submitAuth">
            <label v-if="authMode === 'register'" class="field">
              <span>昵称</span>
              <input
                v-model.trim="authForm.displayName"
                type="text"
                placeholder="平江旅人"
                autocomplete="nickname"
              />
            </label>

            <label class="field">
              <span>邮箱</span>
              <input
                v-model.trim="authForm.account"
                type="email"
                placeholder="例如：you@example.com"
                autocomplete="username"
              />
            </label>

            <label class="field">
              <span>{{ authMode === 'reset' ? '新密码' : '密码' }}</span>
              <input
                v-model="authForm.password"
                type="password"
                :placeholder="authMode === 'reset' ? '请输入新密码' : '请输入密码'"
                :autocomplete="authMode === 'login' ? 'current-password' : 'new-password'"
              />
            </label>

            <label v-if="authMode === 'register' || authMode === 'reset'" class="field">
              <span>{{ authMode === 'reset' ? '确认新密码' : '确认密码' }}</span>
              <input
                v-model="authForm.confirmPassword"
                type="password"
                :placeholder="authMode === 'reset' ? '再次输入新密码' : '再次输入密码'"
                autocomplete="new-password"
              />
            </label>

            <template v-if="authMode === 'register' || authMode === 'reset'">
              <p class="auth-security-copy">
                {{
                  authMode === 'register'
                    ? '创建账号时需要设置三个安全问题答案，后续忘记密码时会用它们进行核对。'
                    : '请输入注册邮箱，并回答注册时设置的三个安全问题。验证通过后才能重置密码。'
                }}
              </p>

              <label
                v-for="item in securityQuestionItems"
                :key="item.field"
                class="field"
              >
                <span>{{ item.prompt }}</span>
                <input
                  v-model="authForm[item.field]"
                  :type="item.type"
                  :placeholder="item.type === 'date' ? '请选择日期' : '请输入答案'"
                  :autocomplete="item.autocomplete"
                />
              </label>
            </template>

            <p v-if="authFeedback" :class="['auth-feedback', `is-${authFeedbackType}`]">
              {{ authFeedback }}
            </p>

            <div class="dialog__actions">
              <button type="submit" class="dialog__primary" :disabled="authSubmitting">
                {{
                  authSubmitting
                    ? '提交中…'
                    : authMode === 'login'
                      ? '立即登录'
                      : authMode === 'register'
                        ? '创建账号'
                        : '验证并重置'
                }}
              </button>
              <button type="button" class="dialog__ghost" @click="closeAuthDialog" :disabled="authSubmitting">取消</button>
            </div>
          </form>
        </section>
      </div>
    </transition>

    <FriendRequestPopup
      v-if="currentUser"
      :show="pendingRequestPopupVisible"
      :requests="pendingFriendRequests"
      :processing-id="processingRequestId"
      @update:show="pendingRequestPopupVisible = $event"
      @accept="handleFriendRequestDecision($event, 'accepted')"
      @reject="handleFriendRequestDecision($event, 'rejected')"
    />
  </div>
</template>

<style>
.profile-request-badge {
  position: absolute;
  top: -0.4rem;
  right: -0.55rem;
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0 0.24rem;
  border-radius: 999px;
  background: #ee4f44;
  color: #fff;
  font-size: 0.68rem;
  line-height: 1.15rem;
  text-align: center;
  box-shadow: 0 0 0 2px rgba(250, 250, 249, 0.92);
}

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
  overflow-y: auto;
  overscroll-behavior: contain;
  background: rgba(28, 25, 23, 0.5);
  backdrop-filter: blur(16px);
  z-index: 80;
}

.favorites-fab {
  position: fixed;
  right: 1.4rem;
  bottom: 1.6rem;
  width: 4.35rem;
  height: 4.35rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.86);
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 16px 30px rgba(37, 33, 28, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.94);
  color: rgba(56, 56, 56, 0.92);
  display: grid;
  place-items: center;
  gap: 0.16rem;
  z-index: 60;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    filter 0.22s ease;
}

.favorites-fab:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 20px 36px rgba(37, 33, 28, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
  border-color: rgba(255, 255, 255, 0.96);
  filter: none;
}

.favorites-fab__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 999px;
  background: rgba(248, 248, 248, 0.92);
  color: rgba(88, 88, 88, 0.9);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.favorites-fab__icon svg {
  width: 1.08rem;
  height: 1.08rem;
}

.favorites-fab__label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  transform: translateX(0.06em);
  color: rgba(74, 74, 74, 0.9);
}

.overlay--fullscreen {
  place-items: stretch;
  padding: 0;
}

.dialog {
  width: min(92vw, 500px);
  max-height: calc(100dvh - 3rem);
  border-radius: 28px;
  border: 1px solid rgba(250, 250, 249, 0.18);
  background: rgba(250, 250, 249, 0.94);
  box-shadow: 0 32px 72px rgba(28, 25, 23, 0.22);
  padding: 1.25rem 1.3rem 1.35rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.dialog::-webkit-scrollbar {
  width: 10px;
}

.dialog::-webkit-scrollbar-track {
  background: transparent;
  margin: 14px 6px 14px 0;
}

.dialog::-webkit-scrollbar-thumb {
  border-radius: 999px;
  border: 2px solid rgba(250, 250, 249, 0.92);
  background: linear-gradient(180deg, rgba(160, 180, 169, 0.8), rgba(120, 145, 132, 0.82));
}

.dialog::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(145, 168, 156, 0.9), rgba(104, 129, 116, 0.92));
}

.dialog {
  scrollbar-width: thin;
  scrollbar-color: rgba(120, 145, 132, 0.82) transparent;
}

.dialog--feature {
  width: min(94vw, 680px);
}

.dialog--crop {
  width: min(94vw, 760px);
}

.dialog--ai {
  width: min(98vw, 1120px);
  height: calc(100dvh - 3rem);
  max-height: calc(100dvh - 3rem);
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  scrollbar-gutter: stable both-edges;
}

.dialog--ai-fullscreen {
  width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  border-radius: 0;
  border: 0;
  box-shadow: none;
}

.dialog--ai .dialog__header {
  padding: 1.15rem 1.2rem 0.85rem;
}

.dialog--ai .dialog__copy {
  display: none;
}

.ai-shell {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  border-top: 1px solid rgba(28, 25, 23, 0.06);
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

.profile-menu-wrap {
  position: relative;
}

.profile-dropdown {
  position: absolute;
  top: calc(100% + 0.8rem);
  right: 0;
  width: min(88vw, 360px);
  padding: 1rem;
  border-radius: 24px;
  border: 1px solid rgba(28, 25, 23, 0.1);
  background: rgba(250, 250, 249, 0.98);
  box-shadow: 0 24px 56px rgba(28, 25, 23, 0.18);
  display: grid;
  gap: 0.9rem;
  z-index: 30;
}

.profile-dropdown__head {
  display: grid;
  gap: 0.18rem;
}

.profile-dropdown__head strong {
  color: var(--ink-900);
  font-size: 1rem;
}

.profile-dropdown__head span {
  color: var(--ink-600);
  font-size: 0.88rem;
}

.profile-dropdown__form {
  display: grid;
  gap: 0.85rem;
}

.profile-dropdown__actions {
  display: grid;
  gap: 0.7rem;
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

.upload-location-status {
  margin: 0.15rem 0 0;
  padding: 0.72rem 0.85rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(28, 25, 23, 0.08);
  color: var(--ink-700);
  font-size: 0.92rem;
  line-height: 1.55;
}

.upload-location-status.is-loading {
  background: rgba(95, 127, 114, 0.08);
  border-color: rgba(95, 127, 114, 0.14);
}

.upload-location-status.is-success {
  background: rgba(24, 121, 78, 0.1);
  border-color: rgba(24, 121, 78, 0.16);
  color: rgba(24, 121, 78, 0.95);
}

.upload-location-status.is-error {
  background: rgba(159, 63, 52, 0.08);
  border-color: rgba(159, 63, 52, 0.12);
  color: var(--cinnabar-700);
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

.auth-security-copy {
  margin: 0;
  padding: 0.85rem 0.95rem;
  border-radius: 18px;
  background: rgba(95, 127, 114, 0.08);
  color: var(--ink-700);
  font-size: 0.92rem;
  line-height: 1.6;
}

.ai-sidebar {
  background: rgba(28, 25, 23, 0.06);
  border-right: 1px solid rgba(28, 25, 23, 0.08);
  padding: 1rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  min-height: 0;
}

.ai-sidebar__new {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 2.85rem;
  border-radius: 999px;
  border: 1px solid rgba(28, 25, 23, 0.14);
  background: rgba(255, 255, 255, 0.65);
  color: var(--ink-900);
  letter-spacing: 0.08em;
  transition:
    transform 0.25s ease,
    background-color 0.25s ease,
    border-color 0.25s ease;
}

.ai-sidebar__new:hover {
  transform: translateY(-1px);
}

.ai-sidebar__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: grid;
  grid-auto-rows: min-content;
  gap: 0.5rem;
  align-content: start;
  padding-right: 0.2rem;
}

.ai-sidebar__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.45rem;
  align-items: stretch;
}

.ai-sidebar__actions {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.ai-sidebar__item {
  width: 100%;
  text-align: left;
  padding: 0.75rem 0.8rem;
  border-radius: 18px;
  border: 1px solid rgba(28, 25, 23, 0.12);
  background: rgba(255, 255, 255, 0.55);
  display: grid;
  gap: 0.28rem;
  transition:
    border-color 0.25s ease,
    background-color 0.25s ease,
    transform 0.25s ease;
}

.ai-sidebar__item:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.72);
}

.ai-sidebar__item.is-active {
  border-color: rgba(95, 127, 114, 0.34);
  background: rgba(95, 127, 114, 0.12);
}

.ai-sidebar__rename,
.ai-sidebar__delete {
  width: 2.5rem;
  border-radius: 16px;
  border: 1px solid rgba(28, 25, 23, 0.12);
  background: rgba(255, 255, 255, 0.7);
  color: var(--ink-700);
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease,
    transform 0.25s ease;
}

.ai-sidebar__rename:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(95, 127, 114, 0.28);
  background: rgba(95, 127, 114, 0.1);
  color: var(--ink-900);
}

.ai-sidebar__delete:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(159, 63, 52, 0.22);
  background: rgba(159, 63, 52, 0.08);
  color: var(--cinnabar-700);
}

.ai-sidebar__rename:disabled,
.ai-sidebar__delete:disabled {
  opacity: 0.56;
  cursor: not-allowed;
}

.ai-sidebar__title {
  font-weight: 600;
  color: var(--ink-900);
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-sidebar__subtitle {
  color: var(--ink-600);
  font-size: 0.82rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: rgba(250, 250, 249, 0.94);
}

.ai-main__header {
  padding: 1rem 1.2rem;
  border-bottom: 1px solid rgba(28, 25, 23, 0.06);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(250, 250, 249, 0.9);
  backdrop-filter: blur(12px);
}

.ai-main__header-actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.ai-main__context {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.ai-main__context span {
  color: var(--ink-500);
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.ai-main__context strong {
  font-size: 1.05rem;
  color: var(--ink-900);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-main__context p {
  margin: 0;
  color: var(--ink-700);
  font-size: 0.92rem;
}

.ai-main__resize {
  flex: 0 0 auto;
  min-height: 2.35rem;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid rgba(28, 25, 23, 0.14);
  background: rgba(255, 255, 255, 0.65);
  color: var(--ink-800);
}

.ai-main__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-starters {
  padding: 1rem 1.2rem 0;
}

.ai-starters__label {
  margin: 0;
  color: var(--ink-600);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}

.ai-chat.ai-chat--main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.15rem 1.2rem;
}

.dialog--ai-fullscreen .ai-chat.ai-chat--main {
  padding: 1.35rem 1.5rem;
}

.dialog--ai-fullscreen .ai-composer {
  padding: 1rem 1.5rem calc(1rem + env(safe-area-inset-bottom));
}

.dialog--ai-fullscreen .ai-main__header,
.dialog--ai-fullscreen .dialog__header {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.message-row--user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  color: var(--ink-900);
  border: 1px solid rgba(28, 25, 23, 0.12);
  background: rgba(255, 255, 255, 0.72);
}

.message-row--assistant .message-avatar {
  background: rgba(95, 127, 114, 0.12);
  border-color: rgba(95, 127, 114, 0.18);
}

.message-row--user .message-avatar {
  background: rgba(159, 63, 52, 0.1);
  border-color: rgba(159, 63, 52, 0.14);
}

.message-bubble {
  max-width: min(80%, 36rem);
}

.message-bubble--user {
  margin-left: 0;
}

.message-row--loading .message-avatar {
  opacity: 0.85;
}

.ai-composer {
  padding: 0.95rem 1.2rem calc(0.95rem + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(28, 25, 23, 0.06);
  background: linear-gradient(
    to bottom,
    rgba(250, 250, 249, 0) 0%,
    rgba(250, 250, 249, 0.9) 20%,
    rgba(250, 250, 249, 0.96) 100%
  );
  backdrop-filter: blur(12px);
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.ai-composer__field {
  flex: 1;
  min-width: 0;
}

.ai-composer__field textarea {
  width: 100%;
  min-height: 2.85rem;
  max-height: 9.5rem;
  padding: 0.75rem 0.95rem;
  border-radius: 18px;
  border: 1px solid rgba(28, 25, 23, 0.12);
  background: rgba(255, 255, 255, 0.72);
  outline: none;
  resize: none;
  line-height: 1.45;
  font-family: inherit;
}

.ai-composer__field textarea:focus {
  border-color: rgba(95, 127, 114, 0.42);
  box-shadow: 0 0 0 4px rgba(95, 127, 114, 0.12);
}

.dialog__primary.ai-composer__send {
  flex: 0 0 auto;
  min-width: 5.5rem;
  padding: 0 1.15rem;
}

.feature-feedback--ai {
  margin-bottom: 0.35rem;
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
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.field input:focus {
  border-color: rgba(95, 127, 114, 0.42);
  box-shadow: 0 0 0 4px rgba(95, 127, 114, 0.12);
}

.field textarea {
  width: 100%;
  min-height: 6.4rem;
  padding: 0.9rem 0.95rem;
  border-radius: 20px;
  border: 1px solid rgba(28, 25, 23, 0.12);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(246, 244, 241, 0.92));
  outline: none;
  resize: vertical;
  line-height: 1.6;
  font-family: inherit;
  color: var(--ink-900);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.field textarea::placeholder {
  color: rgba(87, 83, 78, 0.58);
}

.field textarea:focus {
  border-color: rgba(95, 127, 114, 0.42);
  box-shadow:
    0 0 0 4px rgba(95, 127, 114, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.98);
}

.field input[type='file'] {
  display: none;
}

.upload-picker {
  min-height: 4.8rem;
  padding: 0.55rem 0.8rem;
  border-radius: 22px;
  border: 1px dashed rgba(95, 127, 114, 0.28);
  background:
    linear-gradient(180deg, rgba(243, 248, 245, 0.95), rgba(255, 255, 255, 0.92));
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr);
  gap: 0.8rem;
  align-items: center;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.upload-picker:hover {
  border-color: rgba(95, 127, 114, 0.42);
  background:
    linear-gradient(180deg, rgba(239, 246, 242, 0.98), rgba(255, 255, 255, 0.96));
  transform: translateY(-1px);
}

.upload-picker__camera {
  width: 5rem;
  height: 5rem;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(235, 242, 238, 0.92);
  color: var(--ink-900);
  box-shadow: inset 0 0 0 1px rgba(95, 127, 114, 0.08);
  backdrop-filter: blur(2px);
}

.upload-picker__camera svg {
  width: 1.7rem;
  height: 1.7rem;
}

.upload-picker__copy {
  min-width: 0;
  display: grid;
  gap: 0.22rem;
}

.upload-picker__copy strong {
  color: var(--ink-900);
  font-size: 1rem;
}

.upload-picker__copy p {
  margin: 0;
  color: rgba(68, 64, 60, 0.78);
  line-height: 1.45;
  word-break: break-word;
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
  min-height: min(38vh, 280px);
  max-height: min(46vh, 360px);
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  display: grid;
  gap: 0.75rem;
  align-content: start;
  padding-bottom: 0.35rem;
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

.friends-embed {
  margin-top: 1rem;
}

.upload-preview {
  margin-top: 1rem;
  padding: 1rem 1.05rem;
  border-radius: 22px;
  border: 1px solid rgba(28, 25, 23, 0.08);
  background: rgba(255, 255, 255, 0.78);
  display: grid;
  gap: 0.6rem;
}

.upload-preview__label {
  margin: 0;
  color: var(--ink-600);
  letter-spacing: 0.12em;
  font-size: 0.76rem;
  text-transform: uppercase;
}

.upload-preview__image {
  width: min(100%, 420px);
  max-height: 320px;
  height: auto;
  justify-self: start;
  border-radius: 18px;
  border: 1px solid rgba(28, 25, 23, 0.08);
  object-fit: contain;
  background: rgba(243, 248, 245, 0.9);
}

.upload-preview--draft {
  margin-top: 0.7rem;
}

.crop-stage {
  position: relative;
  width: fit-content;
  max-width: 100%;
  user-select: none;
}

.crop-stage--modal {
  margin-top: 1rem;
}

.crop-stage__image {
  width: min(100%, 680px);
  max-height: 68vh;
}

.crop-stage__selection {
  position: absolute;
  border: 2px solid rgba(255, 255, 255, 0.95);
  box-shadow:
    0 0 0 9999px rgba(28, 25, 23, 0.34),
    0 0 0 1px rgba(95, 127, 114, 0.42);
  border-radius: 14px;
  pointer-events: none;
}

.crop-stage__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.crop-stage__actions span {
  color: var(--ink-600);
  font-size: 0.88rem;
}

.upload-preview__meta {
  display: grid;
  gap: 0.35rem;
}

.upload-preview__meta strong {
  font-size: 1rem;
  color: var(--ink-900);
}

.upload-preview__meta p {
  margin: 0;
  color: var(--ink-700);
  line-height: 1.65;
}

.auth-feedback {
  margin: 0;
  padding: 0.8rem 0.95rem;
  border-radius: 18px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.auth-feedback.is-info {
  background: rgba(95, 127, 114, 0.08);
  color: var(--ink-700);
}

.auth-feedback.is-success {
  background: rgba(24, 121, 78, 0.12);
  color: rgba(24, 121, 78, 0.98);
}

.auth-feedback.is-warning {
  background: rgba(225, 165, 0, 0.12);
  color: rgba(132, 97, 0, 0.95);
}

.auth-feedback.is-error {
  background: rgba(159, 63, 52, 0.08);
  color: var(--cinnabar-700);
}

@media (max-width: 720px) {
  .favorites-fab {
    right: 1rem;
    bottom: calc(1rem + env(safe-area-inset-bottom));
    width: 3.95rem;
    height: 3.95rem;
  }

  .overlay {
    place-items: start center;
    padding: 1rem 0.8rem;
  }

  .dialog {
    width: min(100%, 680px);
    max-height: calc(100dvh - 2rem);
  }

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

  .ai-shell {
    grid-template-columns: 1fr;
  }

  .ai-sidebar {
    border-right: 0;
    border-bottom: 1px solid rgba(28, 25, 23, 0.08);
  }

  .ai-main__header,
  .dialog__header {
    flex-direction: column;
    align-items: stretch;
  }

  .ai-main__header-actions {
    width: 100%;
    justify-content: space-between;
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
