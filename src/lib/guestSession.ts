const GUEST_KEY = 'ts_guest'

export function enableGuestAccess() {
  sessionStorage.setItem(GUEST_KEY, '1')
}

export function hasGuestAccess() {
  return sessionStorage.getItem(GUEST_KEY) === '1'
}

export function clearGuestAccess() {
  sessionStorage.removeItem(GUEST_KEY)
}
