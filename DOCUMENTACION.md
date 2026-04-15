# Sistema de Gestión de Archivos — CNE Ecuador

## Descripción general

Aplicación web monolítica construida con **Next.js 15** para la gestión, revisión y aprobación de archivos institucionales del Consejo Nacional Electoral (CNE) del Ecuador.
El backend utiliza **Firebase** (Authentication + Firestore) y los archivos físicos se almacenan en un repositorio **NAS** de la institución (`\\10.0.16.103\tics\Pruebas`).

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| UI | Tailwind CSS + shadcn/ui (Radix UI) |
| Gráficos | Recharts |
| Impresión PDF | react-to-print |
| Backend | Firebase Admin SDK (Server Components) |
| Auth | Firebase Authentication |
| Base de datos | Firestore (colecciones `users` + subcolección `uploads`) |
| Almacenamiento físico | NAS institucional (`\\10.0.16.103\tics\Pruebas`) |

---

## Comando para ejecutar en local

```bash
npm run dev
```

La aplicación queda disponible en: **http://localhost:9002**

> Requiere Node.js ≥ 18. En el primer arranque, si la base de datos está vacía, la propia pantalla de login ofrece el botón **"Crear Administrador Inicial"**.

---

## Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto con:

```env
# Configuración Firebase Client (pública)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin SDK (privada - solo servidor)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

---

## Roles de usuario

| Rol | Permisos |
|-----|----------|
| `admin` | Gestionar usuarios, revisar/aprobar/rechazar archivos, ver reportes, exportar historial |
| `user` | Subir archivos, ver estado de sus archivos, descargar acta de aprobación |

Solo el administrador puede crear usuarios nuevos. No existe registro público.

---

## Flujo de archivos

```
Usuario sube archivo
        ↓
   PENDIENTE
        ↓
  EN REVISION  (admin abre el archivo)
        ↓
  ┌─────────────────────────────┐
  │  APROBADO  │  RECHAZADO  │  CORRECCIONES  │
  └─────────────────────────────┘
        ↓ (APROBADO)
  Archivo movido en NAS: pendientes/ → validados/
  Acta de aprobación disponible (PDF landscape CNE)
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                        # Login
│   ├── (main)/
│   │   ├── layout.tsx                  # Layout principal + verificación isActive
│   │   ├── dashboard/page.tsx          # Dashboard (admin/usuario)
│   │   ├── files/page.tsx              # Historial del usuario + filtros + acta
│   │   └── admin/
│   │       ├── files/page.tsx          # Revisión de archivos (admin)
│   │       ├── users/page.tsx          # Gestión de usuarios (admin)
│   │       ├── history/page.tsx        # Historial global + exportación
│   │       └── reports/page.tsx        # Reportes y estadísticas
│   ├── api/session/route.ts            # Cookie de sesión (POST/DELETE)
│   └── actions/update-upload-status.ts # Server Action: actualizar estado + mover NAS
├── components/
│   ├── approval-certificate.tsx        # PDF de aprobación CNE (landscape, con firmas)
│   ├── user-certificate-dialog.tsx     # Dialog para que el usuario imprima su acta
│   ├── file-review-dialog.tsx          # Dialog de revisión del admin
│   ├── admin-files-client.tsx          # Tabla de revisión de archivos
│   ├── admin-history-client.tsx        # Historial global + exportación CSV/PDF
│   ├── admin-reports-client.tsx        # Página de reportes con gráficos
│   ├── sidebar-nav.tsx                 # Navegación lateral
│   └── ui/                            # Componentes shadcn/ui
├── firebase/
│   ├── config.ts                       # Configuración Firebase client
│   ├── server.ts                       # Firebase Admin SDK (solo servidor)
│   └── ...
└── lib/
    ├── types.ts                        # Tipos TypeScript globales
    └── status-config.ts               # Configuración visual de estados
