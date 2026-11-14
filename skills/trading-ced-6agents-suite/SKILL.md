---
name: trading-pro-ultimate-ced-6agents-suite
description: Pacchetto All-In-One v18.0 per Trading Pro Ultimate (https://my-lap.github.io/trading-pro-ultimate/). Porta nel sito di trading la Meta-Skill find-skills (Vercel), il Sotto-Direttore CED + 6 Agenti Quantitativi Sempre Attivi (con sblocco immediato del pulsante '👑📈 Nuovi Agenti'), le 12 Varianti Colore Monitor (incluso Bloomberg Terminal, TradingView Navy, Matrix, Daylight), i Tasti Ergonomici Touch-First, il Layout Responsivo PC/Tablet/iPhone (0° Dritto e 90° Girato Split-Screen), la Regia Vocale Neurale 10 Voci M/F per Briefing Mercati e il Generatore Dossier Quantitativo/Rischio in PDF/CSV.
---

# Trading Pro Ultimate v18.0 — CED + 6 Agenti Quantitativi + 12 Temi Monitor + Sblocco Mobile/Cache

## Problema Risolto (Dallo Screenshot di Antigravity `Interactive Trading Platform Development`)
Nello screenshot allegato (`immagine_2.png`), l'utente aveva segnalato **"ancora non vedo nulla"** dopo che l'agente aveva provato ad aggiungere il pulsante `👑📈 Nuovi Agenti` chiedendo di fare "Pull-to-refresh" sul telefono.
**Causa reale del blocco**:
1. Il **Service Worker (`sw.js`)** su GitHub Pages manteneva in cache la vecchia versione di `index.html` e `app.js` su Safari/Chrome mobile, impedendo di vedere `👑📈 Nuovi Agenti`.
2. Mancava un **Iniettore DOM Autonomo Garantito (`DOMContentLoaded` + `MutationObserver`)** che creasse la barra fissa in alto e in basso anche se il resto dello script avesse ritardi o cache stantia.

## Cosa trasporta questo pacchetto da CADBridge Pro a `trading-pro-ultimate`
1. **Sblocco Cache Hard-Reset + Pulsante `👑📈 Nuovi Agenti` Garantito in Alto e in Basso**:
   - Script auto-eseguibile che deregistra i Service Worker bloccati, aggiunge un parametro `?v=18.0` anti-cache e inietta istantaneamente il bottone **`👑📈 Nuovi Agenti & Sala CED`** sia nella Top-Bar sia nella Bottom-Bar mobile.
2. **Catena di Comando Continua Adattata al Trading (`6 Agenti Quantitativi ➔ Vaglio Sotto-Direttore CED ➔ Sviluppo/Esecuzione CEO`)**:
   - **Meta-Skill di partenza `find-skills` (`vercel-labs/skills`)** preconfigurata per cercare skill finanziarie, algoritmiche e UI su `skills.sh` (>1.000 installazioni, audit `SKILL.md`).
   - **I 6 Agenti Ricercatori Indipendenti sotto il Sotto-Direttore (CED)**:
     1. 🕵️‍♂️ **Agente 1 (`Skill-Hunter FinTech & Quant skills.sh`)**: scova in automatico nuove skill di analisi tecnica, backtesting e indicatori su `skills.sh` e GitHub.
     2. 📈 **Agente 2 (`Market Scanner & Multi-Timeframe Signal Engine`)**: analizza trend, volumi, RSI, MACD, Bollinger, Smart Money Concepts (Order Blocks / Fair Value Gaps) su Crypto, Forex, Indici e Azioni.
     3. 🛡️ **Agente 3 (`Risk Management, Kelly Criterion & Stop-Loss Calculator`)**: calcola position sizing, rapporto Risk/Reward (minimo 1:2.5), drawdown massimo e protezione capitale.
     4. 📰 **Agente 4 (`Macro Sentiment, On-Chain & Orderflow Live Portal`)**: monitora flussi istituzionali, calendario macroeconomico e rotazione settoriale in diretta.
     5. 🖥️ **Agente 5 (`Ergonomic UI, 12 Monitor Themes & 0°/90° Split-Screen`)**: gestisce le 12 varianti colore monitor (Bloomberg Dark, TradingView Navy, Matrix Fosforo, Luce Solare, ecc.), tasti grandi Touch-First (`>=44px`) e rotazione `90° Landscape` (Grafico a sinistra + Pannello Ordini/Agenti a destra).
     6. 🔒 **Agente 6 (`Security SKILL.md Audit, Cache-Buster & Zero-Waste Token`)**: verifica ogni `SKILL.md`, forza l'aggiornamento istantaneo su iPhone/Android (zero schermo nero, zero `.mobileconfig` bloccanti) e riduce del 75% i token.
3. **10 Voci Neurali Studio HD M/F + Report Esecutivo PDF/CSV**:
   - Briefing vocale giornaliero in italiano naturale delle operazioni vagliate dal CED + esportazione immediata del **Piano di Trading, Diario Operativo e Analisi del Rischio in PDF e CSV**.
