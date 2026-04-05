#!/usr/bin/env python3
"""
Export candle data from binance.db for the website's Lightweight Charts visualization.

Reads 5-minute candles, resamples to multiple timeframes, and saves as JSON files.
File size management:
  - 5m:  last 3 months only
  - 15m: last 6 months only
  - 1h+: all data from 2023-06-01 onwards
"""

import json
import os
import sqlite3
from datetime import datetime, timedelta, timezone

import pandas as pd

# --- Configuration ---

DB_PATH = "/Users/admin/Desktop/crypto/binance.db"
OUTPUT_DIR = "/Users/admin/Desktop/crypto/website/public/candles"
START_DATE = "2023-06-01"

COINS = [
    "BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "NEARUSDT", "SUIUSDT",
    "LINKUSDT", "AVAXUSDT", "ADAUSDT", "ICPUSDT", "APTUSDT", "DOGEUSDT",
    "BNBUSDT", "DOTUSDT", "UNIUSDT", "ATOMUSDT", "HBARUSDT",
]

# Timeframe configs: (label, pandas resample rule, lookback months or None for all)
TIMEFRAMES = [
    ("5m",  None,   3),    # No resample needed, last 3 months
    ("15m", "15min", 6),   # Last 6 months
    ("1h",  "1h",   None), # All data from START_DATE
    ("4h",  "4h",   None),
    ("1d",  "1D",   None),
]

# Coins where price > $10,000 — use 1 decimal place; others use 2
HIGH_PRICE_COINS = {"BTCUSDT"}


def load_candles(coin: str) -> pd.DataFrame:
    """Load 5m candles from sqlite for a single coin, from START_DATE onwards."""
    conn = sqlite3.connect(DB_PATH)
    query = """
        SELECT datetime_utc, open, high, low, close, volume
        FROM candles
        WHERE market = ? AND unit = 5 AND datetime_utc >= ?
        ORDER BY datetime_utc
    """
    df = pd.read_sql_query(query, conn, params=(coin, START_DATE))
    conn.close()

    if df.empty:
        return df

    df["datetime_utc"] = pd.to_datetime(df["datetime_utc"])
    df = df.set_index("datetime_utc")
    # Drop duplicates (shouldn't exist but be safe)
    df = df[~df.index.duplicated(keep="last")]
    return df


def resample_ohlcv(df: pd.DataFrame, rule: str) -> pd.DataFrame:
    """Resample OHLCV data to a larger timeframe."""
    resampled = df.resample(rule).agg({
        "open": "first",
        "high": "max",
        "low": "min",
        "close": "last",
        "volume": "sum",
    }).dropna(subset=["open"])
    return resampled


def trim_by_months(df: pd.DataFrame, months: int | None) -> pd.DataFrame:
    """Keep only the last N months of data. If months is None, return all."""
    if months is None or df.empty:
        return df
    cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=months * 30)
    return df[df.index >= cutoff]


def df_to_json(df: pd.DataFrame, decimals: int) -> list[dict]:
    """Convert DataFrame to list of dicts for Lightweight Charts."""
    records = []
    for ts, row in df.iterrows():
        records.append({
            "time": ts.strftime("%Y-%m-%dT%H:%M:%S"),
            "open": round(row["open"], decimals),
            "high": round(row["high"], decimals),
            "low": round(row["low"], decimals),
            "close": round(row["close"], decimals),
            "volume": round(row["volume"], 2),
        })
    return records


def export_coin(coin: str) -> None:
    """Export all timeframes for a single coin."""
    decimals = 1 if coin in HIGH_PRICE_COINS else 2
    print(f"\n{'='*50}")
    print(f"Processing {coin} (decimals={decimals})")

    df_5m = load_candles(coin)
    if df_5m.empty:
        print(f"  [SKIP] No data found for {coin}")
        return

    print(f"  Loaded {len(df_5m):,} 5m candles: {df_5m.index[0]} → {df_5m.index[-1]}")
    coin_dir = os.path.join(OUTPUT_DIR, coin)
    os.makedirs(coin_dir, exist_ok=True)

    for label, rule, lookback_months in TIMEFRAMES:
        # Resample if needed
        if rule is None:
            df_tf = df_5m.copy()
        else:
            df_tf = resample_ohlcv(df_5m, rule)

        # Trim by lookback
        df_tf = trim_by_months(df_tf, lookback_months)

        if df_tf.empty:
            print(f"  [{label}] SKIP — empty after trim")
            continue

        records = df_to_json(df_tf, decimals)
        out_path = os.path.join(coin_dir, f"{label}.json")
        with open(out_path, "w") as f:
            json.dump(records, f, separators=(",", ":"))

        size_mb = os.path.getsize(out_path) / (1024 * 1024)
        print(f"  [{label}] {len(records):>8,} candles | {size_mb:.2f} MB | {df_tf.index[0].date()} → {df_tf.index[-1].date()}")


def main():
    print(f"Exporting candles from {DB_PATH}")
    print(f"Output: {OUTPUT_DIR}")
    print(f"Start date: {START_DATE}")
    print(f"Coins: {len(COINS)}")

    total_size = 0
    for coin in COINS:
        export_coin(coin)

    # Summary
    print(f"\n{'='*50}")
    print("SUMMARY")
    total_files = 0
    for coin in COINS:
        coin_dir = os.path.join(OUTPUT_DIR, coin)
        if not os.path.isdir(coin_dir):
            continue
        for fname in sorted(os.listdir(coin_dir)):
            fpath = os.path.join(coin_dir, fname)
            size_mb = os.path.getsize(fpath) / (1024 * 1024)
            total_size += size_mb
            total_files += 1

    print(f"Total files: {total_files}")
    print(f"Total size: {total_size:.1f} MB")
    print("Done!")


if __name__ == "__main__":
    main()
