import React, { useState } from 'react';
import { Heart, User, MapPin, Shield, Upload, Camera, CheckCircle } from 'lucide-react';
import { PREFECTURES, KYC_CONFIG } from '../../lib/constants';

interface KYCData {
  displayName: string;
  dateOfBirth: string;
  city: string;
  idDocument: File | null;
  selfiePhoto: File | null;
}

interface KYCFormProps {
  onComplete: (data: KYCData) => void;
  initialStep?: number;
}

export function KYCForm({ onComplete, initialStep }: KYCFormProps) {
  const [step, setStep] = useState(initialStep ?? 1);
  const [formData, setFormData] = useState<KYCData>({
    displayName: '',
    dateOfBirth: '',
    city: '',
    idDocument: null,
    selfiePhoto: null
  });

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // KYC完了時にデフォルト値を設定
      const completedData: KYCData = {
        displayName: formData.displayName || 'デモユーザー',
        dateOfBirth: formData.dateOfBirth || '1995-01-01',
        city: formData.city || '東京都',
        idDocument: formData.idDocument,
        selfiePhoto: formData.selfiePhoto
      };
      onComplete(completedData);
    }
  };

  // 直接ログイン処理（未使用のため削除）

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateFormData = (field: keyof KYCData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleFileUpload = (field: 'idDocument' | 'selfiePhoto', file: File | null) => {
    if (file && file.size > KYC_CONFIG.MAX_FILE_SIZE) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateFormData(field, file);
        
        if (field === 'selfiePhoto') {
          updateFormData('photos', [result]);
        }
      };
      reader.readAsDataURL(file);
    } else {
      updateFormData(field, file);
    }
  };

  // デバッグ用: 現在のローカルストレージ状況を確認
  const debugStorageData = () => {
    const allUsers = JSON.parse(localStorage.getItem('rainbow-match-all-users') || '[]');
    const globalProfiles = JSON.parse(localStorage.getItem('rainbow-match-global-profiles') || '[]');
    const matchingPool = JSON.parse(localStorage.getItem('rainbow-match-matching-pool') || '[]');
    
    console.log('🔍 ストレージデバッグ:', {
      allUsers: allUsers.length,
      globalProfiles: globalProfiles.length,
      matchingPool: matchingPool.length,
      latestUser: allUsers[allUsers.length - 1]?.profile?.displayName || 'なし'
    });
  };

  // デモ用：本人確認をスキップしてログイン
  const handleDemoLogin = () => {
    const completedData: KYCData = {
      displayName: formData.displayName || 'デモユーザー',
      dateOfBirth: formData.dateOfBirth || '1995-01-01',
      city: formData.city || '東京都',
      idDocument: null,
      selfiePhoto: null
    };
    onComplete(completedData);
  };
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">本人確認</h2>
        <p className="text-gray-600 mt-2">安全で素敵な出会いのために、あなたについて教えてください</p>
        
        {/* デバッグボタン（開発用） */}
        <button
          type="button"
          onClick={debugStorageData}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600"
        >
          [デバッグ] ストレージ確認
        </button>

        {/* デモログイン（本人確認スキップ） - さらに大きく表示 */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleDemoLogin}
            title="デモでログイン（本人確認をスキップ）"
            aria-label="デモでログイン（本人確認をスキップ）"
            className="w-full px-6 py-5 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105"
          >
            🚀 デモでログイン（本人確認をスキップ）
          </button>
          <p className="text-center text-xs text-gray-500 mt-2">
            デモ用：すべての手続きをスキップして即座にアプリを体験
          </p>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">ステップ {step} / 2</span>
          <span className="text-sm text-gray-500">{Math.round((step / 2) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* ステップ1: 表示名 */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <User className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">表示名設定</h3>
            <p className="text-gray-600">あなたの表示名を教えてください</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              表示名
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => updateFormData('displayName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="例: あきら（デモ操作中は空欄でもOK）"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              デモ操作中は入力なしでも次に進めます
            </p>
          </div>
        </div>
      )}

      {/* ステップ2: 詳細情報 */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">詳細情報</h3>
            <p className="text-gray-600">年齢確認と地域情報を入力してください</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              生年月日
            </label>
            {(() => {
              // 年月日の分解
              const [y, m, d] = (formData.dateOfBirth || '').split('-');
              const maxDateStr = new Date(
                Date.now() - KYC_CONFIG.MIN_AGE * 365 * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split('T')[0];
              const [maxY] = maxDateStr.split('-').map(Number);
              const maxYear = Number(maxY);
              const minYear = maxYear - 100; // 過去100年を選択可能

              const selectedYear = y ? Number(y) : 0;
              const selectedMonth = m ? Number(m) : 0;
              const selectedDay = d ? Number(d) : 0;

              const years: number[] = [];
              for (let yr = maxYear; yr >= minYear; yr--) years.push(yr);

              const months = Array.from({ length: 12 }, (_, i) => i + 1);
              const daysInMonth = selectedYear && selectedMonth
                ? new Date(selectedYear, selectedMonth, 0).getDate()
                : 31;
              const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

              const compose = (ny?: number, nm?: number, nd?: number) => {
                const cy = ny ?? selectedYear;
                const cm = nm ?? selectedMonth;
                const cd = nd ?? selectedDay;
                if (!cy || !cm || !cd) return '';
                const mm = String(cm).padStart(2, '0');
                const dd = String(cd).padStart(2, '0');
                return `${cy}-${mm}-${dd}`;
              };

              const handleYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
                const ny = Number(e.target.value) || 0;
                // 月が未選択の時は1月、日が未選択の時は1日に寄せる（選択を進めやすく）
                const nm = selectedMonth || 1;
                const nd = selectedDay || 1;
                updateFormData('dateOfBirth', compose(ny, nm, nd));
              };
              const handleMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
                const nm = Number(e.target.value) || 0;
                const ny = selectedYear || maxYear; // 年未選択時は一旦上限年を仮置き
                // 新しい月で日数超過しないように日を1日にリセット
                updateFormData('dateOfBirth', compose(ny, nm, 1));
              };
              const handleDay = (e: React.ChangeEvent<HTMLSelectElement>) => {
                const nd = Number(e.target.value) || 0;
                const ny = selectedYear || maxYear;
                const nm = selectedMonth || 1;
                updateFormData('dateOfBirth', compose(ny, nm, nd));
              };

              return (
                <div className="grid grid-cols-3 gap-3">
                  <select
                    aria-label="年"
                    value={selectedYear || ''}
                    onChange={handleYear}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">年</option>
                    {years.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}年
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="月"
                    value={selectedMonth || ''}
                    onChange={handleMonth}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">月</option>
                    {months.map((mo) => (
                      <option key={mo} value={mo}>
                        {mo}月
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="日"
                    value={selectedDay || ''}
                    onChange={handleDay}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">日</option>
                    {days.map((dy) => (
                      <option key={dy} value={dy}>
                        {dy}日
                      </option>
                    ))}
                  </select>
                </div>
              );
            })()}
            <p className="text-xs text-gray-500 mt-1">
              例: 年から「1967年」を選択できます（デモ操作中は空欄でも次に進めます）
            </p>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              お住まいの地域
            </label>
            <select
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData('city', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">都道府県を選択してください</option>
              {PREFECTURES.map(prefecture => (
                <option key={prefecture} value={prefecture}>{prefecture}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              デモ操作中は選択なしでも次に進めます
            </p>
          </div>
        </div>
      )}

      {/* ボタン */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          戻る
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
        >
          {step === 2 ? '完了してログイン' : '次へ'}
        </button>
      </div>
    </div>
  );
}