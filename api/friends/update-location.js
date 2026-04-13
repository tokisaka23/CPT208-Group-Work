import { buildJsonResponse, getAuthenticatedUser, readJsonBody } from '../supabase.js';
import {
  isMissingRelationError,
  normalizeCoordinate,
  requirePostMethod,
} from './locationShared.js';

export default async function updateFriendLocationHandler(req, res) {
  if (!requirePostMethod(req, res)) {
    return;
  }

  try {
    const { user, adminClient } = await getAuthenticatedUser(req);
    const {
      latitude = null,
      longitude = null,
      accuracyMeters = null,
    } = readJsonBody(req);

    const normalizedLatitude = normalizeCoordinate(latitude);
    const normalizedLongitude = normalizeCoordinate(longitude);
    const normalizedAccuracy = accuracyMeters === null ? null : normalizeCoordinate(accuracyMeters);

    if (normalizedLatitude === null || normalizedLongitude === null) {
      buildJsonResponse(res, 400, { error: '缺少有效的定位坐标' });
      return;
    }

    if (normalizedLatitude < -90 || normalizedLatitude > 90) {
      buildJsonResponse(res, 400, { error: '纬度超出有效范围' });
      return;
    }

    if (normalizedLongitude < -180 || normalizedLongitude > 180) {
      buildJsonResponse(res, 400, { error: '经度超出有效范围' });
      return;
    }

    if (accuracyMeters !== null && (normalizedAccuracy === null || normalizedAccuracy < 0)) {
      buildJsonResponse(res, 400, { error: '定位精度无效' });
      return;
    }

    const updatedAt = new Date().toISOString();
    const { error } = await adminClient
      .from('user_live_locations')
      .upsert({
        user_id: user.id,
        latitude: normalizedLatitude,
        longitude: normalizedLongitude,
        accuracy_meters: normalizedAccuracy,
        is_online: true,
        updated_at: updatedAt,
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      if (isMissingRelationError(error)) {
        throw new Error('缺少 user_live_locations 表，请先执行 `database/003_user_live_location.sql`。');
      }

      throw new Error(`更新当前位置失败：${error.message}`);
    }

    buildJsonResponse(res, 200, {
      success: true,
      updatedAt,
    });
  } catch (error) {
    buildJsonResponse(res, error.statusCode || 500, {
      error: error.message || '更新当前位置失败，请稍后再试。',
    });
  }
}
