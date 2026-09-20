FRIENDS GROUP – Setup
=====================

Ordner:
  index.html   Seite
  style.css    Design
  script.js    Einstellungen (CONFIG: Musik, Aktualisierung, Admin-Code) + Logik
  members.js   die Freunde (kommt aus dem Admin Panel, anfangs leer)
  admin.js     Admin Panel
  admin.css    Design vom Admin Panel
  music/       deine song.mp3 kommt hier rein

ADMIN PANEL
-----------
Oben links auf "Admin Panel" klicken → Code eingeben: ataka7
Dort kannst du:
  - Mitglied NUR mit der Discord-ID hinzufügen
    (Profilbild, Banner, Name und Status holt sich die Seite selbst von Discord)
  - Name, Rolle, Status, Schrift ändern
  - Social Links eintragen: Discord, TikTok, X, Snapchat, Telegram
  - Reihenfolge ändern und Mitglieder löschen

Discord-ID finden: Discord → Einstellungen → Erweitert → Entwicklermodus AN,
dann Rechtsklick auf das Profil → "Benutzer-ID kopieren".

WICHTIG – damit ALLE die Änderungen sehen:
  Deine Änderungen siehst zuerst nur du (in deinem Browser, gelber Punkt am Link).
  Im Panel unten auf "members.js herunterladen" klicken und die Datei im
  Website-Ordner durch die neue members.js ersetzen (bzw. neu hochladen).

Code ändern:
  Den Code kennt die Seite nur als Hash. Neuen Code erzeugen:
  Browser-Konsole (F12) auf der Seite:  FG.sha256("friends-group:DEINCODE")
  Ergebnis in script.js bei CONFIG.adminHash einsetzen.

LIVE-STATUS
-----------
Jeder, dessen Status live erscheinen soll, muss einmal den Discord-Server von
Lanyard joinen: https://discord.gg/lanyard
(Ohne das kommen trotzdem Profilbild + Banner, aber Status bleibt "Offline".)

MUSIK
-----
Datei "song.mp3" in den Ordner "music" legen. Button oben rechts = stumm / an.
