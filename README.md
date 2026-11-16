# Ceylon Bites — Frontend Coursework

CMJD Batch 112 · Front-End Development 

Student name: Y.M.M Nadeeja 

Frontend repository: https://github.com/mithilanadeeja-cyber/ceylon-bites-coursework


## What this repository contains

React + TypeScript, React Router, Axios, Bootstrap, responsive styles, authentication forms, protected navigation, food/category views, cart, checkout, orders, payments, profile and administrator menu management. The separate Spring Boot/MySQL backend is required for normal operation. Do not copy the backend source into this repository.

## Run on Windows

1. Extract this archive and open the **ceylon-bites-frontend** folder in VS Code. Confirm package.json is directly inside it.
2. Install Node.js 22 LTS.
3. Start the separate backend first, following its README. Its API should respond at http://localhost:8080/api/health.
4. Open a terminal in this frontend folder and run:

```bash
npm ci
npm run dev
```

5. Open the local URL Vite prints (normally http://localhost:5173).
6. Register a customer. For admin access, use the credentials configured in the backend's local .env file.



## Tests and build

```bash
npm test
npm run build
```





## Authentication and payments

 Demo login: customer@demo.test or admin@demo.test, 
 password: Demo123!.

## Code guide

- src/App.tsx: routes and navigation.
- src/pages/: menu, authentication, cart/checkout, orders/payments, profile and administration.
- src/context/AppContext.tsx: authentication and synchronized cart state.
- src/services/api.ts: Axios and backend DTO mapping.
- src/services/demoApi.ts: optional isolated visual-demo service.
- src/components/: reusable guards, controls and loading/error states.
- src/types/: typed UI models and calculations.
- docs/API.md: contract for the companion backend.



```bash
git init
git add .
git commit -m "Submit React frontend coursework"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ceylon-bites-frontend.git
git push -u origin main
```


