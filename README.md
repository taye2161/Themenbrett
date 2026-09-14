# Themenbrett Client-Server Architektur mit REST-API

## Ein Voll funktionales Beispielprogramm mit Frontend und Backend zur Verteilung von Abschlussarbeiten für Professoren

In diesem Semesterprojekt wurde eine vollständige Fullstack Webapplikation realisiert:

*Architektur*
- **Architekturstil:** Client-Server Modell (SPA + REST-API)
- **Sprache:** Typescript

*Backend*
- **Laufzeit & Sprache:** Node.js, Typescript
- **Web-Framework:** Express
- **Datenbank & ODM:** MongoDB via Mongoose
- **Authentifizierung:** JWT, Passwort Hashing mit bcryptjs, cookie-parser
- **Validierung & Logging:** express-validator, strukturierte Server-Logs mit Winston

*Frontend*
- **Core Framework:** React
- **Bundler:** Vite
- **Routing:** React Router
- **UI-Komponenten & Styling:** Bootstrap

## Install + Setup

**Klone dieses Projekt**

   ```git clone <repo-url>```
   
   ```cd <repo-name>```

**Zertifikat erstellen**

1. Öffne das ```cert_example``` Verzeichnis im Terminal
2. Key und Zertifikat erstellen:

   ```openssl req -x509 -newkey rsa:2048 -nodes -extensions EXT -config min.cnf -subj '/CN=localhost' -days 365 -keyout private.key -out public.crt```

**Backend**

1. Öffne das ```backend``` Verzeichnis im Terminal
2. Abhängigkeiten installieren:

   ```npm install```
   
4. JWT-secret erstellen im Terminal:

   ```openssl rand -base64 32```

5. ausgegebenen String in ```.env.example``` hinter ```JWT_SECRET=``` einfügen
6. ```.env.example``` zu ```.env``` umbenennen
7. Backend starten:

   ```npm run start```

**Frontend**

1. Öffne das ```frontend``` Verzeichnis im Terminal
2. Abhängigkeiten installieren:

   ``` npm install ```

4. ```.env.example``` zu ```.env``` umbenennen
5. Frontend starten:

   ```npm run dev```
   
