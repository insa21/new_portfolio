# Vercel Environment Variables for Backend

Konfigurasi environment variables berikut WAJIB di-set di Vercel Dashboard untuk backend production.

## Required Variables

### Database
| Variable | Contoh Value | Keterangan |
|----------|-------------|------------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | Neon database URL |

### JWT (⚠️ SECURITY CRITICAL)
| Variable | Contoh Value | Keterangan |
|----------|-------------|------------|
| `JWT_SECRET` | `d468af23ffae132b2d73cd89212b7b6a` | **WAJIB GANTI!** Generate random string |
| `JWT_REFRESH_SECRET` | `5357443e43695c7f7783e0cfe8eb5cfe` | **WAJIB GANTI!** Generate random string |
| `ACCESS_TOKEN_EXPIRES` | `15m` | Token expires in 15 minutes |
| `REFRESH_TOKEN_EXPIRES` | `7d` | Refresh token expires in 7 days |

### Server
| Variable | Value | Keterangan |
|----------|-------|------------|
| `NODE_ENV` | `production` | **WAJIB** untuk production |
| `PORT` | `3001` | Port (Vercel handle otomatis) |

### CORS (⚠️ IMPORTANT)
| Variable | Contoh Value | Keterangan |
|----------|-------------|------------|
| `CORS_ORIGIN` | `https://your-frontend.vercel.app,https://custom-domain.com` | Comma-separated origins |

### Cloudinary
| Variable | Value | Keterangan |
|----------|-------|------------|
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `your-api-key` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | Cloudinary API secret |

### Rate Limiting (Optional - defaults provided)
| Variable | Default | Keterangan |
|----------|---------|------------|
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW_MS` | `600000` | 10 minutes window |
| `AUTH_RATE_LIMIT_MAX` | `20` | Max auth attempts |
| `AUTH_RATE_LIMIT_WINDOW_MS` | `900000` | 15 minutes window |

---

## Generate JWT Secrets

Jalankan command berikut untuk generate random secrets:

```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])

# Linux/Mac
openssl rand -base64 32
```

---

## Deployment Steps

1. Push code ke GitHub
2. Connect repo ke Vercel
3. Set **Root Directory** ke `server`
4. Set **Build Command** ke `npm run build && npx prisma generate`
5. Set **Output Directory** ke `dist`
6. Add semua environment variables di atas
7. Deploy!

---

## Troubleshooting

### Login tidak bisa / session hilang
- Pastikan `CORS_ORIGIN` include frontend URL dengan exact match (https://)
- Pastikan `NODE_ENV=production` 
- Cek browser console untuk CORS errors

### Database connection error
- Pastikan `DATABASE_URL` ada `?sslmode=require` untuk Neon
- Cek koneksi di Neon dashboard
