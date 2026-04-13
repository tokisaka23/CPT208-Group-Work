<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  Button,
  Loading,
  NavBar,
  showConfirmDialog,
  showFailToast,
  showSuccessToast,
  showToast,
} from 'vant';
import AddFriendForm from '../../components/friends/AddFriendForm.vue';
import BlockedListSection from '../../components/friends/BlockedListSection.vue';
import CreateGroupDialog from '../../components/friends/CreateGroupDialog.vue';
import FriendCodeCard from '../../components/friends/FriendCodeCard.vue';
import FriendLocationPopup from '../../components/friends/FriendLocationNavigatorPopupI18n.vue';
import LocationShareControlCard from '../../components/friends/LocationShareControlCardI18n.vue';
import GroupChatDialog from '../../components/friends/GroupChatPopup.vue';
import FriendManagePanel from '../../components/friends/FriendManagePanel.vue';
import GroupChatSection from '../../components/friends/GroupChatSection.vue';
import {
  addGroupMembers,
  createGroupChat,
  exitGroupChat,
  getGroupChats,
  getGroupMessages,
  markGroupChatAsRead,
  renameGroupChat,
  removeGroupMember,
  sendGroupMessage,
} from '../../services/friends/groupChatService';
import {
  blockFriend,
  getCurrentUserProfile,
  getBlockedFriendList,
  getFriendList,
  getFriendLocation,
  getLocationSharingOverview,
  removeFriend,
  sendFriendRequest,
  setLocationSharingForAllFriends,
  syncCurrentUserLocationSilently,
  unblockFriend,
  updateCurrentUserLocationWithPrompt,
} from '../../services/friends/friendServiceRuntime';
import { resolveLocalized, useLanguage } from '../../i18n';
import { getFriendLocationFallbackMessage } from '../../shared/friendLocation';

defineProps({
  showNavBar: {
    type: Boolean,
    default: true,
  },
});

const { language } = useLanguage();

const textSource = {
  defaultFeedback: {
    zh: '当前列表会展示已通过确认的好友，新的好友申请需要等待对方处理。',
    en: 'This list shows confirmed friends. New requests stay pending until the other person responds.',
    ja: 'ここには承認済みの友だちが表示されます。新しい申請は相手の対応待ちです。',
    ko: '이 목록에는 승인된 친구만 표시됩니다. 새 요청은 상대방의 처리를 기다려야 합니다.',
  },
  navTitle: {
    zh: '好友与定位',
    en: 'Friends and Location',
    ja: '友だちと位置情報',
    ko: '친구와 위치',
  },
  loading: {
    zh: '正在加载好友数据...',
    en: 'Loading friend data...',
    ja: '友だちデータを読み込み中...',
    ko: '친구 데이터를 불러오는 중...',
  },
  pageLoadFailed: {
    zh: '页面加载失败',
    en: 'Page Failed to Load',
    ja: 'ページの読み込みに失敗しました',
    ko: '페이지를 불러오지 못했습니다',
  },
  pageLoadErrorFallback: {
    zh: '好友页面加载失败，请稍后重试',
    en: 'Failed to load the friends page. Please try again later.',
    ja: '友だちページの読み込みに失敗しました。しばらくしてからお試しください。',
    ko: '친구 페이지를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
  },
  reload: {
    zh: '重新加载',
    en: 'Reload',
    ja: '再読み込み',
    ko: '다시 불러오기',
  },
};

const text = computed(() => resolveLocalized(textSource, language.value));

