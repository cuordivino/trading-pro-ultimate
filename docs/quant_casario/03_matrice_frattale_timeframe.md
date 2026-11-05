# 03. Matrice Frattale Multi-Timeframe e Scoring di Ranking

Guida dettagliata per adattare il motore di analisi quantitativa dai timeframe brevissimi (1 minuto) fino a lungo termine (1 mese), con classificazione asimmetrica Long e Short.

---

## 1. Pesi Dinamici della Matrice di Risonanza

Il Composite Score finale di ciascun asset è calcolato come:
$$\text{Composite Score} = \sum_{k} (W_k \times S_k) \times F_{\text{liquidity}}$$
dove $S_k \in [-100, +100]$ e $W_k$ variano a seconda del timeframe:

| Timeframe | Macro / Liquidity ($W_m$) | Trend Strutturale ($W_t$) | Volume & Microstruttura ($W_v$) | Statistica / Z-Score ($W_z$) |
| :--- | :---: | :---: | :---: | :---: |
| **1m (Scalping)** | 0.00 | 0.20 | 0.50 | 0.30 |
| **15m (Intraday rapido)** | 0.10 | 0.30 | 0.40 | 0.20 |
| **1h (Intraday direzionale)** | 0.20 | 0.35 | 0.25 | 0.20 |
| **4h - 1D (Swing Trading)** | 0.40 | 0.35 | 0.15 | 0.10 |
| **1W - 1M (Macro Asset Alloc)** | 0.60 | 0.30 | 0.05 | 0.05 |

---

## 2. Normalizzazione Tangente Iperbolica (Cross-Asset Scaler)

Per consentire il ranking coerente nello stesso pannello di uno strumento Forex (es. EUR/USD), un'azione italiana a media capitalizzazione e un titolo ad alta volatilità come Nvidia, ogni deviazione viene normalizzata via tangente iperbolica $\tanh$:

$$u_{\text{trend}} = \tanh\left( \frac{P_t - \text{AVWAP}_t}{k \cdot \text{ATR}_t} \right)$$

$$u_{\text{reversion}} = -\tanh\left( \frac{Z_t}{2.0} \right)$$

In questo modo tutti i sub-punteggi rimangono matematicamente limitati tra $-1.0$ e $+1.0$, garantendo uniformità nello screener.

---

## 3. Classificazione Asimmetrica Long / Short

- **Score $\ge +65$:** Candidato **STRONG LONG**.
- **Score $\le -65$:** Candidato **STRONG SHORT**.
- **Score tra $-35$ e $+35$:** Fascia **NEUTRAL / NO TRADE** (Capitale protetto).

### Filtro di Allineamento Vettoriale (Trend Alignment):
$$\vec{V}_{\text{alignment}} = \text{Sign}(S_{\text{Macro}}) + \text{Sign}(S_{\text{Daily}}) + \text{Sign}(S_{\text{Execution}})$$
- Se un trade a 1 minuto genera un segnale Long ma $S_{\text{Daily}} < -50$, il segnale viene declassato a *Quick Scalp* con Take Profit a $1 \times \text{ATR}$ oppure inibito se il profilo di rischio è impostato su "Conservativo".

---

## 4. Position Sizing Frattale basato su ATR e Volatilità

Data l'equity di conto $C$ e la tolleranza al rischio per trade $R_{\text{pct}}$:
$$\text{Capitale a Rischio} = C \times R_{\text{pct}} \times M_{\text{regime}}$$

Distanza Stop Loss:
$$\text{Stop Distance} = k_{\text{TF}} \times \text{ATR}_{14}$$
dove:
- $k_{\text{TF}} = 1.2$ per timeframe 1m - 5m
- $k_{\text{TF}} = 1.8$ per timeframe 15m - 1h
- $k_{\text{TF}} = 2.5$ per timeframe daily / weekly

Numero di contratti/azioni:
$$\text{Shares} = \left\lfloor \frac{\text{Capitale a Rischio}}{\text{Stop Distance}} \right\rfloor$$
