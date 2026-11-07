# PACCHETTO UNICO INTEGRATO — TRADING PRO ULTIMATE™ × MOTIONSITES SKILL
**Progetto:** `https://cuordivino.github.io/trading-pro-ultimate/`
**Identità & Copyright:** `Trading Pro Ultimate™ × cuordivino` | `Market Quantum Co-Pilot` | `© La_mEnte_arDente`
**Skill Integrata:** `https://github.com/Motionsites-AI/claude-skill` (MotionSites Web Builder)

---

## 1. STRUTTURA DEL DOCUMENTO COMPRESSO UNICO
Tutto ciò che serve è racchiuso in questo singolo archivio `.zip`, già organizzato con gli stessi percorsi del tuo repository GitHub:

* `favicon.png` (512x512 px quadrata 1:1 col fulmine dorato originale)
* `favicon.ico` (Multi-risoluzione 16x16, 32x32, 48x48, 64x64 per segnalibri browser)
* `apple-touch-icon.png` (180x180 px per iPhone/iPad)
* `css/motionsites-skin.css` (Layer estetico Liquid Glass, Cyber-Grid, Numeri Tabulari, Spotlight)
* `js/motionsites-effects.js` (Motore di micro-interazione Mouse Spotlight Reveal + Particelle Ambientali)
* `assets/` (Copia di backup di tutte le icone e del banner originale `og-banner-tradingpro-ultimate.png`)
* `antigravity_instructions/SNIPPET_INDEX_HTML.html` (Righe esatte di collegamento per `index.html`)

---

## 2. GARANZIA "ZERO-REGRESSION" (NESSUNA ALTERAZIONE DEL CONTENUTO)
1. **Nessuna modifica funzionale:** Nessun ID (`id="..."`), nessuna funzione JavaScript (`recalcStandaloneSizer`, `syncStandaloneLeverageSlider`, simulazioni Monte Carlo, WebSocket, Anti-Panic Guard, ecc.) viene toccato o sovrascritto.
2. **Nessuna modifica ai testi:** Tutti i titoli, i segnali, le etichette e i copyright restano identici al 100%.
3. **Pura valorizzazione visiva:** Il foglio di stile e lo script agiscono esclusivamente come "veste" grafica (Liquid Glassmorphism, riflesso dinamico al passaggio del mouse, stabilizzazione dei numeri in tempo reale e nuovo logo nei segnalibri).

---

## 3. MASTER PROMPT PER GOOGLE ANTIGRAVITY (COPIA E INCOLLA)

Dopo aver estratto questo unico file ZIP nella cartella principale del tuo progetto su **Antigravity**, copia e incolla nella chat di Antigravity questo comando:

```text
Agisci come Senior Creative Frontend Engineer. Ho estratto nella root del progetto l'archivio unico di upgrade estetico basato sulla skill "MotionSites Web Builder" (Motionsites-AI/claude-skill).

FILE GIÀ PRESENTI NELLA ROOT DEL PROGETTO DA COLLEGARE:
1. `favicon.png`, `favicon.ico`, `apple-touch-icon.png`
2. `css/motionsites-skin.css`
3. `js/motionsites-effects.js`

REGOLE TASSATIVE E INDEROGABILI (ZERO-REGRESSION RULE):
- NON eliminare, NON rinominare e NON modificare nessuna funzione JavaScript, nessun calcolo matematico (`recalcStandaloneSizer`, `syncStandaloneLeverageSlider`, simulazioni Monte Carlo, WebSocket, ecc.), nessun ID del DOM (`id="..."`), e nessun testo o dicitura di copyright ("Trading Pro Ultimate™ × cuordivino" e "© La_mEnte_arDente").
- L'intervento deve essere ESCLUSIVAMENTE additivo e di valorizzazione estetica.

OPERAZIONI DA ESEGUIRE SU `index.html` (e `mobile-app.html` se presente):
1. Assicurati di operare sul codice sorgente originale in lingua inglese (verifica che non ci siano tag HTML tradotti come `<testa>` o `<scrittura>`).
2. All'interno del tag `<head>`, subito dopo `<title>`, inserisci i riferimenti ufficiali alla nuova Favicon e al foglio di stile MotionSites:
   <link rel="icon" type="image/png" sizes="512x512" href="favicon.png?v=2">
   <link rel="shortcut icon" href="favicon.ico?v=2">
   <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png?v=2">
   <link rel="stylesheet" href="css/motionsites-skin.css?v=2">
3. Prima della chiusura del tag `</body>`, inserisci il collegamento allo script di micro-interazioni estetico:
   <script src="js/motionsites-effects.js?v=2" defer></script>
4. Se `manifest.json` è presente nella root, aggiorna l'array `icons` affinché punti a `favicon.png` (512x512, image/png).
5. Verifica che non ci siano errori di sintassi, poi esegui `git add .`, `git commit -m "feat(ui): integrate MotionSites cinematic liquid-glass skin and official favicon"` e `git push` sul branch principale.
```
