#!/usr/bin/env python3
"""
Equity Snapshot Cron Job
Fetches Binance Futures account balance, calculates drawdown, pushes to Supabase.

Env vars needed:
  BINANCE_API_KEY
  BINANCE_API_SECRET
  SUPABASE_SERVICE_ROLE_KEY
  EQUITY_PEAK_FILE (optional, default: /tmp/equity_peak.txt)

Cron example (every hour):
  0 * * * * cd /home/ec2-user/trading && python3 equity_cron.py >> /var/log/equity_cron.log 2>&1
"""
import os
import sys
import ccxt
from datetime import datetime, timezone
from supabase_push import push_equity

PEAK_FILE = os.environ.get("EQUITY_PEAK_FILE", "/tmp/equity_peak.txt")


def get_binance_equity():
    """Fetch total wallet balance from Binance Futures."""
    exchange = ccxt.binance(
        {
            "apiKey": os.environ.get("BINANCE_API_KEY", ""),
            "secret": os.environ.get("BINANCE_API_SECRET", ""),
            "options": {"defaultType": "future"},
        }
    )
    balance = exchange.fetch_balance()
    # totalWalletBalance includes unrealized PnL
    equity = float(balance["info"]["totalWalletBalance"])
    return equity


def load_peak():
    """Load peak equity from file."""
    try:
        with open(PEAK_FILE, "r") as f:
            return float(f.read().strip())
    except (FileNotFoundError, ValueError):
        return 0.0


def save_peak(peak):
    """Save peak equity to file."""
    with open(PEAK_FILE, "w") as f:
        f.write(str(peak))


def main():
    try:
        equity = get_binance_equity()
    except Exception as e:
        print(f"[equity_cron] Failed to fetch balance: {e}")
        sys.exit(1)

    peak = load_peak()
    if equity > peak:
        peak = equity
        save_peak(peak)

    drawdown_pct = ((peak - equity) / peak * 100) if peak > 0 else 0.0

    status = push_equity(equity, drawdown_pct)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    print(
        f"[equity_cron] {now} | equity=${equity:.2f} | peak=${peak:.2f} | dd={drawdown_pct:.2f}% | status={status}"
    )


if __name__ == "__main__":
    main()
