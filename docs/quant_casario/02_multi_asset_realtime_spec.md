# 02. Specifiche Tecniche Multi-Asset e Real-Time

Guida esaustiva per integrare nello screener e nell'engine asset eterogenei: Azioni Italiane (FTSE MIB e Mid-Cap), Azioni USA, Forex e Materie Prime.

---

## 1. Azioni Italiane (FTSE MIB & STAR Mid-Cap)

### Regole Microstrutturali di Borsa Italiana:
1. **Aste di Apertura e Chiusura (08:00-09:00 e 17:30-17:35 CET):**
   - Durante le aste i prezzi sono teorici e non riflettono continuità di flusso.
   - **Regola Codice:** Congelare l'ingestione dei tick tra 17:30:00 e 17:35:00 CET. Escludere la candela d'asta dal calcolo intraday di Z-score per evitare distorsioni statistiche.
2. **Filtro di Illiquidità per Mid-Cap (Amihud Illiquidity Ratio):**
   $$\text{Amihud}_t = \frac{|R_t|}{\text{Volume}_t \times P_t}$$
   - Se lo spread Bid-Ask supera lo **0.35%** o l'indice Amihud supera la soglia di tolleranza:
     - Blocco ordini a mercato (Market Orders).
     - Sono ammessi esclusivamente ordini limite passivi (Maker) posizionati sul Bid (per acquisti) o sull'Ask (per vendite).
3. **Filtro Rischio Sovrano (Spread BTP / Bund 10Y):**
   $$\text{Spread} = Y_{\text{BTP 10Y}} - Y_{\text{Bund 10Y}}$$
   - Se lo Spread supera **190-200 bps**, o se cresce con momentum a 10 giorni $> +15\%$:
     - Abbattimento immediato a 0 della size operativa su titoli bancari italiani (Intesa Sanpaolo, UniCredit, Banco BPM, BPER) e Mid-Cap industriali.
4. **Dividend Washing & Cedole:**
   - A maggio/giugno e novembre lo stacco dividendo provoca gap down artificiali.
   - Il motore deve interrogare l'agenda societaria e applicare una correzione:
     $$P_{\text{adjusted}} = P_{\text{raw}} + \text{Dividendo}$$
     ricalcolando l'ancora dell'AVWAP su serie corrette.

---

## 2. Azioni USA (S&P 500, Nasdaq, Mid-Cap USA)

1. **Frammentazione della Liquidità:**
   - I dati di volume arrivano frammentati (SIP, Direct feeds, Dark Pools TRF).
   - Utilizzare feed consolidati NBBO (National Best Bid and Offer).
2. **Volatilità Comparata:**
   - Monitoraggio del ratio $VIX / VIX3M$ come master switch per tutti i titoli dell'S&P 500.
   - Per titoli Nasdaq, integrare il ratio $VXN / VXN3M$.
3. **Circuit Breakers Macro USA:**
   - Blocco degli ordini semi-automatici nei 15 minuti precedenti e seguenti:
     - CPI (Consumer Price Index)
     - NFP (Non-Farm Payrolls)
     - Decisioni sui tassi FOMC e conferenza stampa Fed

---

## 3. Forex (FX Spot e Derivati)

1. **Assenza di Volume Centralizzato:**
   - Il Forex è un mercato OTC.
   - **Soluzione A:** Ingestione del volume reale dai contratti Futures CME (es. `6E` per EUR/USD, `6B` per GBP/USD, `6J` per JPY/USD).
   - **Soluzione B:** Sostituzione del Volume Profile con il **TPO (Time Price Opportunity)** basato sul tempo trascorso a ciascun livello.
2. **Finestra Critica di Rollover (23:00 CET / 17:00 EST):**
   - Durante il passaggio bancario New York - Tokyo, gli spread si allargano di 10-15 volte.
   - **Regola Codice (Hard Lock):** Disattivare qualsiasi esecuzione ordini tra le **22:55 e le 23:20 CET**.
3. **Differenziali di Rendimento Reale:**
   $$\Delta r_{\text{reale}} = (y_{\text{US 2Y}} - \text{CPI}_{\text{US}}) - (y_{\text{EU 2Y}} - \text{CPI}_{\text{EU}})$$
   - Guida il trend di fondo multiday su EUR/USD.

---

## 4. Materie Prime (Commodities: Petrolio, Oro, Rame)

1. **Term Structure dei Futures e Roll Yield:**
   $$\text{Roll Yield} = \frac{P_{\text{Front}} - P_{\text{Second}}}{P_{\text{Front}}}$$
   - **Backwardation (Roll Yield Positivo):** Domanda fisica immediata superiore all'offerta $\rightarrow$ bias algoritmico Long autorizzato.
   - **Contango (Roll Yield Negativo):** Costi di stoccaggio elevati, roll negativo per i fondi $\rightarrow$ divieto di trade Long multiday.
2. **Continuous Back-Adjustment:**
   - Utilizzare serie storiche corrette per differenza al roll del contratto, per evitare scalini artificiali su POC e AVWAP.
