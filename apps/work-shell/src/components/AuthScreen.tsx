import React, { useState } from "react";
import {
  Shield,
  User as UserIcon,
  Mail,
  Lock,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { API_BASE_URL } from "../api-config";
import { User } from "@epios/domain";

interface AuthScreenProps {
  onLogin: (userData: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || email.split("@")[0],
          password,
        }),
      });
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      const data = await response.json();
      onLogin(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top right, #1e2233 0%, #0f111a 100%)",
        color: "white",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "10%",
          width: "400px",
          height: "400px",
          background: "rgba(122, 162, 247, 0.05)",
          borderRadius: "50%",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          background: "rgba(187, 154, 247, 0.03)",
          borderRadius: "50%",
          filter: "blur(60px)",
        }}
      />

      <div
        style={{
          width: "440px",
          padding: "3rem",
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(20px)",
          borderRadius: "32px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          zIndex: 10,
          animation: "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Logo/Brand */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              padding: "12px",
              background: "linear-gradient(135deg, #7aa2f7 0%, #bb9af7 100%)",
              borderRadius: "16px",
              marginBottom: "1rem",
              boxShadow: "0 0 20px rgba(122, 162, 247, 0.3)",
            }}
          >
            <Shield size={32} color="white" />
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Epistemic OS
          </h1>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: "0.9rem",
              marginTop: "0.5rem",
            }}
          >
            {isLogin
              ? "С возвращением в систему управления смыслами"
              : "Присоединяйтесь к экосистеме Governance"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {!isLogin && (
            <InputGroup
              label="Username"
              icon={<UserIcon size={18} />}
              placeholder="alex_arch"
              value={username}
              onChange={setUsername}
            />
          )}

          <InputGroup
            label="Email"
            icon={<Mail size={18} />}
            placeholder="name@company.com"
            type="email"
            value={email}
            onChange={setEmail}
          />

          <InputGroup
            label="Password"
            icon={<Lock size={18} />}
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={setPassword}
          />

          {error && (
            <div
              style={{
                color: "#ff966c",
                fontSize: "0.8rem",
                textAlign: "center",
                background: "rgba(255, 150, 108, 0.1)",
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 150, 108, 0.2)",
              }}
            >
              {error === "Invalid credentials"
                ? "Неверные учетные данные или пользователь не найден"
                : error}
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: "1rem",
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(90deg, #7aa2f7, #bb9af7)",
              color: "white",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 10px 15px -3px rgba(122, 162, 247, 0.2)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            {isLogin ? "Войти в систему" : "Зарегистрироваться"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.4)" }}>
            {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: "none",
                border: "none",
                color: "#7aa2f7",
                fontWeight: 600,
                cursor: "pointer",
                marginLeft: "8px",
                textDecoration: "underline",
              }}
            >
              {isLogin ? "Создать аккаунт" : "Войти"}
            </button>
          </p>
        </div>

        {/* OAuth Dividers */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            margin: "1.5rem 0",
            opacity: 0.2,
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "white" }} />
          <span style={{ fontSize: "0.7rem" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "white" }} />
        </div>

        <button
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(255, 255, 255, 0.03)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            cursor: "pointer",
            fontSize: "0.85rem",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")
          }
        >
          <Terminal size={18} /> Continue with GitHub
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const InputGroup: React.FC<{
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
}> = ({ label, icon, placeholder, type = "text", value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <label
      style={{
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "rgba(255, 255, 255, 0.5)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          left: "14px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "rgba(255, 255, 255, 0.3)",
        }}
      >
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "14px 14px 14px 44px",
          borderRadius: "14px",
          background: "rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          color: "white",
          fontSize: "0.95rem",
          outline: "none",
          transition: "border 0.2s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#7aa2f7")}
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)")
        }
      />
    </div>
  </div>
);

export default AuthScreen;
