# ARQUITECTURA DEL PROYECTO: PAPAS FRITAS EL AMERICANO
## Documento de Fundamentación Técnica y de Diseño

---

## 1. VISIÓN GENERAL DEL PROYECTO

### 1.1 Propósito
Sistema de carta digital con flujo de pedido hacia WhatsApp, diseñado para operaciones de **food truck** en ferias y eventos.

### 1.2 Modelo de Negocio
- **Core Business**: Papas fritas artesanales (producto diferenciador)
- **Complementos**: Bebidas embotelladas (Coca-Cola Company + CCU)
- **Canal de Venta**: Presencial en eventos con pedido digital

---

## 2. ESTRUCTURA DE PRODUCTOS (DEFINITIVA)

```
EL AMERICANO
├── PAPAS SUPREMAS (Producto Estrella - Mayor Margen)
│   ├── Pincho Americano      $5.000
│   ├── Veggie Supremas       $5.000
│   └── Churrasco Supremas    $7.000
│
├── CLÁSICOS (Entrada al Menú - Alto Volumen)
│   ├── Salchipapas           $4.000
│   └── Papas Fritas          $3.000
│
└── BEBIDAS (Complemento - Compra Impulsiva)
    ├── Bebida Lata 350cc     $1.500  [Coca-Cola, Fanta, Sprite]
    └── Agua Cachantún        $1.500  [Con gas / Sin gas - Botella plástico]
```

### 2.1 Fundamentación de la Estructura

| Categoría | Función Estratégica | Margen | Velocidad de Rotación |
|-----------|---------------------|--------|----------------------|
| Supremas | Diferenciación / Identidad | Alto | Medio |
| Clásicos | Volumen / Accesibilidad | Medio | Alto |
| Bebidas | Ticket Promedio | Bajo | Muy Alto |

**Principio aplicado**: *Menu Engineering* - Clasificación BCG adaptada a food service:
- **Estrellas**: Supremas (alta rentabilidad, demanda creciente)
- **Vacas lecheras**: Clásicos (demanda estable, margen moderado)
- **Complementos**: Bebidas (impulsan ticket pero no definen la marca)

---

## 3. IDENTIDAD DE MARCA

### 3.1 Paleta de Colores

```css
/* Colores Primarios - Inspiración Americana */
--color-brand-red:    #D32F2F;  /* Deep Red - Acción, Apetito */
--color-brand-blue:   #002868;  /* Royal Blue - Confianza, Tradición */
--color-brand-yellow: #FFCA28;  /* Warm Yellow - Energía, Calidez */
```

**Fundamentación Cromática (Psicología del Color en Food Industry)**:
- **Rojo**: Estimula el apetito, crea urgencia de compra
- **Azul**: Genera confianza, evoca "americano" clásico
- **Amarillo**: Asociado a papas fritas, calidez, optimismo

### 3.2 Tipografía

| Uso | Fuente | Peso | Justificación |
|-----|--------|------|---------------|
| Títulos/Marca | Space Grotesk | 700-800 | Moderno, legible a distancia |
| Cuerpo | Outfit | 400-600 | Alta legibilidad, amigable |

---

## 4. ARQUITECTURA TÉCNICA

### 4.1 Stack Tecnológico

```
Frontend
├── HTML5 Semántico
├── CSS3 (Variables + Media Queries)
└── JavaScript Vanilla (ES6+)

Backend (Serverless)
└── WhatsApp Business API (vía wa.me deep link)

Almacenamiento
└── sessionStorage (carrito temporal)
```

**Justificación de decisiones**:

| Decisión | Alternativa Rechazada | Razón |
|----------|----------------------|-------|
| HTML/CSS/JS puro | React, Vue | Simplicidad, carga instantánea, sin dependencias |
| sessionStorage | localStorage | Carrito temporal por sesión (no persistir pedidos abandonados) |
| WhatsApp Deep Link | Backend propio | Cero costo de infraestructura, confirmación humana |

### 4.2 Estructura de Archivos

```
deploy/
├── index.html              # Aplicación principal (Single Page)
├── cart.js                 # Lógica del carrito y checkout
├── menu_qr.html            # 📱 Carta digital para QR (móvil, con precios)
├── menu_print_noprices.html# 🖨️ Menú imprimible (sin precios, rellenable)
├── menu_digital_v2.png     # Asset exportado para redes
├── og_preview.png          # Preview para redes sociales
└── images/
    ├── logo.png
    ├── pincho_americano.png
    ├── veggie_supremas.png
    ├── churrasco_supremas.png
    ├── salchipapas.png
    ├── papas_fritas.png
    ├── bebidas_latas.png
    └── agua_mineral.png     # Agua premium (azul=con gas, roja=sin gas)
```

---

## 5. FLUJO DE USUARIO (UX)

### 5.1 Customer Journey

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  DESCUBRE   │────▶│  EXPLORA    │────▶│  SELECCIONA │────▶│  CONFIRMA   │
│  (Landing)  │     │  (Menú)     │     │  (Carrito)  │     │  (WhatsApp) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
   Hero +              Scroll              FAB +              Formulario
   Navbar              Suave               Modal              + Envío
```

### 5.2 Principios de UX Aplicados

1. **Ley de Fitts**: FAB grande y en zona de fácil alcance (esquina inferior derecha)
2. **Ley de Hick**: Menú reducido (7 productos) para decisión rápida
3. **Efecto de Posición Serial**: Supremas primero (recuerdo inicial)
4. **Principio de Cierre**: Steps 1-2-3 dan sensación de progreso

---

## 6. RESPONSIVE DESIGN

### 6.1 Breakpoints

| Breakpoint | Dispositivo | Cambios Clave |
|------------|-------------|---------------|
| > 768px | Desktop/Tablet Landscape | Navbar completa, Hero visible |
| ≤ 768px | Mobile/Tablet Portrait | Hamburger menu, Hero oculto, FAB compacto |

### 6.2 Mobile-First Rationale

El 85%+ del tráfico en ferias proviene de móviles. El diseño prioriza:
- Scroll vertical natural
- Botones de tamaño táctil (44x44px mínimo)
- Carga de imágenes optimizada

---

## 7. SEGURIDAD

### 7.1 Medidas Implementadas

| Vector | Mitigación |
|--------|------------|
| XSS | `escapeHtml()` en todos los inputs |
| Injection | Validación regex en nombre/teléfono/dirección |
| Spam | Rate limiting (3s entre envíos) |
| CSP | Content-Security-Policy header |

---

## 8. MÉTRICAS DE ÉXITO

| KPI | Meta | Cómo Medir |
|-----|------|------------|
| Tiempo de Carga | < 2s | Lighthouse |
| Tasa de Conversión | > 15% | Pedidos / Visitas |
| Ticket Promedio | > $6.000 | Total / Pedidos |
| Abandono de Carrito | < 30% | Analytics |

---

## 9. PRÓXIMOS PASOS

1. **Definir proveedor de Agua Mineral** (marca para imagen)
2. **Sesión fotográfica real** (reemplazar imágenes generadas)
3. **Configurar Google Analytics** (tracking de eventos)
4. **Prueba en evento real** (validar flujo completo)

---

*Documento generado: 2026-01-04*
*Versión: 2.0 (Post-refinamiento)*
