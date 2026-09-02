# Deploying auth.ter.net.in (VPS + Docker Compose)

Mirrors the ternetrok setup. On push to `main`, GitHub Actions
(`.github/workflows/deploy-vps.yml`):

1. writes the `PRODUCTION_ENV` secret to `.env`,
2. SCPs the repo to the server,
3. SSHes in and runs `docker compose -f infra/docker-compose.yml`: **build → start
   postgres → run migrations → up**.

The web container binds `127.0.0.1:${WEB_PORT}:3000` — loopback only, so pick a
free `WEB_PORT` per box and put Caddy in front for TLS. Postgres is not exposed to
the host.

## GitHub repository secrets (Settings → Secrets and variables → Actions)

| secret           | value                                                           |
| ---------------- | --------------------------------------------------------------- |
| `VPS_HOST`       | `217.182.64.210`                                                |
| `VPS_USER`       | `ubuntu`                                                        |
| `VPS_PORT`       | `6722`                                                          |
| `VPS_SSH_KEY`    | private key whose public key is in the server's `authorized_keys` |
| `VPS_APP_DIR`    | deploy path, e.g. `/home/ubuntu/authkit`                        |
| `PRODUCTION_ENV` | the full production `.env` contents (see `.env.example`)        |

`PRODUCTION_ENV` — fill in `.env.example` and paste it whole. Set `WEB_PORT` to a
port that's free on the box (e.g. `4310`) so it doesn't overlap other apps.

## One-time server setup (`ssh ubuntu@217.182.64.210 -p 6722`)

```bash
# Docker + compose plugin installed, and the deploy user in the docker group.
mkdir -p /home/ubuntu/authkit          # == VPS_APP_DIR
```

The workflow SCPs the code here and builds it — no manual clone needed. Then wire
TLS with Caddy (`infra/Caddyfile`), pointing `auth.ter.net.in` at
`127.0.0.1:${WEB_PORT}`:

```bash
# /etc/caddy/Caddyfile (or import infra/Caddyfile). Caddy needs WEB_PORT in its env.
auth.ter.net.in {
  reverse_proxy 127.0.0.1:4310
}
```

## Manual deploy / rollback (on the server)

```bash
cd /home/ubuntu/authkit
docker compose -f infra/docker-compose.yml --env-file .env build
docker compose -f infra/docker-compose.yml --env-file .env up -d postgres
docker compose -f infra/docker-compose.yml --env-file .env run --rm web bun run db:migrate
docker compose -f infra/docker-compose.yml --env-file .env up -d
```

Roll back by checking out a previous commit and re-running the same commands.

## Local dev (unchanged)

```bash
docker compose up -d      # dev Postgres (root docker-compose.yml, port 5432)
bun run db:migrate
bun run dev:web           # http://localhost:3000
```
