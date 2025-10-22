# Cambly Learning PWA

Cambly konuşmalarınızdan öğrenme için geliştirilmiş Progressive Web App (PWA) uygulaması.

## Özellikler

### 🎯 Aralıklı Tekrar Sistemi
- Öğrenme bilimine dayalı aralıklı tekrar algoritması
- Bugünün materyali + rastgele eski materyaller
- Otomatik kart seçimi ve sıralama

### 📚 Çoklu İçerik Türü
- **Grammar Hataları**: Orijinal ve düzeltilmiş cümleler
- **Vocabulary**: Kelime anlamları ve örnek cümleler  
- **Quiz**: Çoktan seçmeli sorular

### 🌐 PWA Özellikleri
- Offline çalışma
- Cihaza yüklenebilir
- Hızlı yükleme
- Responsive tasarım

### 📊 İlerleme Takibi
- Günlük istatistikler
- Streak takibi
- Quiz başarı oranları
- Haftalık aktivite grafiği

### ⚙️ Esnek Ayarlar
- Türkçe çevirileri göster/gizle
- Veri yönetimi
- Offline depolama
- Cache yönetimi
- Otomatik güncelleme kontrolü

## Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd cambly-learning-pwa
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

4. **Tarayıcıda açın**
```
http://localhost:3000
```

## Kullanım

### JSON Dosyası Yükleme

1. **Ana sayfada** "JSON Dosyası Yükle" butonuna tıklayın
2. **Dosya seçin** veya JSON içeriğini yapıştırın
3. **Tarih seçin** (konuşma tarihi)
4. **İçe aktar** butonuna tıklayın

### Öğrenme Oturumu

- Uygulama otomatik olarak aralıklı tekrar kartlarını seçer
- Kartları sırayla tamamlayın
- "Biliyorum" veya "Tekrar Çalış" seçeneklerini kullanın
- Oturum sonunda istatistiklerinizi görün

### Geçmiş Transkriptler

- Tüm yüklenen transkriptleri görüntüleyin
- Belirli bir günün materyallerini tekrar edin
- İstenmeyen transkriptleri silin

### İstatistikler

- Toplam çalışılan gün sayısı
- Streak (arka arkaya çalışma günleri)
- Quiz başarı oranları
- Haftalık aktivite grafiği

## JSON Formatı

Uygulama aşağıdaki JSON formatını bekler:

```json
{
  "grammar_mistakes": [
    {
      "original": "I am go to school",
      "correction": "I am going to school",
      "explanation_en": "Present continuous tense",
      "explanation_tr": "Şimdiki zaman"
    }
  ],
  "vocabulary_suggestions": [
    {
      "word": "excellent",
      "definition_en": "extremely good",
      "definition_tr": "mükemmel",
      "example_sentence": "The food was excellent."
    }
  ],
  "quizzes": [
    {
      "type": "grammar",
      "question_en": "Choose the correct form",
      "question_tr": "Doğru formu seçin",
      "options": ["I go", "I am going", "I went"],
      "correct_answer": 1
    }
  ]
}
```

## Teknik Detaylar

### Teknoloji Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Icons**: Lucide React
- **Storage**: LocalStorage
- **PWA**: Service Worker + Manifest
- **Cache Management**: Versioned caching system

### Proje Yapısı
```
src/
├── components/          # UI bileşenleri
│   ├── ImportModal.jsx
│   ├── LearningCard.jsx
│   ├── QuizCard.jsx
│   └── Header.jsx
├── pages/              # Sayfa bileşenleri
│   ├── Home.jsx
│   ├── History.jsx
│   ├── Statistics.jsx
│   └── Settings.jsx
├── hooks/              # Custom hooks
│   ├── useSettings.js
│   ├── useTranscripts.js
│   └── useVersion.js
├── utils/              # Utility fonksiyonları
│   ├── storage.js
│   ├── validation.js
│   └── spacedRepetition.js
└── App.jsx
```

### Aralıklı Tekrar Algoritması

Kartlar aşağıdaki ağırlıklarla seçilir:
- **Bugünün materyali**: %40
- **Son 3 gün**: %30  
- **Son 7 gün**: %20
- **7+ gün önce**: %10

## PWA Kurulumu

### Tarayıcıda Yükleme
1. Chrome/Edge'de adres çubuğundaki "Yükle" butonuna tıklayın
2. Veya menü > "Uygulamayı yükle" seçeneğini kullanın

### Mobil Cihazda
1. Safari'de "Ana ekrana ekle" seçeneğini kullanın
2. Chrome'da "Ana ekrana ekle" seçeneğini kullanın

## Geliştirme

### Komutlar
```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run preview      # Build önizleme
```

### Linting
```bash
npm run lint         # ESLint kontrolü
```

## Lisans

MIT License

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Versiyon Yönetimi

### Versiyon Güncelleme
```bash
# Patch versiyonu (1.0.0 -> 1.0.1)
npm run version:patch

# Minor versiyonu (1.0.0 -> 1.1.0)  
npm run version:minor

# Major versiyonu (1.0.0 -> 2.0.0)
npm run version:major

# Manuel versiyon
node scripts/update-version.js 1.2.3
```

### Cache Yönetimi
Uygulama gelişmiş cache yönetimi ile gelir:

- **Otomatik Cache Temizleme**: Yeni versiyonlarda eski cache'ler otomatik silinir
- **Versiyon Kontrolü**: Service Worker versiyon değişikliklerini algılar  
- **Manuel Cache Temizleme**: Settings sayfasından cache temizlenebilir
- **Güncelleme Bildirimleri**: Yeni versiyonlar kullanıcıya bildirilir

### Cache Problemleri Çözümü
1. Settings > Application Information > Clear Cache
2. Uygulamayı yeniden yükle
3. Gerekirse tarayıcı cache'ini temizle

## Destek

Sorunlar için GitHub Issues kullanın.