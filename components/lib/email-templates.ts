'use client'

// Email Templates con estética ClearGrade - Oscuro + Verde Claro (#a8e063)
// Mismo diseño que los banners: fondo negro, verde claro, formas decorativas

export const EMAIL_TEMPLATES = {
  confirmEmail: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirma tu email en ClearGrade</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Google Sans', sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            line-height: 1.6;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            border: 1px solid rgba(168, 224, 99, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .blob {
            position: absolute;
            border-radius: 50%;
            opacity: 0.12;
        }
        .blob-1 {
            top: -20%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, #a8e063 0%, transparent 70%);
        }
        .blob-2 {
            bottom: -30%;
            left: -15%;
            width: 250px;
            height: 250px;
            background: radial-gradient(circle, #a8e063 0%, transparent 70%);
        }
        .header-content {
            position: relative;
            z-index: 1;
        }
        .brand {
            font-size: 12px;
            color: #a8e063;
            font-weight: 700;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            margin-bottom: 20px;
            opacity: 0.9;
        }
        .header h1 {
            color: #a8e063;
            font-size: 56px;
            font-weight: 900;
            margin-bottom: 8px;
            letter-spacing: -2px;
            line-height: 1;
        }
        .header p {
            color: rgba(255, 255, 255, 0.6);
            font-size: 16px;
            font-weight: 400;
        }
        .content {
            padding: 50px;
        }
        .content-section {
            margin-bottom: 32px;
        }
        .greeting {
            font-size: 18px;
            color: #ffffff;
            margin-bottom: 16px;
            font-weight: 600;
        }
        .greeting strong {
            color: #a8e063;
        }
        .message {
            font-size: 15px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 28px;
            line-height: 1.8;
        }
        .feature-list {
            background: linear-gradient(135deg, rgba(168, 224, 99, 0.05) 0%, rgba(168, 224, 99, 0.02) 100%);
            border-left: 3px solid #a8e063;
            padding: 20px;
            border-radius: 12px;
            margin: 28px 0;
        }
        .feature-list ul {
            list-style: none;
            padding: 0;
        }
        .feature-list li {
            font-size: 15px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .feature-list li:last-child {
            margin-bottom: 0;
        }
        .checkmark {
            color: #a8e063;
            font-weight: bold;
            font-size: 18px;
        }
        .button-wrapper {
            text-align: center;
            margin: 40px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #a8e063 0%, #8fce2f 100%);
            color: #0a0a0a !important;
            padding: 16px 50px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 16px;
            transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
            box-shadow: 0 8px 24px rgba(168, 224, 99, 0.3);
            border: none;
            cursor: pointer;
            display: inline-block;
        }
        .button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 32px rgba(168, 224, 99, 0.4);
        }
        .code-section {
            margin: 32px 0;
        }
        .code-label {
            font-size: 12px;
            color: rgba(168, 224, 99, 0.8);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 700;
            margin-bottom: 12px;
            display: block;
        }
        .code-box {
            background: linear-gradient(135deg, rgba(168, 224, 99, 0.08) 0%, rgba(168, 224, 99, 0.03) 100%);
            border: 2px solid rgba(168, 224, 99, 0.25);
            border-radius: 12px;
            padding: 24px;
            font-family: 'Monaco', 'Courier New', monospace;
            text-align: center;
            font-size: 28px;
            font-weight: 900;
            color: #a8e063;
            letter-spacing: 6px;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, rgba(168, 224, 99, 0.2) 50%, transparent 100%);
            margin: 32px 0;
        }
        .security-notice {
            background: linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 193, 7, 0.08) 100%);
            border-left: 3px solid rgba(255, 152, 0, 0.5);
            padding: 16px 20px;
            border-radius: 10px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            margin: 24px 0;
        }
        .security-notice strong {
            color: rgba(255, 255, 255, 0.9);
            display: block;
            margin-bottom: 6px;
        }
        .footer-section {
            border-top: 1px solid rgba(168, 224, 99, 0.1);
            padding-top: 28px;
            margin-top: 40px;
        }
        .footer-text {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.5);
            text-align: center;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        .footer-links {
            text-align: center;
            font-size: 12px;
        }
        .footer-links a {
            color: #a8e063;
            text-decoration: none;
            margin: 0 12px;
            transition: opacity 0.2s;
        }
        .footer-links a:hover {
            opacity: 0.8;
        }
        @media (max-width: 600px) {
            .container {
                border-radius: 16px;
            }
            .header {
                padding: 40px 24px;
                min-height: 250px;
            }
            .header h1 {
                font-size: 40px;
            }
            .content {
                padding: 28px;
            }
            .button {
                padding: 14px 40px;
                font-size: 15px;
            }
            .code-box {
                font-size: 22px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
            <div class="header-content">
                <div class="brand">ClearGrade</div>
                <h1>¡Bienvenido!</h1>
                <p>Confirma tu email para empezar</p>
            </div>
        </div>

        <div class="content">
            <div class="content-section">
                <p class="greeting">Hola,</p>
                <p class="message">
                    Gracias por crear tu cuenta en <strong>ClearGrade</strong>. Para completar el registro y acceder a todas nuestras funciones, necesitamos que confirmes tu dirección de email.
                </p>
            </div>

            <div class="button-wrapper">
                <a href="{{ confirm_email_link }}" class="button">Confirmar Email →</a>
            </div>

            <div class="divider"></div>

            <div class="content-section">
                <p class="code-label">O copia este código</p>
                <div class="code-box">{{ code }}</div>
            </div>

            <div class="feature-list">
                <ul>
                    <li><span class="checkmark">✓</span> Gestiona tu agenda escolar</li>
                    <li><span class="checkmark">✓</span> Organiza tareas por materia</li>
                    <li><span class="checkmark">✓</span> Recibe recordatorios inteligentes</li>
                </ul>
            </div>

            <div class="security-notice">
                <strong>Nota de seguridad:</strong>
                Este enlace expirará en 24 horas. Si no creaste esta cuenta, ignora este email.
            </div>

            <div class="footer-section">
                <p class="footer-text">
                    Este es un email de confirmación automático. Por favor no respondas a este correo.
                </p>
                <div class="footer-links">
                    <a href="https://cleargrade.app">ClearGrade</a>
                    <span>•</span>
                    <a href="https://cleargrade.app/privacy">Privacidad</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,

  resetPassword: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña - ClearGrade</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Google Sans', sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            line-height: 1.6;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            border: 1px solid rgba(168, 224, 99, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .blob {
            position: absolute;
            border-radius: 50%;
            opacity: 0.12;
        }
        .blob-1 {
            top: -20%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, #ff6b6b 0%, transparent 70%);
        }
        .blob-2 {
            bottom: -30%;
            left: -15%;
            width: 250px;
            height: 250px;
            background: radial-gradient(circle, #ff6b6b 0%, transparent 70%);
        }
        .header-content {
            position: relative;
            z-index: 1;
        }
        .brand {
            font-size: 12px;
            color: #a8e063;
            font-weight: 700;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            margin-bottom: 20px;
            opacity: 0.9;
        }
        .header h1 {
            color: #ff9999;
            font-size: 56px;
            font-weight: 900;
            margin-bottom: 8px;
            letter-spacing: -2px;
            line-height: 1;
        }
        .header p {
            color: rgba(255, 255, 255, 0.6);
            font-size: 16px;
            font-weight: 400;
        }
        .content {
            padding: 50px;
        }
        .content-section {
            margin-bottom: 32px;
        }
        .message {
            font-size: 15px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 28px;
            line-height: 1.8;
        }
        .steps {
            background: linear-gradient(135deg, rgba(168, 224, 99, 0.05) 0%, rgba(168, 224, 99, 0.02) 100%);
            border-left: 3px solid #a8e063;
            padding: 20px;
            border-radius: 12px;
            margin: 28px 0;
        }
        .steps ol {
            list-style: decimal;
            padding-left: 20px;
            margin: 0;
        }
        .steps li {
            font-size: 15px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 10px;
        }
        .steps li:last-child {
            margin-bottom: 0;
        }
        .button-wrapper {
            text-align: center;
            margin: 40px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #a8e063 0%, #8fce2f 100%);
            color: #0a0a0a !important;
            padding: 16px 50px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 16px;
            transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
            box-shadow: 0 8px 24px rgba(168, 224, 99, 0.3);
            border: none;
            cursor: pointer;
        }
        .button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 32px rgba(168, 224, 99, 0.4);
        }
        .code-section {
            margin: 32px 0;
        }
        .code-label {
            font-size: 12px;
            color: rgba(168, 224, 99, 0.8);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 700;
            margin-bottom: 12px;
            display: block;
        }
        .code-box {
            background: linear-gradient(135deg, rgba(168, 224, 99, 0.08) 0%, rgba(168, 224, 99, 0.03) 100%);
            border: 2px solid rgba(168, 224, 99, 0.25);
            border-radius: 12px;
            padding: 24px;
            font-family: 'Monaco', 'Courier New', monospace;
            text-align: center;
            font-size: 28px;
            font-weight: 900;
            color: #a8e063;
            letter-spacing: 6px;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, rgba(168, 224, 99, 0.2) 50%, transparent 100%);
            margin: 32px 0;
        }
        .security-alert {
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%);
            border-left: 3px solid #ff6b6b;
            padding: 16px 20px;
            border-radius: 10px;
            font-size: 14px;
            color: rgba(255, 200, 200, 0.9);
            margin: 24px 0;
        }
        .security-alert strong {
            color: #ff9999;
            display: block;
            margin-bottom: 8px;
        }
        .expiry-info {
            background: linear-gradient(135deg, rgba(255, 193, 7, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%);
            border-left: 3px solid #ffc107;
            padding: 16px 20px;
            border-radius: 10px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            margin: 24px 0;
        }
        .expiry-info strong {
            color: rgba(255, 255, 255, 0.9);
            display: block;
            margin-bottom: 6px;
        }
        .footer-section {
            border-top: 1px solid rgba(168, 224, 99, 0.1);
            padding-top: 28px;
            margin-top: 40px;
        }
        .footer-text {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.5);
            text-align: center;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        .footer-links {
            text-align: center;
            font-size: 12px;
        }
        .footer-links a {
            color: #a8e063;
            text-decoration: none;
            margin: 0 12px;
            transition: opacity 0.2s;
        }
        .footer-links a:hover {
            opacity: 0.8;
        }
        @media (max-width: 600px) {
            .container {
                border-radius: 16px;
            }
            .header {
                padding: 40px 24px;
                min-height: 250px;
            }
            .header h1 {
                font-size: 40px;
            }
            .content {
                padding: 28px;
            }
            .button {
                padding: 14px 40px;
                font-size: 15px;
            }
            .code-box {
                font-size: 22px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
            <div class="header-content">
                <div class="brand">ClearGrade</div>
                <h1>🔐 Restablecer</h1>
                <p>Solicitud de seguridad</p>
            </div>
        </div>

        <div class="content">
            <div class="security-alert">
                <strong>Solicitud de cambio de contraseña</strong>
                Recibimos una solicitud para restablecer la contraseña de tu cuenta.
            </div>

            <div class="content-section">
                <p class="message">
                    Si realizaste esta solicitud, sigue los pasos para crear una nueva contraseña. Si no fuiste tú, ignora este email.
                </p>
            </div>

            <div class="button-wrapper">
                <a href="{{ reset_password_link }}" class="button">Restablecer Contraseña →</a>
            </div>

            <div class="divider"></div>

            <div class="content-section">
                <p class="code-label">O copia este código</p>
                <div class="code-box">{{ code }}</div>
            </div>

            <div class="steps">
                <ol>
                    <li>Haz clic en el botón de arriba</li>
                    <li>Ingresa una nueva contraseña fuerte</li>
                    <li>Confirma la contraseña</li>
                    <li>¡Listo! Ya puedes iniciar sesión</li>
                </ol>
            </div>

            <div class="expiry-info">
                <strong>⏱️ Válido por 1 hora</strong>
                Este enlace expirará en 1 hora por razones de seguridad.
            </div>

            <div class="security-alert">
                <strong>Consejos de seguridad:</strong>
                <div style="margin-top: 8px; opacity: 0.9;">
                    • Usa una contraseña fuerte con mayúsculas, números y símbolos<br>
                    • Nunca compartas tu contraseña con nadie
                </div>
            </div>

            <div class="footer-section">
                <p class="footer-text">
                    Este es un email de seguridad automático. Por favor no respondas.
                </p>
                <div class="footer-links">
                    <a href="https://cleargrade.app">ClearGrade</a>
                    <span>•</span>
                    <a href="https://cleargrade.app/privacy">Privacidad</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,

  emailChange: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmar cambio de email - ClearGrade</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Google Sans', sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            line-height: 1.6;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            border: 1px solid rgba(168, 224, 99, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .blob {
            position: absolute;
            border-radius: 50%;
            opacity: 0.12;
        }
        .blob-1 {
            top: -20%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, #a8e063 0%, transparent 70%);
        }
        .header-content {
            position: relative;
            z-index: 1;
        }
        .brand {
            font-size: 12px;
            color: #a8e063;
            font-weight: 700;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            margin-bottom: 20px;
            opacity: 0.9;
        }
        .header h1 {
            color: #a8e063;
            font-size: 56px;
            font-weight: 900;
            margin-bottom: 8px;
            letter-spacing: -2px;
            line-height: 1;
        }
        .header p {
            color: rgba(255, 255, 255, 0.6);
            font-size: 16px;
            font-weight: 400;
        }
        .content {
            padding: 50px;
        }
        .message {
            font-size: 15px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 28px;
            line-height: 1.8;
        }
        .button-wrapper {
            text-align: center;
            margin: 40px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #a8e063 0%, #8fce2f 100%);
            color: #0a0a0a !important;
            padding: 16px 50px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 16px;
            transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
            box-shadow: 0 8px 24px rgba(168, 224, 99, 0.3);
            border: none;
        }
        .button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 32px rgba(168, 224, 99, 0.4);
        }
        .email-info {
            background: linear-gradient(135deg, rgba(168, 224, 99, 0.08) 0%, rgba(168, 224, 99, 0.03) 100%);
            border-left: 3px solid #a8e063;
            padding: 20px;
            border-radius: 12px;
            margin: 28px 0;
            font-size: 15px;
        }
        .email-info strong {
            color: #a8e063;
            display: block;
            margin-bottom: 8px;
        }
        .footer-section {
            border-top: 1px solid rgba(168, 224, 99, 0.1);
            padding-top: 28px;
            margin-top: 40px;
            text-align: center;
        }
        .footer-text {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.5);
            line-height: 1.6;
        }
        .footer-links {
            text-align: center;
            font-size: 12px;
            margin-top: 16px;
        }
        .footer-links a {
            color: #a8e063;
            text-decoration: none;
            margin: 0 12px;
            transition: opacity 0.2s;
        }
        .footer-links a:hover {
            opacity: 0.8;
        }
        @media (max-width: 600px) {
            .container {
                border-radius: 16px;
            }
            .header {
                padding: 40px 24px;
                min-height: 250px;
            }
            .header h1 {
                font-size: 40px;
            }
            .content {
                padding: 28px;
            }
            .button {
                padding: 14px 40px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="blob blob-1"></div>
            <div class="header-content">
                <div class="brand">ClearGrade</div>
                <h1>Email Nuevo</h1>
                <p>Se detectó un cambio</p>
            </div>
        </div>

        <div class="content">
            <p class="message">
                Recibimos una solicitud para cambiar el email de tu cuenta en ClearGrade.
            </p>

            <div class="button-wrapper">
                <a href="{{ confirm_email_link }}" class="button">Confirmar Nuevo Email →</a>
            </div>

            <div class="email-info">
                <strong>Nuevo email:</strong>
                {{ new_email }}
            </div>

            <p class="message">
                Si no realizaste este cambio, por favor <a href="{{ support_link }}" style="color: #a8e063; text-decoration: underline;">contacta a soporte</a> inmediatamente.
            </p>

            <div class="footer-section">
                <p class="footer-text">
                    Este es un email de seguridad automático. Por favor no respondas.
                </p>
                <div class="footer-links">
                    <a href="https://cleargrade.app">ClearGrade</a>
                    <span>•</span>
                    <a href="https://cleargrade.app/privacy">Privacidad</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
}

// Helper function para renderizar templates
export function renderEmailTemplate(
  templateType: keyof typeof EMAIL_TEMPLATES,
  variables: Record<string, string>
): string {
  let html = EMAIL_TEMPLATES[templateType]
  
  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    html = html.replace(regex, value)
  })
  
  return html
}
