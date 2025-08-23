// 改善された新規登録フォーム
// 6桁OTP、利用規約同意、初期プロフィール設定を含む

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, ArrowRight, Heart, Shield, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { OTP_CONFIG } from '../../lib/constants';

interface SignupFormProps {
  onSuccess: () => void;
}

type SignupStep = 'email' | 'verify' | 'terms';

export function SignupForm({ onSuccess }: SignupFormProps) {
  const { t } = useLanguage();
  const { signup, verifySignup } = useAuth();
  const [step, setStep] = useState<SignupStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // 利用規約・プライバシーポリシー同意
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signup(email);
      if (result.ok) {
        setStep('verify');
        startResendTimer();
      } else {
        setError(result.error || t('errorGeneric'));
      }
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length !== OTP_CONFIG.LENGTH) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await verifySignup(email, code);
      if (result.ok) {
        setStep('terms');
      } else {
        setError(result.error || '認証コードが正しくありません');
      }
    } catch {
      setError(t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreements.terms || !agreements.privacy) {
      setError('利用規約とプライバシーポリシーへの同意が必要です');
      return;
    }
    // 利用規約同意後、直接KYC画面に遷移
    sessionStorage.setItem('signup-email', email);
    sessionStorage.setItem('signup-agreements', JSON.stringify(agreements));
    sessionStorage.setItem('signup-completed', 'true');
    onSuccess(); // KYC画面に遷移
  };

  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(OTP_CONFIG.RESEND_COOLDOWN_SECONDS);
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      const result = await signup(email);
      if (result.ok) {
        startResendTimer();
        setError('');
      } else {
        setError(result.error || '再送信に失敗しました');
      }
    } catch {
      setError('再送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // メール入力ステップ
  if (step === 'email') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-purple-600" size={28} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Rainbow Mail</h1>
              <p className="text-gray-600">新規登録にようこそ</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>送信中...</span>
                  </>
                ) : (
                  <>
                    <span>認証コードを送信</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => window.location.href = '/login'}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  既にアカウントをお持ちの方はこちら
                </button>
              </div>

              {/* デモでログイン（大きく表示） */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem('signup-email', email.trim() || 'demo@example.com');
                    sessionStorage.setItem('signup-completed', 'true');
                    onSuccess();
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg shadow-lg"
                >
                  🚀 デモでログイン（登録手続きをスキップ）
                </button>
                <p className="text-center text-xs text-gray-500 mt-2">
                  デモ用：すべての手続きをスキップして即座にアプリを体験
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // OTP認証ステップ
  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">認証コードを入力</h1>
              <p className="text-gray-600">{email} に{OTP_CONFIG.LENGTH}桁のコードを送信しました</p>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  認証コード（{OTP_CONFIG.LENGTH}桁）
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, OTP_CONFIG.LENGTH))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-center text-lg font-mono tracking-widest"
                  placeholder="123456"
                  maxLength={OTP_CONFIG.LENGTH}
                  required
                  disabled={isLoading}
                />
                <div className="mt-2 text-sm text-gray-500">
                  <p>デモ用: どのメールアドレスでも「123456」で認証できます</p>
                  <p className="text-xs">有効期限: {OTP_CONFIG.EXPIRY_MINUTES}分</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || code.length !== OTP_CONFIG.LENGTH}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>認証中...</span>
                  </>
                ) : (
                  <>
                    <span>認証する</span>
                    <CheckCircle size={20} />
                  </>
                )}
              </button>

              {/* 再送信 */}
              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    認証コードを再送信
                  </button>
                ) : (
                  <p className="text-gray-500 text-sm">
                    再送信まで {resendTimer}秒
                  </p>
                )}
              </div>

              {/* デモでログイン（大きく表示） */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem('signup-email', email);
                    sessionStorage.setItem('signup-completed', 'true');
                    onSuccess();
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg shadow-lg"
                >
                  🚀 デモでログイン（認証をスキップ）
                </button>
                <p className="text-center text-xs text-gray-500 mt-2">
                  デモ用：認証手続きをスキップして即座にアプリを体験
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 利用規約同意ステップ
  if (step === 'terms') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-600" size={28} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">利用規約への同意</h1>
              <p className="text-gray-600">安全で快適なサービス利用のために</p>
            </div>

            <form onSubmit={handleTermsSubmit} className="space-y-6">
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={(e) => setAgreements(prev => ({ ...prev, terms: e.target.checked }))}
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    required
                  />
                  <div className="text-sm">
                    <span className="text-gray-900 font-medium">利用規約</span>
                    <span className="text-red-500">*</span>
                    <span className="text-gray-600">に同意します</span>
                    <a href="#" className="text-purple-600 hover:text-purple-700 ml-1">
                      （内容を確認）
                    </a>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={(e) => setAgreements(prev => ({ ...prev, privacy: e.target.checked }))}
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    required
                  />
                  <div className="text-sm">
                    <span className="text-gray-900 font-medium">プライバシーポリシー</span>
                    <span className="text-red-500">*</span>
                    <span className="text-gray-600">に同意します</span>
                    <a href="#" className="text-purple-600 hover:text-purple-700 ml-1">
                      （内容を確認）
                    </a>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreements.marketing}
                    onChange={(e) => setAgreements(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="text-sm">
                    <span className="text-gray-900 font-medium">マーケティング情報の受信</span>
                    <span className="text-gray-600">に同意します（任意）</span>
                  </div>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="text-blue-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-blue-800 text-sm font-medium mb-1">安全性について</p>
                    <ul className="text-blue-700 text-xs space-y-1">
                      <li>• 18歳以上の方のみご利用いただけます</li>
                      <li>• 本人確認により安全性を確保しています</li>
                      <li>• 不適切な行為は即座に対処いたします</li>
                      <li>• プライバシーを最優先に保護します</li>
                    </ul>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!agreements.terms || !agreements.privacy}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <span>同意して続行</span>
                <ArrowRight size={20} />
              </button>

              {/* デモでログイン（大きく表示） */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem('signup-email', email);
                    sessionStorage.setItem('signup-agreements', JSON.stringify({
                      terms: true,
                      privacy: true,
                      marketing: false
                    }));
                    sessionStorage.setItem('signup-completed', 'true');
                    onSuccess();
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg shadow-lg"
                >
                  🚀 デモでログイン（利用規約をスキップ）
                </button>
                <p className="text-center text-xs text-gray-500 mt-2">
                  デモ用：利用規約手続きをスキップして即座にアプリを体験
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}