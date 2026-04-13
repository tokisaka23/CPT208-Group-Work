import { buildJsonResponse, getAuthenticatedUser, readJsonBody } from '../supabase.js';
import {
  buildFriendSummary,
  findExistingRelationship,
  findProfileById,
  isFiniteCoordinate,
  loadLiveLocations,
  loadLocationPermissions,
  requirePostMethod,
} from './locationShared.js';

export default async function friendLocationHandler(req, res) {
  if (!requirePostMethod(req, res)) {
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { friendUserId = '' } = readJsonBody(req);
    const normalizedFriendUserId = String(friendUserId).trim();

    if (!normalizedFriendUserId) {
      buildJsonResponse(res, 400, { error: '缺少好友用户 ID' });
      return;
    }

    const relationship = await findExistingRelationship(adminClient, user.id, normalizedFriendUserId);

    if (!relationship || relationship.status !== 'accepted') {
      buildJsonResponse(res, 404, { error: '没有找到可查看定位的好友关系' });
      return;
    }

    const [profile, permissions, locations] = await Promise.all([
      findProfileById(adminClient, normalizedFriendUserId),
      loadLocationPermissions(adminClient, user.id, [normalizedFriendUserId]),
      loadLiveLocations(adminClient, [normalizedFriendUserId]),
    ]);

    if (!profile) {
      buildJsonResponse(res, 404, { error: '没有找到该好友' });
      return;
    }

    const friend = buildFriendSummary(
      profile,
      (permissions || [])[0] || null,
      (locations || [])[0] || null,
      relationship.updated_at || null,
    );

    if (!friend.isLocationSharingEnabled) {
      buildJsonResponse(res, 403, { error: '对方暂未开放位置共享' });
      return;
    }

    if (!isFiniteCoordinate(friend.latitude) || !isFiniteCoordinate(friend.longitude)) {
      buildJsonResponse(res, 404, { error: '暂时没有可展示的定位数据' });
      return;
    }

    buildJsonResponse(res, 200, {
      success: true,
      friend,
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '读取好友定位失败，请稍后再试。',
    });
  }
}
