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
import { currentLanguage, getDocumentTitle, getRouteTitle, resolveLocalized, useLanguage } from './i18n';
import { SECURITY_QUESTION_FIELDS, getSecurityQuestionPrompt } from './shared/securityQuestions';
import { isSupabaseConfigured } from './services/supabase/clientRuntime';
import { deleteCurrentAccount } from './services/supabase/authRuntime';

const route = useRoute();
const router = useRouter();
const { language, languageOptions, setLanguage } = useLanguage();

const openFavorites = () => {
  router.push('/favorites');
};

const appTextSource = {
  brandTitle: {
    zh: '平江慢游',
    en: 'Pingjiang Slow Travel',
    ja: '平江スロートラベル',
    ko: '평강 슬로우 트래블',
  },
  brandSubtitle: {
    zh: '平江 · 园林 · 文博 · 市井',
    en: 'Pingjiang · Gardens · Museums · Heritage',
    ja: '平江・庭園・博物館・暮らし',
    ko: '평강 · 정원 · 박물관 · 생활',
  },
  navAria: {
    zh: '主导航',
    en: 'Main navigation',
    ja: 'メインナビゲーション',
    ko: '메인 내비게이션',
  },
  moreServices: {
    zh: '更多服务',
    en: 'More Services',
    ja: '追加サービス',
    ko: '추가 서비스',
  },
  moreServicesAria: {
    zh: '打开更多服务菜单',
    en: 'Open more services menu',
    ja: '追加サービスメニューを開く',
    ko: '추가 서비스 메뉴 열기',
  },
  languageLabel: {
    zh: '语言',
    en: 'Language',
    ja: '言語',
    ko: '언어',
  },
  profileMenuLabel: {
    zh: '打开账户菜单',
    en: 'Open account menu',
    ja: 'アカウントメニューを開く',
    ko: '계정 메뉴 열기',
  },
  profileAuthLabel: {
    zh: '打开登录弹窗',
    en: 'Open sign-in dialog',
    ja: 'ログイン画面を開く',
    ko: '로그인 창 열기',
  },
  friendNoticeAria: {
    zh: '存在好友或群聊未读提醒',
    en: 'Unread friend or group chat notifications',
    ja: '未読の友だち通知またはグループチャットがあります',
    ko: '읽지 않은 친구 또는 그룹 채팅 알림이 있습니다',
  },
  footerSignatureAria: {
    zh: '页脚落款',
    en: 'Footer signature',
    ja: 'フッター署名',
    ko: '푸터 서명',
  },
  footerNavAria: {
    zh: '页脚导航',
    en: 'Footer navigation',
    ja: 'フッターナビゲーション',
    ko: '푸터 내비게이션',
  },
  close: {
    zh: '关闭',
    en: 'Close',
    ja: '閉じる',
    ko: '닫기',
  },
  navItems: [
    {
      label: { zh: '平江古街', en: 'Pingjiang', ja: '平江古街', ko: '평강고가' },
      to: '/',
      icon: 'pingjiang',
    },
    {
      label: { zh: '古典园林', en: 'Gardens', ja: '古典庭園', ko: '고전 정원' },
      to: '/gardens',
      icon: 'gardens',
    },
    {
      label: { zh: '文博殿堂', en: 'Museums', ja: '博物館', ko: '박물관' },
      to: '/museums',
      icon: 'museums',
    },
    {
      label: { zh: '非遗市井', en: 'Heritage', ja: '生活遺産', ko: '생활 유산' },
      to: '/heritage',
      icon: 'heritage',
    },
  ],
  featureButtons: [
    {
      id: 'friends',
      label: { zh: '好友同游', en: 'Friends', ja: '友だちと巡る', ko: '친구와 함께' },
    },
    {
      id: 'ai',
      label: { zh: 'AI 伴游', en: 'AI Guide', ja: 'AI ガイド', ko: 'AI 가이드' },
    },
    {
      id: 'upload',
      label: { zh: '上传照片', en: 'Upload', ja: '写真をアップロード', ko: '사진 업로드' },
    },
  ],
  featurePanels: {
    friends: {
      label: { zh: '好友同游', en: 'Travel Together', ja: '友だちと巡る', ko: '친구와 함께' },
      eyebrow: 'Travel Together',
      description: {
        zh: '把当前页面、集合点和慢游节奏快速同步给朋友，适合同一条路线结伴看。',
        en: 'Sync the current page, meeting point, and travel rhythm with friends when you want to explore the same route together.',
        ja: '現在のページや集合場所、歩くテンポを友だちにすばやく共有して、同じルートを一緒に回れる。',
        ko: '현재 페이지와 집합 지점, 걷는 리듬을 친구와 빠르게 공유해 같은 루트를 함께 볼 수 있다.',
      },
    },
    ai: {
      label: { zh: 'AI 伴游', en: 'AI Guide', ja: 'AI ガイド', ko: 'AI 가이드' },
      eyebrow: 'Smart Guide',
      description: {
        zh: '根据你当前打开的页面给出导览建议，也可以直接问它先看哪里、怎么走更顺。',
        en: 'Get guidance based on the page you are viewing now, or ask directly where to start and how to walk more smoothly.',
        ja: '今見ているページに合わせて案内を受けたり、どこから見るべきか、どう歩くべきかを直接たずねたりできる。',
        ko: '현재 보고 있는 페이지를 기준으로 안내를 받거나 어디부터 보고 어떻게 걸으면 좋은지 바로 물어볼 수 있다.',
      },
    },
    upload: {
      label: { zh: '上传照片', en: 'Photo Upload', ja: '写真アップロード', ko: '사진 업로드' },
      eyebrow: 'Photo Upload',
      description: {
        zh: '把你在园林里的随手拍传上来，上传成功后会在这里回显。',
        en: 'Upload a photo from your walk. After it succeeds, the image will preview here.',
        ja: '歩きながら撮った写真をアップロードすると、成功後にここでプレビューできる。',
        ko: '산책 중 찍은 사진을 업로드하면 성공 후 이곳에서 바로 미리 볼 수 있다.',
      },
    },
  },
  footerTitle: {
    zh: '一街读姑苏，四页见气韵。',
    en: 'Read Suzhou through one street and four chapters.',
    ja: '一つの街路から姑蘇を読み、四つの頁で気配を見る。',
    ko: '한 거리에서 쑤저우를 읽고, 네 장면에서 분위기를 본다.',
  },
  footerBody: {
    zh: '以宣纸白为底，以水墨黑为骨，以青瓷绿与朱砂红轻轻点醒苏州的静与雅。',
    en: 'Built on paper white and ink black, with celadon green and cinnabar red lightly waking Suzhou\'s calm elegance.',
    ja: '宣紙の白と墨の黒を土台に、青磁の緑と朱砂の赤で蘇州の静けさと雅をそっと立ち上げる。',
    ko: '선지의 흰색과 수묵의 검정을 바탕으로, 청자빛 녹색과 주사빛 붉은색으로 쑤저우의 고요함과 우아함을 살린다.',
  },
  footerCopyright: {
    zh: '© 2026 Jiangnan Gardens. 姑苏漫游指南 保留所有权利。',
    en: '© 2026 Jiangnan Gardens. All rights reserved.',
    ja: '© 2026 Jiangnan Gardens. All rights reserved.',
    ko: '© 2026 Jiangnan Gardens. All rights reserved.',
  },
  loginRegister: {
    zh: '登录 / 注册',
    en: 'Sign In / Sign Up',
    ja: 'ログイン / 登録',
    ko: '로그인 / 회원가입',
  },
  loggedIn: {
    zh: '已登录',
    en: 'Signed in',
    ja: 'ログイン済み',
    ko: '로그인됨',
  },
  loggedOut: {
    zh: '未登录',
    en: 'Signed out',
    ja: '未ログイン',
    ko: '로그아웃 상태',
  },
  authNotReady: {
    zh: '未配置认证',
    en: 'Auth not configured',
    ja: '認証未設定',
    ko: '인증 미설정',
  },
};