const uiText = computed(() => resolveLocalized({
  cancel: { zh: '取消', en: 'Cancel', ja: 'キャンセル', ko: '취소' },
  removeFriendTitle: { zh: '删除好友', en: 'Remove Friend', ja: '友だちを削除', ko: '친구 삭제' },
  removeFriendMessage: { zh: '确认将 {username} 从好友列表中删除吗？', en: 'Remove {username} from your friend list?', ja: '{username} を友だち一覧から削除しますか？', ko: '{username} 님을 친구 목록에서 삭제할까요?' },
  friendRemoved: { zh: '好友已删除', en: 'Friend removed', ja: '友だちを削除しました', ko: '친구를 삭제했습니다' },
  removeFriendFailed: { zh: '删除好友失败，请稍后再试', en: 'Failed to remove the friend. Please try again later.', ja: '友だちの削除に失敗しました。しばらくしてから再試行してください。', ko: '친구 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
  blockFriendTitle: { zh: '拉黑好友', en: 'Block Friend', ja: '友だちをブロック', ko: '친구 차단' },
  blockFriendMessage: { zh: '确认将 {username} 拉入黑名单吗？拉黑后会自动解除好友关系。', en: 'Block {username}? This will also remove the friendship.', ja: '{username} をブロックしますか？ブロックすると友だち関係も解除されます。', ko: '{username} 님을 차단할까요? 차단하면 친구 관계도 함께 해제됩니다.' },
  confirmBlock: { zh: '确认拉黑', en: 'Block', ja: 'ブロックする', ko: '차단' },
  blockSuccess: { zh: '已加入黑名单', en: 'Added to block list', ja: 'ブロック一覧に追加しました', ko: '차단 목록에 추가했습니다' },
  blockFailed: { zh: '拉黑好友失败，请稍后再试', en: 'Failed to block the friend. Please try again later.', ja: '友だちのブロックに失敗しました。しばらくしてから再試行してください。', ko: '친구 차단에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
  unblockTitle: { zh: '移出黑名单', en: 'Remove from Block List', ja: 'ブロック解除', ko: '차단 해제' },
  unblockMessage: { zh: '确认将 {username} 移出黑名单吗？移出后会自动恢复为好友。', en: 'Remove {username} from the block list and restore the friendship?', ja: '{username} をブロック一覧から外して友だちに戻しますか？', ko: '{username} 님을 차단 목록에서 제거하고 친구로 복원할까요?' },
  unblockSuccess: { zh: '已恢复好友', en: 'Friend restored', ja: '友だちに戻しました', ko: '친구로 복원했습니다' },
  unblockFailed: { zh: '移出黑名单失败，请稍后再试', en: 'Failed to remove the user from the block list. Please try again later.', ja: 'ブロック解除に失敗しました。しばらくしてから再試行してください。', ko: '차단 해제에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
  clipboardUnsupported: { zh: '当前环境不支持自动复制，请手动复制', en: 'Automatic copy is not supported here. Please copy it manually.', ja: 'この環境では自動コピーに対応していません。手動でコピーしてください。', ko: '현재 환경에서는 자동 복사를 지원하지 않습니다. 직접 복사해 주세요.' },
  friendCodeCopied: { zh: '好友码已复制', en: 'Friend code copied', ja: 'フレンドコードをコピーしました', ko: '친구 코드를 복사했습니다' },
  addFriendEmptyFeedback: { zh: '请输入对方的好友码后再发送好友请求。', en: 'Enter your friend’s code before sending the request.', ja: '友だち申請を送る前に相手のフレンドコードを入力してください。', ko: '친구 요청을 보내기 전에 상대방의 친구 코드를 입력해 주세요.' },
  addFriendEmptyToast: { zh: '请输入好友码', en: 'Enter a friend code', ja: 'フレンドコードを入力してください', ko: '친구 코드를 입력해 주세요' },
  addFriendSuccess: { zh: '好友请求已发送', en: 'Friend request sent', ja: '友だち申請を送信しました', ko: '친구 요청을 보냈습니다' },
  addFriendFailed: { zh: '发送好友请求失败，请稍后再试', en: 'Failed to send the friend request. Please try again later.', ja: '友だち申請の送信に失敗しました。しばらくしてから再試行してください。', ko: '친구 요청 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
  refreshFriendsFailed: { zh: '刷新好友列表失败', en: 'Failed to refresh the friend list.', ja: '友だち一覧の更新に失敗しました。', ko: '친구 목록 새로고침에 실패했습니다.' },
  enableSharingSuccess: { zh: '已开启位置共享', en: 'Location sharing enabled', ja: '位置共有をオンにしました', ko: '위치 공유를 켰습니다' },
  enableSharingFailed: { zh: '开启位置共享失败', en: 'Failed to enable location sharing.', ja: '位置共有をオンにできませんでした。', ko: '위치 공유를 켜지 못했습니다.' },
  disableSharingSuccess: { zh: '已关闭位置共享', en: 'Location sharing disabled', ja: '位置共有をオフにしました', ko: '위치 공유를 껐습니다' },
  disableSharingFailed: { zh: '关闭位置共享失败', en: 'Failed to disable location sharing.', ja: '位置共有をオフにできませんでした。', ko: '위치 공유를 끄지 못했습니다.' },
  refreshMyLocationSuccess: { zh: '当前位置已更新', en: 'Current location updated', ja: '現在地を更新しました', ko: '현재 위치를 업데이트했습니다' },
  refreshMyLocationFailed: { zh: '更新当前位置失败', en: 'Failed to update the current location.', ja: '現在地の更新に失敗しました。', ko: '현재 위치 업데이트에 실패했습니다.' },
  needOneFriend: { zh: '请先添加至少 1 位好友', en: 'Add at least one friend first.', ja: '先に少なくとも 1 人の友だちを追加してください。', ko: '먼저 친구를 최소 1명 추가해 주세요.' },
  needSelectFriend: { zh: '请至少选择 1 位好友', en: 'Select at least one friend.', ja: '少なくとも 1 人の友だちを選択してください。', ko: '친구를 최소 1명 선택해 주세요.' },
  createGroupSuccess: { zh: '群聊已创建', en: 'Group chat created', ja: 'グループチャットを作成しました', ko: '그룹 채팅을 만들었습니다' },
  createGroupFailed: { zh: '创建群聊失败，请稍后再试', en: 'Failed to create the group chat. Please try again later.', ja: 'グループチャットの作成に失敗しました。しばらくしてから再試行してください。', ko: '그룹 채팅 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
  groupCreatedFeedback: { zh: '群聊“{name}”已创建。', en: 'Group chat "{name}" has been created.', ja: 'グループチャット「{name}」を作成しました。', ko: '그룹 채팅 "{name}"을 만들었습니다.' },
  refreshGroupsFailed: { zh: '刷新群聊列表失败', en: 'Failed to refresh the group list.', ja: 'グループ一覧の更新に失敗しました。', ko: '그룹 목록 새로고침에 실패했습니다.' },
  loadGroupMessagesFailed: { zh: '读取群聊消息失败', en: 'Failed to load group messages.', ja: 'グループメッセージの読み込みに失敗しました。', ko: '그룹 메시지를 불러오지 못했습니다.' },
  sendGroupMessageFailed: { zh: '发送群消息失败', en: 'Failed to send the group message.', ja: 'グループメッセージの送信に失敗しました。', ko: '그룹 메시지 전송에 실패했습니다.' },
  inviteMembersSuccess: { zh: '已邀请好友入群', en: 'Friends invited to the group', ja: '友だちをグループに招待しました', ko: '친구를 그룹에 초대했습니다' },
  inviteMembersFailed: { zh: '邀请好友入群失败', en: 'Failed to invite friends to the group.', ja: '友だちの招待に失敗しました。', ko: '친구 초대에 실패했습니다.' },
  removeGroupMemberTitle: { zh: '移出群成员', en: 'Remove Group Member', ja: 'メンバーを削除', ko: '그룹 멤버 제거' },
  removeGroupMemberMessage: { zh: '确认将 {username} 移出该群聊吗？', en: 'Remove {username} from this group chat?', ja: '{username} をこのグループチャットから外しますか？', ko: '{username} 님을 이 그룹 채팅에서 제거할까요?' },
  removedGroupMemberSuccess: { zh: '成员已移出', en: 'Member removed', ja: 'メンバーを削除しました', ko: '멤버를 제거했습니다' },
  removeGroupMemberFailed: { zh: '移出群成员失败', en: 'Failed to remove the group member.', ja: 'メンバーの削除に失敗しました。', ko: '그룹 멤버 제거에 실패했습니다.' },
  exitGroupTitle: { zh: '退出群聊', en: 'Leave Group Chat', ja: 'グループを退出', ko: '그룹 채팅 나가기' },
  exitGroupMessage: { zh: '确认退出“{name}”吗？', en: 'Leave "{name}"?', ja: '「{name}」から退出しますか？', ko: '"{name}"에서 나갈까요?' },
  exitGroupSuccess: { zh: '你已退出群聊', en: 'You left the group chat', ja: 'グループチャットから退出しました', ko: '그룹 채팅에서 나갔습니다' },
  exitGroupFailed: { zh: '退出群聊失败', en: 'Failed to leave the group chat.', ja: 'グループチャットの退出に失敗しました。', ko: '그룹 채팅 나가기에 실패했습니다.' },
  renameGroupSuccess: { zh: '群名已更新', en: 'Group name updated', ja: 'グループ名を更新しました', ko: '그룹 이름을 업데이트했습니다' },
  renameGroupFailed: { zh: '修改群名失败', en: 'Failed to update the group name.', ja: 'グループ名の更新に失敗しました。', ko: '그룹 이름 수정에 실패했습니다.' },
  noMemberFriendCode: { zh: '该成员暂未提供可添加的好友码', en: 'This member has not provided an addable friend code yet.', ja: 'このメンバーは追加可能なフレンドコードをまだ公開していません。', ko: '이 멤버는 아직 추가 가능한 친구 코드를 제공하지 않았습니다.' },
  addGroupMemberFriendFeedback: { zh: '已向 {username} 发送好友请求', en: 'A friend request has been sent to {username}', ja: '{username} に友だち申請を送りました', ko: '{username} 님에게 친구 요청을 보냈습니다' },
}, language.value));

const localizedUiText = computed(() => resolveLocalized({
  cancel: { zh: '取消', en: 'Cancel', ja: 'キャンセル', ko: '취소' },
  removeAction: { zh: '删除', en: 'Remove', ja: '削除', ko: '삭제' },
  unblockAction: { zh: '移出', en: 'Remove', ja: '解除', ko: '해제' },
  exitAction: { zh: '退出', en: 'Leave', ja: '退出', ko: '나가기' },
  removeFriendTitle: { zh: '删除好友', en: 'Remove Friend', ja: '友だちを削除', ko: '친구 삭제' },
  removeFriendMessage: { zh: '确认将 {username} 从好友列表中删除吗？', en: 'Remove {username} from your friend list?', ja: '{username} を友だち一覧から削除しますか？', ko: '{username} 님을 친구 목록에서 삭제할까요?' },
  friendRemoved: { zh: '好友已删除', en: 'Friend removed', ja: '友だちを削除しました', ko: '친구를 삭제했습니다' },
  removeFriendFailed: { zh: '删除好友失败，请稍后再试', en: 'Failed to remove the friend. Please try again later.', ja: '友だちの削除に失敗しました。しばらくしてから再試行してください。', ko: '친구 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
  blockFriendTitle: { zh: '拉黑好友', en: 'Block Friend', ja: '友だちをブロック', ko: '친구 차단' },
  blockFriendMessage: { zh: '确认将 {username} 拉入黑名单吗？拉黑后会自动解除好友关系。', en: 'Block {username}? This will also remove the friendship.', ja: '{username} をブロックしますか？ブロックすると友だち関係も解除されます。', ko: '{username} 님을 차단할까요? 차단하면 친구 관계도 함께 해제됩니다.' },
  confirmBlock: { zh: '确认拉黑', en: 'Block', ja: 'ブロック', ko: '차단' },
  blockSuccess: { zh: '已加入黑名单', en: 'Added to block list', ja: 'ブロック一覧に追加しました', ko: '차단 목록에 추가했습니다' },
  blockFailed: { zh: '拉黑好友失败，请稍后再试', en: 'Failed to block the friend. Please try again later.', ja: '友だちのブロックに失敗しました。しばらくしてから再試行してください。', ko: '친구 차단에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
  unblockTitle: { zh: '移出黑名单', en: 'Remove from Block List', ja: 'ブロック解除', ko: '차단 해제' },
  unblockMessage: { zh: '确认将 {username} 移出黑名单吗？移出后会自动恢复为好友。', en: 'Remove {username} from the block list and restore the friendship?', ja: '{username} をブロック一覧から外して友だちに戻しますか？', ko: '{username} 님을 차단 목록에서 제거하고 친구로 복원할까요?' },
  unblockSuccess: { zh: '已恢复好友', en: 'Friend restored', ja: '友だちに戻しました', ko: '친구로 복원했습니다' },
  unblockFailed: { zh: '移出黑名单失败，请稍后再试', en: 'Failed to remove the user from the block list. Please try again later.', ja: 'ブロック解除に失敗しました。しばらくしてから再試行してください。', ko: '차단 해제에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
  clipboardUnsupported: { zh: '当前环境不支持自动复制，请手动复制', en: 'Automatic copy is not supported here. Please copy it manually.', ja: 'この環境では自動コピーに対応していません。手動でコピーしてください。', ko: '현재 환경에서는 자동 복사를 지원하지 않습니다. 직접 복사해 주세요.' },
  friendCodeCopied: { zh: '好友码已复制', en: 'Friend code copied', ja: 'フレンドコードをコピーしました', ko: '친구 코드를 복사했습니다' },
  addFriendEmptyFeedback: { zh: '请输入对方的好友码后再发送好友请求。', en: 'Enter your friend’s code before sending the request.', ja: '友だち申請を送る前に相手のフレンドコードを入力してください。', ko: '친구 요청을 보내기 전에 상대방의 친구 코드를 입력해 주세요.' },
  addFriendEmptyToast: { zh: '请输入好友码', en: 'Enter a friend code', ja: 'フレンドコードを入力してください', ko: '친구 코드를 입력해 주세요' },
  addFriendSuccess: { zh: '好友请求已发送', en: 'Friend request sent', ja: '友だち申請を送信しました', ko: '친구 요청을 보냈습니다' },
  addFriendFailed: { zh: '发送好友请求失败，请稍后再试', en: 'Failed to send the friend request. Please try again later.', ja: '友だち申請の送信に失敗しました。しばらくしてから再試行してください。', ko: '친구 요청 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
  friendOfflineToast: { zh: '好友当前不在线', en: 'This friend is currently offline', ja: 'この友だちは現在オフラインです', ko: '이 친구는 현재 오프라인입니다' },
  friendSharingOffToast: { zh: '对方暂未开放位置共享', en: 'This friend has not enabled location sharing yet', ja: '相手はまだ位置共有を有効にしていません', ko: '상대방이 아직 위치 공유를 켜지 않았습니다' },
  loadFriendLocationFailed: { zh: '获取好友定位失败', en: 'Failed to load the friend location', ja: '友だちの位置情報を取得できませんでした', ko: '친구 위치를 불러오지 못했습니다' },
  refreshFriendsFailed: { zh: '刷新好友列表失败', en: 'Failed to refresh the friend list.', ja: '友だち一覧の更新に失敗しました。', ko: '친구 목록 새로고침에 실패했습니다.' },
  enableSharingSuccess: { zh: '已开启位置共享', en: 'Location sharing enabled', ja: '位置共有をオンにしました', ko: '위치 공유를 켰습니다' },
  enableSharingFailed: { zh: '开启位置共享失败', en: 'Failed to enable location sharing.', ja: '位置共有をオンにできませんでした。', ko: '위치 공유를 켜지 못했습니다.' },
  disableSharingSuccess: { zh: '已关闭位置共享', en: 'Location sharing disabled', ja: '位置共有をオフにしました', ko: '위치 공유를 껐습니다' },
  disableSharingFailed: { zh: '关闭位置共享失败', en: 'Failed to disable location sharing.', ja: '位置共有をオフにできませんでした。', ko: '위치 공유를 끄지 못했습니다.' },
  refreshMyLocationSuccess: { zh: '当前位置已更新', en: 'Current location updated', ja: '現在地を更新しました', ko: '현재 위치를 업데이트했습니다' },
  refreshMyLocationFailed: { zh: '更新当前位置失败', en: 'Failed to update the current location.', ja: '現在地の更新に失敗しました。', ko: '현재 위치 업데이트에 실패했습니다.' },
  needOneFriend: { zh: '请先添加至少 1 位好友', en: 'Add at least one friend first.', ja: '先に少なくとも 1 人の友だちを追加してください。', ko: '먼저 친구를 최소 1명 추가해 주세요.' },
  needSelectFriend: { zh: '请至少选择 1 位好友', en: 'Select at least one friend.', ja: '少なくとも 1 人の友だちを選択してください。', ko: '친구를 최소 1명 선택해 주세요.' },
  createGroupSuccess: { zh: '群聊已创建', en: 'Group chat created', ja: 'グループチャットを作成しました', ko: '그룹 채팅을 만들었습니다' },
  createGroupFailed: { zh: '创建群聊失败，请稍后再试', en: 'Failed to create the group chat. Please try again later.', ja: 'グループチャットの作成に失敗しました。しばらくしてから再試行してください。', ko: '그룹 채팅 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
  groupCreatedFeedback: { zh: '群聊“{name}”已创建。', en: 'Group chat "{name}" has been created.', ja: 'グループチャット「{name}」を作成しました。', ko: '그룹 채팅 "{name}"을 만들었습니다.' },
  refreshGroupsFailed: { zh: '刷新群聊列表失败', en: 'Failed to refresh the group list.', ja: 'グループ一覧の更新に失敗しました。', ko: '그룹 목록 새로고침에 실패했습니다.' },
  loadGroupMessagesFailed: { zh: '读取群聊消息失败', en: 'Failed to load group messages.', ja: 'グループメッセージの読み込みに失敗しました。', ko: '그룹 메시지를 불러오지 못했습니다.' },
  sendGroupMessageFailed: { zh: '发送群消息失败', en: 'Failed to send the group message.', ja: 'グループメッセージの送信に失敗しました。', ko: '그룹 메시지 전송에 실패했습니다.' },
  inviteMembersSuccess: { zh: '已邀请好友入群', en: 'Friends invited to the group', ja: '友だちをグループに招待しました', ko: '친구를 그룹에 초대했습니다' },
  inviteMembersFailed: { zh: '邀请好友入群失败', en: 'Failed to invite friends to the group.', ja: '友だちの招待に失敗しました。', ko: '친구 초대에 실패했습니다.' },
  removeGroupMemberTitle: { zh: '移出群成员', en: 'Remove Group Member', ja: 'メンバーを削除', ko: '그룹 멤버 제거' },
  removeGroupMemberMessage: { zh: '确认将 {username} 移出该群聊吗？', en: 'Remove {username} from this group chat?', ja: '{username} をこのグループチャットから外しますか？', ko: '{username} 님을 이 그룹 채팅에서 제거할까요?' },
  removedGroupMemberSuccess: { zh: '成员已移出', en: 'Member removed', ja: 'メンバーを削除しました', ko: '멤버를 제거했습니다' },
  removeGroupMemberFailed: { zh: '移出群成员失败', en: 'Failed to remove the group member.', ja: 'メンバーの削除に失敗しました。', ko: '그룹 멤버 제거에 실패했습니다.' },
  exitGroupTitle: { zh: '退出群聊', en: 'Leave Group Chat', ja: 'グループを退出', ko: '그룹 채팅 나가기' },
  exitGroupMessage: { zh: '确认退出“{name}”吗？', en: 'Leave "{name}"?', ja: '「{name}」から退出しますか？', ko: '"{name}"에서 나갈까요?' },
  exitGroupSuccess: { zh: '你已退出群聊', en: 'You left the group chat', ja: 'グループチャットから退出しました', ko: '그룹 채팅에서 나갔습니다' },
  exitGroupFailed: { zh: '退出群聊失败', en: 'Failed to leave the group chat.', ja: 'グループチャットの退出に失敗しました。', ko: '그룹 채팅 나가기에 실패했습니다.' },
  renameGroupSuccess: { zh: '群名已更新', en: 'Group name updated', ja: 'グループ名を更新しました', ko: '그룹 이름을 업데이트했습니다' },
  renameGroupFailed: { zh: '修改群名失败', en: 'Failed to update the group name.', ja: 'グループ名の更新に失敗しました。', ko: '그룹 이름 변경에 실패했습니다.' },
  noMemberFriendCode: { zh: '该成员暂未提供可添加的好友码', en: 'This member has not provided an addable friend code yet.', ja: 'このメンバーは追加可能なフレンドコードをまだ公開していません。', ko: '이 멤버는 아직 추가 가능한 친구 코드를 제공하지 않았습니다.' },
  addGroupMemberFriendFeedback: { zh: '已向 {username} 发送好友请求', en: 'A friend request has been sent to {username}', ja: '{username} に友だち申請を送りました', ko: '{username} 님에게 친구 요청을 보냈습니다' },
}, language.value));

function formatUiText(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ''));
}

function t(key, params = {}) {
  return formatUiText(localizedUiText.value[key] || '', params);
}

const currentUser = ref(null);
const friends = ref([]);
const blockedUsers = ref([]);
const groupChats = ref([]);
const friendCodeInput = ref('');
const pageLoading = ref(true);
const pageError = ref('');
const isSubmitting = ref(false);
const groupSubmitting = ref(false);
const groupMessageLoading = ref(false);
const groupMessageSending = ref(false);
const groupMemberSubmitting = ref(false);
const groupRenaming = ref(false);
const groupFriendSubmitting = ref(false);
const processingFriendId = ref('');
const processingAction = ref('');
const locationPopupVisible = ref(false);
const selectedFriend = ref(null);
const locationPopupLoading = ref(false);
const locationPopupError = ref('');
const locationSharingOverview = ref({
  totalFriends: 0,
  activeFriendCount: 0,
  sharingMode: 'off',
  lastLocationUpdatedAt: null,
  isOnline: false,
});
const locationSharingLoading = ref(false);
const locationRefreshing = ref(false);
const createGroupPopupVisible = ref(false);
const activeGroupChat = ref(null);
const groupChatPopupVisible = ref(false);
const activeGroupMessages = ref([]);
const groupChatPolling = ref(false);
const feedbackText = ref('');
const feedbackType = ref('info');
const GROUP_CHAT_POLL_INTERVAL = 12000;

watch(
  () => language.value,
  () => {
    if (feedbackType.value === 'info' || !feedbackText.value) {
      feedbackText.value = text.value.defaultFeedback;
    }
  },
  { immediate: true },
);

let groupChatPollTimer = null;

function setFeedback(type, text) {
  feedbackType.value = type;
  feedbackText.value = text;
}

function updateGroupChatState(nextGroups) {
  groupChats.value = nextGroups;

  if (!activeGroupChat.value?.id) {
    return;
  }

  const matchedGroup = nextGroups.find((group) => group.id === activeGroupChat.value.id) || null;

  if (!matchedGroup) {
    groupChatPopupVisible.value = false;
    activeGroupChat.value = null;
    activeGroupMessages.value = [];
    return;
  }

  activeGroupChat.value = matchedGroup;
}

async function refreshLocationSharingOverview() {
  locationSharingOverview.value = await getLocationSharingOverview();
}

async function loadPage() {
  pageLoading.value = true;
  pageError.value = '';

  try {
    const userProfile = await getCurrentUserProfile();

    // 中文注释：这里会请求后端 /api/friends/list，并同步读取当前登录用户资料。
    const [friendList, blockedList, storedGroups, sharingOverview] = await Promise.all([
      getFriendList(),
      getBlockedFriendList(),
      getGroupChats({ currentUserId: userProfile?.id || '' }),
      getLocationSharingOverview(),
    ]);

    currentUser.value = userProfile;
    friends.value = friendList;
    blockedUsers.value = blockedList;
    updateGroupChatState(storedGroups);
    locationSharingOverview.value = sharingOverview;
    syncCurrentUserLocationSilently().catch(() => {});
  } catch (error) {
    console.error('[FriendsPage] 加载好友页面失败', error);
    pageError.value = error.message || text.value.pageLoadErrorFallback;
  } finally {
    pageLoading.value = false;
  }
}

async function refreshRelationshipData() {
  const [friendList, blockedList, sharingOverview] = await Promise.all([
    getFriendList(),
    getBlockedFriendList(),
    getLocationSharingOverview(),
  ]);

  friends.value = friendList;
  blockedUsers.value = blockedList;
  locationSharingOverview.value = sharingOverview;
}

async function refreshGroupChats() {
  const nextGroups = await getGroupChats({
    currentUserId: currentUser.value?.id || '',
  });
  updateGroupChatState(nextGroups);
  return nextGroups;
}

function markGroupAsRead(groupId, messages = []) {
  const normalizedGroupId = String(groupId || '').trim();
  const normalizedCurrentUserId = String(currentUser.value?.id || '').trim();

  if (!normalizedGroupId || !normalizedCurrentUserId) {
    return;
  }

  const latestMessage = [...(messages || [])]
    .filter((message) => message?.createdAt)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0];

  markGroupChatAsRead({
    currentUserId: normalizedCurrentUserId,
    groupId: normalizedGroupId,
    readAt: latestMessage?.createdAt || new Date().toISOString(),
  });

  groupChats.value = groupChats.value.map((group) => (
    group.id === normalizedGroupId
      ? { ...group, hasUnread: false }
      : group
  ));
}

function stopGroupChatPolling() {
  if (groupChatPollTimer) {
    window.clearInterval(groupChatPollTimer);
    groupChatPollTimer = null;
  }
}

async function pollGroupChatData() {
  if (groupChatPolling.value || !currentUser.value?.id) {
    return;
  }

  groupChatPolling.value = true;

  try {
    if (groupChatPopupVisible.value && activeGroupChat.value?.id) {
      const nextMessages = await getGroupMessages(activeGroupChat.value.id);
      activeGroupMessages.value = nextMessages;
      markGroupAsRead(activeGroupChat.value.id, nextMessages);
    }

    await refreshGroupChats();
  } catch (error) {
    console.error('[FriendsPage] 轮询群聊数据失败', error);
  } finally {
    groupChatPolling.value = false;
  }
}

function startGroupChatPolling() {
  stopGroupChatPolling();

  if (typeof window === 'undefined') {
    return;
  }

  groupChatPollTimer = window.setInterval(() => {
    pollGroupChatData();
  }, GROUP_CHAT_POLL_INTERVAL);
}

async function handleCopyFriendCode() {
  const code = currentUser.value?.friendCode;

  if (code) {
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error(t('clipboardUnsupported'));
      }

      await navigator.clipboard.writeText(code);
      showSuccessToast(t('friendCodeCopied'));
    } catch {
      showToast(t('clipboardUnsupported'));
    }
  }

  return;

  if (!code) {
    return;
  }

  try {
    if (!navigator?.clipboard?.writeText) {
      throw new Error('当前环境不支持自动复制');
    }

    await navigator.clipboard.writeText(code);
    showSuccessToast('好友码已复制');
  } catch {
    showToast('当前环境不支持自动复制，请手动复制');
  }
}

async function handleAddFriend() {
  const targetFriendCode = friendCodeInput.value.trim().toUpperCase();

  if (!targetFriendCode) {
    setFeedback('error', t('addFriendEmptyFeedback'));
    showFailToast(t('addFriendEmptyToast'));
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await sendFriendRequest({ targetFriendCode });
    friendCodeInput.value = '';
    setFeedback('success', result.message || t('addFriendSuccess'));
    showSuccessToast(t('addFriendSuccess'));
    await refreshRelationshipData();
  } catch (error) {
    console.error('[FriendsPage] 添加好友失败', error);
    const message = error.message || t('addFriendFailed');
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    isSubmitting.value = false;
  }

  return;

  if (!targetFriendCode) {
    setFeedback('error', '请输入对方的好友码后再发送好友请求。');
    showFailToast('请输入好友码');
    return;
  }

  isSubmitting.value = true;

  try {
    // 中文注释：这里连接后端添加好友接口 /api/friends/add，请求体会携带 targetFriendCode。
    const result = await sendFriendRequest({ targetFriendCode });
    friendCodeInput.value = '';
    setFeedback('success', result.message);
    showSuccessToast('好友请求已发送');
    await refreshRelationshipData();
  } catch (error) {
    console.error('[FriendsPage] 添加好友失败', error);
    const message = error.message || '发送好友请求失败，请稍后再试';
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleRemoveFriend(friend) {
  try {
    await showConfirmDialog({
      title: t('removeFriendTitle'),
      message: t('removeFriendMessage', { username: friend.username }),
      confirmButtonText: t('removeAction'),
      cancelButtonText: t('cancel'),
    });
  } catch {
    return;
  }

  processingFriendId.value = friend.id;
  processingAction.value = 'remove';

  try {
    const result = await removeFriend({ friendUserId: friend.id });

    if (selectedFriend.value?.id === friend.id) {
      handlePopupVisibleChange(false);
    }

    setFeedback('success', result.message || t('friendRemoved'));
    showSuccessToast(t('friendRemoved'));
    await refreshRelationshipData();
  } catch (error) {
    const message = error.message || t('removeFriendFailed');
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    processingFriendId.value = '';
    processingAction.value = '';
  }

  return;

  try {
    await showConfirmDialog({
      title: '删除好友',
      message: `确认将 ${friend.username} 从好友列表中删除吗？`,
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }

  processingFriendId.value = friend.id;
  processingAction.value = 'remove';

  try {
    const result = await removeFriend({ friendUserId: friend.id });

    if (selectedFriend.value?.id === friend.id) {
      handlePopupVisibleChange(false);
    }

    setFeedback('success', result.message);
    showSuccessToast('好友已删除');
    await refreshRelationshipData();
  } catch (error) {
    const message = error.message || '删除好友失败，请稍后再试';
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    processingFriendId.value = '';
    processingAction.value = '';
  }
}

async function handleBlockFriend(friend) {
  try {
    await showConfirmDialog({
      title: t('blockFriendTitle'),
      message: t('blockFriendMessage', { username: friend.username }),
      confirmButtonText: t('confirmBlock'),
      cancelButtonText: t('cancel'),
    });
  } catch {
    return;
  }

  processingFriendId.value = friend.id;
  processingAction.value = 'block';

  try {
    const result = await blockFriend({ friendUserId: friend.id });

    if (selectedFriend.value?.id === friend.id) {
      handlePopupVisibleChange(false);
    }

    setFeedback('success', result.message || t('blockSuccess'));
    showSuccessToast(t('blockSuccess'));
    await refreshRelationshipData();
  } catch (error) {
    const message = error.message || t('blockFailed');
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    processingFriendId.value = '';
    processingAction.value = '';
  }

  return;

  try {
    await showConfirmDialog({
      title: '拉黑好友',
      message: `确认将 ${friend.username} 拉入黑名单吗？拉黑后会自动解除好友关系。`,
      confirmButtonText: '确认拉黑',
      cancelButtonText: '取消',
    });
  } catch {
    return;
  }

  processingFriendId.value = friend.id;
  processingAction.value = 'block';

  try {
    const result = await blockFriend({ friendUserId: friend.id });

    if (selectedFriend.value?.id === friend.id) {
      handlePopupVisibleChange(false);
    }

    setFeedback('success', result.message);
    showSuccessToast('已加入黑名单');
    await refreshRelationshipData();
  } catch (error) {
    const message = error.message || '拉黑好友失败，请稍后再试';
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    processingFriendId.value = '';
    processingAction.value = '';
  }
}

async function handleUnblockFriend(friend) {
  try {
    await showConfirmDialog({
      title: t('unblockTitle'),
      message: t('unblockMessage', { username: friend.username }),
      confirmButtonText: t('unblockAction'),
      cancelButtonText: t('cancel'),
    });
  } catch {
    return;
  }

  processingFriendId.value = friend.id;
  processingAction.value = 'unblock';

  try {
    const result = await unblockFriend({ friendUserId: friend.id });
    setFeedback('success', result.message || t('unblockSuccess'));
    showSuccessToast(t('unblockSuccess'));
    await refreshRelationshipData();
  } catch (error) {
    const message = error.message || t('unblockFailed');
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    processingFriendId.value = '';
    processingAction.value = '';
  }
}

async function handleSelectFriend(friend) {
  if (!friend.isOnline) {
    showToast(t('friendOfflineToast'));
    return;
  }

  if (!friend.isLocationSharingEnabled) {
    showToast(t('friendSharingOffToast'));
    return;
  }

  try {
    selectedFriend.value = friend;
    locationPopupVisible.value = true;
  } catch (error) {
    showFailToast(error.message || t('loadFriendLocationFailed'));
  }
}

function handlePopupVisibleChange(nextVisible) {
  locationPopupVisible.value = nextVisible;

  if (!nextVisible) {
    selectedFriend.value = null;
    locationPopupLoading.value = false;
    locationPopupError.value = '';
  }
}

async function handleFriendDataChanged() {
  try {
    await refreshRelationshipData();
  } catch (error) {
    showFailToast(error.message || t('refreshFriendsFailed'));
  }
}

async function handleEnableLocationSharing() {
  locationSharingLoading.value = true;

  try {
    const nextOverview = await setLocationSharingForAllFriends(true);
    if (nextOverview) {
      locationSharingOverview.value = nextOverview;
    } else {
      await refreshLocationSharingOverview();
    }
    showSuccessToast(t('enableSharingSuccess'));
  } catch (error) {
    showFailToast(error.message || t('enableSharingFailed'));
  } finally {
    locationSharingLoading.value = false;
  }
}

async function handleDisableLocationSharing() {
  locationSharingLoading.value = true;

  try {
    const nextOverview = await setLocationSharingForAllFriends(false);
    if (nextOverview) {
      locationSharingOverview.value = nextOverview;
    } else {
      await refreshLocationSharingOverview();
    }
    showSuccessToast(t('disableSharingSuccess'));
  } catch (error) {
    showFailToast(error.message || t('disableSharingFailed'));
  } finally {
    locationSharingLoading.value = false;
  }
}

async function handleRefreshOwnLocation() {
  locationRefreshing.value = true;

  try {
    const result = await updateCurrentUserLocationWithPrompt();
    locationSharingOverview.value = {
      ...locationSharingOverview.value,
      lastLocationUpdatedAt: result?.updatedAt || new Date().toISOString(),
      isOnline: true,
    };
    showSuccessToast(t('refreshMyLocationSuccess'));
    await refreshRelationshipData();
  } catch (error) {
    showFailToast(error.message || t('refreshMyLocationFailed'));
  } finally {
    locationRefreshing.value = false;
  }
}

function handleOpenCreateGroup() {
  if (!friends.value.length) {
    showToast(t('needOneFriend'));
    return;
  }

  createGroupPopupVisible.value = true;
}

async function handleCreateGroup(payload) {
  const selectedFriends = friends.value.filter((friend) => payload.memberIds.includes(friend.id));

  if (!selectedFriends.length) {
    showToast(t('needSelectFriend'));
    return;
  }

  groupSubmitting.value = true;

  try {
    const nextGroup = await createGroupChat({
      creator: currentUser.value,
      groupName: payload.groupName,
      selectedFriends,
    });

    createGroupPopupVisible.value = false;
    setFeedback('success', t('groupCreatedFeedback', { name: nextGroup.name }));
    showSuccessToast(t('createGroupSuccess'));
    await refreshGroupChats();
  } catch (error) {
    const message = error.message || t('createGroupFailed');
    setFeedback('error', message);
    showFailToast(message);
  } finally {
    groupSubmitting.value = false;
  }
}

async function handleGroupChatDataChanged() {
  try {
    await refreshGroupChats();
  } catch (error) {
    showFailToast(error.message || t('refreshGroupsFailed'));
  }
}

async function handleOpenGroupChat(group) {
  activeGroupChat.value = group;
  groupChatPopupVisible.value = true;
  groupMessageLoading.value = true;
  activeGroupMessages.value = [];

  try {
    activeGroupMessages.value = await getGroupMessages(group.id);
    markGroupAsRead(group.id, activeGroupMessages.value);
  } catch (error) {
    showFailToast(error.message || t('loadGroupMessagesFailed'));
  } finally {
    groupMessageLoading.value = false;
  }
}

function handleGroupChatPopupVisibleChange(nextVisible) {
  groupChatPopupVisible.value = nextVisible;

  if (!nextVisible) {
    activeGroupChat.value = null;
    activeGroupMessages.value = [];
    groupMemberSubmitting.value = false;
    groupRenaming.value = false;
    groupFriendSubmitting.value = false;
  }
}

async function handleSendGroupChatMessage(content) {
  if (!activeGroupChat.value?.id) {
    return;
  }

  groupMessageSending.value = true;

  try {
    const nextMessage = await sendGroupMessage({
      groupId: activeGroupChat.value.id,
      sender: currentUser.value,
      content,
    });

    if (nextMessage) {
      activeGroupMessages.value = [...activeGroupMessages.value, nextMessage];
    }
  } catch (error) {
    showFailToast(error.message || t('sendGroupMessageFailed'));
  } finally {
    groupMessageSending.value = false;
  }
}

async function handleInviteGroupMembers(memberIds) {
  if (!activeGroupChat.value?.id) {
    return;
  }

  const selectedFriends = friends.value.filter((friend) => memberIds.includes(friend.id));

  if (!selectedFriends.length) {
    showToast(t('needSelectFriend'));
    return;
  }

  groupMemberSubmitting.value = true;

  try {
    const nextGroup = await addGroupMembers({
      groupId: activeGroupChat.value.id,
      currentUserId: currentUser.value?.id || '',
      selectedFriends,
    });

    activeGroupChat.value = nextGroup || activeGroupChat.value;
    await refreshGroupChats();
    showSuccessToast(t('inviteMembersSuccess'));
  } catch (error) {
    showFailToast(error.message || t('inviteMembersFailed'));
  } finally {
    groupMemberSubmitting.value = false;
  }
}

async function handleRemoveGroupMember(member) {
  if (!activeGroupChat.value?.id || !member?.id) {
    return;
  }

  try {
    await showConfirmDialog({
      title: t('removeGroupMemberTitle'),
      message: t('removeGroupMemberMessage', { username: member.username }),
      confirmButtonText: t('unblockAction'),
      cancelButtonText: t('cancel'),
    });
  } catch {
    return;
  }

  groupMemberSubmitting.value = true;

  try {
    const nextGroup = await removeGroupMember({
      groupId: activeGroupChat.value.id,
      currentUserId: currentUser.value?.id || '',
      memberId: member.id,
    });

    activeGroupChat.value = nextGroup || activeGroupChat.value;
    await refreshGroupChats();
    showSuccessToast(t('removedGroupMemberSuccess'));
  } catch (error) {
    showFailToast(error.message || t('removeGroupMemberFailed'));
  } finally {
    groupMemberSubmitting.value = false;
  }
}

async function handleExitGroup() {
  if (!activeGroupChat.value?.id) {
    return;
  }

  try {
    await showConfirmDialog({
      title: t('exitGroupTitle'),
      message: t('exitGroupMessage', { name: activeGroupChat.value.name }),
      confirmButtonText: t('exitAction'),
      cancelButtonText: t('cancel'),
    });
  } catch {
    return;
  }

  groupMemberSubmitting.value = true;

  try {
    const result = await exitGroupChat({
      groupId: activeGroupChat.value.id,
      currentUserId: currentUser.value?.id || '',
    });

    await refreshGroupChats();

    if (result?.groupId) {
      activeGroupChat.value = null;
      activeGroupMessages.value = [];
      groupChatPopupVisible.value = false;
    }

    showSuccessToast(t('exitGroupSuccess'));
  } catch (error) {
    showFailToast(error.message || t('exitGroupFailed'));
  } finally {
    groupMemberSubmitting.value = false;
  }
}

async function handleRenameGroup(groupName) {
  if (!activeGroupChat.value?.id) {
    return;
  }

  groupRenaming.value = true;

  try {
    const nextGroup = await renameGroupChat({
      groupId: activeGroupChat.value.id,
      currentUserId: currentUser.value?.id || '',
      groupName,
    });

    activeGroupChat.value = nextGroup || activeGroupChat.value;
    await refreshGroupChats();
    showSuccessToast(t('renameGroupSuccess'));
  } catch (error) {
    showFailToast(error.message || t('renameGroupFailed'));
  } finally {
    groupRenaming.value = false;
  }
}

async function handleAddGroupMemberAsFriend(member) {
  const targetFriendCode = String(member?.friendCode || '').trim().toUpperCase();

  if (!targetFriendCode) {
    showFailToast(t('noMemberFriendCode'));
    return;
  }

  groupFriendSubmitting.value = true;

  try {
    const result = await sendFriendRequest({ targetFriendCode });
    setFeedback('success', result.message || t('addGroupMemberFriendFeedback', { username: member.username }));
    showSuccessToast(t('addFriendSuccess'));
    await refreshRelationshipData();
  } catch (error) {
    showFailToast(error.message || t('addFriendFailed'));
  } finally {
    groupFriendSubmitting.value = false;
  }
}

async function handleFriendLocationSelect(friend) {
  selectedFriend.value = friend;
  locationPopupVisible.value = true;
  locationPopupError.value = '';

  if (!friend.isLocationSharingEnabled) {
    locationPopupLoading.value = false;
    locationPopupError.value = getFriendLocationFallbackMessage(friend, language.value);
    return;
  }

  locationPopupLoading.value = true;

  try {
    const friendLocation = await getFriendLocation(friend.id);
    selectedFriend.value = {
      ...friend,
      ...friendLocation,
    };
  } catch (error) {
    locationPopupError.value = error.message || getFriendLocationFallbackMessage(friend, language.value);
    selectedFriend.value = {
      ...friend,
    };
  } finally {
    locationPopupLoading.value = false;
  }
}

function handleFriendLocationPopupVisibleChange(nextVisible) {
  locationPopupVisible.value = nextVisible;

  if (!nextVisible) {
    selectedFriend.value = null;
    locationPopupLoading.value = false;
    locationPopupError.value = '';
  }
}

onMounted(() => {
  loadPage();
  startGroupChatPolling();
  window.addEventListener('friends-updated', handleFriendDataChanged);
  window.addEventListener('group-chats-updated', handleGroupChatDataChanged);
});

onUnmounted(() => {
  stopGroupChatPolling();
  window.removeEventListener('friends-updated', handleFriendDataChanged);
  window.removeEventListener('group-chats-updated', handleGroupChatDataChanged);
});
</script>

<template>
  <div class="friends-page" :class="{ 'is-embedded': !showNavBar }">
    <NavBar v-if="showNavBar" :title="text.navTitle" fixed placeholder />

    <main class="page-body">
      <section v-if="pageLoading" class="state-card">
        <Loading size="24px" color="#2f8a5c" />
        <p>{{ text.loading }}</p>
      </section>

      <section v-else-if="pageError" class="state-card error-card">
        <h2>{{ text.pageLoadFailed }}</h2>
        <p>{{ pageError }}</p>
        <Button round block type="primary" @click="loadPage">
          {{ text.reload }}
        </Button>
      </section>

      <template v-else>
        <FriendCodeCard
          v-if="currentUser"
          :user="currentUser"
          @copy="handleCopyFriendCode"
        />

        <LocationShareControlCard
          :overview="locationSharingOverview"
          :sharing-loading="locationSharingLoading"
          :location-loading="locationRefreshing"
          @enable-sharing="handleEnableLocationSharing"
          @disable-sharing="handleDisableLocationSharing"
          @refresh-location="handleRefreshOwnLocation"
        />

        <AddFriendForm
          v-model="friendCodeInput"
          :submitting="isSubmitting"
          :feedback-text="feedbackText"
          :feedback-type="feedbackType"
          @submit="handleAddFriend"
        />

        <FriendManagePanel
          :friends="friends"
          :processing-id="processingFriendId"
          :processing-action="processingAction"
          @select-friend="handleFriendLocationSelect"
          @remove-friend="handleRemoveFriend"
          @block-friend="handleBlockFriend"
          @open-create-group="handleOpenCreateGroup"
        />

        <GroupChatSection :groups="groupChats" @open-group="handleOpenGroupChat" />
        <BlockedListSection
          :blocked-users="blockedUsers"
          :processing-id="processingFriendId"
          :processing-action="processingAction"
          @unblock-friend="handleUnblockFriend"
        />
      </template>
    </main>

    <FriendLocationPopup
      :show="locationPopupVisible"
      :friend="selectedFriend"
      :loading="locationPopupLoading"
      :error-message="locationPopupError"
      @update:show="handleFriendLocationPopupVisibleChange"
    />

    <CreateGroupDialog
      v-model:show="createGroupPopupVisible"
      :friends="friends"
      :submitting="groupSubmitting"
      @submit="handleCreateGroup"
    />

    <GroupChatDialog
      v-model:show="groupChatPopupVisible"
      :group="activeGroupChat"
      :current-user-id="currentUser?.id || ''"
      :friends="friends"
      :messages="activeGroupMessages"
      :loading="groupMessageLoading"
      :sending="groupMessageSending"
      :member-submitting="groupMemberSubmitting"
      :renaming="groupRenaming"
      :friend-submitting="groupFriendSubmitting"
      @send="handleSendGroupChatMessage"
      @invite-members="handleInviteGroupMembers"
      @remove-member="handleRemoveGroupMember"
      @exit-group="handleExitGroup"
      @rename-group="handleRenameGroup"
      @add-friend="handleAddGroupMemberAsFriend"
      @update:show="handleGroupChatPopupVisibleChange"
    />
  </div>
</template>

<style scoped>
.friends-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(92, 143, 112, 0.12), transparent 26%),
    linear-gradient(180deg, #f3f6f4 0%, #f8faf8 100%);
}

.friends-page.is-embedded {
  min-height: auto;
}

.page-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 16px calc(24px + env(safe-area-inset-bottom));
  max-width: 560px;
  margin: 0 auto;
}

.state-card {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  border-radius: 20px;
  background: #ffffff;
  color: #536259;
  text-align: center;
  box-shadow: 0 10px 28px rgba(31, 58, 44, 0.08);
}

.state-card p,
.state-card h2 {
  margin: 0;
}

.error-card {
  gap: 14px;
}

@media (min-width: 768px) {
  .page-body {
    padding-top: 24px;
  }

  .friends-page.is-embedded .page-body {
    padding-top: 16px;
  }
}
</style>
