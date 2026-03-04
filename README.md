

## 1.4 Installationsanleitung

Diese Anleitung erklärt die Schritte, die notwendig sind, um das Projekt „Book Details Checker“ lokal in einer Entwicklungsumgebung einzurichten und zu starten.

### Voraussetzungen

Folgende Softwares müssen installiert sein:

* **Node.js**
* **Docker** & Docker Desktop
* **Git**
* **Expo Go App** (auf dem Handy) oder **Android Studio** (für den Emulator)

---

### Schritt 1: Backend (Datenbank & REST-API) vorbereiten

Das Backend läuft in einem Docker-Container und stellt die Buchdaten über einen `json-server` bereit.

1. Terminal öffnen
2. Datenkbank-Container mit folgenden Befehl starten:
```bash
docker run -p 3030:3000 --name restdb -d devnyzh/rest-jsondb

```


3. **Testen des Backends:**
Im Browser aufrufen oder via Curl `http://localhost:3030` auf. Wenn man die Übersicht der Datenbank sieht, läuft das Backend korrekt.


Um `http://localhost:3030/book` aufrufen zu können, muss man eingeloggt sein. Man kann nachdem die App gestartet ist, sich registrieren oder auf Postman ein post auf `http://localhost:3030/signup` und dem body format Body:
```
{
  "email": "test@example.com",
  "password": "bestPassw0rdEver"
}
```
---

### Schritt 2: Frontend (React Native App) einrichten

1. In den Projektordner navigieren.
2. Die Abhängigkeiten installieren:
```bash
npm install

```


---

### Schritt 3: API-Konfiguration 

Damit die App mit dem Backend kommunizieren kann, muss die korrekte IP-Adresse in der Datei `api.ts` eingetragen werden.

#### A. Testen mit dem Android Studio Emulator:

Wie schon im Code gegeben dies URl nutzen für den Emulator:

* **Basis-URL:** `http://10.0.2.2:3030`

#### B. Testen mit einem physischen Handy (Expo Go):

Handy und Laptop müssen im selben Netzwerk sein um es auf dem physischen Handy zu testen.

1. Die IP-Adresse des Laptops herausfinden (Windows: `ipconfig`, Mac/Linux: `ifconfig` oder `ip a`).
2. Jetzt kann man die URL ersetzen in `api.ts`:
* **Basis-URL:** `http://<LAPTOP_IP>:3030` (z.B. `http://192.168.1.50:3030`)


---

### Schritt 4: App starten

Über das Terminal den Expo-Server starten:

```bash
npx expo start

```

* **Für Emulator:** Drücke **"a"** für Android.
* **Für physisches Handy:** Den angezeigten **QR-Code** scannen mit dem Handy --> Expo Go App öffnet sich.

---

