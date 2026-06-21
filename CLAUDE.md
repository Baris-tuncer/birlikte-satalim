@AGENTS.md

# EAS Build vs Update Kuralı

- JS/TS kod değişikliklerinde ASLA `eas build` kullanma. Her zaman `eas update` kullan.
- `eas build` SADECE şu durumlarda kullanılabilir ve kullanmadan önce MUTLAKA kullanıcıya sor:
  - Yeni native paket eklendi (expo-camera, expo-dev-client vb.)
  - app.json'da plugin değişikliği yapıldı
  - Expo SDK versiyonu yükseltildi
- Build başlatmadan önce kullanıcıya "Bu değişiklik native modül içeriyor, build gerekli. Başlatayım mı?" diye sor.
- Kullanıcı onaylamadan kesinlikle `eas build` çalıştırma.
