import os
import yaml
import math
import random
from datetime import datetime

SKILLS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'skills_repo', 'skills'))

# In-memory store for loaded skills
_skills_cache = {}

def get_category_for_slug(slug: str, style: str = '') -> str:
    s = (slug + ' ' + style).lower()
    if any(k in s for k in ['buffett', 'munger', 'graham', 'lynch', 'klarman', 'sleep', 'li-lu', 'schloss', 'danbin', 'duan', 'qiuguolu', 'value', 'compounder']):
        return 'value_quality'
    if any(k in s for k in ['dalio', 'druckenmiller', 'soros', 'ptj', 'gundlach', 'tepper', 'libei', 'shihanbing', 'macro', 'allweather', 'interest']):
        return 'macro_cycles'
    if any(k in s for k in ['minervini', 'livermore', 'oneil', 'darvas', 'turtle', 'seykota', 'tangnengtong', 'chenhao', 'breakout', 'vcp', 'momentum', 'trend']):
        return 'momentum_breakouts'
    if any(k in s for k in ['simons', 'quant', 'stat-arb']):
        return 'quant_systematic'
    if any(k in s for k in ['burry', 'einhorn', 'hindenburg', 'muddy', 'spruce', 'fengliu', 'short', 'forensic']):
        return 'short_forensic'
    if any(k in s for k in ['ackman', 'icahn', 'greenblatt', 'hohn', 'activist', 'special-situations']):
        return 'activist_special'
    if any(k in s for k in ['hayes', 'a16z-crypto', 'paradigm', 'multicoin', 'willy', 'cobie', 'cryptocred', 'hsaka', 'delphi', 'ansem', 'grayscale', 'crypto', 'onchain']):
        return 'crypto_native'
    return 'vc_innovation'