const dialogTextSource = {
  profileName: { zh: '昵称', en: 'Nickname', ja: '表示名', ko: '닉네임' },
  profileNamePlaceholder: { zh: '输入新的昵称', en: 'Enter a new nickname', ja: '新しい表示名を入力', ko: '새 닉네임 입력' },
  newPassword: { zh: '新密码', en: 'New Password', ja: '新しいパスワード', ko: '새 비밀번호' },
  newPasswordPlaceholder: { zh: '留空则不修改密码', en: 'Leave blank to keep the password', ja: '空欄なら変更しません', ko: '비워 두면 비밀번호를 변경하지 않습니다' },
  confirmNewPassword: { zh: '确认新密码', en: 'Confirm New Password', ja: '新しいパスワードを確認', ko: '새 비밀번호 확인' },
  confirmNewPasswordPlaceholder: { zh: '再次输入新密码', en: 'Enter the new password again', ja: '新しいパスワードをもう一度入力', ko: '새 비밀번호를 다시 입력' },
  saving: { zh: '保存中…', en: 'Saving...', ja: '保存中...', ko: '저장 중...' },
  saveChanges: { zh: '保存修改', en: 'Save Changes', ja: '変更を保存', ko: '변경 사항 저장' },
  logout: { zh: '退出登录', en: 'Sign Out', ja: 'ログアウト', ko: '로그아웃' },
  moreActions: { zh: '更多账户操作', en: 'More Account Actions', ja: 'その他のアカウント操作', ko: '추가 계정 작업' },
  friendsNeedLogin: { zh: '需要登录', en: 'Sign In Required', ja: 'ログインが必要です', ko: '로그인이 필요합니다' },
  friendsNeedLoginTitle: { zh: '好友功能需要先登录', en: 'Friends features require sign-in first', ja: '友だち機能を使うには先にログインが必要です', ko: '친구 기능을 사용하려면 먼저 로그인해야 합니다' },
  friendsNeedLoginBody: { zh: '请先完成真实登录后再添加好友、查看好友列表。', en: 'Please sign in with a real account before adding friends or viewing the friend list.', ja: '友だち追加や一覧表示の前に、実際のアカウントでログインしてください。', ko: '친구를 추가하거나 목록을 보기 전에 실제 계정으로 먼저 로그인해 주세요.' },
  goLogin: { zh: '去登录', en: 'Go to Sign In', ja: 'ログインへ', ko: '로그인하기' },
  goRegister: { zh: '去注册', en: 'Go to Sign Up', ja: '登録へ', ko: '회원가입하기' },
  aiHistoryAria: { zh: '历史会话', en: 'Conversation history', ja: '会話履歴', ko: '대화 기록' },
  aiNewConversation: { zh: '新建对话', en: 'New Chat', ja: '新しい会話', ko: '새 대화' },
  aiRenameShort: { zh: '改', en: 'Edit', ja: '変更', ko: '수정' },
  aiDeleteShort: { zh: '删', en: 'Delete', ja: '削除', ko: '삭제' },
  aiConversationAria: { zh: 'AI 伴游对话', en: 'AI guide chat', ja: 'AI ガイド会話', ko: 'AI 가이드 대화' },
  aiStarterLabel: { zh: '你可以从这些问题开始', en: 'You can start with these questions', ja: 'これらの質問から始められます', ko: '이 질문들부터 시작할 수 있습니다' },
  me: { zh: '我', en: 'Me', ja: '私', ko: '나' },
  aiLabel: { zh: 'AI 伴游', en: 'AI Guide', ja: 'AI ガイド', ko: 'AI 가이드' },
  aiLoading: { zh: '正在整理当前页面的慢游建议…', en: 'Preparing slow-travel suggestions for this page...', ja: 'このページ向けのゆったりした案内を整理しています...', ko: '이 페이지에 맞는 느린 여행 제안을 정리하는 중...' },
  aiInputAria: { zh: '输入你的问题', en: 'Enter your question', ja: '質問を入力', ko: '질문 입력' },
  aiInputPlaceholder: { zh: '输入问题，Enter 发送，Shift + Enter 换行', en: 'Type a question. Enter to send, Shift + Enter for a new line', ja: '質問を入力。Enter で送信、Shift + Enter で改行', ko: '질문을 입력하세요. Enter 로 전송, Shift + Enter 로 줄바꿈' },
  send: { zh: '发送', en: 'Send', ja: '送信', ko: '전송' },
  uploadHint: { zh: '上传提示', en: 'Upload Tip', ja: 'アップロード案内', ko: '업로드 안내' },
  uploadTitle: { zh: '上传园林照片', en: 'Upload a Garden Photo', ja: '庭園写真をアップロード', ko: '정원 사진 업로드' },
  uploadBody: { zh: '选择一张图片后点击上传，后端返回图片地址后会在下方回显。', en: 'Choose an image and upload it. The returned image URL will preview below.', ja: '画像を選んでアップロードすると、返却された画像 URL が下に表示されます。', ko: '이미지를 선택해 업로드하면 반환된 이미지 URL 이 아래에 미리 표시됩니다.' },
  uploadPlaceName: { zh: '地点名称', en: 'Place Name', ja: 'スポット名', ko: '장소 이름' },
  uploadPlaceNamePlaceholder: { zh: '例如：平江路小众茶馆', en: 'For example: A hidden teahouse on Pingjiang Road', ja: '例: 平江路の小さな茶館', ko: '예: 평강로의 작은 찻집' },
  uploadPlaceDescription: { zh: '地点描述', en: 'Place Description', ja: 'スポット説明', ko: '장소 설명' },
  uploadPlaceDescriptionPlaceholder: { zh: '请填写地点描述', en: 'Describe this place', ja: 'スポットの説明を入力', ko: '장소 설명을 입력하세요' },
  selectImage: { zh: '选择图片文件', en: 'Choose Image File', ja: '画像ファイルを選択', ko: '이미지 파일 선택' },
  uploading: { zh: '正在上传…', en: 'Uploading...', ja: 'アップロード中...', ko: '업로드 중...' },
  startUpload: { zh: '开始上传', en: 'Start Upload', ja: 'アップロード開始', ko: '업로드 시작' },
  clearPreview: { zh: '清空回显', en: 'Clear Preview', ja: 'プレビューをクリア', ko: '미리보기 지우기' },
  uploadSuccessPreview: { zh: '上传成功回显', en: 'Upload Preview', ja: 'アップロード結果プレビュー', ko: '업로드 미리보기' },
  accountInfo: { zh: '账户信息', en: 'Account Info', ja: 'アカウント情報', ko: '계정 정보' },
  loginAccount: { zh: '登录账户', en: 'Sign In', ja: 'ログイン', ko: '로그인' },
  createAccount: { zh: '创建账户', en: 'Create Account', ja: 'アカウント作成', ko: '계정 만들기' },
  resetPassword: { zh: '重置密码', en: 'Reset Password', ja: 'パスワード再設定', ko: '비밀번호 재설정' },
  login: { zh: '登录', en: 'Sign In', ja: 'ログイン', ko: '로그인' },
  register: { zh: '注册', en: 'Sign Up', ja: '登録', ko: '회원가입' },
  authNotConfigured: { zh: '当前尚未配置真实 Supabase 登录环境变量，所以登录、注册和重置密码现在都不可用。请在 `.env.local` 中填写 `VITE_FY_SUPABASE_URL` 和 `VITE_FY_SUPABASE_ANON_KEY`，或填写 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 后重启前端。', en: 'Supabase auth environment variables are not configured yet, so sign-in, sign-up, and password reset are unavailable. Fill in `VITE_FY_SUPABASE_URL` and `VITE_FY_SUPABASE_ANON_KEY` in `.env.local`, or use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then restart the frontend.', ja: 'Supabase 認証用の環境変数が未設定のため、ログイン、登録、パスワード再設定は現在利用できません。`.env.local` に `VITE_FY_SUPABASE_URL` と `VITE_FY_SUPABASE_ANON_KEY`、または `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定してフロントエンドを再起動してください。', ko: 'Supabase 인증 환경 변수가 아직 설정되지 않아 로그인, 회원가입, 비밀번호 재설정을 사용할 수 없습니다. `.env.local` 에 `VITE_FY_SUPABASE_URL` 와 `VITE_FY_SUPABASE_ANON_KEY` 또는 `VITE_SUPABASE_URL` 와 `VITE_SUPABASE_ANON_KEY` 를 입력한 뒤 프런트엔드를 다시 시작하세요.' },
  currentAccount: { zh: '当前账户', en: 'Current Account', ja: '現在のアカウント', ko: '현재 계정' },
  friendRequests: { zh: '好友请求', en: 'Friend Requests', ja: '友だち申請', ko: '친구 요청' },
  deletingAccount: { zh: '注销中…', en: 'Deleting...', ja: '削除中...', ko: '삭제 중...' },
  deleteAccount: { zh: '注销账号', en: 'Delete Account', ja: 'アカウント削除', ko: '계정 삭제' },
  nicknamePlaceholder: { zh: '平江旅人', en: 'Pingjiang Traveler', ja: '平江の旅人', ko: '평강 여행자' },
  email: { zh: '邮箱', en: 'Email', ja: 'メール', ko: '이메일' },
  emailPlaceholder: { zh: '例如：you@example.com', en: 'For example: you@example.com', ja: '例: you@example.com', ko: '예: you@example.com' },
  password: { zh: '密码', en: 'Password', ja: 'パスワード', ko: '비밀번호' },
  passwordPlaceholder: { zh: '请输入密码', en: 'Enter your password', ja: 'パスワードを入力', ko: '비밀번호를 입력하세요' },
  newPasswordPlaceholderShort: { zh: '请输入新密码', en: 'Enter a new password', ja: '新しいパスワードを入力', ko: '새 비밀번호를 입력하세요' },
  confirmPassword: { zh: '确认密码', en: 'Confirm Password', ja: 'パスワードを確認', ko: '비밀번호 확인' },
  confirmPasswordPlaceholder: { zh: '再次输入密码', en: 'Enter the password again', ja: 'もう一度入力', ko: '비밀번호를 다시 입력하세요' },
  confirmNewPasswordPlaceholderShort: { zh: '再次输入新密码', en: 'Enter the new password again', ja: '新しいパスワードをもう一度入力', ko: '새 비밀번호를 다시 입력하세요' },
  registerSecurityCopy: { zh: '创建账号时需要设置三个安全问题答案，后续忘记密码时会用它们进行核对。', en: 'Set answers to three security questions when creating the account. They will be used later if you forget your password.', ja: 'アカウント作成時に 3 つの秘密の質問の答えを設定します。あとでパスワードを忘れた場合に照合に使います。', ko: '계정을 만들 때 보안 질문 3개의 답을 설정해야 하며, 나중에 비밀번호를 잊었을 때 확인에 사용됩니다.' },
  resetSecurityCopy: { zh: '请输入注册邮箱，并回答注册时设置的三个安全问题。验证通过后才能重置密码。', en: 'Enter your registered email and answer the three security questions you set during sign-up. Only then can the password be reset.', ja: '登録メールアドレスを入力し、登録時に設定した 3 つの秘密の質問に答えてください。認証後にのみパスワードを再設定できます。', ko: '가입한 이메일을 입력하고 가입 시 설정한 보안 질문 3개에 답해야 비밀번호를 재설정할 수 있습니다.' },
  datePlaceholder: { zh: '请选择日期', en: 'Select a date', ja: '日付を選択', ko: '날짜를 선택하세요' },
  answerPlaceholder: { zh: '请输入答案', en: 'Enter your answer', ja: '答えを入力', ko: '답을 입력하세요' },
  submitting: { zh: '提交中…', en: 'Submitting...', ja: '送信中...', ko: '제출 중...' },
  signInNow: { zh: '立即登录', en: 'Sign In Now', ja: '今すぐログイン', ko: '지금 로그인' },
  verifyAndReset: { zh: '验证并重置', en: 'Verify and Reset', ja: '認証して再設定', ko: '확인 후 재설정' },
  cancel: { zh: '取消', en: 'Cancel', ja: 'キャンセル', ko: '취소' },
};

