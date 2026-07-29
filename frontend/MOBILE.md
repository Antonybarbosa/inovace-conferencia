# Configuração Mobile — Capacitor (Android)

O app mobile é gerado pelo Capacitor, que empacota o frontend web como um app Android nativo.

---

## Pré-requisitos

1. **Android Studio** instalado (https://developer.android.com/studio)
2. **Java JDK 17+**
3. **Node.js 18+**

---

## Setup Inicial (primeira vez)

```bash
cd frontend

# 1. Instalar dependências (incluindo Capacitor)
npm install

# 2. Inicializar Capacitor (já configurado no capacitor.config.ts)
npx cap init ConferCheck com.sankhya.confercheck --web-dir dist

# 3. Adicionar plataforma Android
npx cap add android

# 4. Build do frontend e sincronizar com Android
npm run mobile:build
```

---

## Desenvolvimento dia-a-dia

```bash
# Build e sync
npm run mobile:build

# Abrir no Android Studio
npx cap open android
```

No Android Studio: Run → Run 'app' (ou conecte um celular via USB com debug USB ativo).

---

## Live Reload (desenvolvimento rápido)

Para testar em tempo real no celular enquanto desenvolve:

1. Descomentar o `server.url` no `capacitor.config.ts` com o IP da sua máquina:
```ts
server: {
  url: 'http://SEU_IP:5173',
  cleartext: true,
}
```

2. Rodar o Vite em modo dev:
```bash
npm run dev -- --host
```

3. Sync e rodar:
```bash
npx cap sync
npx cap open android
```

---

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Frontend dev server (web) |
| `npm run build` | Build de produção |
| `npm run mobile:build` | Build + sync com Android |
| `npm run cap:sync` | Sincronizar dist/ com o projeto Android |
| `npm run cap:open:android` | Abrir Android Studio |

---

## Estrutura gerada

```
frontend/
├── android/              ← Projeto Android (gerado pelo Capacitor)
├── dist/                 ← Build web (fonte do app)
├── capacitor.config.ts   ← Config do Capacitor
└── ...
```

---

## Gerar APK

No Android Studio:
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. APK fica em: `android/app/build/outputs/apk/debug/app-debug.apk`

Para release:
1. Build → Generate Signed Bundle / APK
2. Seguir wizard de assinatura

---

## Plugins úteis (instalar conforme necessidade)

```bash
# Leitor de código de barras (câmera)
npm install @capacitor-mlkit/barcode-scanning

# Vibração (feedback ao conferir)
npm install @capacitor/haptics

# Status bar (personalizar cores)
npm install @capacitor/status-bar

# Splash screen
npm install @capacitor/splash-screen
```

---

## Notas

- O `webDir: 'dist'` no capacitor.config aponta para o build do Vite
- Em produção, configurar a URL da API no código (não usa proxy do Vite)
- Para produção mobile, setar a baseURL do axios para o IP/domínio do backend
