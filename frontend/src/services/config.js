// This file decides ONE important thing for the whole app: are we talking
// to a real backend, or should we just make up dummy data in the browser?
//
// The rule we picked (based on what our project requirements said) is:
// - If someone sets VITE_API_BASE_URL (in a .env file), we treat that as
//   "a backend was given" and we call the real API + real websocket.
// - If it's empty/not set, we assume "no backend was given" and every
//   service below quietly switches to returning fake/sample data instead.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const IS_MOCK_MODE = API_BASE_URL.trim().length === 0

// small helper to turn "http://localhost:8000" into "ws://localhost:8000"
export function getWsBaseUrl() {
  if (IS_MOCK_MODE) return ''
  return API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
}
