//! Best-effort coin tagging from article title + snippet.
//!
//! Dictionary-based: each ticker maps to a list of needle strings we look
//! for in the lowercased text. Tradeoffs:
//!   - False positives: " eth " matches "method" if we're not careful with
//!     spacing. Add explicit word-boundary markers in needles when the
//!     ticker is a common substring.
//!   - False negatives: anything not in the dictionary is invisible. Fine
//!     for the top-20 coins; the long tail can wait.

pub fn tag_coins(title: &str, snippet: &str) -> Vec<String> {
    let text = format!(" {} {} ", title, snippet).to_lowercase();
    let mut out = Vec::new();
    for (ticker, needles) in DICTIONARY {
        if needles.iter().any(|n| text.contains(n)) {
            out.push((*ticker).to_string());
        }
    }
    out
}

// Tuples of (ticker, &[needle, ...]). Needles are lowercase, with leading/
// trailing spaces where the ticker is short enough to be a false-positive
// substring.
const DICTIONARY: &[(&str, &[&str])] = &[
    ("BTC", &["bitcoin", " btc "]),
    ("ETH", &["ethereum", " eth "]),
    ("SOL", &["solana", " sol "]),
    ("XRP", &["ripple", " xrp "]),
    ("DOGE", &["dogecoin", " doge "]),
    ("ADA", &["cardano", " ada "]),
    ("AVAX", &["avalanche", " avax "]),
    ("LINK", &["chainlink", " link "]), // 'link' is risky; consider dropping
    ("MATIC", &["polygon", " matic "]),
    ("BNB", &["binance coin", " bnb "]),
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tags_bitcoin_from_full_name() {
        let coins = tag_coins("Bitcoin hits $80k", "");
        assert!(coins.contains(&"BTC".to_string()));
    }

    #[test]
    fn tags_eth_from_ticker_with_boundary() {
        let coins = tag_coins("ETH gas fees drop", "");
        assert!(coins.contains(&"ETH".to_string()));
    }

    #[test]
    fn does_not_false_positive_eth_in_method() {
        let coins = tag_coins("New method for staking", "");
        assert!(!coins.contains(&"ETH".to_string()));
    }
}
