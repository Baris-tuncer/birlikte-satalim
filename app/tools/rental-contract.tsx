import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Share,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { formatPriceInput } from '@/lib/format';
import { useAuth } from '@/lib/auth-context';
import {
  createRentalContract,
  getMyRentalContracts,
  deleteRentalContract,
} from '@/lib/database';
import SegmentControl from '@/components/ui/SegmentControl';
import type { RentalContract } from '@/types';

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

function maskTC(tc: string): string {
  if (tc.length < 4) return '***';
  return '*'.repeat(tc.length - 4) + tc.slice(-4);
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
  const [activeSegment, setActiveSegment] = useState(0);

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

  // State
  const [saving, setSaving] = useState(false);

  // History
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      endDate.length === 10 &&
      !saving
    );
  }, [landlordName, landlordTC, tenantName, tenantTC, propertyAddress, rentAmount, paymentDay, startDate, endDate, saving]);

  // Ön doldurulmuş alanlar için bilgi banner
  const hasPrefilledData = !!(params.propertyAddress || params.rentAmount);

  // ─── Reset form ────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setLandlordName('');
    setLandlordTC('');
    setLandlordAddress('');
    setLandlordPhone('');
    setTenantName('');
    setTenantTC('');
    setTenantAddress('');
    setTenantPhone('');
    setPropertyAddress('');
    setPropertyType('');
    setRoomCount('');
    setSquareMeters('');
    setRentAmount('');
    setDepositAmount('');
    setPaymentDay('');
    setStartDate('');
    setEndDate('');
    setIncreaseRate('');
    setAidatAmount('');
    setAidatPayer('kiracı');
    setSpecialTerms('');
    setGuarantorName('');
    setGuarantorTC('');
    setGuarantorPhone('');
  }, []);

  // ─── Fetch history ─────────────────────────────────────────────

  const fetchContracts = useCallback(async () => {
    if (!profile?.id) return;
    setHistoryLoading(true);
    const { data } = await getMyRentalContracts(profile.id);
    setContracts(data);
    setHistoryLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    if (activeSegment === 1) {
      fetchContracts();
    }
  }, [activeSegment, fetchContracts]);

  // ─── Create + Share ────────────────────────────────────────────

  const handleCreateAndShare = async () => {
    if (!profile) return;

    if (!isValidTC(landlordTC.trim())) {
      Alert.alert('Hata', 'Kiraya veren için geçerli bir TC Kimlik numarası girin.');
      return;
    }
    if (!isValidTC(tenantTC.trim())) {
      Alert.alert('Hata', 'Kiracı için geçerli bir TC Kimlik numarası girin.');
      return;
    }
    if (guarantorTC.trim() && !isValidTC(guarantorTC.trim())) {
      Alert.alert('Hata', 'Kefil için geçerli bir TC Kimlik numarası girin.');
      return;
    }

    setSaving(true);

    const { data, error } = await createRentalContract({
      agent_id: profile.id,
      listing_id: null,
      landlord_name: landlordName.trim(),
      landlord_tc: landlordTC.trim(),
      landlord_address: landlordAddress.trim() || null,
      landlord_phone: landlordPhone.trim() || null,
      tenant_name: tenantName.trim(),
      tenant_tc: tenantTC.trim(),
      tenant_address: tenantAddress.trim() || null,
      tenant_phone: tenantPhone.trim() || null,
      property_address: propertyAddress.trim(),
      property_type: propertyType.trim() || null,
      room_count: roomCount.trim() || null,
      square_meters: squareMeters.trim() || null,
      rent_amount: rentAmount.trim(),
      deposit_amount: depositAmount.trim() || null,
      payment_day: paymentDay.trim(),
      start_date: startDate,
      end_date: endDate,
      increase_rate: increaseRate.trim() || null,
      aidat_amount: aidatAmount.trim() || null,
      aidat_payer: aidatAmount.trim() ? aidatPayer : null,
      special_terms: specialTerms.trim() || null,
      guarantor_name: guarantorName.trim() || null,
      guarantor_tc: guarantorTC.trim() || null,
      guarantor_phone: guarantorPhone.trim() || null,
    });

    setSaving(false);

    if (error || !data) {
      Alert.alert('Hata', error ?? 'Kontrat oluşturulamadı.');
      return;
    }

    const link = `https://berabersatalim.com/kontrat.html#${data.confirmation_token}`;
    const message = `Merhaba ${tenantName.trim()},\n\nKira sözleşmeniz oluşturulmuştur.\nSözleşmeyi görüntülemek ve onaylamak için lütfen aşağıdaki linke tıklayın:\n\n${link}`;

    await Share.share({ message, title: 'Kira Sözleşmesi' });
    resetForm();
  };

  // ─── Re-share existing contract link ───────────────────────────

  const handleReShare = (contract: RentalContract) => {
    const link = `https://berabersatalim.com/kontrat.html#${contract.confirmation_token}`;
    const message = `Merhaba ${contract.tenant_name},\n\nKira sözleşmeniz oluşturulmuştur.\nSözleşmeyi görüntülemek ve onaylamak için lütfen aşağıdaki linke tıklayın:\n\n${link}`;

    Share.share({ message, title: 'Kira Sözleşmesi' });
  };

  // ─── Delete contract ───────────────────────────────────────────

  const handleDelete = (id: string) => {
    Alert.alert(
      'Kontratı Sil',
      'Bu kira kontratı kalıcı olarak silinecek. Emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteRentalContract(id);
            if (error) {
              Alert.alert('Hata', error);
              return;
            }
            setContracts((prev) => prev.filter((c) => c.id !== id));
          },
        },
      ],
    );
  };

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

      {/* Segment Control */}
      <View style={styles.segmentWrapper}>
        <SegmentControl
          segments={['Yeni Kontrat', 'Geçmiş Kontratlar']}
          selected={activeSegment}
          onSelect={setActiveSegment}
        />
      </View>

      {/* ═══ YENİ KONTRAT ═══ */}
      {activeSegment === 0 && (
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

          {/* Danışman Bilgileri (auto-filled) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Danışman Bilgileri</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ad Soyad</Text>
              <Text style={styles.infoValue}>{profile?.name ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Firma</Text>
              <Text style={styles.infoValue}>{profile?.company_name ?? '—'}</Text>
            </View>
            {profile?.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefon</Text>
                <Text style={styles.infoValue}>{profile.phone}</Text>
              </View>
            )}

            <View style={styles.autoFillNote}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.text.tertiary} />
              <Text style={styles.autoFillNoteText}>Profil bilgilerinizden otomatik dolduruldu</Text>
            </View>
          </View>

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
                <Text style={[styles.pillText, aidatPayer === 'kiracı' && styles.pillTextActive]}>
                  Kiracı
                </Text>
              </Pressable>
              <Pressable
                style={[styles.pill, aidatPayer === 'kiraya_veren' && styles.pillActive]}
                onPress={() => setAidatPayer('kiraya_veren')}
              >
                <Text style={[styles.pillText, aidatPayer === 'kiraya_veren' && styles.pillTextActive]}>
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
            {saving ? (
              <ActivityIndicator color={Colors.text.inverse} />
            ) : (
              <>
                <Ionicons name="share-outline" size={20} color={Colors.text.inverse} />
                <Text style={styles.submitButtonText}>Kontrat Oluştur ve Paylaş</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.disclaimer}>
            Bu sözleşme genel bilgi amaçlı hazırlanmıştır. Hukuki danışmanlık
            yerine geçmez. Önemli işlemlerde bir avukata danışmanız önerilir.
          </Text>
        </ScrollView>
      )}

      {/* ═══ GEÇMİŞ KONTRATLAR ═══ */}
      {activeSegment === 1 && (
        <View style={styles.historyContainer}>
          {historyLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : contracts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color={Colors.text.tertiary} />
              <Text style={styles.emptyStateText}>Henüz kira kontratı oluşturmadınız.</Text>
            </View>
          ) : (
            <FlatList
              data={contracts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.historyCard}>
                  <View style={styles.historyCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyTenantName}>{item.tenant_name}</Text>
                      <Text style={styles.historyTC}>TC: {maskTC(item.tenant_tc)}</Text>
                    </View>
                    <Text style={styles.historyDate}>
                      {item.start_date} - {item.end_date}
                    </Text>
                  </View>

                  <View style={styles.historyLocation}>
                    <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
                    <Text style={styles.historyLocationText} numberOfLines={1}>
                      {item.property_address}
                    </Text>
                  </View>

                  <View style={styles.historyBadges}>
                    <View style={styles.historyRentBadge}>
                      <Text style={styles.historyRentBadgeText}>{item.rent_amount} TL/ay</Text>
                    </View>
                    {item.confirmed_at ? (
                      <View style={styles.confirmedBadge}>
                        <Ionicons name="checkmark-circle" size={12} color={Colors.success ?? '#059669'} />
                        <Text style={styles.confirmedBadgeText}>Onaylandı</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingBadge}>
                        <Ionicons name="time-outline" size={12} color={Colors.warning} />
                        <Text style={styles.pendingBadgeText}>Onay Bekleniyor</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.historyActions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.historyShareButton,
                        pressed && { opacity: 0.85 },
                      ]}
                      onPress={() => handleReShare(item)}
                    >
                      <Ionicons name="send-outline" size={16} color={Colors.primary} />
                      <Text style={styles.historyShareText}>Linki Gönder</Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.historyDeleteButton,
                        pressed && { opacity: 0.85 },
                      ]}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={Colors.error} />
                      <Text style={styles.historyDeleteText}>Sil</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  segmentWrapper: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['5xl'],
  },

  // ─── Info rows ───
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
  },
  infoValue: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  autoFillNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.md,
  },
  autoFillNoteText: {
    ...Typography.caption2,
    color: Colors.text.tertiary,
  },

  // ─── Form stiller ───
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

  // ─── History ───
  historyContainer: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['5xl'],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing['3xl'],
  },
  emptyStateText: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  historyTenantName: {
    ...Typography.headline,
    color: Colors.text.primary,
  },
  historyTC: {
    ...Typography.caption1,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  historyDate: {
    ...Typography.caption1,
    color: Colors.text.secondary,
  },
  historyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  historyLocationText: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    flex: 1,
  },
  historyBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  historyRentBadge: {
    backgroundColor: Colors.rent + '14',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  historyRentBadgeText: {
    ...Typography.caption1,
    color: Colors.rent,
    fontWeight: '600',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: (Colors.success ?? '#059669') + '14',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  confirmedBadgeText: {
    ...Typography.caption1,
    color: Colors.success ?? '#059669',
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning + '14',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  pendingBadgeText: {
    ...Typography.caption1,
    color: Colors.warning,
    fontWeight: '600',
  },
  historyActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  historyShareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '0A',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  historyShareText: {
    ...Typography.caption1,
    color: Colors.primary,
    fontWeight: '600',
  },
  historyDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '0A',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  historyDeleteText: {
    ...Typography.caption1,
    color: Colors.error,
    fontWeight: '600',
  },
});
