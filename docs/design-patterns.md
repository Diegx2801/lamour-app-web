# Patrones de diseno usados en L'AMOUR App

Este proyecto usa una arquitectura propia de React moderno. No depende de
clases tradicionales para demostrar patrones; los aplica con modulos, hooks,
servicios y componentes.

## 1. Singleton

Archivo principal:

```text
src/lib/supabase.ts
```

El cliente de Supabase se crea una sola vez y se reutiliza en toda la
aplicacion. Esto evita repetir configuracion y mantiene una unica instancia de
conexion para autenticacion, consultas y funciones.

## 2. Service / Repository

Ejemplos:

```text
src/features/admin-agenda/api/adminAgendaService.ts
src/features/admin-dashboard/api/adminDashboardService.ts
src/features/admin-cash/api/adminCashService.ts
src/features/admin-users/api/adminUsersService.ts
```

Estos archivos centralizan el acceso a Supabase. La interfaz no consulta la
base de datos directamente; llama a funciones del servicio. Esto separa datos
de presentacion y hace mas simple mantener la aplicacion.

## 3. Controller / ViewModel con Hooks

Ejemplos:

```text
src/features/admin-agenda/hooks/useAdminAgenda.ts
src/features/admin-dashboard/hooks/useAdminDashboard.ts
src/features/admin-cash/hooks/useAdminCash.ts
src/features/admin-services/hooks/useAdminServices.ts
```

Los hooks administran estado, cargas, validaciones y acciones. Las paginas se
mantienen enfocadas en renderizar. Este patron se parece a un ViewModel porque
prepara los datos y comandos que necesita la vista.

## 4. Adapter / Mapper

Ejemplos:

```text
getClientData()
getServiceData()
normalizeTime()
formatAuditDetails()
```

Estas funciones adaptan datos de Supabase al formato que necesita la interfaz.
Tambien normalizan valores como horarios, telefonos, estados y textos de
historial.

## 5. Protected Route

Archivo principal:

```text
src/components/auth/ProtectedRoute.tsx
```

Este componente envuelve rutas privadas y valida sesion, rol y estado activo.
Es un ejemplo de control de acceso aplicado como componente reutilizable.

## Flujo general

```text
Pagina / Componente -> Hook de feature -> Service/API -> Supabase
```

Este flujo mantiene el codigo ordenado:

- La pagina renderiza.
- El hook controla reglas y estado.
- El servicio consulta o actualiza datos.
- Supabase almacena y protege la informacion.

## Por que no se fuerza Factory o Decorator

El sistema no necesita una Factory o Decorator formal para funcionar bien. Se
evita agregar patrones artificiales porque podrian hacer el codigo mas complejo
sin mejorar la logica del negocio. Los patrones actuales ya cubren separacion
de responsabilidades, reutilizacion y seguridad.
