# Copilot instructions (Hospital-Outpatient)

## Big picture

- Frontend is Vue 3 + Vite + TypeScript + Element Plus + Pinia. Entry: [src/main.ts](src/main.ts).
- UI is role/department-driven: login returns `departmentType`, which controls landing route and sidebar menus.
  - Landing route map: [src/config/departmentRouteMap.ts](src/config/departmentRouteMap.ts)
  - Sidebar menu map: [src/config/menu.ts](src/config/menu.ts)
  - Sidebar reads `appStore.loginData.departmentType`: [src/components/SideBar.vue](src/components/SideBar.vue)

## Developer workflow

- Dev server: `npm run dev` (Vite). API calls go through `/api` proxy to `http://localhost:8080`: [vite.config.ts](vite.config.ts).
- Typecheck + build: `npm run build` (runs `vue-tsc -b` then `vite build`).
- Preview build: `npm run preview`.

## API conventions

- Use the shared Axios instance and `apiRequest<T>()`: [src/api/request.ts](src/api/request.ts).
- Backend response shape assumed: `{ code, data, message, meta }`.
  - `apiRequest` returns **either** `data` (when no `meta`) **or** `{ data, meta }` (when `meta` exists).
  - Call sites that need pagination should expect `{ data, meta }` (see Tech store usage): [src/store/Tech/TechStore.ts](src/store/Tech/TechStore.ts).
- Auth: token is stored in `sessionStorage` (tab-isolated) via app store: [src/store/app.ts](src/store/app.ts).
  - Request interceptor attaches `Authorization: Bearer <token>`.
  - On `401/403`, client logs out and redirects to `/login?redirect=...`: [src/api/request.ts](src/api/request.ts).
- API modules are grouped by department/feature under [src/api/modules](src/api/modules) (e.g. [src/api/modules/Outpatient/MedicalTreatment.ts](src/api/modules/Outpatient/MedicalTreatment.ts)).

## State management (Pinia)

- Stores use the setup-style `defineStore(name, () => { ... })` and `ref/reactive/computed`.
- Pattern for patient-scoped draft persistence:
  - Use `sessionStorage` keys scoped by `regId` + debounce `watch`.
  - IMPORTANT: when leaving a patient workspace, stop watchers by setting the scoped id to `null` (prevents cross-patient state leaks).
  - Examples: [src/store/Outpatient/MedicalTreatment/MedicalRecord.ts](src/store/Outpatient/MedicalTreatment/MedicalRecord.ts), [src/store/Outpatient/MedicalTreatment/OrderStore.ts](src/store/Outpatient/MedicalTreatment/OrderStore.ts), [src/store/Outpatient/MedicalTreatment/PrescriptionStore.ts](src/store/Outpatient/MedicalTreatment/PrescriptionStore.ts).

## Routing + layouts

- Global layout with header + sidebar: [src/components/MainLayout.vue](src/components/MainLayout.vue).
- Outpatient doctor flow is split:
  - “大厅/患者查看” uses `SimpleHeaderLayout`.
  - “诊疗工作台” is `/outpatient/workspace/:visitId` and uses `DoctorWorkspaceLayout`, which loads context and clears patient stores on unmount: [src/components/DoctorWorkspaceLayout.vue](src/components/DoctorWorkspaceLayout.vue).
- Tech workstations (Exam/Lab/Disposal) reuse shared pages and switch behavior via `route.meta.moduleType`:
  - Routes set `meta.moduleType`: [src/router/index.ts](src/router/index.ts)
  - Pages read it and call `store.setModule(...)`: [src/views/Tech/Entry/index.vue](src/views/Tech/Entry/index.vue)
  - Store uses an API strategy map (`EXAM`/`LAB`/`DISPOSAL`): [src/store/Tech/TechStore.ts](src/store/Tech/TechStore.ts)

## Styling

- SCSS tokens are globally injected (no per-file imports needed): [vite.config.ts](vite.config.ts), [src/styles/\_tokens.scss](src/styles/_tokens.scss), [src/styles/\_semantic.scss](src/styles/_semantic.scss).
- Prefer existing `$padding-*`, `$text-color*`, `$background-color*` variables in component `lang="scss"` blocks.
