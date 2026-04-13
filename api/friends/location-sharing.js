import { buildJsonResponse, getAuthenticatedUser, readJsonBody } from '../supabase.js';
import {
  isMissingRelationError,
  loadAcceptedFriendIds,
  loadOwnerLocationPermissions,
  loadSingleLiveLocation,
  normalizeLiveLocationRow,
  requirePostMethod,
} from './locationShared.js';

function buildSharingOverview(friendIds, permissions, liveLocation) {
  const activePermissions = (permissions || []).filter((item) => item.is_active);
  const normalizedLiveLocation = normalizeLiveLocationRow(liveLocation);

  return {
    totalFriends: friendIds.length,
    activeFriendCount: activePermissions.length,
    sharingMode:
      activePermissions.length === 0
        ? 'off'
        : activePermissions.length === friendIds.length
          ? 'all'
          : 'partial',
    lastLocationUpdatedAt: normalizedLiveLocation?.updatedAt || null,
    isOnline: Boolean(normalizedLiveLocation?.isOnline),
  };
}

export default async function locationSharingHandler(req, res) {
  if (!requirePostMethod(req, res)) {
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const { isActive } = readJsonBody(req);
    const friendIds = [...new Set(await loadAcceptedFriendIds(adminClient, user.id))];

    if (typeof isActive === 'boolean') {
      if (isActive) {
        if (friendIds.length) {
          const now = new Date().toISOString();
          const rows = friendIds.map((viewerUserId) => ({
            owner_user_id: user.id,
            viewer_user_id: viewerUserId,
            is_active: true,
            granted_at: now,
            revoked_at: null,
          }));

          const { error } = await adminClient
            .from('location_share_permissions')
            .upsert(rows, {
              onConflict: 'owner_user_id,viewer_user_id',
            });

          if (error) {
            if (isMissingRelationError(error)) {
              throw new Error('缺少 location_share_permissions 表，请先检查数据库初始化。');
            }

            throw new Error(`开启位置共享失败：${error.message}`);
          }
        }
      } else if (friendIds.length) {
        const { error } = await adminClient
          .from('location_share_permissions')
          .update({
            is_active: false,
            revoked_at: new Date().toISOString(),
          })
          .eq('owner_user_id', user.id)
          .in('viewer_user_id', friendIds);

        if (error) {
          if (isMissingRelationError(error)) {
            throw new Error('缺少 location_share_permissions 表，请先检查数据库初始化。');
          }

          throw new Error(`关闭位置共享失败：${error.message}`);
        }
      }
    }

    const [permissions, liveLocation] = await Promise.all([
      loadOwnerLocationPermissions(adminClient, user.id, friendIds),
      loadSingleLiveLocation(adminClient, user.id),
    ]);

    buildJsonResponse(res, 200, {
      success: true,
      overview: buildSharingOverview(friendIds, permissions, liveLocation),
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '读取位置共享状态失败，请稍后再试。',
    });
  }
}
