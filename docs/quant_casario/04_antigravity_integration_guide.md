# 04. Guida all'Integrazione nel Progetto Antigravity

Questa guida descrive come integrare i moduli quantitativi all'interno dell'architettura del tuo software di trading semi-automatico Antigravity.

---

## 1. Architettura dei Flussi Dati e Connettività

```
[Broker Gateway: IBKR / Fix / Alpaca]
           │ WebSocket Feed (Ticks L1 / L2)
           ▼
[Antigravity Data Ingestion Worker]
           │ ZeroMQ PUSH/PULL (IPC Socket)
           ▼
[RealTimeAssetTracker Ring Buffers] ── (Aggiorna AVWAP, Z-Score O(1))
           │ Heartbeat Timer (ogni 150ms)
           ▼
[MultiTimeframeRanker Matrix Engine]
           │ JSON Payload via WebSocket
           ▼
[Antigravity Frontend GUI (React / Electron / Python Qt)]
```

### Stack Consigliato per le Prestazioni:
- **Broker Interface:** `ib_insync` per Interactive Brokers (copre Euronext Milan, US, CME Futures e Forex).
- **Inter-Process Communication:** `ZeroMQ` (`pyzmq`) per scambiare i tick tra il processo I/O e il processo analitico con latenza inferiore a 0.2 ms.
- **Time-Series Storage:** `QuestDB` o `TimescaleDB` per persistere i tick senza saturare la RAM.

---

## 2. Implementazione della UI Semi-Automatica

### Componenti Chiave della Dashboard Antigravity:
1. **Pannello Griglia Dinamica (Live Screener):**
   - Elenco titoli ordinati in tempo reale per `Confidence Score` decrescente.
   - Filtri a pulsante rapido: `Tutti`, `Solo Long (>65)`, `Solo Short (<-65)`.
   - Selettore orizzonte temporale: `1m`, `15m`, `1h`, `4h`, `1D`, `1W`, `1M`.
   - Slider Rischio: da `0.5%` a `2.5%` di rischio capitale per operazione.

2. **Scheda Ordine Pre-Compilata (Action Dispatcher):**
   - Cliccando su un titolo dalla griglia, l'app genera istantaneamente una proposta d'ordine:
     - Ticker & Direzione (BUY / SELL SHORT)
     - Quantità calcolata con Risk Parity ATR
     - Prezzo Limite (posizionato su AVWAP o POC)
     - Stop Loss e Take Profit (Bracket Order OCO)
   - **Safety TTL Counter:** Un contatore a scalare (10 secondi). Se l'utente non clicca su "CONFERMA ESECUZIONE", l'ordine si invalida automaticamente per proteggersi da deviazioni di prezzo improvvise.

3. **Master Risk Card ("Worst-Case Scenario"):**
   - Indicatore fisso a fondo schermo: calcola la perdita massima istantanea se tutti i trade correntemente aperti o proposti dovessero colpire lo Stop Loss contemporaneamente, bloccando ulteriori approvazioni se il rischio aggregato supera la soglia prefissata (es. 3.0% del conto).
