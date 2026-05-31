# Deployment Guide

This project is designed for:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- File storage: Cloudinary

## 1. MongoDB Atlas Setup

1. Create a MongoDB Atlas account.
2. Create a new project and cluster.
3. Create a database user with read/write permissions.
4. In Network Access, allow Render to connect. For a simple MVP deployment, you can use `0.0.0.0/0`; for production, restrict this to known outbound IPs where possible.
5. Copy your connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/lms?retryWrites=true&w=majority
```

Use a database name such as `lms` in the URI.

## 2. Cloudinary Setup

1. Create a Cloudinary account.
2. Open the Cloudinary dashboard.
3. Copy:
   - Cloud name
   - API key
   - API secret
4. Add these values to Render as backend environment variables:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Salary slips are uploaded to the `lms/salary-slips` Cloudinary folder. The returned secure URL is stored in MongoDB.

## 3. Render Backend Deployment

Create a new Render Web Service from this GitHub repository.

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm start` |

### Backend Environment Variables

Add these in Render:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-app.vercel.app
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Notes:

- Render injects its own `PORT` value at runtime. Keeping `PORT=5000` is fine for local parity, but Render's assigned port takes precedence if set in the environment.
- `CLIENT_URL` must match the deployed Vercel frontend URL exactly, including `https://`.
- The build command installs dev dependencies because TypeScript and type packages are required during `npm run build`. The runtime still uses compiled output from `dist/` via `npm start`.

## 4. Vercel Frontend Deployment

Import the same GitHub repository into Vercel.

| Setting | Value |
|---|---|
| Framework Preset | `Next.js` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | Default Next.js output |

### Frontend Environment Variables

Add this in Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com/api
```

Do not include a trailing slash.

## 5. Seed Script

After the Render backend is configured with `MONGODB_URI`, run the seed script from a local machine or Render Shell:

```bash
cd backend
npm install
npm run seed
```

The script creates:

| Email | Role |
|---|---|
| `admin@example.com` | `ADMIN` |
| `sales@example.com` | `SALES` |
| `sanction@example.com` | `SANCTION` |
| `disbursement@example.com` | `DISBURSEMENT` |
| `collection@example.com` | `COLLECTION` |
| `borrower@example.com` | `BORROWER` |

All seeded users use:

```text
Password@123
```

## 6. Deployment Order

1. Create MongoDB Atlas cluster and database user.
2. Create Cloudinary account and copy credentials.
3. Deploy backend on Render with MongoDB, JWT, CORS, and Cloudinary environment variables.
4. Confirm backend health endpoint:

```text
https://your-render-backend.onrender.com/api/health
```

5. Run `npm run seed`.
6. Deploy frontend on Vercel with `NEXT_PUBLIC_API_URL` pointing to the Render backend.
7. Update Render `CLIENT_URL` to the final Vercel URL.
8. Redeploy Render if `CLIENT_URL` changed.
9. Test login and full borrower-to-collection lifecycle.

## 7. Production URLs

Fill these in after deployment:

```text
Frontend URL:
Backend URL:
MongoDB Atlas Cluster:
Cloudinary Cloud Name:
```

## 8. Local Development

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

For local development, set:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```
