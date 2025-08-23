import { useState } from 'react';
import { Mail, Loader2, LogIn, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const { login, sendLoginOTP } = useAuth();
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // デモログイン処理（確実に動作）
  const handleDemoLogin = async () => {
    console.log('🚀 デモログイン開始');
    setIsLoading(true);
    setError('');
    
    try {
      const targetEmail = email.trim() || 'demo@example.com';
      console.log('デモログイン実行:', targetEmail);
      
      const result = await login(targetEmail, '123456', true);
      console.log('ログイン結果:', result);
      
      if (result.ok) {
        console.log('✅ ログイン成功 - onSuccess呼び出し');
        onSuccess();
      } else {
        console.error('❌ ログイン失敗:', result.error);
        setError(result.error || 'ログインに失敗しました');
      }
    } catch (error) {
      console.error('❌ ログインエラー:', error);
      setError('ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await sendLoginOTP(email);
      if (result.ok) {
        setStep('verify');
      } else {
        setError(result.error || 'OTP送信に失敗しました');
      }
    } catch {
      setError('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length !== 6) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, code, false);
      if (result.ok) {
        onSuccess();
      } else {
        setError(result.error || '認証コードが正しくありません');
      }
    } catch {
      setError('認証に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-500 to-green-400 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                  <defs>
                    <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="20%" stopColor="#F59E0B" />
                      <stop offset="40%" stopColor="#FBBF24" />
                      <stop offset="60%" stopColor="#10B981" />
                      <stop offset="80%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                  <path d="M4 14a8 8 0 0 1 16 0" fill="none" stroke="url(#rg)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M6 14a6 6 0 0 1 12 0" fill="none" stroke="url(#rg)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
                  <path d="M8 14a4 4 0 0 1 8 0" fill="none" stroke="url(#rg)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Rainbow Mail</h1>
              <p className="text-gray-600">おかえりなさい</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="you@example.com"
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
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>送信中...</span>
                  </>
                ) : (
                  <>
                    <span>認証コードを送信</span>
                    <LogIn size={20} />
                  </>
                )}
              </button>

              {/* デモログインボタン - 最優先 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-5 px-6 rounded-xl transition-all transform hover:scale-105 text-lg shadow-xl"
                >
                  🚀 デモでログイン（コード不要）
                </button>
                <p className="text-center text-xs text-gray-500 mt-2">
                  デモ用：認証コードなしで即座にログイン
                </p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => onSwitchToSignup && onSwitchToSignup()}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  新規登録はこちら
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-teal-500 to-green-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">認証コードを入力</h1>
            <p className="text-gray-600">{email} に6桁のコードを送信しました</p>
          </div>

          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                認証コード（6桁）
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center text-lg font-mono tracking-widest"
                placeholder="123456"
                maxLength={6}
                disabled={isLoading}
              />
              <div className="mt-2 text-sm text-gray-500">
                <p>デモ用: どのメールアドレスでも「123456」でログインできます</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>ログイン中...</span>
                </>
              ) : (
                <>
                  <span>ログイン</span>
                  <LogIn size={20} />
                </>
              )}
            </button>

            {/* デモログインボタン - 認証画面でも表示 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 text-lg shadow-xl"
              >
                🚀 デモでログイン（コード不要）
              </button>
              <p className="text-center text-xs text-gray-500 mt-2">
                デモ用：認証コードなしで即座にログイン
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}