const routeJourneysSource = {
  '/': {
    meetPoint: {
      zh: '平江路主街 · 顾颉刚故居旁',
      en: 'Pingjiang Road main street · beside the Gu Jiegang residence',
      ja: '平江路のメインストリート・顧頡剛旧居のそば',
      ko: '평강로 메인 거리 · 고결강 옛집 옆',
    },
    pace: {
      zh: '先顺着主街认方向，再向园林、文博和支巷慢慢散开。',
      en: 'Orient yourself on the main street first, then branch gently into gardens, museums, and side lanes.',
      ja: 'まず大通りで方向感覚をつかみ、そのあと庭園や博物館、路地へ静かに広がっていく。',
      ko: '먼저 큰 거리에서 방향을 잡고, 그다음 정원과 박물관, 골목으로 천천히 퍼져 나간다.',
    },
    focus: [
      {
        zh: '先沿河看整体气质',
        en: 'Read the overall mood along the canal first',
        ja: 'まず川沿いで全体の気配を見る',
        ko: '먼저 강가를 따라 전체 분위기를 본다',
      },
      {
        zh: '再分线进入园林与文博',
        en: 'Then split into gardens and museums',
        ja: 'そのあと庭園と博物館へ枝分かれする',
        ko: '그다음 정원과 박물관으로 나뉘어 들어간다',
      },
      {
        zh: '傍晚回到评弹与灯影最完整',
        en: 'Return by dusk for the fullest lights and music',
        ja: '夕方には灯りと評弾がそろう場所へ戻る',
        ko: '해질 무렵 조명과 평탄이 가장 완전한 곳으로 돌아온다',
      },
    ],
    prompts: [
      {
        zh: '我第一次来，应该从哪一段开始走？',
        en: 'It is my first time here. Which section should I start with?',
        ja: '初めて来ました。どの区間から歩き始めるのがよいですか。',
        ko: '처음 왔는데 어느 구간부터 걷는 게 좋을까요?',
      },
      {
        zh: '想把园林和博物馆串起来，怎么安排更顺？',
        en: 'How should I connect the gardens and museums smoothly?',
        ja: '庭園と博物館をなめらかにつなぐにはどう歩けばよいですか。',
        ko: '정원과 박물관을 자연스럽게 이어 보려면 어떻게 짜는 게 좋을까요?',
      },
      {
        zh: '平江路傍晚最适合停在哪一段？',
        en: 'Which part of Pingjiang Road is best around dusk?',
        ja: '夕方の平江路ではどのあたりに立ち止まるのがよいですか。',
        ko: '평강로에서 해질 무렵 머물기 좋은 구간은 어디인가요?',
      },
    ],
  },
  '/gardens': {
    meetPoint: {
      zh: '拙政园外白墙花窗一侧',
      en: 'Outside Humble Administrator\'s Garden by the white wall and lattice window',
      ja: '拙政園外の白壁と花窓のそば',
      ko: '졸정원 밖 백벽과 화창 옆',
    },
    pace: {
      zh: '先看整体水院比例，再回头看花窗、回廊和框景细节。',
      en: 'Read the overall water-court proportions first, then return to the details of windows, corridors, and framed views.',
      ja: 'まず水庭の全体比率を見て、そのあと花窓や回廊、フレームの細部へ戻る。',
      ko: '먼저 수원의 전체 비례를 보고, 그다음 화창과 회랑, 프레임 풍경의 세부로 돌아온다.',
    },
    focus: [
      { zh: '先整体后细节', en: 'Whole first, details later', ja: '全体を先に、細部はあとで', ko: '전체를 먼저, 세부는 나중에' },
      { zh: '框景和回廊最值得停留', en: 'Framed scenes and corridors deserve the pause', ja: 'フレーム景と回廊で立ち止まる', ko: '프레임 풍경과 회랑에서 멈춘다' },
      { zh: '午后光线更适合慢看', en: 'Afternoon light suits a slower look', ja: '午後の光がゆっくり見るのに合う', ko: '오후의 빛이 천천히 보기에 좋다' },
    ],
    prompts: [
      {
        zh: '古典园林这页我应该先看哪一座？',
        en: 'Which garden should I begin with on this page?',
        ja: 'この庭園ページではどこから見始めるのがよいですか。',
        ko: '이 정원 페이지에서는 어느 정원부터 보는 게 좋을까요?',
      },
      {
        zh: '想拍出园林层次感，站哪里更合适？',
        en: 'Where should I stand to photograph the layers of the garden?',
        ja: '庭園の層を撮るなら、どこに立つのがよいですか。',
        ko: '정원의 층위를 사진으로 담으려면 어디에 서는 게 좋을까요?',
      },
      {
        zh: '如果时间只有半天，园林路线怎么排？',
        en: 'If I only have half a day, how should I arrange the garden route?',
        ja: '半日しかない場合、庭園ルートはどう組むべきですか。',
        ko: '반나절만 있다면 정원 동선을 어떻게 짜는 게 좋을까요?',
      },
    ],
  },
  '/museums': {
    meetPoint: {
      zh: '苏州博物馆主入口外',
      en: 'Outside the main entrance of Suzhou Museum',
      ja: '蘇州博物館の正面入口前',
      ko: '쑤저우 박물관 정문 앞',
    },
    pace: {
      zh: '先看建筑与光影，再进入展陈，最后把昆曲和旧宅声景连起来。',
      en: 'Begin with architecture and light, then move into the collections, and finally connect them with Kunqu and the soundscape of old residences.',
      ja: 'まず建築と光を見てから展示へ入り、最後に昆曲や旧宅の音風景へつなげる。',
      ko: '먼저 건축과 빛을 보고 전시로 들어간 뒤, 마지막에 곤곡과 옛 저택의 소리 풍경으로 이어 간다.',
    },
    focus: [
      { zh: '先读建筑空间再看文物', en: 'Read the architecture before the objects', ja: '文物より先に空間を読む', ko: '유물보다 먼저 공간을 읽기' },
      { zh: '昆曲馆更适合带着听的心情', en: 'The Kunqu museum works best with listening in mind', ja: '昆曲館は聴く気分で入る', ko: '곤곡관은 듣는 마음으로 보기' },
      { zh: '留一点时间给庭院与过渡空间', en: 'Leave time for courtyards and transitions', ja: '中庭と移行空間にも時間を残す', ko: '중정과 전이 공간에도 시간을 남기기' },
    ],
    prompts: [
      {
        zh: '文博殿堂这页先看苏博还是昆曲博物馆？',
        en: 'On this page, should I start with Suzhou Museum or the Kunqu Museum?',
        ja: 'このページでは蘇州博物館と昆曲博物館のどちらを先に見るべきですか。',
        ko: '이 페이지에서는 쑤저우 박물관과 곤곡 박물관 중 어디부터 가는 게 좋을까요?',
      },
      {
        zh: '昆曲博物馆最值得留意哪些细节？',
        en: 'What details are most worth noticing in the Kunqu Museum?',
        ja: '昆曲博物館ではどの細部に注目すべきですか。',
        ko: '곤곡 박물관에서는 어떤 디테일을 가장 눈여겨봐야 하나요?',
      },
      {
        zh: '想走一条安静一点的文博路线，怎么安排？',
        en: 'How can I plan a quieter museum route?',
        ja: 'もう少し静かな文博ルートにするにはどう組めばよいですか。',
        ko: '조금 더 조용한 박물관 동선으로 짜려면 어떻게 하면 좋을까요?',
      },
    ],
  },
  '/heritage': {
    meetPoint: {
      zh: '平江路书场门口',
      en: 'At the entrance of the Pingjiang storytelling hall',
      ja: '平江路の書場の入口前',
      ko: '평강로 서장 입구 앞',
    },
    pace: {
      zh: '先吃后听，再进手作与支巷，把烟火气按节奏收拢起来。',
      en: 'Eat first, listen next, then move into crafts and side lanes, gathering the street\'s warmth step by step.',
      ja: 'まず食べて、そのあと聴き、最後に手仕事と路地へ入って、暮らしの熱を順に受け取っていく。',
      ko: '먼저 먹고, 그다음 듣고, 마지막에 수공예와 골목으로 들어가 생활의 온기를 순서대로 모은다.',
    },
    focus: [
      { zh: '苏式汤面适合做起点', en: 'Suzhou noodles make a good beginning', ja: '蘇州の麺から始めるのがよい', ko: '쑤저우식 면으로 시작하기 좋다' },
      { zh: '评弹和昆曲适合放在傍晚', en: 'Pingtan and Kunqu suit the evening', ja: '評弾と昆曲は夕方がよく似合う', ko: '평탄과 곤곡은 저녁이 잘 어울린다' },
      { zh: '手作店更适合最后慢慢看', en: 'Craft shops work best at the end', ja: '手仕事の店は最後にゆっくり見る', ko: '수공예 가게는 마지막에 천천히 보기 좋다' },
    ],
    prompts: [
      {
        zh: '非遗市井这页我应该先吃还是先听？',
        en: 'On this page, should I eat first or listen first?',
        ja: 'このページではまず食べるべきですか、それとも聴くべきですか。',
        ko: '이 페이지에서는 먼저 먹는 게 좋을까요, 듣는 게 좋을까요?',
      },
      {
        zh: '想体验评弹和昆曲，晚上怎么排更顺？',
        en: 'How should I arrange the evening if I want both Pingtan and Kunqu?',
        ja: '評弾と昆曲の両方を体験したいなら、夜はどう組むのがよいですか。',
        ko: '평탄과 곤곡을 모두 경험하고 싶다면 저녁 동선을 어떻게 짜는 게 좋을까요?',
      },
      {
        zh: '有什么适合买回去的苏州小物件？',
        en: 'What small Suzhou items are worth taking home?',
        ja: '持ち帰りに向く蘇州の小さな品はありますか。',
        ko: '사서 가져가기 좋은 쑤저우의 작은 물건에는 뭐가 있나요?',
      },
    ],
  },
};