def load_all_skills():
    global _skills_cache
    if _skills_cache:
        return _skills_cache

    if not os.path.exists(SKILLS_DIR):
        return {}

    skills = {}
    for slug in sorted(os.listdir(SKILLS_DIR)):
        skill_path = os.path.join(SKILLS_DIR, slug)
        if not os.path.isdir(skill_path):
            continue

        inv_file = os.path.join(skill_path, 'invest.md')
        skill_file = os.path.join(skill_path, 'SKILL.md')

        info = {
            'slug': slug,
            'name': slug.replace('-', ' ').title(),
            'investor': slug.replace('-', ' ').title(),
            'style': 'Investment Judgment',
            'timeHorizon': 'Flexible',
            'description': '',
            'signals': {},
            'filters': {},
            'sizing': {},
            'invalidation': '',
            'category': 'value_quality',
            'has_invest': False,
            'has_skill': os.path.exists(skill_file)
        }

        # Parse invest.md if present
        if os.path.exists(inv_file):
            try:
                with open(inv_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if content.startswith('---'):
                        parts = content.split('---', 2)
                        if len(parts) >= 2:
                            data = yaml.safe_load(parts[1])
                            if isinstance(data, dict):
                                info.update({
                                    'name': data.get('name', info['name']),
                                    'investor': data.get('investor', info['investor']),
                                    'style': data.get('style', info['style']),
                                    'timeHorizon': data.get('timeHorizon', info['timeHorizon']),
                                    'description': data.get('description', ''),
                                    'circleOfCompetence': data.get('circleOfCompetence', []),
                                    'marketRegime': data.get('marketRegime', {}),
                                    'signals': data.get('signals', {}),
                                    'filters': data.get('filters', {}),
                                    'sizing': data.get('sizing', {}),
                                    'invalidation': data.get('invalidation', ''),
                                    'has_invest': True
                                })
            except Exception:
                pass

        # Parse SKILL.md for process & triggers
        if os.path.exists(skill_file):
            try:
                with open(skill_file, 'r', encoding='utf-8') as f:
                    skill_text = f.read()
                    info['skill_text'] = skill_text
                    if not info['description'] and 'description:' in skill_text:
                        for line in skill_text.split('\n'):
                            if line.strip().startswith('description:'):
                                info['description'] = line.split('description:', 1)[1].strip(' "')
                                break
            except Exception:
                pass

        info['category'] = get_category_for_slug(slug, info.get('style', ''))
        skills[slug] = info

    _skills_cache = skills
    return skills

def get_skill_details(slug: str):
    skills = load_all_skills()
    return skills.get(slug)

# ==========================================
# TECHNICAL & QUANTITATIVE METRICS
# ==========================================
def calculate_metrics(candles):
    if not candles or len(candles) < 20:
        return {}

    closes = [c['close'] for c in candles]
    highs = [c['high'] for c in candles]
    lows = [c['low'] for c in candles]
    volumes = [c['volume'] for c in candles]
    
    current_price = closes[-1]
    
    def sma(data, period):
        if len(data) < period:
            return sum(data) / len(data)
        return sum(data[-period:]) / period

    sma20 = sma(closes, 20)
    sma50 = sma(closes, min(50, len(closes)))
    sma200 = sma(closes, min(200, len(closes)))

    # RSI 14
    changes = [closes[i] - closes[i-1] for i in range(1, len(closes))]
    gains = [max(0, ch) for ch in changes[-14:]]
    losses = [max(0, -ch) for ch in changes[-14:]]
    avg_gain = sum(gains) / 14 if gains else 0
    avg_loss = sum(losses) / 14 if losses else 0
    rs = (avg_gain / avg_loss) if avg_loss != 0 else 100
    rsi = 100 - (100 / (1 + rs))

    # ATR proxy
    tr_list = []
    for i in range(1, min(15, len(candles))):
        hl = highs[-i] - lows[-i]
        hc = abs(highs[-i] - closes[-i-1])
        lc = abs(lows[-i] - closes[-i-1])
        tr_list.append(max(hl, hc, lc))
    atr = sum(tr_list) / len(tr_list) if tr_list else (current_price * 0.02)
    atr_pct = (atr / current_price) * 100

    # Volume dry-up
    recent_vol = sum(volumes[-3:]) / 3 if len(volumes) >= 3 else 1
    avg_vol = sum(volumes[-20:]) / 20 if len(volumes) >= 20 else 1
    vol_dry_up_ratio = recent_vol / avg_vol if avg_vol > 0 else 1.0

    highest = max(highs)
    lowest = min(lows)
    dist_from_high_pct = ((highest - current_price) / highest) * 100

    # VCP Contraction detection
    recent_range = max(highs[-5:]) - min(lows[-5:])
    prev_range = max(highs[-15:-5]) - min(lows[-15:-5]) if len(highs) >= 15 else recent_range
    is_contracting = recent_range < (prev_range * 0.75)

    # Momentum Z-score
    slice_20 = closes[-20:]
    mean_20 = sum(slice_20) / len(slice_20)
    variance = sum((x - mean_20) ** 2 for x in slice_20) / len(slice_20)
    std_20 = math.sqrt(variance) if variance > 0 else 0.0001
    z_score = (current_price - mean_20) / std_20

    return {
        'price': current_price,
        'sma20': round(sma20, 2),
        'sma50': round(sma50, 2),
        'sma200': round(sma200, 2),
        'stage2_trend': current_price > sma50 and sma50 >= sma200 * 0.98,
        'rsi': round(rsi, 1),
        'atr': round(atr, 2),
        'atr_pct': round(atr_pct, 2),
        'vol_dry_up_ratio': round(vol_dry_up_ratio, 2),
        'vol_dry_up': vol_dry_up_ratio < 0.85,
        'dist_from_high_pct': round(dist_from_high_pct, 2),
        'is_contracting': is_contracting,
        'z_score': round(z_score, 2),
        'highest': highest,
        'lowest': lowest
    }

# ==========================================
# MASTER INVESTOR EVALUATION PERSONAS
# ==========================================
def evaluate_buffett(metrics, is_crypto_asset):
    if is_crypto_asset:
        return {
            'investor': 'Warren Buffett',
            'slug': 'buffett',
            'style': 'Value & Moat',
            'pillar': 'Moat & Intrinsic Value',
            'score': 18,
            'verdict': 'TOO HARD / PASS',
            'summary': 'Asset non produttivo al di fuori del circolo di competenza. Non genera utili per i proprietari né dividendi reali.',
            'signals_met': ['Nessun dividendo tangibile o flusso di cassa operativo'],
            'risks': ['Mancanza di moat protettivo', 'Asset puramente speculativo'],
            'invalidation': 'Asset non produce flussi di cassa o utili (Owner Earnings)',
            'target_price': None,
            'stop_loss': None
        }
    
    p = metrics.get('price', 100)
    rsi = metrics.get('rsi', 50)
    dist_high = metrics.get('dist_from_high_pct', 10)
    
    score = 60
    signals = []
    if dist_high > 15:
        score += 20
        signals.append(f'Sconto del {dist_high:.1f}% sui massimi (Margine di Sicurezza in espansione)')
    if rsi < 45:
        score += 15
        signals.append('Prezzo sotto pressione emotiva temporanea di mercato')
    if metrics.get('price') < metrics.get('sma200', p):
        signals.append('Quotazione a sconto sulla media mobile di lungo periodo (200 SMA)')
        score += 5
    
    score = min(92, max(35, score))
    verdict = 'BUY / VALUE COMPOUNDER' if score >= 75 else ('WATCHLIST' if score >= 55 else 'PASS')
    
    return {
        'investor': 'Warren Buffett',
        'slug': 'buffett',
        'style': 'Value & Moat',
        'pillar': 'Moat & Intrinsic Value',
        'score': score,
        'verdict': verdict,
        'summary': 'Azienda con solido posizionamento economico. Richiede margine di sicurezza conservativo prima dell’acquisto.',
        'signals_met': signals or ['Prezzo in linea con le valutazioni storiche'],
        'risks': ['Erosione del potere di determinazione dei prezzi (Pricing Power)', 'Allocazione del capitale del management'],
        'invalidation': f'Rottura del supporto strutturale a ${round(p * 0.85, 2)} o deterioramento dei margini operativi',
        'target_price': round(p * 1.30, 2),
        'stop_loss': round(p * 0.85, 2)
    }

def evaluate_minervini(metrics):
    p = metrics.get('price', 100)
    stage2 = metrics.get('stage2_trend', False)
    contracting = metrics.get('is_contracting', False)
    vol_dry = metrics.get('vol_dry_up', False)
    dist_high = metrics.get('dist_from_high_pct', 20)
    rsi = metrics.get('rsi', 50)
    
    score = 40
    signals = []
    
    if stage2:
        score += 25
        signals.append('Stage-2 Uptrend Confermato (Prezzo > SMA50 > SMA200)')
    if contracting:
        score += 15
        signals.append('VCP (Volatility Contraction Pattern) in fase finale di compressione')
    if vol_dry:
        score += 15
        signals.append('Volume Dry-Up: offerta esausta vicino al punto pivot')
    if dist_high < 12:
        score += 10
        signals.append('Prezzo vicino ai massimi (< 12% dal picco): forza relativa dominante')
    if 55 <= rsi <= 72:
        score += 5
        signals.append('RSI costruttivo in zona momentum positivo (55-72)')

    score = min(98, score)
    verdict = 'STRONG BUY (PIVOT BREAKOUT)' if score >= 85 else ('WATCHLIST (VCP FORMING)' if score >= 65 else 'AVOID (NO TREND)')

    sl = round(p * 0.94, 2)
    tp = round(p * 1.18, 2)

    return {
        'investor': 'Mark Minervini',
        'slug': 'minervini-vcp',
        'style': 'Momentum + VCP Breakout',
        'pillar': 'Trend & VCP Contraction',
        'score': score,
        'verdict': verdict,
        'summary': 'Analisi SEPA / Volatility Contraction. Contrazione delle vendite prima del breakout esplosivo.',
        'signals_met': signals or ['Consolidamento informe, attendere contrazione'],
        'risks': ['Falso breakout con espansione improvvisa dei volumi in vendita', 'Mercato generale in distribuzione'],
        'invalidation': f'Chiusura sotto lo Stop Loss matematico a ${sl} (Max perdita -6%)',
        'target_price': tp,
        'stop_loss': sl
    }

def evaluate_dalio(metrics, is_crypto_asset):
    atr_pct = metrics.get('atr_pct', 2.0)
    p = metrics.get('price', 100)
    
    score = 65
    signals = []
    
    if atr_pct > 4.5:
        score -= 20
        signals.append(f'Alta volatilità (ATR {atr_pct:.1f}%): richiede drastico ridimensionamento della posizione (Risk Parity)')
    else:
        score += 15
        signals.append(f'Volatilità contenuta (ATR {atr_pct:.1f}%): compatibile con allocazione All-Weather')
        
    if metrics.get('price') > metrics.get('sma50', p):
        score += 10
        signals.append('Asset coerente con la fase attuale del ciclo di liquidità')

    verdict = 'ALLOCATE (BALANCED)' if score >= 70 else ('HEDGE / UNDERWEIGHT' if score < 50 else 'NEUTRAL')

    return {
        'investor': 'Ray Dalio',
        'slug': 'dalio-principles-allweather',
        'style': 'Macro & Risk Parity',
        'pillar': 'Macro Regime & Volatility',
        'score': score,
        'verdict': verdict,
        'summary': 'Framework della Macchina Economica. Controllo rigoroso delle correlazioni e bilanciamento della volatilità.',
        'signals_met': signals,
        'risks': ['Svolta restrittiva della liquidità bancaria', 'Shock inflattivo non prezzato'],
        'invalidation': f'Divergenza macro o breakdown sotto ${round(p * 0.90, 2)}',
        'target_price': round(p * 1.15, 2),
        'stop_loss': round(p * 0.92, 2)
    }

def evaluate_simons(metrics):
    p = metrics.get('price', 100)
    z_score = metrics.get('z_score', 0)
    rsi = metrics.get('rsi', 50)
    
    score = 50
    signals = []
    
    if z_score < -1.8:
        score += 35
        signals.append(f'Anomalia statistica (Z-Score: {z_score:.2f}): elevata probabilità di Mean Reversion rialzista')
    elif z_score > 2.2:
        score -= 25
        signals.append(f'Estensione statistica eccessiva (Z-Score: {z_score:.2f}): rischio di pullback verso la media')
    else:
        score += 15
        signals.append(f'Z-Score nel canale di normalità statistica ({z_score:.2f})')

    if rsi < 35:
        score += 20
        signals.append('Filtro Quant: anomalia di ipervenduto estremo')

    verdict = 'QUANT LONG EDGE' if score >= 75 else ('QUANT SHORT EDGE' if score <= 40 else 'NO STATISTICAL EDGE')

    return {
        'investor': 'Jim Simons',
        'slug': 'simons-quant',
        'style': 'Quant & Stat-Arb',
        'pillar': 'Statistical Mean Reversion',
        'score': score,
        'verdict': verdict,
        'summary': 'Modello probabilistico matematico Medallion. Riconoscimento di anomalie non casuali nei rendimenti.',
        'signals_met': signals,
        'risks': ['Cambiamento improvviso di regime statistico', 'Rumore di mercato che supera il segnale'],
        'invalidation': f'Superamento della 3° deviazione standard a ${round(p * 0.95, 2)}',
        'target_price': round(p * 1.08, 2),
        'stop_loss': round(p * 0.96, 2)
    }

def evaluate_burry(metrics):
    p = metrics.get('price', 100)
    rsi = metrics.get('rsi', 50)
    dist_high = metrics.get('dist_from_high_pct', 10)
    
    score = 50
    signals = []
    
    if dist_high > 35:
        score += 35
        signals.append(f'Crollo del {dist_high:.1f}%: potenziale scommessa asimmetrica contrarian profonda')
    elif dist_high < 3 and rsi > 75:
        score = 25
        signals.append('Euforia sui massimi: setup per posizionamento asimmetrico ribassista (Short)')
    else:
        score += 10
        signals.append('Profilo di asimmetria standard')

    verdict = 'ASYMMETRIC CONTRARIAN BUY' if score >= 75 else ('SHORT SETUP' if score <= 30 else 'WATCHLIST')

    return {
        'investor': 'Michael Burry',
        'slug': 'burry-asymmetric-contrarian',
        'style': 'Asymmetric Contrarian',
        'pillar': 'Asymmetric Contrarian Skew',
        'score': score,
        'verdict': verdict,
        'summary': 'Analisi dei dettagli contabili e del consensus errato di mercato. Cerca asimmetrie estreme a basso costo.',
        'signals_met': signals,
        'risks': ['Il mercato può restare irrazionale più a lungo di quanto tu possa restare solvibile'],
        'invalidation': f'Superamento dei livelli di tolleranza a ${round(p * 0.88, 2)}',
        'target_price': round(p * 1.45, 2),
        'stop_loss': round(p * 0.88, 2)
    }

def evaluate_livermore(metrics):
    p = metrics.get('price', 100)
    dist_high = metrics.get('dist_from_high_pct', 20)
    
    score = 50
    signals = []
    
    if dist_high < 5:
        score += 35
        signals.append('Prezzo su Punto Pivot Critico (Pivotal Point): linea di minor resistenza al rialzo')
    elif metrics.get('price') > metrics.get('sma20', p):
        score += 15
        signals.append('Trend di breve termine integro: principio di accumulazione piramidale attivo')

    verdict = 'BUY ON PIVOT BREAKOUT' if score >= 80 else 'WAIT FOR PIVOTAL POINT'

    return {
        'investor': 'Jesse Livermore',
        'slug': 'livermore',
        'style': 'Tape Reading & Pivots',
        'pillar': 'Tape Reading & Pivotal Points',
        'score': score,
        'verdict': verdict,
        'summary': 'Segui la linea di minor resistenza. Compra sui punti pivot e piramida solo sulle posizioni in utile.',
        'signals_met': signals,
        'risks': ['Esitazione del prezzo al punto pivot o inversione immediata dei volumi'],
        'invalidation': f'Perdita del punto pivot a ${round(p * 0.93, 2)}',
        'target_price': round(p * 1.25, 2),
        'stop_loss': round(p * 0.93, 2)
    }

# ==========================================
# MASTER COMMITTEE CONSENSUS & RADAR PILLARS
# ==========================================
def run_investor_committee(symbol: str, quote: dict, candles: list):
    metrics = calculate_metrics(candles)
    is_crypto_asset = quote.get('type') == 'crypto'
    
    council = [
        evaluate_buffett(metrics, is_crypto_asset),
        evaluate_minervini(metrics),
        evaluate_dalio(metrics, is_crypto_asset),
        evaluate_simons(metrics),
        evaluate_burry(metrics),
        evaluate_livermore(metrics)
    ]
    
    scores = [m['score'] for m in council]
    avg_score = round(sum(scores) / len(scores))
    
    # Radar dimensions
    pillars = {
        'moat': council[0]['score'],
        'technical_vcp': council[1]['score'],
        'macro': council[2]['score'],
        'quant': council[3]['score'],
        'contrarian': council[4]['score'],
        'pivots': council[5]['score']
    }

    valid_tps = [m['target_price'] for m in council if m.get('target_price')]
    valid_sls = [m['stop_loss'] for m in council if m.get('stop_loss')]
    
    consensus_tp = round(sum(valid_tps) / len(valid_tps), 2) if valid_tps else round(quote['price'] * 1.15, 2)
    consensus_sl = round(sum(valid_sls) / len(valid_sls), 2) if valid_sls else round(quote['price'] * 0.94, 2)

    if avg_score >= 78:
        consensus_verdict = 'FORTE CONSENSO RIALZISTA (CONVICTION BUY)'
        bias = 'BULLISH'
    elif avg_score >= 62:
        consensus_verdict = 'ACCUMULAZIONE PRUDENTE (MODERATE BUY)'
        bias = 'MODERATE_BULLISH'
    elif avg_score >= 48:
        consensus_verdict = 'CONSIGLIO DIVISO / ATTENDERE CONFERME (WATCHLIST)'
        bias = 'NEUTRAL'
    else:
        consensus_verdict = 'ELEVATO RISCHIO INVALIDAZIONE (CAUTION / PASS)'
        bias = 'BEARISH'

    return {
        'symbol': symbol,
        'price': quote.get('price', 0),
        'metrics': metrics,
        'consensus_score': avg_score,
        'consensus_verdict': consensus_verdict,
        'bias': bias,
        'consensus_target_price': consensus_tp,
        'consensus_stop_loss': consensus_sl,
        'recommended_risk_pct': 1.0 if avg_score < 60 else (2.0 if avg_score >= 80 else 1.5),
        'pillars': pillars,
        'council': council,
        'timestamp': datetime.now().isoformat()
    }

# ==========================================
# INTERACTIVE PERSONA CHATBOT
# ==========================================
def generate_investor_chat_reply(investor_slug: str, user_prompt: str, symbol: str, quote: dict):
    skill = get_skill_details(investor_slug)
    name = skill.get('investor', 'L’Investitore') if skill else 'Esperto'
    price = quote.get('price', 0)
    change = quote.get('change', 0)

    if 'buffett' in investor_slug:
        return (
            f"Saluti. Qui parla Warren Buffett. Su **{symbol}** (quotato a circa ${price}, variazione: {change}%):\n\n"
            f"Regola n. 1: Non perdere mai denaro. Regola n. 2: Non dimenticare mai la regola n. 1.\n\n"
            f"La mia domanda fondamentale prima di toccare qualsiasi titolo è: **comprendiamo il business a fondo?** "
            f"Ha un fossato competitivo (Economic Moat) inespugnabile che tra 10 o 20 anni continuerà a generare consistenti 'Owner Earnings' "
            f"con un elevato ritorno sul capitale investito (ROIC > 15%)?\n\n"
            f"Se il mercato offre un prezzo con un ampio Margine di Sicurezza rispetto al suo reale valore intrinseco, allora siamo acquirenti. "
            f"Altrimenti, come dice il mio socio Charlie Munger, 'il grande denaro non si fa comprando o vendendo, ma aspettando'."
        )
    elif 'minervini' in investor_slug:
        return (
            f"Ciao trader, qui Mark Minervini. Guardando il grafico tecnico di **{symbol}** (${price}):\n\n"
            f"Per il mio sistema SEPA, non mi interessa comprare al minimo. Io voglio comprare **esattamente prima che il prezzo esploda al rialzo!**\n\n"
            f"Cosa esigo per entrare?\n"
            f"1. **Stage 2 Uptrend confermato**: il prezzo deve trovarsi sopra le medie a 50 e 200 giorni.\n"
            f"2. **VCP (Volatility Contraction Pattern)**: contrazioni successive sempre più strette (es. -12%, poi -6%, poi -2%).\n"
            f"3. **Volume Dry-Up**: i volumi devono prosciugarsi prima del breakout del punto pivot.\n\n"
            f"Regola aurea: Stop Loss matematico e irremovibile fissato a massimo -5% o -7%. Se il trade non si muove a favore immediatamente, si taglia senza pietà!"
        )
    elif 'dalio' in investor_slug:
        return (
            f"Salve, sono Ray Dalio di Bridgewater. La prospettiva macro su **{symbol}** (${price}):\n\n"
            f"Ogni mercato è governato dalla 'Macchina Economica': cicli del debito a breve e lungo termine, e dinamiche di cassa/liquidità.\n\n"
            f"Non scommettere mai tutto il tuo capitale su un solo esito. Nel nostro approccio **All-Weather & Risk Parity**, "
            f"ponderiamo ogni posizione in base alla sua volatilità intrinseca, non al valore nominale in euro.\n\n"
            f"Chiediti: in quale quadrante macro ci troviamo per questo asset? Crescita sopra le attese o inflazione che sorprende? "
            f"Mantieni sempre correlazioni non correlate nel tuo portafoglio."
        )
    elif 'simons' in investor_slug:
        return (
            f"Saluti dal Renaissance Technologies. Jim Simons qui.\n\n"
            f"Non abbiamo alcuna opinione emotiva su **{symbol}**. I mercati non sono casuali, ma contengono minuscole anomalie statistiche.\n\n"
            f"Analizzando i segnali quantitativi su questo titolo a ${price}:\n"
            f"Misuriamo la persistenza del momentum vs il decadimento della media (Mean Reversion Z-Score). "
            f"Se il segnale supera il nostro rapporto segnale/rumore e il modello di Sharpe calcolato supera la soglia, "
            f"eseguiamo il trade con decine di migliaia di micro-ordini e controllo dinamico dell'esposizione.\n\n"
            f"I modelli matematici battono sempre l’intuizione umana."
        )
    elif 'burry' in investor_slug:
        return (
            f"Qui Michael Burry (Scion Asset Management).\n\n"
            f"Tutti guardano quello che fa la folla su **{symbol}** (${price}). Io passo le mie notti a spulciare i bilanci aziendali, "
            f"le note a piè di pagina dei moduli 10-K e le scadenze del debito societario.\n\n"
            f"Cerco scommesse **profondamente asimmetriche**: situazioni in cui il downside è rigorosamente limitato o coperto, "
            f"ma il mercato sta prezzando uno scenario catastrofico o, al contrario, un'euforia irrealistica che permette un posizionamento short asimmetrico.\n\n"
            f"Non abbiate paura di essere i soli ad avere ragione. Spesso essere in anticipo sembra uguale a sbagliare, finché la realtà non bussa alla porta."
        )
    else:
        return (
            f"Benvenuto nel terminale Investor Skills. Sono {name}.\n\n"
            f"Applicando il mio modello decisionale su **{symbol}** (ultimo prezzo: ${price}):\n"
            f"Secondo la mia filosofia ({skill.get('style', 'Strategica')}), il fattore decisivo per entrare a mercato "
            f"è la rigorosa disciplina tra il segnale di ingresso e il controllo del rischio.\n\n"
            f"Prima di aprire un'operazione, definisci chiaramente la condizione di invalidazione del trade: a quale prezzo "
            f"la tua ipotesi iniziale si rivela falsa? Proteggi sempre il capitale prima di pensare al profitto."
        )
