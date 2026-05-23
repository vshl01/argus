-- Candles: OHLCV price bars, one row per (coin, interval, timestamp).
--
-- Written by the background fetcher (which polls Binance every N seconds)
-- and read by the prices handler. The handler never touches the external
-- API directly — this table is the contract between the two halves.
--
-- `coin` is the ticker symbol in uppercase ('BTC', 'ETH', ...). `interval`
-- is the bar size as a short code ('1h', '4h', '1d'). `ts` is the bar's
-- open time in UTC. OHLCV columns are DOUBLE PRECISION so they map directly
-- to Rust's f64 without needing a BigDecimal crate. ~15 significant digits
-- is plenty for chart rendering and indicator math.

CREATE TABLE candles (
    coin      TEXT              NOT NULL,
    interval  TEXT              NOT NULL,
    ts        TIMESTAMPTZ       NOT NULL,
    open      DOUBLE PRECISION  NOT NULL,
    high      DOUBLE PRECISION  NOT NULL,
    low       DOUBLE PRECISION  NOT NULL,
    close     DOUBLE PRECISION  NOT NULL,
    volume    DOUBLE PRECISION  NOT NULL,

    PRIMARY KEY (coin, interval, ts),

    CONSTRAINT candles_coin_uppercase  CHECK (coin = UPPER(coin)),
    CONSTRAINT candles_interval_known  CHECK (interval IN ('1m', '5m', '15m', '1h', '4h', '1d')),
    CONSTRAINT candles_high_ge_low     CHECK (high >= low),
    CONSTRAINT candles_volume_nonneg   CHECK (volume >= 0)
);

-- Primary read pattern: "give me the last N candles for BTC at 1h interval,
-- newest first." The PK already covers (coin, interval, ts) but DESC on ts
-- lets the planner avoid a sort.
CREATE INDEX candles_coin_interval_ts_idx ON candles (coin, interval, ts DESC);