const appText = computed(() => resolveLocalized(appTextSource, currentLanguage.value));
const dialogText = computed(() => resolveLocalized(dialogTextSource, currentLanguage.value));
const navItems = computed(() => appText.value.navItems);
const featureButtons = computed(() => appText.value.featureButtons);
const featurePanels = computed(() => appText.value.featurePanels);
const routeJourneys = computed(() => resolveLocalized(routeJourneysSource, currentLanguage.value));
const pageContextLabel = computed(() => getRouteTitle(route.meta.titleKey || route.path));
const currentJourney = computed(() => routeJourneys.value[route.path] || routeJourneys.value['/']);

const activeFeature = ref('');
const activeFeatureInfo = computed(() => featurePanels.value[activeFeature.value] || null);
const isFeatureOpen = computed(() => Boolean(activeFeature.value));

const createInviteCode = () => `PJ-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.floor(Math.random() * 9) + 1}`;

const friendTrip = reactive({
  roomCode: createInviteCode(),
  members: 2,
  meetingPoint: currentJourney.value.meetPoint,
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
const profileMenuRef = ref(null);
const serviceMenuRef = ref(null);
const isServiceMenuOpen = ref(false);

const MAX_AI_CONTEXT_MESSAGES = 12;
const MAX_PERSISTED_CHAT_ROUNDS = 30;
const AI_GREETING_HINT_SOURCE = {
  zh: '当前页智能导览',
  en: 'Guide for this page',
  ja: 'このページの案内',
  ko: '현재 페이지 안내',
};

function getAiGreetingHint() {
  return resolveLocalized(AI_GREETING_HINT_SOURCE, currentLanguage.value);
}

function getDefaultAiConversationTitle() {
  return dialogText.value.aiNewConversation;
}

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
  return routeJourneys.value[contextKey] || routeJourneys.value['/'];
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
const activeAiPrompts = computed(() => activeAiJourney.value.prompts || currentJourney.value.prompts);
const aiShouldShowStarter = computed(() => !aiMessages.value.some((item) => item.role === 'user'));
const hasPendingFriendRequests = computed(() => pendingFriendRequests.value.length > 0);
const hasUnreadGroupChats = computed(() => unreadGroupChatCount.value > 0);
const hasFriendFeatureNotification = computed(
  () => hasPendingFriendRequests.value || hasUnreadGroupChats.value,
);

function buildAiGreeting(pageLabel = pageContextLabel.value) {
  const language = currentLanguage.value;

  if (language === 'en') {
    return `You are viewing "${pageLabel}" now. I can suggest where to start, how to move through it smoothly, and which details deserve a slower look.`;
  }

  if (language === 'ja') {
    return `いま見ているのは「${pageLabel}」です。このページに合わせて、どこから見るべきか、どう歩くと自然か、どの細部で立ち止まるべきかを案内できます。`;
  }

  if (language === 'ko') {
    return `지금 보고 있는 페이지는 "${pageLabel}"입니다. 어디부터 보고 어떻게 걸으면 좋은지, 어떤 디테일에서 천천히 머물면 좋은지 안내할 수 있습니다.`;
  }

  return `你现在浏览的是「${pageLabel}」。我可以按当前页面告诉你先看哪里、怎么走更顺，以及哪些细节最值得慢下来。`;
}

function buildOfflineAiReply(prompt, conversation = activeAiConversation.value) {
  const pageLabel = conversation?.pageLabel || pageContextLabel.value;
  const journey = getJourneyByContextKey(conversation?.contextKey || route.fullPath);
  const language = currentLanguage.value;
  const promptText = String(prompt || '').toLowerCase();
  const focusSummary = journey.focus.slice(0, 2).join(language === 'en' ? ', ' : '、');
  const focusAll = journey.focus.join(language === 'en' ? ', ' : '、');
  const asksRoute = /(先|怎么走|start|route|walk|first|どこから|歩|먼저|동선|어떻게)/i.test(promptText);
  const asksPhoto = /(拍|照片|好看|photo|picture|shoot|撮|写真|예쁘|사진)/i.test(promptText);

  if (asksRoute) {
    if (language === 'en') {
      return `If you are at "${pageLabel}" now, I suggest this rhythm: ${journey.pace} Focus first on ${focusSummary}.`;
    }
    if (language === 'ja') {
      return `もし今「${pageLabel}」にいるなら、この流れがおすすめです。${journey.pace} とくに ${focusSummary} を先に意識してみてください。`;
    }
    if (language === 'ko') {
      return `지금 "${pageLabel}"에 있다면 이런 흐름을 추천합니다. ${journey.pace} 우선 ${focusSummary} 에 집중해 보세요.`;
    }
    return `如果你现在在「${pageLabel}」，建议 ${journey.pace} 重点可以放在：${journey.focus.slice(0, 2).join('、')}。`;
  }

  if (asksPhoto) {
    if (language === 'en') {
      return `In "${pageLabel}", the most compelling photos are often not the obvious wide shot, but layered angles like ${journey.focus[0]}. Pause for a minute before choosing where to shoot.`;
    }
    if (language === 'ja') {
      return `「${pageLabel}」では、正面の大きな景色よりも、${journey.focus[0]} のような層のある角度のほうが印象的です。まず少し立ち止まってから撮る場所を決めるのがおすすめです。`;
    }
    if (language === 'ko') {
      return `"${pageLabel}"에서는 정면의 큰 장면보다 ${journey.focus[0]} 같은 층이 있는 각도가 더 오래 남습니다. 먼저 잠시 멈춘 뒤 촬영 위치를 정해 보세요.`;
    }
    return `在「${pageLabel}」里，更耐看的往往不是正面大景，而是 ${journey.focus[0]} 这类有层次的角度。可以先停一分钟，再决定从哪里拍。`;
  }

  if (language === 'en') {
    return `This page is "${pageLabel}". If you want a smoother slow-travel rhythm, keep these three points in mind: ${focusAll}.`;
  }
  if (language === 'ja') {
    return `このページは「${pageLabel}」です。ゆっくり見る流れを整えたいなら、まずこの 3 つを意識してください。${focusAll}。`;
  }
  if (language === 'ko') {
    return `지금 페이지는 "${pageLabel}"입니다. 더 자연스럽게 천천히 보려면 이 세 가지를 기억하세요. ${focusAll}.`;
  }
  return `现在这页是「${pageLabel}」。如果想慢游得更顺，可以记住这三个重点：${journey.focus.join('、')}。`;
}

function createAiGreetingMessage(pageLabel = pageContextLabel.value) {
  return {
    id: createAiMessageId('assistant'),
    role: 'assistant',
    content: buildAiGreeting(pageLabel),
    hint: getAiGreetingHint(),
  };
}

function createAiConversation({
  id = createAiConversationId(),
  pageLabel = pageContextLabel.value,
  contextKey = route.fullPath,
  title = getDefaultAiConversationTitle(),
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
  return truncateAiText(firstUserMessage?.content, 18) || (currentLanguage.value === 'en'
    ? `${pageLabel} Guide`
    : currentLanguage.value === 'ja'
      ? `${pageLabel} 案内`
      : currentLanguage.value === 'ko'
        ? `${pageLabel} 안내`
        : `${pageLabel} 导览`);
}

function deriveAiConversationPreview(conversation) {
  const lastMessage = [...conversation.messages]
    .reverse()
    .find((item) => item.role === 'user' || item.role === 'assistant');

  return truncateAiText(lastMessage?.content, 28) || (currentLanguage.value === 'en'
    ? 'Continue your Suzhou garden chat here.'
    : currentLanguage.value === 'ja'
      ? 'ここから蘇州庭園の話を続けましょう。'
      : currentLanguage.value === 'ko'
        ? '여기서 쑤저우 정원 이야기를 이어 가세요.'
        : '从这里继续聊苏州园林。');
}

function trimConversationMessages(conversation) {
  if (!conversation) {
    return;
  }

  const greetingMessage = conversation.messages.find((item) => item.hint === getAiGreetingHint()) || null;
  const regularMessages = conversation.messages
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
    .filter((item) => item.hint !== getAiGreetingHint())
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
    .filter((item) => item.hint !== getAiGreetingHint())
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
    title: item?.title || getDefaultAiConversationTitle(),
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

  const nextTitle = window.prompt(
    currentLanguage.value === 'en'
      ? 'Enter a new conversation title'
      : currentLanguage.value === 'ja'
        ? '新しい会話タイトルを入力してください'
        : currentLanguage.value === 'ko'
          ? '새 대화 제목을 입력하세요'
          : '请输入新的对话标题',
    conversation.title || getDefaultAiConversationTitle(),
  );

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

function handleAiComposerKeydown(event) {
  if (event?.key !== 'Enter' || event?.shiftKey || event?.isComposing || isAiComposing.value) {
    return;
  }

  event.preventDefault();
  sendAiMessage();
}

const openFeature = async (featureId) => {
  closeServiceMenu();
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
  }
};

const closeFeature = () => {
  activeFeature.value = '';
  aiDraft.value = '';
  uploadError.value = '';
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
    closeServiceMenu();
    closeProfileMenu();
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
const securityQuestionItems = computed(() => SECURITY_QUESTION_FIELDS.map((field) => ({
  field,
  prompt: getSecurityQuestionPrompt(field, currentLanguage.value),
  type: field === 'birthday' ? 'date' : 'text',
  autocomplete: field === 'birthday' ? 'bday' : 'off',
})));
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

function openServiceMenu() {
  closeProfileMenu();
  isServiceMenuOpen.value = true;
}

function closeServiceMenu() {
  isServiceMenuOpen.value = false;
}

function toggleServiceMenu() {
  if (isServiceMenuOpen.value) {
    closeServiceMenu();
    return;
  }

  openServiceMenu();
}

function handleSelectFeature(featureId) {
  closeServiceMenu();
  openFeature(featureId);
}

function toggleProfileMenu() {
  if (!currentUser.value) {
    openAuthDialog('login');
    return;
  }

  closeServiceMenu();
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

function handleWindowClickForHeaderMenus(event) {
  const target = event.target;

  if (isProfileMenuOpen.value) {
    const profileRoot = profileMenuRef.value;

    if (profileRoot && !profileRoot.contains(target)) {
      closeProfileMenu();
    }
  }

  if (isServiceMenuOpen.value) {
    const serviceRoot = serviceMenuRef.value;

    if (serviceRoot && !serviceRoot.contains(target)) {
      closeServiceMenu();
    }
  }
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
      '当前还没有配置真实 Supabase 登录环境变量。请在 .env.local 中填写 VITE_FY_SUPABASE_URL / VITE_FY_SUPABASE_ANON_KEY，或使用 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY。',
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
const profileLabel = computed(() => currentUser.value?.username || appText.value.loginRegister);
const profileStatus = computed(() => {
  if (currentUser.value) {
    return appText.value.loggedIn;
  }

  return isSupabaseConfigured() ? appText.value.loggedOut : appText.value.authNotReady;
});

// 上传图片相关状态
const selectedImageFile = ref(null);
const uploadPlaceName = ref('');
const uploadPlaceDescription = ref('');
const uploadedImageUrl = ref('');
const isUploadingImage = ref(false);
const uploadError = ref('');

function handleSelectImage(event) {
  const file = event?.target?.files?.[0];

  if (!file) {
    selectedImageFile.value = null;
    return;
  }

  selectedImageFile.value = file;
  uploadError.value = '';
}

async function submitUploadImage() {
  if (!selectedImageFile.value || isUploadingImage.value) {
    return;
  }

  if (!uploadPlaceName.value.trim()) {
    uploadError.value = '请输入地点名称。';
    return;
  }

  if (!uploadPlaceDescription.value.trim()) {
    uploadError.value = '请输入地点描述。';
    return;
  }

  isUploadingImage.value = true;
  uploadError.value = '';

  try {
    const formData = new FormData();
    formData.append('image', selectedImageFile.value);
    formData.append('title', uploadPlaceName.value.trim());
    formData.append('description', uploadPlaceDescription.value.trim());

    // 中文注释：这里连接后端图片上传接口 /api/ugc，使用 FormData 以 multipart/form-data 发送图片文件。
    // 注意：使用 fetch/axios 发送 FormData 时，不要手动写死 Content-Type，浏览器会自动补上 boundary。
    const result = await uploadApi.uploadGardenImage(formData);
    uploadedImageUrl.value = result?.image_url || result?.imageUrl || '';

    if (!uploadedImageUrl.value) {
      throw new Error('上传成功但未拿到图片地址，请检查后端返回字段 image_url/imageUrl。');
    }

    uploadPlaceName.value = '';
    uploadPlaceDescription.value = '';
  } catch (error) {
    console.error('[Upload] 上传图片失败', error);
    uploadError.value = error.message || '上传失败，请稍后再试。';
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
    window.addEventListener('click', handleWindowClickForHeaderMenus);
  }
  window.addEventListener('group-chats-updated', handleGroupChatUnreadChanged);
});

onUnmounted(() => {
  stopPendingRequestPolling();
  stopGroupChatUnreadPolling();
  window.removeEventListener('group-chats-updated', handleGroupChatUnreadChanged);
  authSubscription?.data?.subscription?.unsubscribe?.();

  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleWindowClickForHeaderMenus);
  }
});

watch(
  [() => route.meta.titleKey, () => language.value],
  ([titleKey]) => {
    if (typeof document !== 'undefined') {
      document.title = getDocumentTitle(titleKey || 'pingjiang');
    }
  },
  { immediate: true },
);

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
    <header class="site-header site-header--refined">
      <div class="header-inner header-inner--refined">
        <RouterLink to="/" class="brand-link brand-link--refined">
          <span class="brand-seal">平</span>
          <span class="brand-copy">
            <strong class="brand-title">{{ appText.brandTitle }}</strong>
            <small class="brand-subtitle">{{ appText.brandSubtitle }}</small>
          </span>
        </RouterLink>

        <nav class="primary-nav" :aria-label="appText.navAria">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="primary-nav__item"
          >
            <span class="primary-nav__icon" aria-hidden="true">
              <svg v-if="item.icon === 'pingjiang'" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4.5 11.1 12 4.8l7.5 6.3v8.6a1.45 1.45 0 0 1-1.45 1.45H5.95A1.45 1.45 0 0 1 4.5 19.7v-8.6Z"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.55"
                />
                <path
                  d="M9.45 21.1v-5.5a1 1 0 0 1 1-1h3.1a1 1 0 0 1 1 1v5.5"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.55"
                />
                <path
                  d="M7.75 10.2h8.5"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.2"
                  opacity="0.5"
                />
              </svg>
              <svg v-else-if="item.icon === 'gardens'" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6.55 15.65c6.2.9 10-2.9 10.85-10.15-6.2-.45-10.65 2.75-10.85 10.15Z"
                  stroke="currentColor"
                  stroke-linejoin="round"
                  stroke-width="1.55"
                />
                <path
                  d="M6.55 15.65c2.25-3.5 6.05-6.05 10.85-10.15"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.55"
                />
                <path
                  d="M6.55 15.65V20.7"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.55"
                />
                <path
                  d="M6.55 19.8c-.75.55-1.35 1.15-1.8 1.8"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.2"
                  opacity="0.55"
                />
              </svg>
              <svg v-else-if="item.icon === 'museums'" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4.65 9.05 12 4.7l7.35 4.35"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.55"
                />
                <path
                  d="M6.7 10.2v8.65m3.55-8.65v8.65m3.5-8.65v8.65m3.55-8.65v8.65"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.45"
                />
                <path
                  d="M5.3 20.8h13.4"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.55"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none">
                <path
                  d="M8.15 10.15V7.9a3.85 3.85 0 0 1 7.7 0v2.25"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.55"
                />
                <path
                  d="M7.35 10.15h9.3c.68 0 1.22.55 1.22 1.22v7.08c0 1.1-.89 1.99-1.99 1.99H8.12a1.99 1.99 0 0 1-1.99-1.99v-7.08c0-.67.54-1.22 1.22-1.22Z"
                  stroke="currentColor"
                  stroke-linejoin="round"
                  stroke-width="1.55"
                />
                <path
                  d="M12 13.2v4"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="1.55"
                />
              </svg>
            </span>
            <span class="primary-nav__label">{{ item.label }}</span>
          </RouterLink>
        </nav>

        <div class="header-actions header-actions--refined">
          <div
            ref="serviceMenuRef"
            class="service-menu"
            @mouseenter="openServiceMenu"
            @mouseleave="closeServiceMenu"
          >
            <button
              type="button"
              class="service-menu__trigger"
              :aria-expanded="isServiceMenuOpen"
              :aria-label="appText.moreServicesAria"
              @click.stop="toggleServiceMenu"
            >
              <span class="service-menu__trigger-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5.25 8.1c1.7-.8 3.35-1.2 4.95-1.2 1.55 0 3.2.4 4.95 1.2 1.25.55 2.5 1 3.75 1.35"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-width="1.45"
                  />
                  <path
                    d="M5.25 15.9c1.7.8 3.35 1.2 4.95 1.2 1.55 0 3.2-.4 4.95-1.2 1.25-.55 2.5-1 3.75-1.35"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-width="1.45"
                  />
                  <circle cx="8.2" cy="12" r="1.2" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                  <circle cx="15.8" cy="12" r="1.2" fill="currentColor" />
                </svg>
              </span>
              <span class="service-menu__trigger-label">{{ appText.moreServices }}</span>
              <span
                v-if="hasFriendFeatureNotification"
                class="service-menu__trigger-dot"
                :aria-label="appText.friendNoticeAria"
              />
            </button>

            <transition name="service-dropdown">
              <div v-if="isServiceMenuOpen" class="service-menu__panel" role="menu" @click.stop>
                <button
                  v-for="feature in featureButtons"
                  :key="feature.id"
                  type="button"
                  class="service-menu__item"
                  @click="handleSelectFeature(feature.id)"
                >
                  <span class="service-menu__item-icon" aria-hidden="true">
                    <svg v-if="feature.id === 'friends'" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8.6 10.2a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Zm6.65 1.35a2.45 2.45 0 1 0 0-4.9 2.45 2.45 0 0 0 0 4.9Zm-10 6.95a4.65 4.65 0 0 1 6.95 0m1.45 0a3.95 3.95 0 0 1 5.65-.8"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.45"
                      />
                    </svg>
                    <svg v-else-if="feature.id === 'ai'" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 4.9 13.6 8.5l3.95.32-3 2.58.9 3.8L12 13.2l-3.45 2.05.9-3.8-3-2.58 3.95-.32L12 4.9Z"
                        stroke="currentColor"
                        stroke-linejoin="round"
                        stroke-width="1.45"
                      />
                      <path
                        d="M12 3.1v1.35m0 15.1v1.35m7.2-8.9h1.35m-16.1 0H5.8"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-width="1.2"
                        opacity="0.6"
                      />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7.7 7.25h8.6a1.95 1.95 0 0 1 1.95 1.95v5.6a1.95 1.95 0 0 1-1.95 1.95h-5.2l-3.5 2.45v-2.45H7.7a1.95 1.95 0 0 1-1.95-1.95V9.2a1.95 1.95 0 0 1 1.95-1.95Z"
                        stroke="currentColor"
                        stroke-linejoin="round"
                        stroke-width="1.45"
                      />
                      <path
                        d="M9 10.7h6m-6 2.8h4.2"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-width="1.25"
                      />
                    </svg>
                  </span>
                  <span class="service-menu__item-copy">
                    <strong>{{ feature.label }}</strong>
                    <small>{{ featurePanels[feature.id]?.eyebrow }}</small>
                  </span>
                  <span
                    v-if="feature.id === 'friends' && hasFriendFeatureNotification"
                    class="service-menu__item-dot"
                    :aria-label="appText.friendNoticeAria"
                  />
                </button>
              </div>
            </transition>
          </div>

          <label class="language-switch language-switch--refined">
            <select :value="language" @change="setLanguage($event.target.value)">
              <option v-for="item in languageOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>

          <div ref="profileMenuRef" class="profile-menu-wrap">
            <button
              type="button"
              class="profile-button profile-button--refined"
              :aria-label="currentUser ? appText.profileMenuLabel : appText.profileAuthLabel"
              @click.stop="toggleProfileMenu"
            >
              <span class="profile-avatar" :class="{ 'profile-avatar--filled': currentUser }">
                <span class="profile-status-dot" :class="{ 'profile-status-dot--active': currentUser }" />
                <span v-if="hasPendingFriendRequests" class="profile-request-badge">
                  {{ pendingFriendRequests.length > 9 ? '9+' : pendingFriendRequests.length }}
                </span>
                <span>{{ avatarLabel }}</span>
              </span>
              <span class="profile-copy profile-copy--refined">
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
                  <span>{{ dialogText.profileName }}</span>
                  <input
                    v-model.trim="profileForm.displayName"
                    type="text"
                    :placeholder="dialogText.profileNamePlaceholder"
                    autocomplete="nickname"
                  />
                </label>

                <label class="field">
                  <span>{{ dialogText.newPassword }}</span>
                  <input
                    v-model="profileForm.password"
                    type="password"
                    :placeholder="dialogText.newPasswordPlaceholder"
                    autocomplete="new-password"
                  />
                </label>

                <label class="field">
                  <span>{{ dialogText.confirmNewPassword }}</span>
                  <input
                    v-model="profileForm.confirmPassword"
                    type="password"
                    :placeholder="dialogText.confirmNewPasswordPlaceholder"
                    autocomplete="new-password"
                  />
                </label>

                <p v-if="profileFeedback" :class="['auth-feedback', `is-${profileFeedbackType}`]">
                  {{ profileFeedback }}
                </p>

                <div class="profile-dropdown__actions">
                  <button type="submit" class="dialog__primary" :disabled="profileSubmitting">
                    {{ profileSubmitting ? dialogText.saving : dialogText.saveChanges }}
                  </button>
                  <button type="button" class="dialog__ghost" @click="logout" :disabled="profileSubmitting">
                    {{ dialogText.logout }}
                  </button>
                </div>
                <div class="profile-dropdown__actions">
                  <button
                    type="button"
                    class="dialog__ghost"
                    :disabled="authDeletingAccount || profileSubmitting"
                    @click="deleteAccount"
                  >
                    {{ authDeletingAccount ? dialogText.deletingAccount : dialogText.deleteAccount }}
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
        <section class="footer-signature" :aria-label="appText.footerSignatureAria">
          <div class="footer-signature__headline">
            <span class="seal-stamp">苏</span>
            <h3>{{ appText.footerTitle }}</h3>
          </div>
          <p>{{ appText.footerBody }}</p>
        </section>

        <nav class="footer-nav" :aria-label="appText.footerNavAria">
          <RouterLink v-for="item in navItems" :key="`footer-${item.to}`" :to="item.to" class="footer-link">
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>

      <div class="footer-bottom">
        <p>{{ appText.footerCopyright }}</p>
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
        role="dialog"
        aria-modal="true"
        @click.self="closeFeature"
      >
        <section
          class="dialog dialog--feature"
          :class="{ 'dialog--ai': activeFeature === 'ai' }"
          @click.stop
        >
          <header class="dialog__header">
            <div class="dialog__intro">
              <p class="dialog__eyebrow">{{ activeFeatureInfo?.eyebrow }}</p>
              <h2 class="dialog__title">{{ activeFeatureInfo?.label }}</h2>
            </div>
            <button type="button" class="dialog__close" @click="closeFeature">{{ appText.close }}</button>
          </header>

          <p class="dialog__copy">{{ activeFeatureInfo?.description }}</p>

          <template v-if="activeFeature === 'friends'">
            <div v-if="!currentUser" class="feature-context">
              <span>{{ dialogText.friendsNeedLogin }}</span>
              <strong>{{ dialogText.friendsNeedLoginTitle }}</strong>
              <p>{{ dialogText.friendsNeedLoginBody }}</p>

              <div class="dialog__actions">
                <button type="button" class="dialog__primary" @click="openAuthDialog('login')">{{ dialogText.goLogin }}</button>
                <button type="button" class="dialog__ghost" @click="openAuthDialog('register')">{{ dialogText.goRegister }}</button>
              </div>
            </div>

            <div v-else class="friends-embed">
              <!-- 中文注释：这里嵌入好友页面组件，它会调用后端接口 /api/friends/add 与 /api/friends/list 完成加好友与好友列表。 -->
              <FriendsPage :show-nav-bar="false" />
            </div>
          </template>

          <template v-else-if="activeFeature === 'ai'">
            <div class="ai-shell">
              <aside class="ai-sidebar" :aria-label="dialogText.aiHistoryAria">
                <button type="button" class="ai-sidebar__new" @click="startNewAiConversation">
                  <span aria-hidden="true">+</span>
                  {{ dialogText.aiNewConversation }}
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
                        {{ dialogText.aiRenameShort }}
                      </button>
                      <button
                        type="button"
                        class="ai-sidebar__delete"
                        :disabled="isAiLoading || aiConversationDeletingId === conversation.id"
                        :aria-label="`删除会话 ${conversation.title}`"
                        @click="deleteAiConversation(conversation.id)"
                      >
                        {{ aiConversationDeletingId === conversation.id ? '...' : dialogText.aiDeleteShort }}
                      </button>
                    </div>
                  </div>
                </div>
              </aside>

              <section class="ai-main" :aria-label="dialogText.aiConversationAria">
                <div class="ai-main__body">
                  <div class="ai-starters" v-if="aiShouldShowStarter">
                    <p class="ai-starters__label">{{ dialogText.aiStarterLabel }}</p>
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
                        {{ message.role === 'user' ? dialogText.me : 'AI' }}
                      </div>
                      <div
                        :class="[
                          'message-bubble',
                          message.role === 'user' ? 'message-bubble--user' : 'message-bubble--assistant',
                        ]"
                      >
                        <span class="message-bubble__role">{{ message.role === 'user' ? dialogText.me : dialogText.aiLabel }}</span>
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
                        <span class="message-bubble__role">{{ dialogText.aiLabel }}</span>
                        <p>{{ dialogText.aiLoading }}</p>
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
                      :aria-label="dialogText.aiInputAria"
                      :placeholder="dialogText.aiInputPlaceholder"
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
                    {{ dialogText.send }}
                  </button>
                </form>
              </section>
            </div>
          </template>

          <template v-else-if="activeFeature === 'upload'">
            <div class="feature-context">
              <span>{{ dialogText.uploadHint }}</span>
              <strong>{{ dialogText.uploadTitle }}</strong>
              <p>{{ dialogText.uploadBody }}</p>
            </div>

            <form class="dialog__form" @submit.prevent="submitUploadImage">
              <label class="field field--full">
                <span>{{ dialogText.uploadPlaceName }}</span>
                <input
                  v-model.trim="uploadPlaceName"
                  type="text"
                  :placeholder="dialogText.uploadPlaceNamePlaceholder"
                />
              </label>

              <label class="field field--full">
                <span>{{ dialogText.uploadPlaceDescription }}</span>
                <textarea
                  v-model.trim="uploadPlaceDescription"
                  rows="4"
                  :placeholder="dialogText.uploadPlaceDescriptionPlaceholder"
                />
              </label>

              <label class="field field--full">
                <span>{{ dialogText.selectImage }}</span>
                <input type="file" accept="image/*" @change="handleSelectImage" />
              </label>

              <div class="dialog__actions dialog__actions--compact">
                <button type="submit" class="dialog__primary" :disabled="!selectedImageFile || isUploadingImage">
                  {{ isUploadingImage ? dialogText.uploading : dialogText.startUpload }}
                </button>
                <button type="button" class="dialog__ghost" @click="uploadedImageUrl = ''">{{ dialogText.clearPreview }}</button>
              </div>
            </form>

            <p v-if="uploadError" class="feature-feedback">{{ uploadError }}</p>

            <div v-if="uploadedImageUrl" class="upload-preview">
              <p class="upload-preview__label">{{ dialogText.uploadSuccessPreview }}</p>
              <img :src="uploadedImageUrl" alt="uploaded" class="upload-preview__image" />
            </div>
          </template>
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
                  ? dialogText.accountInfo
                  : authMode === 'login'
                    ? dialogText.loginAccount
                    : authMode === 'register'
                      ? dialogText.createAccount
                      : dialogText.resetPassword
              }}
            </h2>
            <button type="button" class="dialog__close" @click="closeAuthDialog">{{ appText.close }}</button>
          </header>

          <div v-if="!currentUser" class="dialog__tabs">
            <button
              type="button"
              class="tab-button"
              :class="{ 'is-active': authMode === 'login' }"
              @click="setAuthMode('login')"
            >
              {{ dialogText.login }}
            </button>
            <button
              type="button"
              class="tab-button"
              :class="{ 'is-active': authMode === 'register' }"
              @click="setAuthMode('register')"
            >
              {{ dialogText.register }}
            </button>
            <button
              type="button"
              class="tab-button"
              :class="{ 'is-active': authMode === 'reset' }"
              @click="setAuthMode('reset')"
            >
              {{ dialogText.resetPassword }}
            </button>
          </div>

          <p v-if="!currentUser && !isSupabaseConfigured()" class="auth-feedback is-warning">
            {{ dialogText.authNotConfigured }}
          </p>

          <template v-if="currentUser">
            <div class="feature-context">
              <span>{{ dialogText.currentAccount }}</span>
              <strong>{{ currentUser.username }}</strong>
              <p>{{ currentUser.email }}</p>
            </div>

            <form class="dialog__form" @submit.prevent="submitProfileUpdate">
              <label class="field">
                <span>{{ dialogText.profileName }}</span>
                <input
                  v-model.trim="profileForm.displayName"
                  type="text"
                  :placeholder="dialogText.profileNamePlaceholder"
                  autocomplete="nickname"
                />
              </label>

              <label class="field">
                <span>{{ dialogText.newPassword }}</span>
                <input
                  v-model="profileForm.password"
                  type="password"
                  :placeholder="dialogText.newPasswordPlaceholder"
                  autocomplete="new-password"
                />
              </label>

              <label class="field">
                <span>{{ dialogText.confirmNewPassword }}</span>
                <input
                  v-model="profileForm.confirmPassword"
                  type="password"
                  :placeholder="dialogText.confirmNewPasswordPlaceholder"
                  autocomplete="new-password"
                />
              </label>

              <p v-if="profileFeedback" :class="['auth-feedback', `is-${profileFeedbackType}`]">
                {{ profileFeedback }}
              </p>

              <div class="dialog__actions">
                <button type="submit" class="dialog__primary" :disabled="profileSubmitting">
                  {{ profileSubmitting ? dialogText.saving : dialogText.saveChanges }}
                </button>
                <button type="button" class="dialog__primary" @click="logout">{{ dialogText.logout }}</button>
                <button
                  v-if="hasPendingFriendRequests"
                  type="button"
                  class="dialog__ghost"
                  @click="pendingRequestPopupVisible = true"
                >
                  {{ dialogText.friendRequests }} {{ pendingFriendRequests.length }}
                </button>
                <button
                  type="button"
                  class="dialog__ghost"
                  :disabled="authDeletingAccount"
                  @click="deleteAccount"
                >
                  {{ authDeletingAccount ? dialogText.deletingAccount : dialogText.deleteAccount }}
                </button>
                <button type="button" class="dialog__ghost" @click="closeAuthDialog">关闭</button>
              </div>
            </form>

          </template>

          <form v-else class="dialog__form" @submit.prevent="submitAuth">
            <label v-if="authMode === 'register'" class="field">
              <span>{{ dialogText.profileName }}</span>
              <input
                v-model.trim="authForm.displayName"
                type="text"
                :placeholder="dialogText.nicknamePlaceholder"
                autocomplete="nickname"
              />
            </label>

            <label class="field">
              <span>{{ dialogText.email }}</span>
              <input
                v-model.trim="authForm.account"
                type="email"
                :placeholder="dialogText.emailPlaceholder"
                autocomplete="username"
              />
            </label>

            <label class="field">
              <span>{{ authMode === 'reset' ? dialogText.newPassword : dialogText.password }}</span>
              <input
                v-model="authForm.password"
                type="password"
                :placeholder="authMode === 'reset' ? dialogText.newPasswordPlaceholderShort : dialogText.passwordPlaceholder"
                :autocomplete="authMode === 'login' ? 'current-password' : 'new-password'"
              />
            </label>

            <label v-if="authMode === 'register' || authMode === 'reset'" class="field">
              <span>{{ authMode === 'reset' ? dialogText.confirmNewPassword : dialogText.confirmPassword }}</span>
              <input
                v-model="authForm.confirmPassword"
                type="password"
                :placeholder="authMode === 'reset' ? dialogText.confirmNewPasswordPlaceholderShort : dialogText.confirmPasswordPlaceholder"
                autocomplete="new-password"
              />
            </label>

            <template v-if="authMode === 'register' || authMode === 'reset'">
              <p class="auth-security-copy">
                {{
                  authMode === 'register'
                    ? dialogText.registerSecurityCopy
                    : dialogText.resetSecurityCopy
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
                  :placeholder="item.type === 'date' ? dialogText.datePlaceholder : dialogText.answerPlaceholder"
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
                    ? dialogText.submitting
                    : authMode === 'login'
                      ? dialogText.signInNow
                      : authMode === 'register'
                        ? dialogText.createAccount
                        : dialogText.verifyAndReset
                }}
              </button>
              <button type="button" class="dialog__ghost" @click="closeAuthDialog" :disabled="authSubmitting">{{ dialogText.cancel }}</button>
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

