import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'trading_platform.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Trades Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            side TEXT NOT NULL,
            entry_price REAL NOT NULL,
            exit_price REAL,
            qty REAL NOT NULL,
            leverage INTEGER DEFAULT 1,
            sl REAL,
            tp REAL,
            pnl REAL DEFAULT 0.0,
            status TEXT DEFAULT 'OPEN',
            investor_skill TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            closed_at TEXT
        )
    ''')
    
    # Alerts Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            condition TEXT NOT NULL,
            target_price REAL NOT NULL,
            skill_slug TEXT,
            active INTEGER DEFAULT 1,
            triggered INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Settings Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    ''')

    # Seed default settings if empty
    cursor.execute('SELECT COUNT(*) FROM settings')
    if cursor.fetchone()[0] == 0:
        defaults = {
            'initial_capital': '25000',
            'current_capital': '25000',
            'risk_percentage': '1.5',
            'risk_profile': 'moderate',
            'telegram_token': '8933669800:AAG-kfsZezwSVWJ6ai6YoTmEVRxCP7_NL7I',
            'telegram_chat_id': '947710688',
            'bybit_key': '',
            'bybit_secret': '',
            'alpaca_key': '',
            'alpaca_secret': '',
            'twelvedata_key': '9f793095b1004638b251baa4013e667d',
            'openai_key': '',
            'gemini_key': ''
        }
        for k, v in defaults.items():
            cursor.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', (k, v))
            
    conn.commit()
    conn.close()

def get_trades(limit=100):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM trades ORDER BY id DESC LIMIT ?', (limit,))
    rows = cursor.fetchall()
    trades = [dict(r) for r in rows]
    conn.close()
    return trades

def add_trade(trade_data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO trades (symbol, side, entry_price, exit_price, qty, leverage, sl, tp, pnl, status, investor_skill, notes, created_at, closed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        trade_data.get('symbol', 'BTCUSDT'),
        trade_data.get('side', 'LONG'),
        float(trade_data.get('entry_price', 0.0)),
        float(trade_data.get('exit_price', 0.0)) if trade_data.get('exit_price') else None,
        float(trade_data.get('qty', 1.0)),
        int(trade_data.get('leverage', 1)),
        float(trade_data.get('sl', 0.0)) if trade_data.get('sl') else None,
        float(trade_data.get('tp', 0.0)) if trade_data.get('tp') else None,
        float(trade_data.get('pnl', 0.0)),
        trade_data.get('status', 'OPEN'),
        trade_data.get('investor_skill', ''),
        trade_data.get('notes', ''),
        trade_data.get('created_at', datetime.now().isoformat()),
        trade_data.get('closed_at')
    ))
    trade_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return trade_id

def close_trade(trade_id, exit_price, pnl):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE trades 
        SET exit_price = ?, pnl = ?, status = 'CLOSED', closed_at = ?
        WHERE id = ?
    ''', (exit_price, pnl, datetime.now().isoformat(), trade_id))
    conn.commit()
    conn.close()

def delete_trade(trade_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM trades WHERE id = ?', (trade_id,))
    conn.commit()
    conn.close()

def get_alerts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM alerts ORDER BY id DESC')
    rows = cursor.fetchall()
    alerts = [dict(r) for r in rows]
    conn.close()
    return alerts

def add_alert(alert_data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO alerts (symbol, condition, target_price, skill_slug, active, triggered, created_at)
        VALUES (?, ?, ?, ?, 1, 0, ?)
    ''', (
        alert_data.get('symbol', ''),
        alert_data.get('condition', 'ABOVE'),
        float(alert_data.get('target_price', 0.0)),
        alert_data.get('skill_slug', ''),
        datetime.now().isoformat()
    ))
    alert_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return alert_id

def delete_alert(alert_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM alerts WHERE id = ?', (alert_id,))
    conn.commit()
    conn.close()

def get_settings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT key, value FROM settings')
    rows = cursor.fetchall()
    settings = {r['key']: r['value'] for r in rows}
    conn.close()
    return settings

def update_settings(settings_dict):
    conn = get_db()
    cursor = conn.cursor()
    for k, v in settings_dict.items():
        cursor.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', (k, str(v)))
    conn.commit()
    conn.close()

# Initialize immediately
init_db()
