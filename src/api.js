// Backwards-compatible API entrypoint.
// The actual implementations live under src/services/api/.
export {
  aiApi,
  authApi,
  uploadApi,
  requestAuthorizedJson,
  readStoredAuthState,
  clearStoredAuthState,
} from './services/api';

