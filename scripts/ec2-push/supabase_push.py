"""
Supabase Push Utility for EC2 Trading Bots
Copy this to EC2 and import in bot code.

Env vars needed:
  SUPABASE_URL (default: https://gcvisvrgupnqjjakvnxb.supabase.co)
  SUPABASE_SERVICE_ROLE_KEY

Usage:
  from supabase_push import push_open_position, close_position, push_trade, push_equity
"""
import os
import requests
from datetime import datetime, timezone

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://gcvisvrgupnqjjakvnxb.supabase.co")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def _headers():
    return {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }


def _post(table, data):
    """POST to Supabase REST API."""
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/{table}", json=data, headers=_headers()
    )
    if r.status_code not in (200, 201):
        print(f"[supabase_push] {table} error {r.status_code}: {r.text}")
    return r.status_code


def _delete(table, filters):
    """DELETE from Supabase REST API."""
    query = "&".join(f"{k}=eq.{v}" for k, v in filters.items())
    url = f"{SUPABASE_URL}/rest/v1/{table}?{query}"
    r = requests.delete(url, headers=_headers())
    return r.status_code


def push_open_position(
    strategy, coin, side, entry_time, entry_price, current_price, margin, leverage
):
    """Upsert an open position. Call on entry and periodically for price updates."""
    pos_id = f"{strategy}_{coin}_{side}"
    direction = 1 if side == "long" else -1
    unrealized = (
        margin * leverage * (current_price - entry_price) / entry_price * direction
    )
    unrealized_pct = (current_price - entry_price) / entry_price * 100 * direction

    return _post(
        "open_positions",
        {
            "id": pos_id,
            "strategy": strategy,
            "coin": coin,
            "side": side,
            "entry_time": (
                entry_time if isinstance(entry_time, str) else entry_time.isoformat()
            ),
            "entry_price": float(entry_price),
            "current_price": float(current_price),
            "unrealized_pnl": round(float(unrealized), 2),
            "unrealized_pnl_pct": round(float(unrealized_pct), 2),
            "margin": float(margin),
            "leverage": int(leverage),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    )


def close_position(strategy, coin, side):
    """Remove a position from open_positions when it's closed."""
    pos_id = f"{strategy}_{coin}_{side}"
    return _delete("open_positions", {"id": pos_id})


def push_trade(
    strategy,
    coin,
    side,
    entry_time,
    exit_time,
    entry_price,
    exit_price,
    margin,
    leverage,
    pnl,
    pnl_pct,
    exit_type,
):
    """Push a completed trade to live_trades."""
    return _post(
        "live_trades",
        {
            "strategy": strategy,
            "coin": coin,
            "side": side,
            "entry_time": (
                entry_time
                if isinstance(entry_time, str)
                else entry_time.isoformat()
            ),
            "exit_time": (
                exit_time if isinstance(exit_time, str) else exit_time.isoformat()
            ),
            "entry_price": float(entry_price),
            "exit_price": float(exit_price),
            "margin": float(margin),
            "leverage": int(leverage),
            "pnl": round(float(pnl), 2),
            "pnl_pct": round(float(pnl_pct), 2),
            "exit_type": exit_type,
        },
    )


def push_equity(equity, drawdown_pct=0):
    """Push an equity snapshot."""
    return _post(
        "equity_snapshots",
        {
            "equity": round(float(equity), 2),
            "drawdown_pct": round(float(drawdown_pct), 2),
            "snapshot_time": datetime.now(timezone.utc).isoformat(),
        },
    )


def update_position_price(
    strategy, coin, side, current_price, entry_price, margin, leverage
):
    """Convenience: update just the current price of an open position."""
    return push_open_position(
        strategy, coin, side, "", entry_price, current_price, margin, leverage
    )
