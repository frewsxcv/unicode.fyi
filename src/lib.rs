mod utils;

use serde::Serialize;
use unic::segment as unic_segment;
use unic::ucd as unic_ucd;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn unicode_info(s: &str) -> JsValue {
    utils::set_panic_hook();
    JsValue::from_serde(
        &unic_segment::Words::new(&s, |_| true)
            .map(|word_str| Word::from_str(word_str))
            .collect::<Vec<_>>()
    ).unwrap()
}

#[wasm_bindgen]
#[derive(Debug, Serialize)]
pub struct Word {
    content: String,
    grapheme_clusters: Vec<GraphemeCluster>
}

impl Word {
    fn from_str(word_str: &str) -> Self {
        Word {
            content: word_str.to_string(),
            grapheme_clusters: unic_segment::Graphemes::new(word_str)
                .map(|gc| GraphemeCluster::from_str(gc))
                .collect()
        }
    }
}

#[wasm_bindgen]
#[derive(Debug, Serialize)]
pub struct GraphemeCluster {
    content: String,
    code_points: Vec<CodePoint>,
}

impl GraphemeCluster {
    fn from_str(s: &str) -> Self {
        Self {
            content: s.to_owned(),
            code_points: s.chars().map(CodePoint::from_char).collect()
        }
    }
}

#[wasm_bindgen]
#[derive(Debug, Serialize)]
pub struct CodePoint {
    age: String,
    char: char,
    code: String,
    display: String,
    general_category: String,
    grapheme_cluster_break: String,
    is_alphabetic: bool,
    is_lowercase: bool,
    is_uppercase: bool,
    is_white_space: bool,
    name: String,
}

impl CodePoint {
    fn from_char(c: char) -> Self {
        CodePoint {
            age: char_age(c),
            char: c,
            code: char_code(c),
            display: char_display(c),
            general_category: unic_ucd::GeneralCategory::of(c).to_string(),
            grapheme_cluster_break: unic_ucd::GraphemeClusterBreak::of(c).to_string(),
            is_alphabetic: unic_ucd::Alphabetic::of(c).as_bool(),
            is_lowercase: unic_ucd::Lowercase::of(c).as_bool(),
            is_uppercase: unic_ucd::Uppercase::of(c).as_bool(),
            is_white_space: unic_ucd::WhiteSpace::of(c).as_bool(),
            name: char_name(c),
        }
    }
}

fn char_display(c: char) -> String {
    if c.is_whitespace() {
        c.escape_default().collect::<String>()
    } else {
        c.to_string()
    }
}

fn char_name(c: char) -> String {
    unic_ucd::Name::of(c)
        .map(|n| n.to_string())
        .or_else(|| char_name_abbreviations(c))
        .unwrap_or_else(|| "<none>".to_owned())
}

fn char_name_abbreviations(c: char) -> Option<String> {
    unic_ucd::name_aliases_of(c, unic_ucd::NameAliasType::NameAbbreviations).map(|abbrs| abbrs[0].to_owned())
}

fn char_age(c: char) -> String {
    if let Some(unicode_version) = unic_ucd::Age::of(c).map(|a| a.actual()) {
        format!(
            "{}.{}.{}",
            unicode_version.major, unicode_version.minor, unicode_version.micro
        )
    } else {
        format!("<none>")
    }
}

// 'c' -> "U+0063"
fn char_code(c: char) -> String {
    format!("U+{:04x}", c as u32).to_ascii_uppercase()
}
