'use client'

// Email Templates con estética ClearGrade Material 3 Expressive
// Mismo diseño que el sitio web: Deep Blue + Verde Monet #00D418

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
            font-family: 'Google Sans', 'Google Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #f8f9fa 0%, #f3f5f7 100%);
            color: #1a1a1a;
            line-height: 1.6;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .header {
            background: linear-gradient(135deg, #3d2e8f 0%, #2d1b6f 100%);
            padding: 48px 32px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(0, 212, 24, 0.15) 0%, transparent 70%);
            border-radius: 50%;
        }
        .header-content {
            position: relative;
            z-index: 1;
        }
        .header h1 {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .header p {
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
            font-weight: 500;
        }
        .content {
            padding: 40px;
        }
        .content-section {
            margin-bottom: 24px;
        }
        .greeting {
            font-size: 16px;
            color: #1a1a1a;
            margin-bottom: 16px;
            font-weight: 500;
        }
        .greeting strong {
            color: #3d2e8f;
        }
        .message {
            font-size: 14px;
            color: #666666;
            margin-bottom: 24px;
            line-height: 1.8;
        }
        .feature-list {
            background: linear-gradient(135deg, rgba(61, 46, 143, 0.03) 0%, rgba(0, 212, 24, 0.03) 100%);
            border-left: 4px solid #00D418;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .feature-list ul {
            list-style: none;
            padding: 0;
        }
        .feature-list li {
            font-size: 14px;
            color: #333;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .feature-list li:last-child {
            margin-bottom: 0;
        }
        .checkmark {
            color: #00D418;
            font-weight: bold;
            font-size: 16px;
        }
        .button-wrapper {
            text-align: center;
            margin: 32px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #00D418 0%, #00a312 100%);
            color: white !important;
            padding: 14px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
            box-shadow: 0 4px 16px rgba(0, 212, 24, 0.3);
            border: none;
            cursor: pointer;
            display: inline-block;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 212, 24, 0.4);
        }
        .code-section {
            margin: 28px 0;
        }
        .code-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            font-weight: 600;
            margin-bottom: 8px;
            display: block;
        }
        .code-box {
            background: linear-gradient(135deg, #f5f7f6 0%, #f0f9f7 100%);
            border: 1px solid rgba(0, 212, 24, 0.2);
            border-radius: 8px;
            padding: 20px;
            font-family: 'Geist Mono', 'Monaco', 'Courier New', monospace;
            text-align: center;
            font-size: 24px;
            font-weight: 700;
            color: #3d2e8f;
            letter-spacing: 4px;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.08) 50%, transparent 100%);
            margin: 28px 0;
        }
        .security-notice {
            background: linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 193, 7, 0.08) 100%);
            border-left: 4px solid #ff9800;
            padding: 14px 16px;
            border-radius: 6px;
            font-size: 13px;
            color: #666;
            margin: 20px 0;
        }
        .security-notice strong {
            color: #333;
            display: block;
            margin-bottom: 4px;
        }
        .footer-section {
            border-top: 1px solid rgba(0, 0, 0, 0.06);
            padding-top: 24px;
            margin-top: 32px;
        }
        .footer-text {
            font-size: 13px;
            color: #999;
            text-align: center;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        .footer-links {
            text-align: center;
            font-size: 12px;
        }
        .footer-links a {
            color: #3d2e8f;
            text-decoration: none;
            margin: 0 8px;
            transition: color 0.2s;
        }
        .footer-links a:hover {
            color: #00D418;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #3d2e8f;
            letter-spacing: -1px;
        }
        @media (max-width: 600px) {
            .container {
                border-radius: 12px;
            }
            .header {
                padding: 32px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content {
                padding: 24px;
            }
            .button {
                padding: 12px 32px;
                font-size: 14px;
            }
            .code-box {
                font-size: 20px;
                letter-spacing: 2px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="logo">ClearGrade</div>
                <h1>¡Bienvenido!</h1>
                <p>Estamos listos para comenzar</p>
            </div>
        </div>

        <div class="content">
            <div class="content-section">
                <p class="greeting">Hola <strong>{{ user_name }}</strong>,</p>
                <p class="message">
                    Gracias por crear tu cuenta en <strong>ClearGrade</strong>. Para completar el registro y acceder a todas nuestras funciones, necesitamos que confirmes tu dirección de email.
                </p>
            </div>

            <div class="button-wrapper">
                <a href="{{ confirm_email_link }}" class="button">Confirmar Email</a>
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
                    <li><span class="checkmark">✓</span> Recibe recordatorios</li>
                </ul>
            </div>

            <div class="security-notice">
                <strong>Nota de seguridad:</strong>
                Este enlace expirará en 24 horas. Si no creaste esta cuenta, puedes ignorar este email.
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
            font-family: 'Google Sans', 'Google Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #f8f9fa 0%, #f3f5f7 100%);
            color: #1a1a1a;
            line-height: 1.6;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .header {
            background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
            padding: 48px 32px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            border-radius: 50%;
        }
        .header-content {
            position: relative;
            z-index: 1;
        }
        .header h1 {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .header p {
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
            font-weight: 500;
        }
        .content {
            padding: 40px;
        }
        .content-section {
            margin-bottom: 24px;
        }
        .greeting {
            font-size: 16px;
            color: #1a1a1a;
            margin-bottom: 16px;
            font-weight: 500;
        }
        .greeting strong {
            color: #3d2e8f;
        }
        .message {
            font-size: 14px;
            color: #666666;
            margin-bottom: 24px;
            line-height: 1.8;
        }
        .steps {
            background: linear-gradient(135deg, rgba(61, 46, 143, 0.03) 0%, rgba(0, 212, 24, 0.03) 100%);
            border-left: 4px solid #3d2e8f;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .steps ol {
            list-style: decimal;
            padding-left: 20px;
            margin: 0;
        }
        .steps li {
            font-size: 14px;
            color: #333;
            margin-bottom: 8px;
        }
        .steps li:last-child {
            margin-bottom: 0;
        }
        .button-wrapper {
            text-align: center;
            margin: 32px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #00D418 0%, #00a312 100%);
            color: white !important;
            padding: 14px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
            box-shadow: 0 4px 16px rgba(0, 212, 24, 0.3);
            border: none;
            cursor: pointer;
            display: inline-block;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 212, 24, 0.4);
        }
        .code-section {
            margin: 28px 0;
        }
        .code-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            font-weight: 600;
            margin-bottom: 8px;
            display: block;
        }
        .code-box {
            background: linear-gradient(135deg, #f5f7f6 0%, #f0f9f7 100%);
            border: 1px solid rgba(0, 212, 24, 0.2);
            border-radius: 8px;
            padding: 20px;
            font-family: 'Geist Mono', 'Monaco', 'Courier New', monospace;
            text-align: center;
            font-size: 24px;
            font-weight: 700;
            color: #3d2e8f;
            letter-spacing: 4px;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.08) 50%, transparent 100%);
            margin: 28px 0;
        }
        .security-alert {
            background: linear-gradient(135deg, rgba(244, 67, 54, 0.08) 0%, rgba(229, 57, 53, 0.08) 100%);
            border-left: 4px solid #d32f2f;
            padding: 14px 16px;
            border-radius: 6px;
            font-size: 13px;
            color: #666;
            margin: 20px 0;
        }
        .security-alert strong {
            color: #333;
            display: block;
            margin-bottom: 4px;
        }
        .expiry-info {
            background: linear-gradient(135deg, rgba(255, 193, 7, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%);
            border-left: 4px solid #ff9800;
            padding: 14px 16px;
            border-radius: 6px;
            font-size: 13px;
            color: #666;
            margin: 20px 0;
        }
        .expiry-info strong {
            color: #333;
            display: block;
            margin-bottom: 4px;
        }
        .footer-section {
            border-top: 1px solid rgba(0, 0, 0, 0.06);
            padding-top: 24px;
            margin-top: 32px;
        }
        .footer-text {
            font-size: 13px;
            color: #999;
            text-align: center;
            line-height: 1.6;
            margin-bottom: 16px;
        }
        .footer-links {
            text-align: center;
            font-size: 12px;
        }
        .footer-links a {
            color: #3d2e8f;
            text-decoration: none;
            margin: 0 8px;
            transition: color 0.2s;
        }
        .footer-links a:hover {
            color: #00D418;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -1px;
        }
        @media (max-width: 600px) {
            .container {
                border-radius: 12px;
            }
            .header {
                padding: 32px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content {
                padding: 24px;
            }
            .button {
                padding: 12px 32px;
                font-size: 14px;
            }
            .code-box {
                font-size: 20px;
                letter-spacing: 2px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1>🔐 Restablecer Contraseña</h1>
                <p>Solicitud de seguridad</p>
            </div>
        </div>

        <div class="content">
            <div class="security-alert">
                <strong>Solicitud de cambio de contraseña</strong>
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en ClearGrade.
            </div>

            <div class="content-section">
                <p class="greeting">Hola,</p>
                <p class="message">
                    Si realizaste esta solicitud, sigue los pasos a continuación para crear una nueva contraseña. Si no fuiste tú, ignora este email.
                </p>
            </div>

            <div class="button-wrapper">
                <a href="{{ reset_password_link }}" class="button">Restablecer Contraseña</a>
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
                <ul style="margin-top: 8px; padding-left: 16px;">
                    <li style="font-size: 13px; margin-bottom: 4px;">Usa una contraseña fuerte con mayúsculas, números y símbolos</li>
                    <li style="font-size: 13px;">Nunca compartas tu contraseña con nadie</li>
                </ul>
            </div>

            <div class="footer-section">
                <p class="footer-text">
                    Este es un email de seguridad automático. Por favor no respondas a este correo.
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
            font-family: 'Google Sans', 'Google Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #f8f9fa 0%, #f3f5f7 100%);
            color: #1a1a1a;
            line-height: 1.6;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .header {
            background: linear-gradient(135deg, #3d2e8f 0%, #2d1b6f 100%);
            padding: 48px 32px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(0, 212, 24, 0.15) 0%, transparent 70%);
            border-radius: 50%;
        }
        .header-content {
            position: relative;
            z-index: 1;
        }
        .header h1 {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .header p {
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
            font-weight: 500;
        }
        .content {
            padding: 40px;
        }
        .message {
            font-size: 14px;
            color: #666666;
            margin-bottom: 24px;
            line-height: 1.8;
        }
        .button-wrapper {
            text-align: center;
            margin: 32px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #00D418 0%, #00a312 100%);
            color: white !important;
            padding: 14px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
            box-shadow: 0 4px 16px rgba(0, 212, 24, 0.3);
            border: none;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 212, 24, 0.4);
        }
        .email-info {
            background: linear-gradient(135deg, rgba(61, 46, 143, 0.03) 0%, rgba(0, 212, 24, 0.03) 100%);
            border-left: 4px solid #00D418;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
        }
        .email-info strong {
            color: #3d2e8f;
            display: block;
            margin-bottom: 6px;
        }
        .footer-section {
            border-top: 1px solid rgba(0, 0, 0, 0.06);
            padding-top: 24px;
            margin-top: 32px;
            text-align: center;
        }
        .footer-text {
            font-size: 13px;
            color: #999;
            line-height: 1.6;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -1px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1>Confirmar Nuevo Email</h1>
                <p>Se detectó un cambio en tu cuenta</p>
            </div>
        </div>

        <div class="content">
            <p class="message">
                Recibimos una solicitud para cambiar el email asociado a tu cuenta de ClearGrade.
            </p>

            <div class="button-wrapper">
                <a href="{{ confirm_email_link }}" class="button">Confirmar Nuevo Email</a>
            </div>

            <div class="email-info">
                <strong>Nuevo email:</strong>
                {{ new_email }}
            </div>

            <p class="message">
                Si no realizaste este cambio, por favor <a href="{{ support_link }}" style="color: #3d2e8f; text-decoration: underline;">contacta a soporte</a> inmediatamente.
            </p>

            <div class="footer-section">
                <p class="footer-text">
                    Este es un email de seguridad automático. Por favor no respondas a este correo.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,

  inviteUser: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Te han invitado a ClearGrade!</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Google Sans', 'Google Sans Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #f8f9fa 0%, #f3f5f7 100%);
            color: #1a1a1a;
            line-height: 1.6;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .header {
            background: linear-gradient(135deg, #3d2e8f 0%, #2d1b6f 100%);
            padding: 48px 32px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(0, 212, 24, 0.15) 0%, transparent 70%);
            border-radius: 50%;
        }
        .header-content {
            position: relative;
            z-index: 1;
        }
        .header h1 {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .header p {
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
            font-weight: 500;
        }
        .content {
            padding: 40px;
        }
        .message {
            font-size: 14px;
            color: #666666;
            margin-bottom: 24px;
            line-height: 1.8;
        }
        .button-wrapper {
            text-align: center;
            margin: 32px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #00D418 0%, #00a312 100%);
            color: white !important;
            padding: 14px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
            box-shadow: 0 4px 16px rgba(0, 212, 24, 0.3);
            border: none;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 212, 24, 0.4);
        }
        .features {
            background: linear-gradient(135deg, rgba(61, 46, 143, 0.03) 0%, rgba(0, 212, 24, 0.03) 100%);
            border-left: 4px solid #00D418;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .features ul {
            list-style: none;
            padding: 0;
        }
        .features li {
            font-size: 14px;
            color: #333;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .features li:last-child {
            margin-bottom: 0;
        }
        .checkmark {
            color: #00D418;
            font-weight: bold;
            font-size: 16px;
        }
        .footer-section {
            border-top: 1px solid rgba(0, 0, 0, 0.06);
            padding-top: 24px;
            margin-top: 32px;
        }
        .footer-text {
            font-size: 13px;
            color: #999;
            text-align: center;
            line-height: 1.6;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -1px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1>🎉 ¡Bienvenido a ClearGrade!</h1>
                <p>Te han invitado a unirte</p>
            </div>
        </div>

        <div class="content">
            <p class="message">
                {{ inviter_name }} te ha invitado a unirte a ClearGrade, la plataforma más inteligente para gestionar tu agenda escolar.
            </p>

            <div class="button-wrapper">
                <a href="{{ invite_link }}" class="button">Aceptar Invitación</a>
            </div>

            <div class="features">
                <ul>
                    <li><span class="checkmark">✓</span> Organiza todas tus tareas en un solo lugar</li>
                    <li><span class="checkmark">✓</span> Recibe recordatorios inteligentes</li>
                    <li><span class="checkmark">✓</span> Colabora con otros estudiantes</li>
                    <li><span class="checkmark">✓</span> Personaliza tu experiencia</li>
                </ul>
            </div>

            <p class="message">
                ¡Este email es tuyo! Solo tú puedes aceptar esta invitación haciendo clic en el botón de arriba.
            </p>

            <div class="footer-section">
                <p class="footer-text">
                    Este es un email de invitación automático. Por favor no respondas a este correo.
                </p>
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #f5f7f6 0%, #f0f9f7 100%);
            color: #1a1a1a;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 212, 24, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #00D418 0%, #00B812 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
        }
        .content {
            padding: 40px;
        }
        .greeting {
            font-size: 16px;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .greeting strong {
            color: #00D418;
        }
        .message {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .button-wrapper {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #00D418 0%, #00B812 100%);
            color: white !important;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(0, 212, 24, 0.3);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 212, 24, 0.4);
        }
        .code-box {
            background: #f5f7f6;
            border-left: 4px solid #00D418;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: 'Monaco', 'Courier New', monospace;
            text-align: center;
        }
        .code-box .label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .code-box .code {
            font-size: 20px;
            font-weight: 700;
            color: #00D418;
            letter-spacing: 2px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 12px;
            font-size: 13px;
            color: #856404;
            margin: 20px 0;
        }
        .footer {
            padding: 30px 40px;
            background: #f9faf8;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 13px;
            color: #999;
        }
        .footer a {
            color: #00D418;
            text-decoration: none;
            font-weight: 600;
        }
        .divider {
            height: 1px;
            background: #eee;
            margin: 20px 0;
        }
        .features {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 30px 0;
        }
        .feature {
            text-align: center;
            padding: 16px;
            background: #f9faf8;
            border-radius: 8px;
        }
        .feature-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }
        .feature-title {
            font-weight: 600;
            font-size: 13px;
            color: #1a1a1a;
            margin-bottom: 4px;
        }
        .feature-desc {
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎓 ClearGrade</h1>
            <p>Tu gestor de tareas inteligente</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                ¡Hola, <strong>{{ user_email }}</strong>!
            </div>

            <div class="message">
                Bienvenido a <strong>ClearGrade</strong>. Estamos emocionados de tenerte en nuestro equipo. 
                Para completar tu registro y acceder a todas las funciones, confirma tu dirección de correo haciendo clic en el botón de abajo.
            </div>

            <div class="button-wrapper">
                <a href="{{ confirm_email_link }}" class="button">Confirmar email</a>
            </div>

            <div class="code-box">
                <div class="label">O usa este código</div>
                <div class="code">{{ token }}</div>
            </div>

            <div class="features">
                <div class="feature">
                    <div class="feature-icon">📋</div>
                    <div class="feature-title">Gestiona tareas</div>
                    <div class="feature-desc">Organiza todas tus asignaciones</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📅</div>
                    <div class="feature-title">Calendario inteligente</div>
                    <div class="feature-desc">Ve todo de un vistazo</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎨</div>
                    <div class="feature-title">Personalización</div>
                    <div class="feature-desc">Elige tu estilo</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">⚡</div>
                    <div class="feature-title">Instant sync</div>
                    <div class="feature-desc">Todo sincronizado</div>
                </div>
            </div>

            <div class="warning">
                ⏰ Este enlace expira en 24 horas. Si no solicitaste este correo, puedes ignorarlo.
            </div>

            <div class="message" style="font-size: 12px; color: #999;">
                Si el botón anterior no funciona, copia y pega este enlace en tu navegador:
                <br><code style="color: #00D418; word-break: break-all;">{{ confirm_email_link }}</code>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div style="margin-bottom: 12px;">
                <strong style="color: #1a1a1a;">ClearGrade</strong> • Tu gestor de tareas inteligente
            </div>
            <div>
                © 2026 ClearGrade. Todos los derechos reservados.
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
    <title>Recupera tu contraseña en ClearGrade</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #f5f7f6 0%, #f0f9f7 100%);
            color: #1a1a1a;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 212, 24, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #00D418 0%, #00B812 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
        }
        .content {
            padding: 40px;
        }
        .greeting {
            font-size: 16px;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .greeting strong {
            color: #00D418;
        }
        .message {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .alert {
            background: #ffe5e5;
            border: 1px solid #ffcccc;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            color: #cc0000;
            font-size: 13px;
        }
        .alert strong {
            display: block;
            margin-bottom: 4px;
        }
        .button-wrapper {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #00D418 0%, #00B812 100%);
            color: white !important;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(0, 212, 24, 0.3);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 212, 24, 0.4);
        }
        .steps {
            background: #f9faf8;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .step {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
        }
        .step:last-child {
            margin-bottom: 0;
        }
        .step-number {
            background: #00D418;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-weight: 700;
            font-size: 12px;
        }
        .step-content {
            flex: 1;
        }
        .step-title {
            font-weight: 600;
            font-size: 13px;
            color: #1a1a1a;
            margin-bottom: 2px;
        }
        .step-desc {
            font-size: 12px;
            color: #999;
        }
        .code-box {
            background: #f5f7f6;
            border-left: 4px solid #00D418;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: 'Monaco', 'Courier New', monospace;
            text-align: center;
        }
        .code-box .label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .code-box .code {
            font-size: 20px;
            font-weight: 700;
            color: #00D418;
            letter-spacing: 2px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 12px;
            font-size: 13px;
            color: #856404;
            margin: 20px 0;
        }
        .footer {
            padding: 30px 40px;
            background: #f9faf8;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 13px;
            color: #999;
        }
        .footer a {
            color: #00D418;
            text-decoration: none;
            font-weight: 600;
        }
        .divider {
            height: 1px;
            background: #eee;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🔐 Recupera tu acceso</h1>
            <p>Restablece tu contraseña de ClearGrade</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                ¡Hola, <strong>{{ user_email }}</strong>!
            </div>

            <div class="alert">
                <strong>⚠️ Solicitud de cambio de contraseña</strong>
                Hemos recibido una solicitud para cambiar la contraseña de tu cuenta.
            </div>

            <div class="message">
                Si solicitaste cambiar tu contraseña, haz clic en el botón de abajo para establecer una nueva. 
                Si no fuiste tú, ignora este correo; tu cuenta permanecerá segura.
            </div>

            <div class="button-wrapper">
                <a href="{{ reset_password_link }}" class="button">Cambiar contraseña</a>
            </div>

            <div class="code-box">
                <div class="label">O usa este código</div>
                <div class="code">{{ token }}</div>
            </div>

            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <div class="step-title">Haz clic en el botón arriba</div>
                        <div class="step-desc">O copia el código de recuperación</div>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <div class="step-title">Ingresa tu nueva contraseña</div>
                        <div class="step-desc">Elige algo seguro y único</div>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <div class="step-title">¡Listo! Accede con tu nueva contraseña</div>
                        <div class="step-desc">Tu cuenta estará completamente restaurada</div>
                    </div>
                </div>
            </div>

            <div class="warning">
                ⏰ Este enlace expira en 1 hora. Si esperas más tiempo, deberás solicitar otro.
            </div>

            <div class="divider"></div>

            <div class="message" style="font-size: 12px; color: #999;">
                Si el botón anterior no funciona, copia y pega este enlace en tu navegador:
                <br><code style="color: #00D418; word-break: break-all;">{{ reset_password_link }}</code>
            </div>

            <div class="warning" style="background: #e8f5e9; border-color: #4caf50; color: #2e7d32; margin-top: 20px;">
                💡 Consejo: Usa una contraseña fuerte con mayúsculas, minúsculas, números y símbolos especiales.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div style="margin-bottom: 12px;">
                <strong style="color: #1a1a1a;">ClearGrade</strong> • Tu gestor de tareas inteligente
            </div>
            <div style="margin-bottom: 12px;">
                Si no reconoces esta solicitud, <a href="{{ support_link }}">contacta a soporte</a>
            </div>
            <div>
                © 2026 ClearGrade. Todos los derechos reservados.
            </div>
        </div>
    </div>
</body>
</html>`,

  inviteUser: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Te han invitado a ClearGrade</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #f5f7f6 0%, #f0f9f7 100%);
            color: #1a1a1a;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 212, 24, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #00D418 0%, #00B812 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
        }
        .content {
            padding: 40px;
        }
        .greeting {
            font-size: 16px;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        .greeting strong {
            color: #00D418;
        }
        .message {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .button-wrapper {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #00D418 0%, #00B812 100%);
            color: white !important;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(0, 212, 24, 0.3);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 212, 24, 0.4);
        }
        .footer {
            padding: 30px 40px;
            background: #f9faf8;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 13px;
            color: #999;
        }
        .footer a {
            color: #00D418;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Únete a ClearGrade</h1>
            <p>Has sido invitado</p>
        </div>

        <div class="content">
            <div class="greeting">
                ¡Hola!
            </div>

            <div class="message">
                <strong>{{ invited_by }}</strong> te ha invitado a unirte a <strong>ClearGrade</strong>, 
                la plataforma inteligente para gestionar tus tareas escolares. 
            </div>

            <div class="message">
                Con ClearGrade podrás:
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>📋 Organizar todas tus tareas en un solo lugar</li>
                    <li>📅 Ver tu calendario escolar completo</li>
                    <li>🎨 Personalizar tu experiencia</li>
                    <li>⚡ Sincronizar automáticamente todos tus dispositivos</li>
                </ul>
            </div>

            <div class="button-wrapper">
                <a href="{{ invite_link }}" class="button">Aceptar invitación</a>
            </div>

            <div class="message" style="font-size: 12px; color: #999;">
                O copia este código: <code style="color: #00D418;">{{ token }}</code>
            </div>
        </div>

        <div class="footer">
            <div style="margin-bottom: 12px;">
                <strong style="color: #1a1a1a;">ClearGrade</strong> • Tu gestor de tareas inteligente
            </div>
            <div>
                © 2026 ClearGrade. Todos los derechos reservados.
            </div>
        </div>
    </div>
</body>
</html>`
}

// Función helper para renderizar templates
export function renderEmailTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let rendered = template
  Object.entries(variables).forEach(([key, value]) => {
    rendered = rendered.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value)
  })
  return rendered
}

// Ejemplos de uso:
// const html = renderEmailTemplate(EMAIL_TEMPLATES.confirmEmail, {
//   user_email: 'usuario@ejemplo.com',
//   confirm_email_link: 'https://tuapp.com/auth/confirm?token=xyz',
//   token: 'ABC123XYZ'
// })
