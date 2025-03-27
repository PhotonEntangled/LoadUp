# LoadUp Project Structure

## 🚨 Important Structure Notes

- **Critical:** The LoadUp project uses a **monorepo structure** with multiple applications
- **Page Location:** All Next.js pages must be created in `apps/admin-dashboard/src/pages/` NOT in the root `src/pages/`
- **API Routes:** All API endpoints must be created in `apps/admin-dashboard/src/pages/api/` 
- **Components:** Shared components can be placed in the root `src/components/` directory

## 📋 Page Map & Navigation Structure

### Admin Dashboard (`apps/admin-dashboard/`)

#### Core Pages
- **Dashboard** - `/admin/dashboard` - Main admin overview
- **Emergency Map** - `/admin/emergency-map` - Simplified map for testing
- **Vehicle Tracking** - `/admin/tracking` (in sidebar, planned implementation)
- **OCR Document Upload** - `/admin/documents` (dedicated page for document uploading)

#### Map Components
- **FleetOverviewMap** - Main map component (currently under maintenance)
- **FleetOverviewMapWrapper** - Wrapper redirecting to emergency map
- **EmergencyMap** - Simplified map implementation for testing

#### Locations/Routing Structure
```
apps/admin-dashboard/
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── dashboard.tsx       # Main dashboard
│   │   │   ├── emergency-map.tsx   # Emergency map
│   │   │   ├── tracking.tsx        # Vehicle tracking (planned)
│   │   │   └── documents.tsx       # OCR document upload
│   │   └── api/
│   │       ├── mapbox-token.ts     # Secure token endpoint
│   │       └── ...
```

## 🔑 Token Management

Map components need Mapbox tokens which should be managed securely:

1. Store tokens in `.env` as `MAPBOX_SECRET_TOKEN`
2. Client components cannot directly access `MAPBOX_SECRET_TOKEN`
3. Use API endpoints (like `/api/mapbox-token`) to securely provide tokens to client

## 🧭 Common Issues & Solutions

### Map Not Rendering
- Error: `Cannot read properties of null (reading 'useContext')`
- Solution: This is a server-side rendering issue with react-map-gl. Add `dynamic` import with `{ ssr: false }`

### Page Not Found
- Check that the page is in the correct location: `apps/admin-dashboard/src/pages/`
- Verify Next.js server is running with `npm run dev`

### Environment Variables Not Available
- Client components can only access variables prefixed with `NEXT_PUBLIC_`
- Use API endpoints to securely provide server-side variables to client

## 📂 Additional Resources

- Check `package.json` for available scripts
- The sidebar navigation is defined in `apps/admin-dashboard/src/components/Sidebar.tsx`
- Shared components are in the root `src/components/` directory 