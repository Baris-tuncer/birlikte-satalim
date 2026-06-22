// Kayıt sonrası email doğrulama için geçici credential store
// Sadece memory'de tutulur, persist edilmez

let pendingEmail = '';
let pendingPassword = '';

export function setPendingAuth(email: string, password: string) {
  pendingEmail = email;
  pendingPassword = password;
}

export function getPendingAuth() {
  return { email: pendingEmail, password: pendingPassword };
}

export function clearPendingAuth() {
  pendingEmail = '';
  pendingPassword = '';
}
