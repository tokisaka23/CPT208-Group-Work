export const mockCurrentUser = {
  id: 'user_001',
  username: '苏小柚',
  friendCode: 'SUZHOU-2088',
};

// 这里只保留“可被添加的候选用户”，不再默认出现在好友列表中。
const candidateUsers = [
  {
    id: 'friend_201',
    username: '许棠',
    friendCode: 'FIND-8842',
    isOnline: false,
    isLocationSharingEnabled: false,
    latitude: null,
    longitude: null,
    updatedAt: '2026-03-10T19:12:00+08:00',
  },
  {
    id: 'friend_202',
    username: '沈知言',
    friendCode: 'FIND-6635',
    isOnline: true,
    isLocationSharingEnabled: true,
    latitude: 31.309852,
    longitude: 120.631744,
    updatedAt: '2026-03-11T14:21:00+08:00',
  },
  {
    id: 'friend_203',
    username: '顾晚宁',
    friendCode: 'FIND-4907',
    isOnline: true,
    isLocationSharingEnabled: false,
    latitude: null,
    longitude: null,
    updatedAt: '2026-03-11T13:48:00+08:00',
  },
  {
    id: 'friend_204',
    username: '林舟',
    friendCode: 'FIND-2048',
    isOnline: true,
    isLocationSharingEnabled: true,
    latitude: 31.298341,
    longitude: 120.585316,
    updatedAt: '2026-03-11T14:18:00+08:00',
  },
  {
    id: 'friend_205',
    username: '陈雨禾',
    friendCode: 'FIND-7301',
    isOnline: true,
    isLocationSharingEnabled: false,
    latitude: null,
    longitude: null,
    updatedAt: '2026-03-11T14:05:00+08:00',
  },
  {
    id: 'friend_206',
    username: '周以安',
    friendCode: 'FIND-5520',
    isOnline: false,
    isLocationSharingEnabled: true,
    latitude: 31.316958,
    longitude: 120.620543,
    updatedAt: '2026-03-11T10:42:00+08:00',
  },
];

export function findUserByFriendCode(friendCode) {
  return candidateUsers.find(
    (item) => item.friendCode.toUpperCase() === friendCode.toUpperCase(),
  );
}