<style scoped>
.site-header--refined {
  position: sticky;
  top: 0;
  z-index: 48;
  border-bottom: 1px solid rgba(111, 121, 138, 0.12);
  background:
    linear-gradient(180deg, rgba(248, 245, 238, 0.96), rgba(244, 239, 231, 0.92)),
    radial-gradient(circle at top left, rgba(124, 147, 164, 0.1), transparent 32%);
  backdrop-filter: blur(18px);
}

.site-header--refined::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(175, 148, 86, 0.08) 0, rgba(175, 148, 86, 0.08) 1px, transparent 1px, transparent 24px),
    linear-gradient(rgba(175, 148, 86, 0.05) 0, rgba(175, 148, 86, 0.05) 1px, transparent 1px, transparent 24px),
    radial-gradient(circle at 18% 28%, rgba(124, 147, 164, 0.08), transparent 28%),
    radial-gradient(circle at 82% 24%, rgba(185, 155, 94, 0.08), transparent 24%);
  background-size: 24px 24px, 24px 24px, auto, auto;
  opacity: 0.34;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.62), transparent);
}

.header-inner--refined {
  position: relative;
  width: min(100%, calc(var(--max-width) + 5rem));
  min-height: 5.25rem;
  margin: 0 auto;
  padding: 1rem 1.6rem 1.1rem;
  display: flex;
  align-items: center;
  gap: 1.35rem;
}

