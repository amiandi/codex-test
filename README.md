# Propanpegel

Eine responsive, deutschsprachige Web-App, die den Füllstand von Propangasflaschen aus ihrem Gewicht berechnet. Unterstützt 5, 8 und 11 kg sowie eigene Nennfüllmengen.

## Installation und Entwicklung

Voraussetzung: Node.js 20.19+ oder 22.12+ (validiert mit Node.js 24) und npm.

```sh
npm ci
npm run dev
```

Vite stellt den Entwicklungsserver standardmäßig auf Port 5173 bereit. Auf Cloud-Maschinen mit eingeschränkten Home-Verzeichnissen kann `npm ci --cache /tmp/propanpegel-npm-cache` verwendet werden.

```sh
npm test          # Unit- und UI-Tests einmal ausführen
npm run test:watch
npm run build     # TypeScript-Prüfung und Produktionsbuild nach dist/
npm run preview   # Produktionsbuild lokal prüfen, standardmäßig Port 4173
```

## Bedienung

1. Nennfüllmenge der Flasche auswählen (oder unter „Andere“ eintragen).
2. Eingeprägtes Tara-Gewicht in kg eingeben.
3. Aktuelles Gesamtgewicht der Flasche in kg eingeben.

Gasmenge = Gesamtgewicht − Tara. Füllstand = Gasmenge ÷ Nennfüllmenge × 100. Komma und Punkt sind als Dezimaltrenner erlaubt. Leere Felder, ungültige Zahlen, negative Gewichte, Gesamtgewicht unter Tara und Überfüllung erzeugen Hinweise statt irreführender Ergebnisse. Eine Nennfüllmenge muss positiv sein. 0 kg Tara ist mathematisch zulässig, sollte bei einer realen Flasche aber überprüft werden. Die Anzeige rundet auf maximal zwei Nachkommastellen; gerechnet wird mit ungerundeten Werten.

## Technische Entscheidungen

- **React, TypeScript und Vite:** kleine clientseitige Anwendung mit strikten Typen, ohne Backend oder Konten.
- **Getrennte Fachlogik:** `src/calculator.ts` enthält reine Berechnungs- und Parserfunktionen. Ein diskriminierter Ergebnistyp verhindert, dass die UI ungültige Werte als Ergebnis behandelt.
- **Sofortige Berechnung:** kein zusätzlicher Berechnen-Knopf; Grafik und Zahlen folgen den Eingaben. Bei Fehlern wird das vorherige Ergebnis entfernt. Ein Hinweis erscheint auch bei noch unvollständigen Gewichtsangaben.
- **Keine stille Begrenzung bei Überfüllung:** Überschreitungen sind Fehler. Ausschließlich numerisches Gleitkomma-Rauschen bis 1e-9 kg wird toleriert.
- **Lokale Speicherung:** versionierter `localStorage`-Schlüssel; Daten werden beim Laden strukturell geprüft und danach erneut fachlich validiert. Beschädigte oder gesperrte Speicherung verhindert die Berechnung nicht. Zurücksetzen speichert leere Standardwerte.
- **Gestaltung:** responsive CSS ohne UI-Framework, SVG-Symbole aus Lucide und eine mit CSS gezeichnete Flasche. Keine externen Fonts, Bilder oder Analyse-Dienste.
- **Barrierearme Bedienung:** native Radiofelder, beschriftete Eingaben, Tastaturfokus, Fehlermeldungen mit `role="alert"`, Live-Ergebnis und Berücksichtigung reduzierter Bewegung. Kein formaler WCAG-Audit.
- **Tests:** Vitest für Grenzfälle und Parser, React Testing Library für Bedienung, Fehlermeldungen und Speicherung. Keine exakten Laufzeitprognosen: Diese würden zusätzlich den tatsächlichen Gasverbrauch benötigen.

Die Anwendung überträgt keine Eingaben. Die Messgenauigkeit hängt von Waage und Tara-Angabe ab. Bei einer Überfüllungsmeldung zunächst Eingaben und Flaschenkennzeichnung prüfen.

## GitHub Pages

Der Workflow `.github/workflows/pages.yml` prüft und baut die App bei jedem Push auf `main` und veröffentlicht `dist/` über GitHub Pages. Unter **Settings → Pages → Build and deployment → Source** muss **GitHub Actions** ausgewählt sein. Bei späterer Aktivierung den Workflow **Deploy to GitHub Pages** unter **Actions → Run workflow** erneut starten.

Zieladresse: https://amiandi.github.io/codex-test/

Vite verwendet dafür den Basispfad `/codex-test/`, damit JavaScript und CSS auch unter dem Repository-Unterpfad geladen werden. Bei einem anderen Repository-Namen oder Hosting unter einer eigenen Domain muss `base` in `vite.config.ts` angepasst werden. Für den lokalen Entwicklungsserver gilt dadurch ebenfalls der Pfad `/codex-test/`.
