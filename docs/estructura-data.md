# Estructura Data & Contenido 

## Definiciones Básicas
- **Trazabilidad**:  `id`, `sku` y `slug` únicos.
- **Formatos** 
   - JSON parseable, 
   slugs kebab-case, moneda  **CLP**, fechas ISO 8601 (UTC).



## Entidades principales

#### PRODUCTS
- ❗ `id: string (uuid v4)`
- ❗ `sku: string` — formato `PREFIX-CAT3-SUB3-RAND4-YY`
- ❗ `name: string`
- ❗ `slug: string` (`kebab-case`, único)
- ❗ `category: string` (slug nivel 1)
- ❕ `description: string (2–5 frases)`
- ❗ `price: number` (CLP, entero)
- ❗ `currency: 'CLP'`
- ❗ `images: ProductImage[]` (≥ 3 recomendado)
- ❗ `stock: number`
- ❗ `createdAt: string` (ISO-8601)



▫️❕❔
-----------

## 0) Principios

- **Coherencia visual**: estética nórdico cálido (madera clara, luz cálida, tonos neutros).
- **Datos estrictos**: JSON parseable, slugs kebab-case, monedas en **CLP**, fechas ISO 8601 (UTC).
- **Trazabilidad**: cada producto tiene `id (uuid)`, `sku` único, `slug` único.
- **Escalabilidad**: categorías y colecciones desacopladas (N:N por `product.collections` y `product.tags`).

---

## 1) Entidades principales

### 1.1 Product
Campos obligatorios:
- `id: string (uuid v4)`
- `sku: string` — formato `PREFIX-CAT3-SUB3-RAND4-YY`
- `name: string`
- `slug: string` (`kebab-case`, único)
- `category: string` (slug nivel 1)
- `price: number` (CLP, entero)
- `currency: 'CLP'`
- `images: ProductImage[]` (≥ 3 recomendado)
- `stock: number`
- `createdAt: string` (ISO-8601)

Campos recomendados:
- `shortDescription: string (≤ 140 chars)`
- `description: string (2–5 frases)`
- `collections?: string[]`
- `badges?: string[]` (`'nuevo'|'eco'|'best-seller'|'envío gratis'|'fabricación local'|'madera certificada'|'edición limitada'|'últimas unidades'`)
- `compareAtPrice?: number | null` (> `price` cuando hay oferta)
- `dimensions: { width_cm:number; depth_cm:number; height_cm:number }`
- `materials: string[]` (p.ej., `["roble","lino","acero"]`)
- `colors: string[]` (p.ej., `["roble natural","beige"]`)
- `variants?: Variant[]` (por `color|material|tamaño`)
- `tags?: string[]` (SEO/colección suave)
- `seo?: { title:string; description:string }`

**ProductImage**
- `url: string` (preferir Unsplash/licencia libre)
- `alt: string`
- `view: 'front'|'angle'|'detail'|'in-situ'`

**Variant**
- `option: 'color'|'material'|'tamaño'`
- `value: string`
- `sku: string` (misma regla de SKU)
- `image?: ProductImage` (ideal: una por variante)

### 1.2 Category Tree
- `name: string`
- `slug: string`
- `children?: { name:string; slug:string }[]`
- `image?: { url:string; alt:string }` (representación visual de categoría)

**Taxonomía por defecto**
- `muebles`: `sofas`, `seccionales`, `butacas`, `sillas`, `mesas-centro`, `mesas-comedor`, `mesas-laterales`, `veladores`, `racks-tv`, `estanterias`, `aparadores`, `escritorios`, `banquetas`, `camas`
- `iluminacion`: `lamparas-pie`, `lamparas-mesa`, `colgantes`
- `textiles`: `alfombras`, `cojines`, `mantas`
- `decoracion`: `espejos`, `jarrones`, `velas`, `cuadros`, `plantas-artificiales`

### 1.3 Collection
- `name: string`
- `slug: string`
- `description?: string`
- `heroImage?: { url:string; alt:string }`

**Colecciones sugeridas**
- `living-nordico`, `madera-clara`, `rattan-fibras`, `escritorios-compactos`, `pequenos-espacios`, `luz-calida`, `textiles-organicos`, `metal-negro-mate`

### 1.4 Tag
- `string` plano. Ej.: `nordico`, `madera-certificada`, `hecho-a-mano`.

---

## 2) Convenciones

- **Slugs**: minúsculas, sin acentos, `kebab-case`.  
  `"Mesa de Centro Lino"` → `mesa-de-centro-lino`
- **Moneda**: números enteros CLP (sin separadores ni decimales); formatear en UI.
- **Fechas**: ISO 8601 UTC (`new Date().toISOString()`).
- **Imágenes**:
  - Priorizar luz **cálida**, tonos neutros; evitar saturación chillona/HDR.
  - Galerías con 3–6 fotos: al menos 1 `detail` + 1 `in-situ`.
  - Variantes: **imagen distinta por valor** (no recolor).
