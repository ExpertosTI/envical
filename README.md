# envical — Calculadora de envíos

App independiente que reemplaza el módulo Odoo **POS Shipment Management**
(`pos_shipment_manager`): **calcula** el costo de un envío y permite
**configurar** las reglas con que se calcula.

Mobile-first, sin backend. Se despliega en **https://envios.renace.tech**
siguiendo el Renace Protocol (Docker Swarm + Traefik + `RenaceNet`).

## Stack

- **Vite + React 19 + TypeScript** → build estático.
- **nginx:alpine** en Docker, detrás de Traefik con Let's Encrypt.
- **Sin dependencias de runtime** salvo React. Sin fuentes externas.
- Configuración persistida en `localStorage` + Import/Export JSON.

## Funcionalidad

**Calculadora** — cotiza un envío en vivo:

```
total = tarifa de zona + cargo por peso + recargos
```

Si el valor de la orden alcanza el umbral de envío gratis, el total es 0.
El total se redondea según la configuración.

**Configuración** — editor de reglas:

- Zonas de entrega (tarifa base por destino).
- Escalas de peso (rango + tarifa + cargo por kg adicional).
- Umbral de envío gratis.
- Recargos opcionales (monto fijo o % del valor de la orden).
- Moneda y redondeo.
- Exportar / Importar / Restablecer.

## Estructura

```
envical/
├── src/
│   ├── App.tsx, main.tsx
│   ├── types.ts
│   ├── lib/
│   │   ├── shipping-engine.ts        # lógica de cálculo (pura)
│   │   ├── shipping-engine.test.ts   # tests (vitest)
│   │   ├── storage.ts                # localStorage + import/export saneado
│   │   ├── defaults.ts               # config inicial (zonas RD)
│   │   └── format.ts
│   ├── components/                   # UI reutilizable
│   ├── views/Calculator.tsx, Settings.tsx
│   └── styles.css                    # design system renace.tech
├── Dockerfile · nginx.conf · docker-compose.yml · deploy.sh
└── package.json · vite.config.ts · tsconfig.json
```

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:5184
npm test         # tests del motor de cálculo
npm run build    # type-check + build a dist/
```

## Despliegue (Renace Protocol)

```bash
# En el VPS, primera vez clona el repo en /opt/envical
git clone https://github.com/ExpertosTI/envical.git /opt/envical
cd /opt/envical
./deploy.sh

# Variables opcionales:
DOMAIN=envios.renace.tech STACK_NAME=envios ./deploy.sh
```

Verificación post-deploy:

```bash
docker stack services envios
docker service logs -f envios_web
curl -I https://envios.renace.tech/healthz
```

## DNS

Apuntar el subdominio al VPS:

```
envios.renace.tech   A   <VPS_IP>
```

Traefik gestiona el certificado TLS vía Let's Encrypt automáticamente.

## Seguridad

- CSP estricta (`script-src 'self'`), `X-Frame-Options: DENY`, `nosniff`,
  HSTS vía Traefik.
- La importación de JSON se sanea campo por campo: solo se copian claves
  conocidas con su tipo esperado (sin riesgo de prototype pollution).
- Sin telemetría ni llamadas de red; los datos no salen del dispositivo.
