import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { formatPriceInput } from '@/lib/format';
import { useAuth } from '@/lib/auth-context';

// ─── Yardımcılar ──────────────────────────────────────────────────

function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
}

function isValidTC(tc: string): boolean {
  return tc.length === 11 && tc[0] !== '0' && /^\d{11}$/.test(tc);
}

// ─── Bileşen ──────────────────────────────────────────────────────

export default function RentalContractScreen() {
  const params = useLocalSearchParams<{
    propertyAddress?: string;
    propertyType?: string;
    roomCount?: string;
    squareMeters?: string;
    rentAmount?: string;
  }>();

  const { profile } = useAuth();

  // Kiraya veren
  const [landlordName, setLandlordName] = useState('');
  const [landlordTC, setLandlordTC] = useState('');
  const [landlordAddress, setLandlordAddress] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('');

  // Kiracı
  const [tenantName, setTenantName] = useState('');
  const [tenantTC, setTenantTC] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');

  // Taşınmaz (ilandan otomatik dolabilir)
  const [propertyAddress, setPropertyAddress] = useState(params.propertyAddress ?? '');
  const [propertyType, setPropertyType] = useState(params.propertyType ?? '');
  const [roomCount, setRoomCount] = useState(params.roomCount ?? '');
  const [squareMeters, setSquareMeters] = useState(params.squareMeters ?? '');

  // Kira koşulları
  const [rentAmount, setRentAmount] = useState(
    params.rentAmount ? formatPriceInput(params.rentAmount) : '',
  );
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentDay, setPaymentDay] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [increaseRate, setIncreaseRate] = useState('');

  // Ek bilgiler
  const [aidatAmount, setAidatAmount] = useState('');
  const [aidatPayer, setAidatPayer] = useState<'kiracı' | 'kiraya_veren'>('kiracı');
  const [specialTerms, setSpecialTerms] = useState('');

  // Kefil
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorTC, setGuarantorTC] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');

  const canSubmit = useMemo(() => {
    return (
      landlordName.trim().length > 0 &&
      landlordTC.trim().length === 11 &&
      tenantName.trim().length > 0 &&
      tenantTC.trim().length === 11 &&
      propertyAddress.trim().length > 0 &&
      rentAmount.trim().length > 0 &&
      paymentDay.trim().length > 0 &&
      startDate.length === 10 &&
      endDate.length === 10
    );
  }, [landlordName, landlordTC, tenantName, tenantTC, propertyAddress, rentAmount, paymentDay, startDate, endDate]);

  const handleCreateAndShare = useCallback(async () => {
    if (!isValidTC(landlordTC.trim())) {
      Alert.alert('Hata', 'Kiraya veren için geçerli bir TC Kimlik numarası girin.');
      return;
    }
    if (!isValidTC(tenantTC.trim())) {
      Alert.alert('Hata', 'Kiracı için geçerli bir TC Kimlik numarası girin.');
      return;
    }

    const lines: string[] = [];

    lines.push('KİRA SÖZLEŞMESİ');
    lines.push('═'.repeat(40));
    lines.push('');

    // MADDE 1
    lines.push('MADDE 1 — TARAFLAR');
    lines.push('─'.repeat(36));
    lines.push('');
    lines.push('KİRAYA VEREN (Ev Sahibi):');
    lines.push(`  Ad Soyad   : ${landlordName.trim()}`);
    lines.push(`  TC Kimlik   : ${landlordTC.trim()}`);
    if (landlordAddress.trim()) lines.push(`  Adres      : ${landlordAddress.trim()}`);
    if (landlordPhone.trim()) lines.push(`  Telefon    : ${landlordPhone.trim()}`);
    lines.push('');
    lines.push('KİRACI:');
    lines.push(`  Ad Soyad   : ${tenantName.trim()}`);
    lines.push(`  TC Kimlik   : ${tenantTC.trim()}`);
    if (tenantAddress.trim()) lines.push(`  Mevcut Adres: ${tenantAddress.trim()}`);
    if (tenantPhone.trim()) lines.push(`  Telefon    : ${tenantPhone.trim()}`);
    lines.push('');

    // MADDE 2
    lines.push('MADDE 2 — KİRALANAN TAŞINMAZ');
    lines.push('─'.repeat(36));
    lines.push(`  Adres      : ${propertyAddress.trim()}`);
    if (propertyType.trim()) lines.push(`  Türü       : ${propertyType.trim()}`);
    if (roomCount.trim()) lines.push(`  Oda Sayısı : ${roomCount.trim()}`);
    if (squareMeters.trim()) lines.push(`  Yüzölçümü  : ${squareMeters.trim()} m²`);
    lines.push('');

    // MADDE 3
    lines.push('MADDE 3 — KİRA SÜRESİ');
    lines.push('─'.repeat(36));
    lines.push(`  Başlangıç  : ${startDate}`);
    lines.push(`  Bitiş      : ${endDate}`);
    lines.push('  Sözleşme süresi sonunda kiracı tahliye etmediği ve kiraya veren');
    lines.push('  yazılı ihtarda bulunmadığı takdirde, sözleşme aynı koşullarla');
    lines.push('  1 (bir) yıl uzatılmış sayılır.');
    lines.push('');

    // MADDE 4
    lines.push('MADDE 4 — KİRA BEDELİ VE ÖDEME');
    lines.push('─'.repeat(36));
    lines.push(`  Aylık Kira  : ${rentAmount.trim()} TL`);
    lines.push(`  Ödeme Günü  : Her ayın ${paymentDay.trim()}. günü`);
    lines.push('  Ödeme şekli: Kiraya verenin bildireceği banka hesabına');
    lines.push('  havale/EFT ile yapılacaktır.');
    lines.push('');

    // MADDE 5
    lines.push('MADDE 5 — KİRA ARTIŞ ORANI');
    lines.push('─'.repeat(36));
    const incText = increaseRate.trim() || 'TÜFE (Tüketici Fiyat Endeksi) oranında';
    lines.push(`  Yıllık artış: ${incText}`);
    lines.push('  Kira artışı, 6098 sayılı TBK hükümleri ve yürürlükteki');
    lines.push('  mevzuat çerçevesinde uygulanır.');
    lines.push('');

    // MADDE 6
    lines.push('MADDE 6 — DEPOZİTO (GÜVENLİK TEMİNATI)');
    lines.push('─'.repeat(36));
    if (depositAmount.trim()) {
      lines.push(`  Depozito   : ${depositAmount.trim()} TL`);
    } else {
      lines.push('  Depozito alınmamıştır.');
    }
    lines.push('  Depozito, sözleşmenin sona ermesi ve taşınmazın eksiksiz teslimi');
    lines.push('  halinde kiracıya iade edilir.');
    lines.push('');

    // MADDE 7
    lines.push('MADDE 7 — AİDAT VE GİDERLER');
    lines.push('─'.repeat(36));
    if (aidatAmount.trim()) {
      const payer = aidatPayer === 'kiracı' ? 'Kiracı' : 'Kiraya Veren';
      lines.push(`  Aylık aidat : ${aidatAmount.trim()} TL (ödeyen: ${payer})`);
    }
    lines.push('  Elektrik, su, doğalgaz ve internet gibi kullanıma bağlı');
    lines.push('  giderler kiracıya aittir.');
    lines.push('  Yapısal onarımlar kiraya verene aittir.');
    lines.push('');

    // MADDE 8
    lines.push('MADDE 8 — KULLANIM KOŞULLARI');
    lines.push('─'.repeat(36));
    lines.push('  Kiracı, kiralananı özenle kullanmak ve komşulara saygı');
    lines.push('  göstermekle yükümlüdür.');
    lines.push('  Kiracı, yazılı onay olmadan tadilat yapamaz ve kiralananı');
    lines.push('  devredemez veya alt kiraya veremez.');
    lines.push('');

    // MADDE 9
    lines.push('MADDE 9 — TAHLİYE');
    lines.push('─'.repeat(36));
    lines.push('  Kiracı, sözleşme bitiminden en az 15 gün önce yazılı');
    lines.push('  bildirimde bulunarak tahliye edebilir.');
    lines.push('  Anahtar teslimi tutanak ile yapılır.');
    lines.push('');

    // KEFİL (varsa)
    let nextMadde = 10;
    if (guarantorName.trim()) {
      lines.push(`MADDE ${nextMadde} — KEFİL`);
      lines.push('─'.repeat(36));
      lines.push(`  Ad Soyad   : ${guarantorName.trim()}`);
      if (guarantorTC.trim()) lines.push(`  TC Kimlik   : ${guarantorTC.trim()}`);
      if (guarantorPhone.trim()) lines.push(`  Telefon    : ${guarantorPhone.trim()}`);
      lines.push('  Kefil, kiracının tüm borçlarını müteselsil kefil sıfatıyla üstlenir.');
      lines.push('');
      nextMadde++;
    }

    // ÖZEL ŞARTLAR (varsa)
    if (specialTerms.trim()) {
      lines.push(`MADDE ${nextMadde} — ÖZEL ŞARTLAR`);
      lines.push('─'.repeat(36));
      lines.push(`  ${specialTerms.trim()}`);
      lines.push('');
      nextMadde++;
    }

    // SON HÜKÜMLER
    lines.push(`MADDE ${nextMadde} — SON HÜKÜMLER`);
    lines.push('─'.repeat(36));
    lines.push('  İşbu sözleşme 2 (iki) nüsha olarak düzenlenmiş olup, taraflar');
    lines.push('  tüm maddelerini okuduklarını ve kabul ettiklerini beyan ederler.');
    lines.push('  Sözleşmede hüküm bulunmayan hallerde 6098 sayılı TBK uygulanır.');
    lines.push('');
    lines.push('─'.repeat(40));
    lines.push(`Düzenleme Tarihi: ${new Date().toLocaleDateString('tr-TR')}`);
    lines.push('');
    lines.push('KİRAYA VEREN                    KİRACI');
    const padded = landlordName.trim().padEnd(32);
    lines.push(`${padded}${tenantName.trim()}`);
    lines.push('İmza:                           İmza:');
    if (guarantorName.trim()) {
      lines.push('');
      lines.push('KEFİL');
      lines.push(guarantorName.trim());
      lines.push('İmza:');
    }
    lines.push('');
    lines.push('═'.repeat(40));
    lines.push('Beraber Satalım uygulaması ile oluşturulmuştur.');

    await Share.share({
      message: lines.join('\n'),
      title: 'Kira Sözleşmesi',
    });
  }, [
    landlordName, landlordTC, landlordAddress, landlordPhone,
    tenantName, tenantTC, tenantAddress, tenantPhone,
    propertyAddress, propertyType, roomCount, squareMeters,
    rentAmount, depositAmount, paymentDay, startDate, endDate,
    increaseRate, aidatAmount, aidatPayer, specialTerms,
    guarantorName, guarantorTC, guarantorPhone,
  ]);

  // Ön doldurulmuş alanlar için bilgi banner
  const hasPrefilledData = !!(params.propertyAddress || params.rentAmount);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Kira Kontratı',
          headerShown: true,
          headerBackTitle: 'Geri',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text.primary,
          headerTitleStyle: { ...Typography.headline, color: Colors.text.primary },
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Ön doldurma bilgisi */}
        {hasPrefilledData && (
          <View style={styles.prefilledBanner}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.prefilledText}>
              Taşınmaz bilgileri ilandan otomatik dolduruldu
            </Text>
          </View>
        )}

        {/* ─── 1. Kiraya Veren ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Kiraya Veren Bilgileri</Text>
          </View>

          <Text style={styles.inputLabel}>Ad Soyad *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={landlordName}
              onChangeText={setLandlordName}
              placeholder="Ad Soyad"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.inputLabel}>TC Kimlik No *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={landlordTC}
              onChangeText={(t) => setLandlordTC(t.replace(/\D/g, '').slice(0, 11))}
              placeholder="11 haneli TC Kimlik No"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="number-pad"
              maxLength={11}
            />
          </View>

          <Text style={styles.inputLabel}>Adres</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={landlordAddress}
              onChangeText={setLandlordAddress}
              placeholder="Adres"
              placeholderTextColor={Colors.text.tertiary}
              multiline
            />
          </View>

          <Text style={styles.inputLabel}>Telefon</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={landlordPhone}
              onChangeText={setLandlordPhone}
              placeholder="0 5XX XXX XX XX"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* ─── 2. Kiracı ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Kiracı Bilgileri</Text>
          </View>

          <Text style={styles.inputLabel}>Ad Soyad *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={tenantName}
              onChangeText={setTenantName}
              placeholder="Ad Soyad"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.inputLabel}>TC Kimlik No *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={tenantTC}
              onChangeText={(t) => setTenantTC(t.replace(/\D/g, '').slice(0, 11))}
              placeholder="11 haneli TC Kimlik No"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="number-pad"
              maxLength={11}
            />
          </View>

          <Text style={styles.inputLabel}>Mevcut Adres</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={tenantAddress}
              onChangeText={setTenantAddress}
              placeholder="Kiracının mevcut adresi"
              placeholderTextColor={Colors.text.tertiary}
              multiline
            />
          </View>

          <Text style={styles.inputLabel}>Telefon</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={tenantPhone}
              onChangeText={setTenantPhone}
              placeholder="0 5XX XXX XX XX"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* ─── 3. Taşınmaz ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="home-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Taşınmaz Bilgileri</Text>
          </View>

          <Text style={styles.inputLabel}>Taşınmaz Adresi *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={propertyAddress}
              onChangeText={setPropertyAddress}
              placeholder="Tam adres"
              placeholderTextColor={Colors.text.tertiary}
              multiline
            />
          </View>

          <Text style={styles.inputLabel}>Taşınmaz Türü</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={propertyType}
              onChangeText={setPropertyType}
              placeholder="Konut / İşyeri"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Oda Sayısı</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={roomCount}
                  onChangeText={setRoomCount}
                  placeholder="3+1"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>m²</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={squareMeters}
                  onChangeText={setSquareMeters}
                  placeholder="120"
                  placeholderTextColor={Colors.text.tertiary}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>
        </View>

        {/* ─── 4. Kira Koşulları ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Kira Koşulları</Text>
          </View>

          <Text style={styles.inputLabel}>Aylık Kira Bedeli (TL) *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={rentAmount}
              onChangeText={(t) => setRentAmount(formatPriceInput(t))}
              placeholder="25.000"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="number-pad"
            />
          </View>

          <Text style={styles.inputLabel}>Depozito (TL)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={depositAmount}
              onChangeText={(t) => setDepositAmount(formatPriceInput(t))}
              placeholder="75.000"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="number-pad"
            />
          </View>

          <Text style={styles.inputLabel}>Ödeme Günü *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={paymentDay}
              onChangeText={(t) => setPaymentDay(t.replace(/\D/g, '').slice(0, 2))}
              placeholder="Her ayın kaçıncı günü (1-30)"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Başlangıç Tarihi *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={(t) => setStartDate(formatDateInput(t))}
                  placeholder="GG.AA.YYYY"
                  placeholderTextColor={Colors.text.tertiary}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Bitiş Tarihi *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={endDate}
                  onChangeText={(t) => setEndDate(formatDateInput(t))}
                  placeholder="GG.AA.YYYY"
                  placeholderTextColor={Colors.text.tertiary}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
            </View>
          </View>

          <Text style={styles.inputLabel}>Yıllık Artış Oranı</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={increaseRate}
              onChangeText={setIncreaseRate}
              placeholder="TÜFE oranında (boş bırakılırsa)"
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>
        </View>

        {/* ─── 5. Ek Koşullar ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Ek Koşullar</Text>
          </View>

          <Text style={styles.inputLabel}>Aylık Aidat (TL)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={aidatAmount}
              onChangeText={(t) => setAidatAmount(formatPriceInput(t))}
              placeholder="1.500"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="number-pad"
            />
          </View>

          <Text style={styles.inputLabel}>Aidat Ödeyen</Text>
          <View style={styles.pillRow}>
            <Pressable
              style={[styles.pill, aidatPayer === 'kiracı' && styles.pillActive]}
              onPress={() => setAidatPayer('kiracı')}
            >
              <Text
                style={[styles.pillText, aidatPayer === 'kiracı' && styles.pillTextActive]}
              >
                Kiracı
              </Text>
            </Pressable>
            <Pressable
              style={[styles.pill, aidatPayer === 'kiraya_veren' && styles.pillActive]}
              onPress={() => setAidatPayer('kiraya_veren')}
            >
              <Text
                style={[
                  styles.pillText,
                  aidatPayer === 'kiraya_veren' && styles.pillTextActive,
                ]}
              >
                Kiraya Veren
              </Text>
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>Özel Şartlar</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={specialTerms}
              onChangeText={setSpecialTerms}
              placeholder="Ek koşullar varsa yazın"
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* ─── 6. Kefil ─── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-add-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Kefil Bilgileri (Opsiyonel)</Text>
          </View>

          <Text style={styles.inputLabel}>Ad Soyad</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={guarantorName}
              onChangeText={setGuarantorName}
              placeholder="Kefil ad soyad"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.inputLabel}>TC Kimlik No</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={guarantorTC}
              onChangeText={(t) => setGuarantorTC(t.replace(/\D/g, '').slice(0, 11))}
              placeholder="11 haneli TC Kimlik No"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="number-pad"
              maxLength={11}
            />
          </View>

          <Text style={styles.inputLabel}>Telefon</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={guarantorPhone}
              onChangeText={setGuarantorPhone}
              placeholder="0 5XX XXX XX XX"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* ─── Submit ─── */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
            pressed && canSubmit && { opacity: 0.85 },
          ]}
          onPress={handleCreateAndShare}
          disabled={!canSubmit}
        >
          <Ionicons name="share-outline" size={20} color={Colors.text.inverse} />
          <Text style={styles.submitButtonText}>Kontrat Oluştur ve Paylaş</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Bu sözleşme genel bilgi amaçlı hazırlanmıştır. Hukuki danışmanlık
          yerine geçmez. Önemli işlemlerde bir avukata danışmanız önerilir.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['5xl'],
  },

  // Ön doldurma banner
  prefilledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '0D',
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  prefilledText: {
    ...Typography.footnote,
    color: Colors.success,
    fontWeight: '500',
    flex: 1,
  },

  // Bölüm kartları
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.title3,
    color: Colors.text.primary,
  },

  // Input
  inputLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
  },
  input: {
    ...Typography.body,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },

  // Pill toggle
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  pillTextActive: {
    color: Colors.text.inverse,
  },

  // Submit
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.text.tertiary,
  },
  submitButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },
  disclaimer: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.xl,
    lineHeight: 18,
  },
});
