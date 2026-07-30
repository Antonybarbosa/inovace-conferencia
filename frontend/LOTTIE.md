# Animações Lottie — Guia de Implementação

## Biblioteca

Usamos `@lottiefiles/dotlottie-react` para renderizar animações Lottie no React.

**Instalação:**
```bash
npm install @lottiefiles/dotlottie-react --legacy-peer-deps
```

---

## Uso básico

```tsx
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

<DotLottieReact
  src="https://lottie.host/SEU_ID/ARQUIVO.lottie"
  autoplay
  loop
  style={{ width: '200px', height: '200px' }}
/>
```

---

## Props disponíveis

| Prop | Tipo | Descrição |
|---|---|---|
| `src` | string | URL do arquivo .lottie (hospedado no lottie.host ou local) |
| `autoplay` | boolean | Inicia automaticamente |
| `loop` | boolean | Repete a animação |
| `speed` | number | Velocidade (1 = normal, 2 = dobro) |
| `style` | CSSProperties | Estilos inline (width, height) |
| `onComplete` | () => void | Callback ao finalizar (se loop=false) |

---

## Animações usadas no projeto

| Local | URL | Descrição |
|---|---|---|
| Login (painel escuro) | `https://lottie.host/9ea946f2-11b8-4c08-8a5c-ef92d7583abe/GDn1GXbgRO.lottie` | Animação de logística/entrega |

---

## Onde encontrar animações

- **LottieFiles:** https://lottiefiles.com (maior biblioteca gratuita)
- **Lottie Host:** https://lottie.host (hospedagem gratuita de .lottie)
- Buscar por: logistics, delivery, barcode, scanner, package, warehouse

---

## Exemplos de uso futuro

### Loading global (substituir spinner)
```tsx
<DotLottieReact
  src="https://lottie.host/LOADING_ANIMATION.lottie"
  autoplay
  loop
  style={{ width: '120px', height: '120px' }}
/>
```

### Sucesso ao conferir item
```tsx
<DotLottieReact
  src="https://lottie.host/CHECK_ANIMATION.lottie"
  autoplay
  loop={false}
  style={{ width: '60px', height: '60px' }}
/>
```

### Erro / alerta
```tsx
<DotLottieReact
  src="https://lottie.host/ERROR_ANIMATION.lottie"
  autoplay
  loop={false}
  style={{ width: '80px', height: '80px' }}
/>
```

### Scanner ativo (esperando bipagem)
```tsx
<DotLottieReact
  src="https://lottie.host/SCANNER_ANIMATION.lottie"
  autoplay
  loop
  style={{ width: '40px', height: '40px' }}
/>
```

---

## Arquivo local (offline/Capacitor)

Para usar offline (app mobile), baixe o `.lottie` e coloque em `public/`:

```tsx
<DotLottieReact
  src="/animations/loading.lottie"
  autoplay
  loop
/>
```

---

## Notas

- Arquivos `.lottie` são leves (5-50KB geralmente)
- Preferir `.lottie` sobre `.json` (mais compacto)
- Para performance mobile, manter animações abaixo de 100KB
- O componente renderiza via Canvas (melhor performance que SVG animado)
