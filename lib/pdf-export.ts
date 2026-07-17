// ─── PDF Çıktı Yardımcıları ──────────────────────────────────────
// expo-print ile HTML → PDF oluşturma. Build'de expo-print yoksa sessizce false döner.

import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

let Print: typeof import('expo-print') | null = null;

try {
  Print = require('expo-print');
} catch {
  // expo-print native modülü yok (eski build) — PDF devre dışı
}

/** expo-print kullanılabilir mi? */
export function isPdfAvailable(): boolean {
  return Print !== null;
}

/** Yer Gösterme Belgesi PDF'i oluştur ve paylaş */
export async function exportShowingCertificatePdf(params: {
  agentName: string;
  agentCompany: string;
  agentPhone?: string;
  licenseNumber?: string;
  clientName: string;
  clientTcMasked: string;
  clientPhone?: string;
  city: string;
  district: string;
  neighborhood?: string;
  addressDetail?: string;
  propertyType: string;
  transactionType: string;
  ada?: string;
  parsel?: string;
  showingDate: string;
  showingTime?: string;
  notes?: string;
  confirmedAt?: string;
}): Promise<void> {
  if (!Print) {
    Alert.alert('PDF Kullanılamıyor', 'Bu özellik için uygulamanın güncel sürümünü indirin.');
    return;
  }

  const p = params;
  const address = [p.city, p.district, p.neighborhood, p.addressDetail].filter(Boolean).join(', ');
  const parcelInfo = [p.ada && `Ada: ${p.ada}`, p.parsel && `Parsel: ${p.parsel}`].filter(Boolean).join(' / ');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 40px; color: #1A1A2E; font-size: 14px; line-height: 1.6; }
    h1 { text-align: center; font-size: 20px; margin-bottom: 4px; }
    .subtitle { text-align: center; color: #6B7280; font-size: 12px; margin-bottom: 32px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 700; color: #0A2540; border-bottom: 2px solid #0A2540; padding-bottom: 6px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 6px 8px; border-bottom: 1px solid #E5E7EB; }
    td:first-child { color: #6B7280; width: 40%; font-size: 13px; }
    td:last-child { font-weight: 500; }
    .status { text-align: center; padding: 12px; border-radius: 8px; margin-top: 24px; font-weight: 600; }
    .confirmed { background: #ECFDF5; color: #059669; }
    .pending { background: #FFF7ED; color: #D97706; }
    .footer { text-align: center; color: #9CA3AF; font-size: 11px; margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 16px; }
  </style>
</head>
<body>
  <h1>YER GÖSTERME BELGESİ</h1>
  <p class="subtitle">Beraber Satalım</p>

  <div class="section">
    <div class="section-title">Danışman Bilgileri</div>
    <table>
      <tr><td>Ad Soyad</td><td>${p.agentName}</td></tr>
      <tr><td>Firma</td><td>${p.agentCompany}</td></tr>
      ${p.licenseNumber ? `<tr><td>Yetki Belgesi No</td><td>${p.licenseNumber}</td></tr>` : ''}
      ${p.agentPhone ? `<tr><td>Telefon</td><td>${p.agentPhone}</td></tr>` : ''}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Müşteri Bilgileri</div>
    <table>
      <tr><td>Ad Soyad</td><td>${p.clientName}</td></tr>
      <tr><td>TC Kimlik No</td><td>${p.clientTcMasked}</td></tr>
      ${p.clientPhone ? `<tr><td>Telefon</td><td>${p.clientPhone}</td></tr>` : ''}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Taşınmaz Bilgileri</div>
    <table>
      <tr><td>Adres</td><td>${address}</td></tr>
      <tr><td>Taşınmaz Türü</td><td>${p.propertyType}</td></tr>
      <tr><td>İşlem Türü</td><td>${p.transactionType}</td></tr>
      ${parcelInfo ? `<tr><td>Ada / Parsel</td><td>${parcelInfo}</td></tr>` : ''}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Gösterim Bilgileri</div>
    <table>
      <tr><td>Tarih</td><td>${p.showingDate}</td></tr>
      ${p.showingTime ? `<tr><td>Saat</td><td>${p.showingTime}</td></tr>` : ''}
      ${p.notes ? `<tr><td>Notlar</td><td>${p.notes}</td></tr>` : ''}
    </table>
  </div>

  <div class="status ${p.confirmedAt ? 'confirmed' : 'pending'}">
    ${p.confirmedAt ? `Müşteri tarafından onaylandı — ${p.confirmedAt}` : 'Onay bekleniyor'}
  </div>

  <div class="footer">Bu belge Beraber Satalım uygulaması ile oluşturulmuştur.</div>
</body>
</html>`;

  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch {
    Alert.alert('Hata', 'PDF oluşturulurken bir sorun oluştu.');
  }
}

/** Kira Kontratı PDF'i oluştur ve paylaş */
export async function exportRentalContractPdf(params: {
  agentName: string;
  agentCompany: string;
  agentPhone?: string;
  landlordName: string;
  landlordTcMasked: string;
  landlordAddress?: string;
  landlordPhone?: string;
  tenantName: string;
  tenantTcMasked: string;
  tenantAddress?: string;
  tenantPhone?: string;
  propertyAddress: string;
  propertyType?: string;
  roomCount?: string;
  squareMeters?: string;
  rentAmount: string;
  depositAmount?: string;
  paymentDay: string;
  startDate: string;
  endDate: string;
  increaseRate?: string;
  aidatAmount?: string;
  aidatPayer?: string;
  specialTerms?: string;
  guarantorName?: string;
  guarantorTcMasked?: string;
  guarantorPhone?: string;
  confirmedAt?: string;
}): Promise<void> {
  if (!Print) {
    Alert.alert('PDF Kullanılamıyor', 'Bu özellik için uygulamanın güncel sürümünü indirin.');
    return;
  }

  const p = params;
  const propertyDetails = [p.propertyType, p.roomCount, p.squareMeters && `${p.squareMeters} m²`].filter(Boolean).join(' — ');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 40px; color: #1A1A2E; font-size: 14px; line-height: 1.6; }
    h1 { text-align: center; font-size: 20px; margin-bottom: 4px; }
    .subtitle { text-align: center; color: #6B7280; font-size: 12px; margin-bottom: 32px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 700; color: #0A2540; border-bottom: 2px solid #0A2540; padding-bottom: 6px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 6px 8px; border-bottom: 1px solid #E5E7EB; }
    td:first-child { color: #6B7280; width: 40%; font-size: 13px; }
    td:last-child { font-weight: 500; }
    .status { text-align: center; padding: 12px; border-radius: 8px; margin-top: 24px; font-weight: 600; }
    .confirmed { background: #ECFDF5; color: #059669; }
    .pending { background: #FFF7ED; color: #D97706; }
    .terms { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-top: 8px; white-space: pre-wrap; font-size: 13px; }
    .footer { text-align: center; color: #9CA3AF; font-size: 11px; margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 16px; }
  </style>
</head>
<body>
  <h1>KİRA SÖZLEŞMESİ</h1>
  <p class="subtitle">Beraber Satalım</p>

  <div class="section">
    <div class="section-title">Emlak Danışmanı</div>
    <table>
      <tr><td>Ad Soyad</td><td>${p.agentName}</td></tr>
      <tr><td>Firma</td><td>${p.agentCompany}</td></tr>
      ${p.agentPhone ? `<tr><td>Telefon</td><td>${p.agentPhone}</td></tr>` : ''}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Kiraya Veren</div>
    <table>
      <tr><td>Ad Soyad</td><td>${p.landlordName}</td></tr>
      <tr><td>TC Kimlik No</td><td>${p.landlordTcMasked}</td></tr>
      ${p.landlordAddress ? `<tr><td>Adres</td><td>${p.landlordAddress}</td></tr>` : ''}
      ${p.landlordPhone ? `<tr><td>Telefon</td><td>${p.landlordPhone}</td></tr>` : ''}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Kiracı</div>
    <table>
      <tr><td>Ad Soyad</td><td>${p.tenantName}</td></tr>
      <tr><td>TC Kimlik No</td><td>${p.tenantTcMasked}</td></tr>
      ${p.tenantAddress ? `<tr><td>Adres</td><td>${p.tenantAddress}</td></tr>` : ''}
      ${p.tenantPhone ? `<tr><td>Telefon</td><td>${p.tenantPhone}</td></tr>` : ''}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Taşınmaz</div>
    <table>
      <tr><td>Adres</td><td>${p.propertyAddress}</td></tr>
      ${propertyDetails ? `<tr><td>Detay</td><td>${propertyDetails}</td></tr>` : ''}
    </table>
  </div>

  <div class="section">
    <div class="section-title">Kira Koşulları</div>
    <table>
      <tr><td>Aylık Kira</td><td>${p.rentAmount} TL</td></tr>
      ${p.depositAmount ? `<tr><td>Depozito</td><td>${p.depositAmount} TL</td></tr>` : ''}
      <tr><td>Ödeme Günü</td><td>Her ayın ${p.paymentDay}. günü</td></tr>
      <tr><td>Başlangıç</td><td>${p.startDate}</td></tr>
      <tr><td>Bitiş</td><td>${p.endDate}</td></tr>
      <tr><td>Artış Oranı</td><td>${p.increaseRate || 'TÜFE oranında'}</td></tr>
      ${p.aidatAmount ? `<tr><td>Aidat</td><td>${p.aidatAmount} TL (${p.aidatPayer === 'kiraya_veren' ? 'Kiraya veren' : 'Kiracı'} öder)</td></tr>` : ''}
    </table>
  </div>

  ${p.guarantorName ? `
  <div class="section">
    <div class="section-title">Kefil</div>
    <table>
      <tr><td>Ad Soyad</td><td>${p.guarantorName}</td></tr>
      ${p.guarantorTcMasked ? `<tr><td>TC Kimlik No</td><td>${p.guarantorTcMasked}</td></tr>` : ''}
      ${p.guarantorPhone ? `<tr><td>Telefon</td><td>${p.guarantorPhone}</td></tr>` : ''}
    </table>
  </div>` : ''}

  ${p.specialTerms ? `
  <div class="section">
    <div class="section-title">Özel Şartlar</div>
    <div class="terms">${p.specialTerms}</div>
  </div>` : ''}

  <div class="status ${p.confirmedAt ? 'confirmed' : 'pending'}">
    ${p.confirmedAt ? `Kiracı tarafından onaylandı — ${p.confirmedAt}` : 'Kiracı onayı bekleniyor'}
  </div>

  <div class="footer">Bu sözleşme Beraber Satalım uygulaması ile oluşturulmuştur. Genel bilgi amaçlıdır, hukuki danışmanlık yerine geçmez.</div>
</body>
</html>`;

  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch {
    Alert.alert('Hata', 'PDF oluşturulurken bir sorun oluştu.');
  }
}
