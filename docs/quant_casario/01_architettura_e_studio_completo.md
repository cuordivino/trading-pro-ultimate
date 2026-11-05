# 01. Studio Completo, Metodologia e Modelli Matematici

Questo documento raccoglie la totalità della teoria, dei modelli economici e delle formule matematiche discusse per replicare l'approccio analitico e quantitativo di Marco Casario.

---

## 1. Architettura Concettuale a 3 Livelli (Top-Down)

Il sistema non opera come un oscillatore tecnico isolato. Ogni decisione di trading viene gerarchicamente filtrata attraverso tre livelli:

```
[LIVELLO 1: Macro Regime Filter]
           │
           ▼
[LIVELLO 2: Market Breadth & Cross-Asset Confirmation]
           │
           ▼
[LIVELLO 3: Execution, Orderflow & Risk Management]
```

---

## 2. Il Modello Macro a 4 Quadranti (Growth / Inflation)

Ispirato al framework macro di Ray Dalio (Bridgewater) e Hedgeye, il mercato viene segmentato in base al tasso di variazione (Second Derivative / Rate of Change - RoC) di Crescita Economica ($G$) e Inflazione ($I$).

### Formula del Rate of Change (RoC a 6 mesi annualizzato):
$$RoC_6(X_t) = \left( \frac{X_t}{X_{t-6}} - 1 \right) \times 100$$

### Definizione dei Quadranti:
1. **Quadrante 1 (Goldilocks):** Crescita in accelerazione ($G \uparrow$), Inflazione in decelerazione ($I \downarrow$).
   - *Asset favoriti:* Azionario Growth, Big Tech, High Yield Bonds.
   - *Moltiplicatore Rischio Long Sistema:* 1.2x.
2. **Quadrante 2 (Overheating / Rifrazione):** Crescita in accelerazione ($G \uparrow$), Inflazione in accelerazione ($I \uparrow$).
   - *Asset favoriti:* Materie Prime (Energy, Industrial Metals), TIPS, Settore Energetico.
   - *Moltiplicatore Rischio Long Sistema:* 0.8x.
3. **Quadrante 3 (Stagflazione):** Crescita in decelerazione ($G \downarrow$), Inflazione in accelerazione ($I \uparrow$).
   - *Asset favoriti:* Oro (Gold), Liquidità, Settori difensivi (Healthcare, Consumer Staples).
   - *Moltiplicatore Rischio Long Sistema:* 0.4x (Forte hedging short).
4. **Quadrante 4 (Deflazione / Recessione):** Crescita in decelerazione ($G \downarrow$), Inflazione in decelerazione ($I \downarrow$).
   - *Asset favoriti:* Treasury a lunga scadenza (TLT), Obbligazioni Investment Grade, Utility.
   - *Moltiplicatore Rischio Long Sistema:* 0.0x - 0.2x (Cash / Posizioni Short su indici azionari).

---

## 3. Il Termometro della Liquidità (Fed Net Liquidity)

La liquidità delle banche centrali determina la marea sottostante che sostiene le valutazioni di mercato.

### Formula della Liquidità Netta USA:
$$\text{US Net Liquidity}_t = \text{WALCL}_t - \text{WTREGEN}_t - (\text{RRPONTSYD}_t \times 1000)$$

- **`WALCL` (Fed Total Assets):** Attivo totale di bilancio della Federal Reserve (in milioni USD).
- **`WTREGEN` (TGA - Treasury General Account):** Conto del Tesoro USA presso la Fed (in milioni USD). Quando sale, il Tesoro drena cassa dal sistema bancario.
- **`RRPONTSYD` (Overnight Reverse Repo):** Liquidità parcheggiata da banche e money market funds (in miliardi USD, moltiplicata per 1000 per uniformare a milioni).

### Momentum a 4 Settimane (Delta Liquidity):
$$\Delta L_t = \frac{L_t - L_{t-28}}{L_{t-28}}$$
*Se S&P 500 segna nuovi massimi ma $\Delta L_t < 0$, si genera un segnale di "Divergenza di Liquidità Ribassista": l'algoritmo blocca gli acquisti a rottura.*

---

## 4. Struttura del Rischio e Volatilità (VIX Curve & GEX)

### A. Term Structure Ratio del VIX
$$R_{\text{vol}} = \frac{\text{VIX}_t}{\text{VIX3M}_t}$$
- **$R_{\text{vol}} \le 0.92$ (Contango Netto):** Volatilità a breve inferiore a quella a medio termine. Struttura sana di mercato toro $\rightarrow$ segnali Long pienamente abilitati.
- **$0.92 < R_{\text{vol}} \le 1.00$ (Transizione):** Compressione o possibile cambio di regime.
- **$R_{\text{vol}} > 1.00$ (Backwardation):** Panico a breve termine. L'algoritmo attiva il *Circuit Breaker*: vietati nuovi ordini Long a leva; gli stop loss vengono allargati o le posizioni ridotte.

### B. Gamma Exposure (GEX) & Zero Gamma Level
- **Positive Gamma Regime ($Spot > \text{Zero Gamma}$):** I market maker vendono quando il mercato sale e comprano quando scende (hedging mean-reverting). Il mercato è compresso, ideale per strategie range-bound.
- **Negative Gamma Regime ($Spot < \text{Zero Gamma}$):** I market maker amplificano i movimenti vendendo quando scende e comprando quando sale. Volatilità esplosiva $\rightarrow$ l'app deve utilizzare ordini stop a rottura.

---

## 5. Microstruttura di Prezzo e Volume

### A. Anchored VWAP (AVWAP)
$$\text{AVWAP}_t = \frac{\sum_{i=t_0}^{t} P_i \cdot V_i}{\sum_{i=t_0}^{t} V_i}$$
Dove:
- $P_i = \frac{H_i + L_i + C_i}{3}$ (Typical Price).
- $t_0$ è l'evento di ancoraggio: inizio anno (YTD), giorno del rilascio CPI/FOMC, o minimo strutturale di swing.

### B. Z-Score Statistico su Media Mobile
$$Z_t = \frac{P_t - \mu_{t, N}}{\sigma_{t, N}}$$
- Se $Z > +2.0$: Ipercomprato statistico. L'algoritmo proibisce acquisti a mercato (anti-chasing).
- Se $-1.8 \le Z \le -0.8$ con $P_t > \text{AVWAP}$: Condizione ideale di "Pullback Istituzionale".

### C. Volume Profile (POC, VAH, VAL)
- **Point of Control (POC):** Livello di prezzo con il maggior volume scambiato nel periodo.
- **Value Area (70%):** Delimitata da Value Area High (VAH) e Value Area Low (VAL).