.brand-link--refined {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  flex: 0 0 auto;
}

.site-header--refined .brand-seal {
  width: 3rem;
  border-radius: 1.1rem;
  border: 1px solid rgba(175, 148, 86, 0.2);
  background:
    linear-gradient(145deg, rgba(191, 166, 111, 0.18), rgba(124, 147, 164, 0.14)),
    rgba(255, 252, 246, 0.88);
  color: #5f4e31;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 10px 24px rgba(84, 71, 47, 0.08);
}

.site-header--refined .brand-copy {
  gap: 0.1rem;
}

.site-header--refined .brand-title {
  font-size: 1.12rem;
  letter-spacing: 0.12em;
  color: #42372c;
}

.site-header--refined .brand-subtitle {
  color: rgba(85, 81, 74, 0.68);
  letter-spacing: 0.18em;
}

.primary-nav {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
  padding: 0.48rem;
  border-radius: 2rem;
  border: 1px solid rgba(111, 121, 138, 0.12);
  background:
    linear-gradient(180deg, rgba(255, 251, 244, 0.9), rgba(246, 241, 233, 0.92)),
    radial-gradient(circle at 15% 30%, rgba(124, 147, 164, 0.08), transparent 24%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 14px 34px rgba(84, 71, 47, 0.07);
}

.primary-nav::before {
  content: '';
  position: absolute;
  inset: 0.42rem;
  border-radius: 1.6rem;
  border: 1px solid rgba(175, 148, 86, 0.08);
  pointer-events: none;
}

.primary-nav__item {
  position: relative;
  min-height: 3.5rem;
  padding: 0.72rem 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.68rem;
  border-radius: 1.55rem 1.35rem 1.6rem 1.25rem;
  border: 1px solid rgba(111, 121, 138, 0.08);
  background:
    linear-gradient(145deg, rgba(255, 252, 247, 0.95), rgba(243, 237, 229, 0.88));
  color: #4c453b;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 6px 18px rgba(84, 71, 47, 0.05);
  transition:
    transform 0.28s ease,
    border-color 0.28s ease,
    box-shadow 0.28s ease,
    background-color 0.28s ease,
    color 0.28s ease;
}

.primary-nav__item:hover,
.primary-nav__item.router-link-active,
.primary-nav__item.router-link-exact-active {
  color: #2f4e62;
  border-color: rgba(124, 147, 164, 0.24);
  background:
    linear-gradient(145deg, rgba(235, 243, 246, 0.96), rgba(247, 241, 230, 0.92));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.86),
    0 10px 24px rgba(84, 71, 47, 0.08);
  transform: translateY(-1px);
}