```

---

## Módulos principales

### 1. Autenticación y sesión
- Login mediante Firebase Authentication (email/password).
- Al autenticarse, se guarda una cookie `userId` en el servidor (`/api/session` POST).
- El layout principal (`(main)/layout.tsx`) verifica en cada navegación:
  - Que el usuario esté autenticado en Firebase Auth.
  - Que exista su documento en Firestore.
  - Que `isActive === true`. Si está desactivado → cierra sesión y redirige a `/?error=account_disabled`.

### 2. Gestión de usuarios (`/admin/users`)
- CRUD completo de usuarios (crear, editar, activar/desactivar).
- **Borrado lógico**: el campo `isActive` en Firestore pasa a `false`. El usuario no es eliminado.
- Asignación de ubicación física: estantería (ej. `8B`) y caja (ej. `4A`) por usuario.
- Promoción/degradación de rol (user ↔ admin), sincronizado con la colección `roles_admin`.

### 3. Revisión de archivos (`/admin/files`)
- Lista todos los uploads del sistema con filtro por estado (tabs).
- El admin abre el **Dialog de revisión** que muestra:
  - Datos del archivo y usuario.
  - Enlace al archivo físico en el NAS.
  - Campo de observaciones.
  - Vista previa del **Acta de Aprobación CNE** (landscape, con firmas).
- Acciones disponibles: Aprobar · Solicitar Correcciones · Rechazar.
- Al **Aprobar**: el archivo se mueve en el NAS de `pendientes/` a `validados/` y se habilita el botón de impresión del acta.

### 4. Acta de Aprobación (PDF CNE Ecuador)
Componente `ApprovalCertificate` imprimible via `react-to-print`:
- Orientación **A4 horizontal** (`@page { size: A4 landscape; }`).
- **Header**: logo CNE (amarillo/azul) + título institucional + N° acta + fecha.
- **Tabla**: nombre archivo, tipo, uso, fecha subida, fecha aprobación, usuario, departamento, estantería, caja.
- **Pie de página**: dos columnas de firma — Administrador del Sistema / Director del CNE.
- Disponible para el admin en el dialog de revisión y para el usuario en su historial.

### 5. Historial del usuario (`/files`)
- Listado de todos los archivos subidos por el usuario autenticado.
- **Filtros funcionales** por estado (checkboxes).
- Archivos **APROBADO**: botón "Ver Acta" → abre dialog con el PDF de aprobación.
- Archivos **CORRECCIONES / RECHAZADO**: fila expandida con `Alert` rojo mostrando las observaciones del admin.

### 6. Reportes (`/admin/reports`)
Página de analytics con datos en tiempo real de Firestore:

| Sección | Tipo | Datos |
|---------|------|-------|
| KPI Cards | Métricas | Total archivos · Aprobados % · Rechazados % · Tasa de aprobación |
| Fila 1 | `BarChart` | Uploads por mes (últimos 6 meses) |
| Fila 1 | `PieChart` | Distribución por estado con colores semánticos |
| Fila 2 | `BarChart` horizontal | Archivos por departamento |
| Fila 2 | `BarChart` | Archivos por tipo de uso (acta/contrato/memorando/otro) |
| Fila 3 | `ComposedChart` + 2 líneas | Tendencia aprobaciones vs rechazos por mes |
| Fila 3 | `Table` | Top 5 usuarios más activos |

### 7. Historial global y exportación para auditoría (`/admin/history`)
- **Filtro por rango de fechas** (date pickers Desde / Hasta).
- Muestra solo archivos con estado **APROBADO** en el rango seleccionado.
- **Descargar CSV**: genera archivo `.csv` con BOM UTF-8 para compatibilidad con Excel. Columnas: ID, Usuario, Departamento, Nombre Archivo, Tipo, Uso, Fecha Subida, Fecha Aprobación, Estantería, Caja.
- **Imprimir PDF**: genera informe A4 landscape con header CNE institucional.
- Tabla de actividad completa (todos los estados) como referencia.

---

## Estructura de datos en Firestore

### Colección `users`
```
users/{userId}
  ├── id: string
  ├── nombres: string
  ├── apellidos: string
  ├── email: string
  ├── identification: string
  ├── department: string
  ├── rol: 'admin' | 'user'
  ├── isActive: boolean
  ├── avatarUrl?: string
  └── assignedLocations?: Array<{ shelf: string, box: string }>

users/{userId}/uploads/{uploadId}
  ├── id: string
  ├── userId: string
  ├── originalName: string
  ├── fileType: 'pdf' | 'word' | 'excel' | 'zip' | 'otro'
  ├── usage: 'acta' | 'contrato' | 'memorando' | 'otro'
  ├── description?: string
  ├── uploadDate: string (ISO)
  ├── status: 'PENDIENTE' | 'EN REVISION' | 'CORRECCIONES' | 'APROBADO' | 'RECHAZADO'
  ├── observations?: string
  ├── reviewedAt?: string (ISO)
  ├── acceptanceActPath?: string
  ├── shelf: string
  └── box: string
```

### Colección `roles_admin`
```
roles_admin/{userId}
  └── grantedAt: string (ISO)
```
Usada por las reglas de seguridad de Firestore para verificar si un usuario es administrador.

---

## NAS — Estructura de carpetas

```
\\10.0.16.103\tics\Pruebas\
├── pendientes\     ← Archivos subidos por usuarios (en espera de revisión)
└── validados\      ← Archivos aprobados (movidos automáticamente al aprobar)
```

---

## Notas de despliegue

- La aplicación puede correr en la nube (Vercel, Google Cloud Run) o en un servidor local dentro de la red institucional.
- Para acceder al NAS desde la aplicación, el servidor donde corre Next.js debe tener acceso de red a `\\10.0.16.103` (montaje SMB/CIFS).
- En entornos cloud, se recomienda montar el NAS como unidad de red en el servidor o usar un agente local que tenga acceso al NAS.
- Las variables de entorno deben configurarse en el panel del proveedor de hosting (nunca subir `.env.local` al repositorio).
