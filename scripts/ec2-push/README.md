# EC2 Supabase Push Utility

Push live trading data from EC2 bots to the crypto website's Supabase backend.

## Copy to EC2

```bash
scp -i ~/.ssh/crypto-bot-key.pem scripts/ec2-push/*.py ec2-user@54.116.81.215:/home/ec2-user/trading/
```

## Env Vars

Add to `~/.bashrc` or your bot's environment:

```bash
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export BINANCE_API_KEY="your-key"       # for equity_cron.py only
export BINANCE_API_SECRET="your-secret"  # for equity_cron.py only
```

`SUPABASE_URL` defaults to the project URL and doesn't need to be set.

## Dependencies

```bash
pip install requests ccxt
```

## Usage in Bot Code

```python
from supabase_push import push_open_position, close_position, push_trade

# On entry
push_open_position("dipbuy", "HBAR", "long", entry_time, entry_price, entry_price, margin=100, leverage=10)

# Periodic price update
update_position_price("dipbuy", "HBAR", "long", current_price, entry_price, margin=100, leverage=10)

# On exit
push_trade("dipbuy", "HBAR", "long", entry_time, exit_time, entry_price, exit_price, margin=100, leverage=10, pnl=12.50, pnl_pct=1.25, exit_type="tp")
close_position("dipbuy", "HBAR", "long")
```

## Equity Snapshot Cron

Run `equity_cron.py` every hour to track account equity and drawdown:

```bash
crontab -e
```

```
0 * * * * cd /home/ec2-user/trading && /usr/bin/python3 equity_cron.py >> /var/log/equity_cron.log 2>&1
```

This fetches Binance Futures wallet balance, tracks peak equity in `/tmp/equity_peak.txt`, and pushes the snapshot with drawdown percentage.

## Tables

| Table | Purpose |
|---|---|
| `open_positions` | Currently open positions (upserted by id = `{strategy}_{coin}_{side}`) |
| `live_trades` | Completed trades (append-only) |
| `equity_snapshots` | Hourly equity + drawdown snapshots |