.primary-nav__icon {
  width: 2rem;
  height: 2rem;
  flex: 0 0 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(124, 147, 164, 0.08);
  color: inherit;
}

.primary-nav__icon svg {
  width: 1.08rem;
  height: 1.08rem;
}

.primary-nav__label {
  font-family: var(--font-serif);
  font-size: 0.96rem;
  line-height: 1.2;
  letter-spacing: 0.05em;
  text-align: center;
  white-space: normal;
}

.header-actions--refined {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  flex: 0 0 auto;
}

.service-menu {
  position: relative;
}

.service-menu__trigger,
.language-switch--refined,
.profile-button--refined {
  min-height: 3.3rem;
  border-radius: 1.35rem;
  border: 1px solid rgba(111, 121, 138, 0.12);
  background:
    linear-gradient(145deg, rgba(255, 252, 247, 0.94), rgba(243, 237, 229, 0.88));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.84),
    0 10px 22px rgba(84, 71, 47, 0.06);
}

.service-menu__trigger {
  position: relative;
  min-width: 7.6rem;
  padding: 0.68rem 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: #4c453b;
}

.service-menu__trigger-icon {
  width: 1.8rem;
  height: 1.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(124, 147, 164, 0.08);
}

.service-menu__trigger-icon svg {
  width: 1rem;
  height: 1rem;
}

