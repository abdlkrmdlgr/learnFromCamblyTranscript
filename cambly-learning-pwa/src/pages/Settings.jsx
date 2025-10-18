import { useState } from 'react';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Eye, EyeOff, Info } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { progressStorage } from '../utils/storage';

const Settings = () => {
  const { settings, updateSettings, toggleTurkish } = useSettings();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAllData = () => {
    if (window.confirm('Tüm verilerinizi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      const success = progressStorage.clearAll();
      if (success) {
        alert('Tüm veriler başarıyla silindi. Sayfa yenilenecek.');
        window.location.reload();
      } else {
        alert('Veriler silinirken bir hata oluştu.');
      }
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <SettingsIcon size={20} />
            <span>Uygulama Ayarları</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Dil Ayarları */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dil Ayarları</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Türkçe Çevirileri Göster</h4>
                  <p className="text-sm text-gray-600">
                    Kartlarda Türkçe açıklamaları gösterir/gizler
                  </p>
                </div>
                <button
                  onClick={toggleTurkish}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showTurkish ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showTurkish ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info size={20} className="text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Bilgi</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Bu ayar kapalıyken kartlarda Türkçe çeviriler görünmez. 
                      Her kartta ayrı ayrı "Göster/Gizle" butonu ile kontrol edebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Veri Yönetimi */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Veri Yönetimi</h3>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Dikkat</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Tüm verileriniz cihazınızda saklanır. Verilerinizi silerseniz, 
                      tüm transkriptler, ilerleme kayıtları ve ayarlarınız silinir.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Tüm Verileri Sil</h4>
                  <p className="text-sm text-gray-600">
                    Tüm transkriptler, ilerleme kayıtları ve ayarları silinir
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Sil</span>
                </button>
              </div>
            </div>
          </div>

          {/* Uygulama Bilgileri */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uygulama Bilgileri</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Uygulama Adı</h4>
                  <p className="text-sm text-gray-600">Cambly Learning PWA</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Versiyon</h4>
                  <p className="text-sm text-gray-600">1.0.0</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Platform</h4>
                  <p className="text-sm text-gray-600">PWA (Progressive Web App)</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Veri Depolama</h4>
                  <p className="text-sm text-gray-600">LocalStorage (Cihazda)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kullanım İpuçları */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kullanım İpuçları</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">JSON Dosyası Yükleme</h4>
                  <p className="text-sm text-gray-600">
                    Cambly konuşmanızdan sonra oluşturulan JSON dosyasını yükleyerek öğrenmeye başlayın.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Aralıklı Tekrar</h4>
                  <p className="text-sm text-gray-600">
                    Uygulama, öğrenme bilimine dayalı aralıklı tekrar sistemi kullanır.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600">3</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Offline Çalışma</h4>
                  <p className="text-sm text-gray-600">
                    PWA olarak çalışır ve internet bağlantısı olmadan da kullanılabilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tüm Verileri Sil</h3>
                  <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Tüm transkriptler, ilerleme kayıtları ve ayarlarınız silinecek. 
                Bu işlemi onaylamak istediğinizden emin misiniz?
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteAllData}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