- **Descuentos**: `compareAtPrice` > `price`; aplicar badge “oferta” si lo usan.
- **Stock**: 0 oculta botón comprar; mostrar “sin stock”.
- **Accesibilidad**: `alt` descriptivo (“Detalle pata de roble en mesa ovalada”).

---

## 3) Bases de datos (opciones)

### 3.1 Esquema minimal (SQL-ish)
**products**
- `id` PK, `sku` UNIQUE, `slug` UNIQUE
- `name`, `short_description`, `description`
- `category`
- `price` INT, `compare_at_price` INT NULL, `currency` CHAR(3)
- `dimensions_json` JSON, `materials_json` JSON, `colors_json` JSON
- `images_json` JSON, `variants_json` JSON
- `collections_json` JSON, `badges_json` JSON, `tags_json` JSON
- `stock` INT, `seo_json` JSON, `created_at` TIMESTAMP

**categories**
- `slug` PK, `name`, `parent_slug` FK NULL

**collections**
- `slug` PK, `name`, `description`, `hero_image_json` JSON

> Alternativa: Firestore/Document DB usando exactamente los objetos de la sección 1.

---

## 4) Validaciones (build-time o runtime)

- `slug`, `sku` únicos.
- `price >= 0`, `compareAtPrice == null || compareAtPrice > price`.
- `images.length >= 3` (recomendado).
- Si hay `variants`, cada `variant.sku` único.
- `category` existe en taxonomía.

---

## 5) SKU

**Formato**: `PREFIX-CAT3-SUB3-RAND4-YY`  
Ej.: `MUE-MUE-SOF-AB3K-25`

**Reglas**:
- `PREFIX`: configurable por proyecto (p.ej., `MUE`).
- `CAT3/SUB3`: primeras 3 letras del slug (ASCII, sin acentos).
- `RAND4`: alfanumérico mayúscula.
- `YY`: año 2 dígitos (creación).

---

## 6) Directrices de imágenes (Unsplash u otras libres)

**Estética target**: “scandinavian / warm light / natural wood / neutral tones / matte black accents”.

**Términos base (productos):**
- `linen sofa warm natural light`
- `oak coffee table warm light minimal`
- `tv console natural wood matte black`
- `rattan chair neutral tones`

**Ángulos / sets (múltiples fotos):**
- Añade: `detail shot`, `angle`, `close-up`, `in situ`, `series`, `set`.

**Variantes (mismo objeto en material/color distinto)**:
- Madera: `oak`, `walnut`, `ash`, `black stain`
- Textil: `linen beige`, `linen light gray`
- Metal: `matte black`, `brushed steel`

**Secciones del sitio (fondos)**:
- `hero`: `scandinavian living room warm light negative space`
- `login/register bg`: `minimal interior warm soft light texture`
- `contacto`: `workspace natural wood soft shadows`

**Sufijos útiles**:
- `?orientation=landscape`
- `&color=warm` o `&color=black_and_white`

---

## 7) Seeds & Fixtures

### 7.1 Ejemplo de producto (recortado)
```json
{
  "id":"uuid",
  "sku":"MUE-MUE-SOF-AB3K-25",
  "name":"Sofá Lino Alba",
  "slug":"sofa-lino-alba",
  "shortDescription":"Sofá de 3 cuerpos tapizado en lino con patas de roble.",
  "description":"De inspiración nórdica, combina lino texturizado y roble natural.",
  "category":"muebles",
  "collections":["living-nordico","madera-clara"],
  "badges":["fabricación local"],
  "price":649990,
  "compareAtPrice":699990,
  "currency":"CLP",
  "dimensions":{"width_cm":210,"depth_cm":90,"height_cm":80},
  "materials":["lino","roble"],
  "colors":["beige lino","roble natural"],
  "images":[
    {"url":"(link 1)","alt":"Sofá de lino en luz cálida","view":"in-situ"},
    {"url":"(link 2)","alt":"Detalle pata roble","view":"detail"},
    {"url":"(link 3)","alt":"Vista en ángulo","view":"angle"}
  ],
  "variants":[
    {"option":"color","value":"beige","sku":"MUE-MUE-SOF-9K3P-25"},
    {"option":"color","value":"gris claro","sku":"MUE-MUE-SOF-Z7Q2-25"}
  ],
  "stock":12,
  "tags":["nordico","luz-calida","textil-natural"],
  "seo":{"title":"Sofá Lino Alba | Sitio","description":"Sofá nórdico de lino y roble."},
  "createdAt":"2025-11-05T00:00:00.000Z"
}
