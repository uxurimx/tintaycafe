# Sistema de Roles y Seguridad de Tinta y Café

Este documento detalla cómo funciona la jerarquía de acceso en Tinta y Café (Neural Nexus) y cómo gestionar los permisos de tu equipo.

## Jerarquía de Roles

El sistema utiliza cinco niveles de acceso principales para distinguir entre el personal del negocio y los clientes.

| Rol | Descripción | Acceso Principal |
| :--- | :--- | :--- |
| **Owner** (Propietario) | Acceso total al sistema. | Todo (POS, Inventario, Clientes, Configuración). |
| **Admin** (Administrador) | Gestión operativa completa. | Todo (POS, Inventario, Clientes, Configuración). |
| **Employee** (Empleado) | Personal de barra y ventas. | POS, Inventario, Menú. |
| **Kitchen** (Cocina) | Personal de preparación. | Menú (Recetas), Perfil Personal. |
| **Customer** (Consumidor) | Clientes del programa de lealtad. | Mi Perfil (Puntos e Historial). |

## ¿Cómo funcionan los Roles?

Cualquier persona que se registre en el sitio web (vía Clerk) entra automáticamente con el rol de **Customer**. Esto garantiza que, por defecto, nadie pueda ver información administrativa.

### Protección Forzada
Si un usuario con el rol de **Customer** intenta acceder manualmente a una ruta administrativa (ej. `/inventory`), el sistema lo detectará automáticamente y lo redirigirá a su perfil personal en `/me`.

---

## Cómo promover a un usuario (Ejemplos)

Para cambiar el rol de un usuario, debes actualizar su registro en la tabla `users` de la base de datos (mientras implementamos el panel de gestión de empleados). Aquí tienes ejemplos de cómo configurar tu equipo:

### Ejemplo 1: El nuevo Barista (Employee)
Nombre: `Juan Pérez`
Email: `juan@gmail.com`
Clerk ID: `user_xxxxxxxx`
**Acción**: Cambiar rol de `customer` a `employee`. 
*Resultado*: Juan podrá cobrar en el POS y ver cuánto café queda en el inventario.

### Ejemplo 2: El Chef de Repostería (Kitchen)
Nombre: `Elena Gómez`
Email: `elena@cocina.com`
Clerk ID: `user_yyyyyyyy`
**Acción**: Cambiar rol de `customer` a `kitchen`.
*Resultado*: Elena podrá entrar a ver el Menú para revisar ingredientes o recetas, pero no tendrá acceso al POS ni a los datos de los clientes.

### Ejemplo 3: El Socio/Gerente (Admin)
Nombre: `Carlos Ruiz`
Email: `carlos@gerencia.com`
Clerk ID: `user_zzzzzzzz`
**Acción**: Cambiar rol de `customer` a `admin`.
*Resultado*: Carlos tiene acceso a la configuración de las sucursales, proveedores y toda la analítica.

---

## Preguntas Frecuentes

**¿Un cliente puede volverse Admin por error?**
No. El rol por defecto es `customer`. Solo alguien con acceso a la gestión de base de datos o un Owner puede elevar el rol de un usuario.

**¿Qué pasa si borro a un usuario en Clerk?**
El usuario perderá acceso al sistema, pero sus transacciones históricas permanecerán vinculadas a su registro de `customer` para mantener la integridad de los datos.
