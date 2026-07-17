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
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, Radius } from '@/constants/Theme';
import { CITIES, CITY_DISTRICTS, getNeighborhoodsForDistrict } from '@/lib/constants';
import { PROPERTY_LABELS, TRANSACTION_LABELS } from '@/lib/format';
import { useAuth } from '@/lib/auth-context';
import {
  createShowingCertificate,
  getMyShowingCertificates,
  deleteShowingCertificate,
} from '@/lib/database';
import { supabase } from '@/lib/supabase';
import DropdownPicker from '@/components/ui/DropdownPicker';
import SegmentControl from '@/components/ui/SegmentControl';
import { isPdfAvailable, exportShowingCertificatePdf } from '@/lib/pdf-export';
import type { Listing, ShowingCertificate, PropertyType, TransactionType } from '@/types';

// ─── Helpers ──────────────────────────────────────────

function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
}

function formatTimeInput(text: string): string {
  const digits = text.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

function parseDateInput(dateStr: string): string | null {
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  if (!day || !month || !year || year.length !== 4) return null;
  const d = Number(day), m = Number(month), y = Number(year);
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 2020 || y > 2030) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function isValidTC(tc: string): boolean {
  return tc.length === 11 && tc[0] !== '0' && /^\d{11}$/.test(tc);
}

function maskTC(tc: string): string {
  if (tc.length < 4) return '***';
  return '*'.repeat(tc.length - 4) + tc.slice(-4);
}

// ─── Dropdown options ─────────────────────────────────

const PROPERTY_TYPE_OPTIONS = [
  { key: 'RESIDENTIAL', label: 'Konut' },
  { key: 'COMMERCIAL', label: 'Ticari' },
  { key: 'LAND', label: 'Arsa' },
  { key: 'URBAN_RENEWAL', label: 'Kentsel Dönüşüm' },
];

const TRANSACTION_TYPE_OPTIONS = [
  { key: 'SALE', label: 'Satılık' },
  { key: 'RENT', label: 'Kiralık' },
];

// ─── Main Screen ──────────────────────────────────────

export default function ShowingCertificateScreen() {
  const router = useRouter();
  const { listingId } = useLocalSearchParams<{ listingId?: string }>();
  const { profile } = useAuth();
  const [activeSegment, setActiveSegment] = useState(0);

  // — Linked listing
  const [linkedListing, setLinkedListing] = useState<Listing | null>(null);
  const [listingLoading, setListingLoading] = useState(!!listingId);

  // — Form state
  const [clientName, setClientName] = useState('');
  const [clientTC, setClientTC] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [addressDetail, setAddressDetail] = useState('');
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<string | null>(null);
  const [ada, setAda] = useState('');
  const [parsel, setParsel] = useState('');

  // Auto-fill current date & time
  const [showingDate, setShowingDate] = useState(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`;
  });
  const [showingTime, setShowingTime] = useState(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  // — History state
  const [certificates, setCertificates] = useState<ShowingCertificate[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // — Fetch linked listing
  useEffect(() => {
    if (!listingId) return;
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*, agent:users(*)')
        .eq('id', listingId)
        .single();

      if (cancelled) return;
      setListingLoading(false);

      if (error || !data) return;

      const listing = data as Listing;
      setLinkedListing(listing);

      // Pre-fill property fields from listing
      setSelectedCity(listing.city);
      setSelectedDistrict(listing.district);
      setSelectedNeighborhood(listing.neighborhood ?? null);
      setPropertyType(listing.property_type);
      setTransactionType(listing.transaction_type);
      setAda(listing.ada ?? '');
      setParsel(listing.parsel ?? '');
    })();

    return () => { cancelled = true; };
  }, [listingId]);

  // — Dropdown options
  const cityOptions = useMemo(
    () => CITIES.map((c) => ({ key: c, label: c })),
    [],
  );

  const districtOptions = useMemo(() => {
    if (!selectedCity) return [];
    const districts = CITY_DISTRICTS[selectedCity] ?? [];
    return districts.map((d) => ({ key: d, label: d }));
  }, [selectedCity]);

  const neighborhoodOptions = useMemo(() => {
    if (!selectedCity || !selectedDistrict) return [];
    const neighborhoods = getNeighborhoodsForDistrict(selectedCity, selectedDistrict);
    return neighborhoods.map((n) => ({ key: n, label: n }));
  }, [selectedCity, selectedDistrict]);

  // — City/District/Neighborhood cascade
  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city);
    setSelectedDistrict(null);
    setSelectedNeighborhood(null);
  }, []);

  const handleDistrictChange = useCallback((district: string) => {
    setSelectedDistrict(district);
    setSelectedNeighborhood(null);
  }, []);

  // — Form validation
  const canSubmit = useMemo(() => {
    return (
      clientName.trim().length > 0 &&
      clientTC.trim().length === 11 &&
      selectedCity !== null &&
      selectedDistrict !== null &&
      propertyType !== null &&
      transactionType !== null &&
      showingDate.length === 10 &&
      confirmed &&
      !saving
    );
  }, [clientName, clientTC, selectedCity, selectedDistrict, propertyType, transactionType, showingDate, confirmed, saving]);

  // — Reset form
  const resetForm = useCallback(() => {
    setClientName('');
    setClientTC('');
    setClientPhone('');
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedNeighborhood(null);
    setAddressDetail('');
    setPropertyType(null);
    setTransactionType(null);
    setAda('');
    setParsel('');
    setShowingDate('');
    setShowingTime('');
    setNotes('');
    setConfirmed(false);
  }, []);

  // — Fetch history
  const fetchCertificates = useCallback(async () => {
    if (!profile?.id) return;
    setHistoryLoading(true);
    const { data } = await getMyShowingCertificates(profile.id);
    setCertificates(data);
    setHistoryLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    if (activeSegment === 1) {
      fetchCertificates();
    }
  }, [activeSegment, fetchCertificates]);

  // — Create + Share
  const handleCreateAndShare = async () => {
    if (!profile) return;

    if (!isValidTC(clientTC.trim())) {
      Alert.alert('Hata', 'Geçerli bir TC Kimlik numarası girin (11 hane, sıfırla başlayamaz).');
      return;
    }

    const dbDate = parseDateInput(showingDate);
    if (!dbDate) {
      Alert.alert('Hata', 'Geçerli bir tarih girin (GG.AA.YYYY).');
      return;
    }

    setSaving(true);

    const { data, error } = await createShowingCertificate({
      agent_id: profile.id,
      client_name: clientName.trim(),
      client_tc: clientTC.trim(),
      client_phone: clientPhone.trim() || null,
      city: selectedCity!,
      district: selectedDistrict!,
      neighborhood: selectedNeighborhood || null,
      address_detail: addressDetail.trim() || null,
      property_type: propertyType as PropertyType,
      transaction_type: transactionType as TransactionType,
      ada: ada.trim() || null,
      parsel: parsel.trim() || null,
      showing_date: dbDate,
      showing_time: showingTime.trim() || null,
      notes: notes.trim() || null,
      listing_id: linkedListing?.id ?? null,
    });

    setSaving(false);

    if (error || !data) {
      Alert.alert('Hata', error ?? 'Belge oluşturulamadı.');
      return;
    }

    const link = `https://berabersatalim.com/belge.html#${data.confirmation_token}`;
    const message = `Merhaba ${clientName.trim()},\n\n${showingDate} tarihli yer gösterme belgeniz oluşturulmuştur.\nBelgeyi görüntülemek ve onaylamak için lütfen aşağıdaki linke tıklayın:\n\n${link}`;

    await Share.share({ message, title: 'Yer Gösterme Belgesi' });
    resetForm();
  };

  // — Re-share existing certificate link
  const handleReShare = (cert: ShowingCertificate) => {
    const dateFormatted = cert.showing_date
      ? cert.showing_date.split('-').reverse().join('.')
      : '';

    const link = `https://berabersatalim.com/belge.html#${cert.confirmation_token}`;
    const message = `Merhaba ${cert.client_name},\n\n${dateFormatted} tarihli yer gösterme belgeniz oluşturulmuştur.\nBelgeyi görüntülemek ve onaylamak için lütfen aşağıdaki linke tıklayın:\n\n${link}`;

    Share.share({ message, title: 'Yer Gösterme Belgesi' });
  };

  // — PDF export
  const handlePdfExport = (cert: ShowingCertificate) => {
    const dateFormatted = cert.showing_date
      ? cert.showing_date.split('-').reverse().join('.')
      : '';

    exportShowingCertificatePdf({
      agentName: profile?.name ?? '',
      agentCompany: profile?.company_name ?? '',
      agentPhone: profile?.phone ?? undefined,
      licenseNumber: profile?.license_number ?? undefined,
      clientName: cert.client_name,
      clientTcMasked: maskTC(cert.client_tc),
      clientPhone: cert.client_phone ?? undefined,
      city: cert.city,
      district: cert.district,
      neighborhood: cert.neighborhood ?? undefined,
      addressDetail: cert.address_detail ?? undefined,
      propertyType: PROPERTY_LABELS[cert.property_type] ?? cert.property_type,
      transactionType: TRANSACTION_LABELS[cert.transaction_type] ?? cert.transaction_type,
      ada: cert.ada ?? undefined,
      parsel: cert.parsel ?? undefined,
      showingDate: dateFormatted,
      showingTime: cert.showing_time ?? undefined,
      notes: cert.notes ?? undefined,
      confirmedAt: cert.confirmed_at ?? undefined,
    });
  };

  // — Delete certificate
  const handleDelete = (id: string) => {
    Alert.alert(
      'Belgeyi Sil',
      'Bu yer gösterme belgesi kalıcı olarak silinecek. Emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteShowingCertificate(id);
            if (error) {
              Alert.alert('Hata', error);
              return;
            }
            setCertificates((prev) => prev.filter((c) => c.id !== id));
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Yer Gösterme Belgesi',
          headerBackTitle: 'Geri',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text.primary,
        }}
      />

      {/* Segment Control */}
      <View style={styles.segmentWrapper}>
        <SegmentControl
          segments={['Yeni Belge', 'Geçmiş Belgeler']}
          selected={activeSegment}
          onSelect={setActiveSegment}
        />
      </View>

      {/* ═══ YENİ BELGE ═══ */}
      {activeSegment === 0 && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Danışman Bilgileri (auto-filled) */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={22} color={Colors.primary} />
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
            {profile?.license_number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Yetki Belgesi No</Text>
                <Text style={styles.infoValue}>{profile.license_number}</Text>
              </View>
            )}
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

          {/* Müşteri Bilgileri */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={22} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
            </View>

            <Text style={styles.inputLabel}>Ad Soyad *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { paddingLeft: Spacing.md }]}
                value={clientName}
                onChangeText={setClientName}
                placeholder="Müşteri adı soyadı"
                placeholderTextColor={Colors.text.tertiary}
                autoCapitalize="words"
              />
            </View>

            <Text style={styles.inputLabel}>TC Kimlik No *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { paddingLeft: Spacing.md }]}
                value={clientTC}
                onChangeText={(t) => setClientTC(t.replace(/\D/g, '').slice(0, 11))}
                placeholder="11 haneli TC Kimlik numarası"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={11}
              />
            </View>

            <Text style={styles.inputLabel}>Telefon</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { paddingLeft: Spacing.md }]}
                value={clientPhone}
                onChangeText={setClientPhone}
                placeholder="0532 xxx xx xx"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Taşınmaz Bilgileri */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="home-outline" size={22} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Taşınmaz Bilgileri</Text>
            </View>

            {/* Linked listing banner */}
            {linkedListing && (
              <View style={styles.linkedBanner}>
                <Ionicons name="link-outline" size={16} color={Colors.primary} />
                <Text style={styles.linkedBannerText}>
                  İlan bilgilerinden otomatik dolduruldu
                </Text>
              </View>
            )}

            {listingLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: Spacing.xl }} />
            ) : linkedListing ? (
              <>
                {/* Read-only property fields from listing */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Şehir</Text>
                  <Text style={styles.infoValue}>{linkedListing.city}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>İlçe</Text>
                  <Text style={styles.infoValue}>{linkedListing.district}</Text>
                </View>
                {linkedListing.neighborhood && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mahalle</Text>
                    <Text style={styles.infoValue}>{linkedListing.neighborhood}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Taşınmaz Türü</Text>
                  <Text style={styles.infoValue}>
                    {PROPERTY_LABELS[linkedListing.property_type] ?? linkedListing.property_type}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>İşlem Türü</Text>
                  <Text style={styles.infoValue}>
                    {TRANSACTION_LABELS[linkedListing.transaction_type] ?? linkedListing.transaction_type}
                  </Text>
                </View>
                {linkedListing.ada && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ada</Text>
                    <Text style={styles.infoValue}>{linkedListing.ada}</Text>
                  </View>
                )}
                {linkedListing.parsel && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Parsel</Text>
                    <Text style={styles.infoValue}>{linkedListing.parsel}</Text>
                  </View>
                )}

                {/* Address detail is still editable */}
                <Text style={[styles.inputLabel, { marginTop: Spacing.lg }]}>Adres Detayı</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={addressDetail}
                    onChangeText={setAddressDetail}
                    placeholder="Cadde/Sokak, Bina No, Daire No"
                    placeholderTextColor={Colors.text.tertiary}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </>
            ) : (
              <>
                {/* Manual entry — no linked listing */}
                <Text style={styles.inputLabel}>Şehir *</Text>
                <View style={styles.pickerWrapper}>
                  <DropdownPicker
                    label="Şehir"
                    value={selectedCity}
                    options={cityOptions}
                    onSelect={handleCityChange}
                    placeholder="Şehir seçin"
                  />
                </View>

                <Text style={styles.inputLabel}>İlçe *</Text>
                <View style={styles.pickerWrapper}>
                  <DropdownPicker
                    label="İlçe"
                    value={selectedDistrict}
                    options={districtOptions}
                    onSelect={handleDistrictChange}
                    placeholder={selectedCity ? 'İlçe seçin' : 'Önce şehir seçin'}
                  />
                </View>

                {neighborhoodOptions.length > 0 && (
                  <>
                    <Text style={styles.inputLabel}>Mahalle</Text>
                    <View style={styles.pickerWrapper}>
                      <DropdownPicker
                        label="Mahalle"
                        value={selectedNeighborhood}
                        options={neighborhoodOptions}
                        onSelect={setSelectedNeighborhood}
                        placeholder="Mahalle seçin"
                      />
                    </View>
                  </>
                )}

                <Text style={styles.inputLabel}>Adres Detayı</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={addressDetail}
                    onChangeText={setAddressDetail}
                    placeholder="Cadde/Sokak, Bina No, Daire No"
                    placeholderTextColor={Colors.text.tertiary}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <Text style={styles.inputLabel}>Taşınmaz Türü *</Text>
                <View style={styles.pickerWrapper}>
                  <DropdownPicker
                    label="Taşınmaz Türü"
                    value={propertyType}
                    options={PROPERTY_TYPE_OPTIONS}
                    onSelect={setPropertyType}
                    placeholder="Tür seçin"
                  />
                </View>

                <Text style={styles.inputLabel}>İşlem Türü *</Text>
                <View style={styles.pickerWrapper}>
                  <DropdownPicker
                    label="İşlem Türü"
                    value={transactionType}
                    options={TRANSACTION_TYPE_OPTIONS}
                    onSelect={setTransactionType}
                    placeholder="İşlem türü seçin"
                  />
                </View>

                {/* Ada / Parsel */}
                <View style={styles.rowInputs}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Ada</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={[styles.input, { paddingLeft: Spacing.md }]}
                        value={ada}
                        onChangeText={setAda}
                        placeholder="Ada no"
                        placeholderTextColor={Colors.text.tertiary}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Parsel</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={[styles.input, { paddingLeft: Spacing.md }]}
                        value={parsel}
                        onChangeText={setParsel}
                        placeholder="Parsel no"
                        placeholderTextColor={Colors.text.tertiary}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Gösterim Bilgileri */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Gösterim Bilgileri</Text>
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Tarih * (GG.AA.YYYY)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, { paddingLeft: Spacing.md }]}
                    value={showingDate}
                    onChangeText={(t) => setShowingDate(formatDateInput(t))}
                    placeholder="07.07.2026"
                    placeholderTextColor={Colors.text.tertiary}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Saat (SS:DD)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, { paddingLeft: Spacing.md }]}
                    value={showingTime}
                    onChangeText={(t) => setShowingTime(formatTimeInput(t))}
                    placeholder="14:30"
                    placeholderTextColor={Colors.text.tertiary}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Notlar */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={22} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Notlar</Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.multilineInput, { minHeight: 80 }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Ek notlar (opsiyonel)"
                placeholderTextColor={Colors.text.tertiary}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Onay + Buton */}
          <View style={styles.sectionCard}>
            <Pressable
              style={styles.checkboxRow}
              onPress={() => setConfirmed(!confirmed)}
            >
              <Ionicons
                name={confirmed ? 'checkbox' : 'square-outline'}
                size={24}
                color={confirmed ? Colors.accent : Colors.text.tertiary}
              />
              <Text style={styles.checkboxText}>
                Bu yer gösterme belgesinin doğru ve eksiksiz olduğunu onaylıyorum.
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
                pressed && canSubmit && { opacity: 0.9 },
              ]}
              onPress={handleCreateAndShare}
              disabled={!canSubmit}
            >
              {saving ? (
                <ActivityIndicator color={Colors.text.inverse} />
              ) : (
                <>
                  <Ionicons name="share-outline" size={20} color={Colors.text.inverse} />
                  <Text style={styles.submitButtonText}>Belge Oluştur ve Paylaş</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* ═══ GEÇMİŞ BELGELER ═══ */}
      {activeSegment === 1 && (
        <View style={styles.historyContainer}>
          {historyLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : certificates.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color={Colors.text.tertiary} />
              <Text style={styles.emptyStateText}>Henüz yer gösterme belgesi oluşturmadınız.</Text>
            </View>
          ) : (
            <FlatList
              data={certificates}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const dateFormatted = item.showing_date
                  ? item.showing_date.split('-').reverse().join('.')
                  : '';
                return (
                  <View style={styles.historyCard}>
                    <View style={styles.historyCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyClientName}>{item.client_name}</Text>
                        <Text style={styles.historyTC}>TC: {maskTC(item.client_tc)}</Text>
                      </View>
                      <Text style={styles.historyDate}>{dateFormatted}</Text>
                    </View>

                    <View style={styles.historyLocation}>
                      <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
                      <Text style={styles.historyLocationText}>
                        {[item.city, item.district, item.neighborhood].filter(Boolean).join(', ')}
                      </Text>
                    </View>

                    <View style={styles.historyBadges}>
                      <View style={styles.historyBadge}>
                        <Text style={styles.historyBadgeText}>
                          {PROPERTY_LABELS[item.property_type] ?? item.property_type}
                        </Text>
                      </View>
                      <View style={styles.historyBadge}>
                        <Text style={styles.historyBadgeText}>
                          {TRANSACTION_LABELS[item.transaction_type] ?? item.transaction_type}
                        </Text>
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

                      {isPdfAvailable() && (
                        <Pressable
                          style={({ pressed }) => [
                            styles.historyPdfButton,
                            pressed && { opacity: 0.85 },
                          ]}
                          onPress={() => handlePdfExport(item)}
                        >
                          <Ionicons name="document-outline" size={16} color={Colors.accent} />
                          <Text style={styles.historyPdfText}>PDF</Text>
                        </Pressable>
                      )}

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
                );
              }}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Stiller ──────────────────────────────────────────

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
    padding: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['5xl'],
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
  linkedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '0A',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  linkedBannerText: {
    ...Typography.caption1,
    color: Colors.primary,
    fontWeight: '600',
  },
  inputLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  pickerWrapper: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  multilineInput: {
    paddingLeft: Spacing.md,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  checkboxText: {
    ...Typography.footnote,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.text.tertiary,
  },
  submitButtonText: {
    ...Typography.headline,
    color: Colors.text.inverse,
  },

  // — History
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
  historyClientName: {
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
  },
  historyBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  historyBadge: {
    backgroundColor: Colors.primary + '0A',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  historyBadgeText: {
    ...Typography.caption1,
    color: Colors.primary,
    fontWeight: '600',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '14',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  confirmedBadgeText: {
    ...Typography.caption1,
    color: Colors.success,
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
  historyPdfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent + '0A',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  historyPdfText: {
    ...Typography.caption1,
    color: Colors.accent,
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
