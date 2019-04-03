mod utils;

use serde::Serialize;
use unic::segment::Graphemes;
use unic::segment::Words;
use unic::ucd::{
    name_aliases_of, Age, Alphabetic, GeneralCategory, GraphemeClusterBreak, Lowercase, Name,
    NameAliasType, Uppercase, WhiteSpace,
};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn unicode_info(s: &str) -> JsValue {
    let mut ret = vec![];
    for word in Words::new(&s, |_| true) {
        ret.push(
            Graphemes::new(word).map(|gc| grapheme_cluster_to_char_infos(gc)).collect::<Vec<_>>()
        );
    }
    JsValue::from_serde(&ret).unwrap()
}

#[wasm_bindgen]
#[derive(Debug, Serialize)]
pub struct CharInfo {
    age: String,
    char: char,
    display: String,
    general_category: String,
    grapheme_cluster_break: String,
    is_alphabetic: bool,
    is_lowercase: bool,
    is_uppercase: bool,
    is_white_space: bool,
    name: String,
}

impl CharInfo {
    fn from_char(c: char) -> Self {
        CharInfo {
            age: char_age(c),
            char: c,
            display: char_display(c),
            general_category: GeneralCategory::of(c).to_string(),
            grapheme_cluster_break: GraphemeClusterBreak::of(c).to_string(),
            is_alphabetic: Alphabetic::of(c).as_bool(),
            is_lowercase: Lowercase::of(c).as_bool(),
            is_uppercase: Uppercase::of(c).as_bool(),
            is_white_space: WhiteSpace::of(c).as_bool(),
            name: char_name(c),
        }
    }
}

fn grapheme_cluster_to_char_infos(gc: &str) -> Vec<CharInfo> {
    gc.chars().map(CharInfo::from_char).collect::<Vec<_>>()
}

fn char_display(c: char) -> String {
    if c.is_whitespace() {
        c.escape_default().collect::<String>()
    } else {
        c.to_string()
    }
}

fn char_name(c: char) -> String {
    Name::of(c)
        .map(|n| n.to_string())
        .or_else(|| char_name_abbreviations(c))
        .unwrap_or_else(|| "<none>".to_owned())
}

fn char_name_abbreviations(c: char) -> Option<String> {
    name_aliases_of(c, NameAliasType::NameAbbreviations).map(|abbrs| abbrs[0].to_owned())
}

fn char_age(c: char) -> String {
    if let Some(unicode_version) = Age::of(c).map(|a| a.actual()) {
        format!(
            "{}.{}.{}",
            unicode_version.major, unicode_version.minor, unicode_version.micro
        )
    } else {
        format!("<none>")
    }
}
