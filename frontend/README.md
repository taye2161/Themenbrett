WE 2, Blatt 11
----------------

## Bearbeitung

Zur Bearbeitung und Abgabe des Aufgabenblattes gehen Sie wie folgt vor:

1. Erstellen Sie einen Fork des Projekts unter Ihrer Gitlab-Kennung.
2. Setzen Sie die Sichtbarkeit Ihres Forks auf private.
3. Klonen Sie Ihren Fork.
4. Führen Sie `npm install` im Projektverzeichnis aus.
5. Bearbeiten Sie die Aufgabe auf dem Branch "main" (dies ist der Standard, normalerweise sollten Sie mit Branches nichts zu tun haben).
6. 'Committen' Sie alle Ihre Änderungen mindestens nach jeder Teilaufgabe. Geben Sie sinnvolle Commit-Messages an!

Es wird dringend empfohlen, im Dev Container zu entwickeln. Zu Ihrer Sicherheit befindet sich im Projekt eine .npmrc, die npm veranlasst, nur Pakete zu installieren, die mindestens 3 Tage alt sind. In dieser Zeit sollten Supply-Chain-Angriffe auf NPM-Pakete in der Regel gefunden worden sein.

## Tests

Die Tests müssen via `npm test` ausführbar sein. Dies ist initial auch schon so konfiguriert.

## Frontend-Server starten

Der Frontend-Server wird im Developer-Modus mittels `npm run dev` gestartet.

## AI Chat History

Erstellen Sie die Copilot Chat History. Dieses Script nicht im DevContainer ausführen, da es auf die lokale Chat-History zugreift. Wechseln Sie also auf Ihrem lokalen Rechner in das Projektverzeichnis und führen Sie dort folgendes Skript aus:

```bash
npm run ailog
```

Falls Sie im Dev Container arbeiten, müssen Sie obigen Befehl in Projektverzeichnis des Host ausführen. Unter Windows müssen Sie in diesem Fall folgenden Befehl eingeben:

```bash
node .\node_modules\copilothistory\bin\cli.js export -o ailog.md --remotePath /workspaces
```

Falls Sie nicht mit generischer AI (genAI) gearbeitet haben, erstellen Sie die Datei `ailog.md` manuell mit einem kleinen Kommentar.
Falls beide Befehle oben fehlschlagen, bitten Sie die genAI, die Datei mit dem Chat-Verlauf zu erstellen.

## Abgabe

Für die Abgabe erstellen Sie eine Zip-Datei `abgabe-Blatt_11.zip` mittels
```
npm run abgabe
```
Diese enthält Ihr lokales Repository. Diese Datei müssen Sie dann in Moodle hochladen.

Weiteres zur Bearbeitung und Abgabe finden Sie im Blatt "Modalitäten" unter Moodle.

## Lizenz (License)

Die Dateien dürfen nur im Rahmen des oben genannten Moduls verwendet werden und sind nur zum persönlichen Gebrauch bestimmt. Falls der Code später im Rahmen von Bewerbungsverfahren vorgestellt werden soll, kann er mit Mitarbeitern der Firma geteilt etwa über private GitHub- oder GitLab-Repositories geteilt werden. Eine Bereitstellung in öffentlichen Repositories ist nicht erlaubt.