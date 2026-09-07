# Planungskompass & OKR-Tracker — geteilte Version mit Passwortschutz

Zwei eigenständige Tools in einer App, bewusst getrennt: der **Zeitstrahl**
(Feiertage, Ferien, Projekte, Kampagnen) unter `/` und der **OKR-Tracker**
(Objectives, Key Results, Gewichtung, Status-Updates) unter `/okrs`. Beide
sind über einen kleinen Link im Kopfbereich miteinander verlinkt.

Alle, die das Passwort kennen, sehen und bearbeiten dieselben Daten — die
liegen zentral in einer Vercel-KV-Datenbank (zwei getrennte Schlüssel, einer
pro Tool).

## Deployment auf Vercel

1. **Repo anlegen**: Diesen Ordner in ein neues GitHub-Repo pushen (oder als
   ZIP direkt in Vercel importieren: „Add New… → Project → Deploy without
   Git").
2. **Projekt importieren**: Im Vercel-Dashboard „Add New… → Project" und das
   Repo auswählen.
3. **KV-Datenbank verbinden** (für die gemeinsame Speicherung):
   - Im Projekt → Tab „Storage" → „Create Database" → „KV" auswählen.
   - Nach dem Erstellen mit dem Projekt verbinden („Connect Project").
   - Vercel setzt `KV_REST_API_URL` und `KV_REST_API_TOKEN` automatisch als
     Umgebungsvariablen.
4. **Passwort setzen**: Unter „Settings → Environment Variables":
   - `PLANNING_PASSWORD` = das Passwort, das du an dein Team gibst.
5. **Deploy** anstoßen (passiert bei Git-Push automatisch, sonst über
   „Redeploy").

Danach ist die App unter der von Vercel vergebenen URL erreichbar
(z. B. `planungskompass.vercel.app` oder deine eigene Domain, falls du eine
in den Projekteinstellungen hinterlegst). Jeder mit dem Link und Passwort
kann zugreifen; das Passwort kannst du jederzeit über die Umgebungsvariable
ändern.

## Lokal testen

```bash
npm install
cp .env.example .env.local   # PLANNING_PASSWORD eintragen
npm run dev
```

Ohne verbundene KV-Datenbank läuft lokal ein einfacher Im-Speicher-Fallback
(Daten gehen bei jedem Neustart verloren — für Produktion daher unbedingt
die KV-Datenbank in Vercel verbinden).

## Passwort ändern

Einfach den Wert von `PLANNING_PASSWORD` in den Vercel-Projekteinstellungen
anpassen und neu deployen (oder „Redeploy" auslösen). Bereits angemeldete
Nutzer bleiben bis zum Cookie-Ablauf (30 Tage) oder bis sie sich abmelden
eingeloggt — bei einer Passwortänderung ist ein erneutes Einloggen mit dem
neuen Passwort nötig, sobald das alte Cookie ungültig wird.

## Struktur

- `middleware.ts` — prüft das Auth-Cookie auf allen Seiten/APIs außer `/login`.
- `app/login/page.tsx` — Login-Formular.
- `app/api/login/route.ts` — prüft Passwort, setzt Cookie.
- `app/api/data/route.ts` — liest/schreibt die Zeitstrahl-Daten (Vercel KV).
- `app/api/okr-data/route.ts` — liest/schreibt die OKR-Daten (Vercel KV, eigener Schlüssel).
- `app/page.tsx` — der Zeitstrahl (Feiertage, Ferien, Projekte, Kampagnen).
- `app/okrs/page.tsx` — der OKR-Tracker (Objectives, Key Results, Status-Updates).