.service-menu__trigger-label {
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  color: #5b5347;
  white-space: nowrap;
}

.service-menu__trigger-dot,
.service-menu__item-dot {
  width: 0.58rem;
  height: 0.58rem;
  border-radius: 999px;
  background: #b9634f;
  box-shadow: 0 0 0 3px rgba(255, 250, 244, 0.88);
}

.service-menu__trigger-dot {
  position: absolute;
  top: 0.7rem;
  right: 0.72rem;
}

.service-menu__panel {
  position: absolute;
  top: calc(100% + 0.8rem);
  right: 0;
  width: 19rem;
  padding: 0.72rem;
  display: grid;
  gap: 0.48rem;
  border-radius: 1.55rem;
  border: 1px solid rgba(111, 121, 138, 0.12);
  background:
    linear-gradient(180deg, rgba(250, 246, 239, 0.98), rgba(243, 238, 230, 0.96));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.86),
    0 22px 48px rgba(84, 71, 47, 0.14);
}

.service-menu__item {
  width: 100%;
  padding: 0.85rem 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.78rem;
  border-radius: 1.15rem;
  border: 1px solid rgba(111, 121, 138, 0.08);
  background: rgba(255, 252, 247, 0.82);
  color: #4c453b;
  text-align: left;
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    background-color 0.24s ease;
}

.service-menu__item:hover {
  transform: translateY(-1px);
  border-color: rgba(124, 147, 164, 0.2);
  background: rgba(241, 245, 244, 0.92);
}

.service-menu__item-icon {
  width: 2rem;
  height: 2rem;
  flex: 0 0 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(124, 147, 164, 0.08);
}

.service-menu__item-icon svg {
  width: 1.05rem;
  height: 1.05rem;
}

.service-menu__item-copy {
  min-width: 0;
  display: grid;
  gap: 0.16rem;
}

.service-menu__item-copy strong {
  font-weight: 600;
  color: #453d33;
}

.service-menu__item-copy small {
  color: rgba(91, 83, 71, 0.74);
  letter-spacing: 0.08em;
}

.language-switch--refined {
  display: inline-flex;
  align-items: center;
  padding: 0 0.85rem;
}

.language-switch--refined select {
  min-width: 5.7rem;
  min-height: 2.6rem;
  padding: 0 1.2rem 0 0.1rem;
  border: 0;
  background: transparent;
  color: #453d33;
  font-size: 0.86rem;
  letter-spacing: 0.05em;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.profile-button--refined {
  padding: 0.26rem 0.36rem 0.26rem 0.34rem;
  gap: 0.56rem;
}

.site-header--refined .profile-avatar {
  width: 2.2rem;
  background:
    linear-gradient(145deg, rgba(191, 166, 111, 0.16), rgba(124, 147, 164, 0.12)),
    rgba(255, 251, 245, 0.9);
  color: #5f4e31;
}

.site-header--refined .profile-status-dot {
  border-color: rgba(250, 246, 239, 0.96);
}

.profile-copy--refined {
  gap: 0.1rem;
}

.site-header--refined .profile-label {
  color: #453d33;
  font-size: 0.8rem;
}

.site-header--refined .profile-note {
  color: rgba(91, 83, 71, 0.68);
}

.site-header--refined .profile-dropdown {
  top: calc(100% + 0.9rem);
  border-radius: 1.5rem;
  border-color: rgba(111, 121, 138, 0.12);
  background:
    linear-gradient(180deg, rgba(250, 246, 239, 0.98), rgba(243, 238, 230, 0.96));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.84),
    0 22px 48px rgba(84, 71, 47, 0.14);
}

.service-dropdown-enter-active,
.service-dropdown-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.service-dropdown-enter-from,
.service-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1180px) {
  .header-inner--refined {
    flex-wrap: wrap;
    row-gap: 0.9rem;
  }

  .primary-nav {
    order: 3;
    width: 100%;
  }

  .header-actions--refined {
    margin-left: auto;
  }
}

@media (max-width: 860px) {
  .header-inner--refined {
    gap: 1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .primary-nav {
    gap: 0.58rem;
    padding: 0.38rem;
  }

  .primary-nav__item {
    min-height: 3.25rem;
    padding: 0.62rem 0.72rem;
    gap: 0.52rem;
  }

  .primary-nav__label {
    font-size: 0.84rem;
  }

  .service-menu__trigger {
    min-width: 3.3rem;
    padding-left: 0.72rem;
    padding-right: 0.72rem;
  }

  .service-menu__trigger-label,
  .profile-copy--refined {
    display: none;
  }

  .language-switch--refined {
    padding-left: 0.68rem;
    padding-right: 0.68rem;
  }

  .language-switch--refined select {
    min-width: 4.6rem;
  }
}

@media (max-width: 640px) {
  .header-inner--refined {
    grid-template-columns: minmax(0, 1fr) auto;
    display: grid;
    align-items: center;
  }

  .primary-nav {
    grid-column: 1 / -1;
    margin-top: 0.16rem;
    gap: 0.5rem;
    padding: 0.4rem;
    border-radius: 1.7rem;
  }

  .brand-link--refined {
    min-width: 0;
  }

  .site-header--refined .brand-title {
    font-size: 1rem;
  }

  .site-header--refined .brand-subtitle {
    display: none;
  }

  .primary-nav__item {
    min-height: 4.5rem;
    padding: 0.62rem 0.38rem 0.72rem;
    flex-direction: column;
    gap: 0.42rem;
    border-radius: 1.3rem;
  }

  .primary-nav__icon {
    width: 1.84rem;
    height: 1.84rem;
    flex-basis: 1.84rem;
  }

  .primary-nav__icon svg {
    width: 0.98rem;
    height: 0.98rem;
  }

  .primary-nav__label {
    font-size: 0.76rem;
    line-height: 1.35;
    letter-spacing: 0.02em;
  }

  .service-menu__panel {
    width: min(18rem, calc(100vw - 1.5rem));
    right: -0.25rem;
  }

  .language-switch--refined select {
    min-width: 4rem;
    font-size: 0.8rem;
  }

  .profile-button--refined {
    padding-right: 0.32rem;
  }
}

@media (max-width: 420px) {
  .primary-nav {
    gap: 0.42rem;
    padding: 0.34rem;
  }

  .primary-nav__item {
    min-height: 4.3rem;
    padding: 0.56rem 0.28rem 0.64rem;
    gap: 0.36rem;
  }

  .primary-nav__icon {
    width: 1.72rem;
    height: 1.72rem;
    flex-basis: 1.72rem;
  }

  .primary-nav__icon svg {
    width: 0.92rem;
    height: 0.92rem;
  }

  .primary-nav__label {
    font-size: 0.72rem;
    line-height: 1.3;
  }
}
</style>

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

.dialog--feature {
  width: min(94vw, 680px);
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
  width: 100%;
  height: auto;
  border-radius: 18px;
  border: 1px solid rgba(28, 25, 23, 0.08);
  object-fit: cover;
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

  .profile-dropdown {
    position: fixed;
    top: max(4.75rem, calc(env(safe-area-inset-top) + 4.2rem));
    left: 1rem;
    right: 1rem;
    width: auto;
    max-height: calc(100dvh - 6rem);
    overflow-y: auto;
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
    max-height: 34vh;
    padding: 0.85rem;
  }

  .dialog__header {
    flex-direction: column;
    align-items: stretch;
  }

  .ai-chat.ai-chat--main {
    padding: 1rem;
  }

  .message-row {
    gap: 0.55rem;
    align-items: flex-start;
  }

  .message-avatar {
    width: 30px;
    height: 30px;
    flex-basis: 30px;
    font-size: 0.76rem;
  }

  .message-bubble {
    max-width: 100%;
    padding: 0.85rem 0.9rem;
  }

  .ai-composer {
    flex-direction: column;
    align-items: stretch;
    padding: 0.85rem 1rem calc(0.95rem + env(safe-area-inset-bottom));
  }

  .dialog__primary.ai-composer__send {
    width: 100%;
    min-width: 0;
  }

  .friends-embed {
    min-height: 0;
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

  .dialog--ai {
    width: min(100%, 1000px);
    height: calc(100dvh - 2rem);
    max-height: calc(100dvh - 2rem);
  }
}

@media (max-width: 540px) {
  .overlay {
    padding: 0.75rem;
  }

  .dialog {
    width: 100%;
    max-height: calc(100dvh - 1.5rem);
    border-radius: 24px;
    padding: 1rem;
  }

  .dialog--feature {
    padding: 1rem;
  }

  .dialog--ai {
    width: 100%;
    height: calc(100dvh - 1.5rem);
    max-height: calc(100dvh - 1.5rem);
    padding: 0;
  }

  .dialog__title {
    font-size: 1.25rem;
  }

  .prompt-chips {
    gap: 0.45rem;
  }

  .prompt-chip {
    width: 100%;
    justify-content: flex-start;
    text-align: left;
  }

  .upload-preview {
    padding: 0.85rem;
  }
}
</style>
