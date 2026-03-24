import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { User, Lock, Eye, EyeOff, X } from 'lucide-react';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const usernameError = touched.username && !username.trim() ? 'Поле обязательно для заполнения' : '';
  const passwordError = touched.password && !password.trim() ? 'Поле обязательно для заполнения' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    if (!username.trim() || !password.trim()) return;

    await login(username, password, rememberMe);

    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <div className="login-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#2D3FE2" />
            <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="login-title">Добро пожаловать!</h1>
        <p className="login-subtitle">Пожалуйста, авторизируйтесь</p>

        <div className="form-group">
          <label className="form-label">Логин</label>
          <div className={`input-wrapper ${usernameError || error ? 'input-error' : ''}`}>
            <User size={18} className="input-icon" />
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              placeholder="Введите логин"
              autoComplete="username"
            />
            {username && (
              <button type="button" className="input-action" onClick={() => setUsername('')}>
                <X size={16} />
              </button>
            )}
          </div>
          {usernameError && <span className="field-error">{usernameError}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Пароль</label>
          <div className={`input-wrapper ${passwordError || error ? 'input-error' : ''}`}>
            <Lock size={18} className="input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="Введите пароль"
              autoComplete="current-password"
            />
            <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordError && <span className="field-error">{passwordError}</span>}
        </div>

        {error && <div className="api-error">{error}</div>}

        <label className="remember-me" id="remember-me-label">
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span className="checkmark" />
          Запомнить данные
        </label>

        <button
          id="login-submit"
          type="submit"
          className="login-btn"
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>

        <div className="login-divider">
          <span>или</span>
        </div>

        <p className="login-footer">
          Нет аккаунта?{' '}
          <a href="#" onClick={(e) => e.preventDefault()} className="create-link">
            Создать
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
