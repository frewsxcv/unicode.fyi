use std::io;
use unic::segment::Graphemes;
use unic::segment::Words;
use unic::ucd::{
    name_aliases_of, Age, Alphabetic, GeneralCategory, GraphemeClusterBreak, Lowercase, Name,
    NameAliasType, Uppercase, WhiteSpace,
};
// use wasm_bindgen::prelude::*;

// #[wasm_bindgen]
#[derive(Debug)]
struct CharInfo {
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

fn main() -> io::Result<()> {
    let mut buffer = String::new();
    io::stdin().read_line(&mut buffer)?;

    for word in Words::new(&buffer, |_| true) {
        println!("word");
        for grapheme_cluster in Graphemes::new(word) {
            println!("\tcluster");
            for char_info in grapheme_cluster.chars().map(CharInfo::from_char) {
                println!("\t\t{:?}", char_info);
            }
        }
    }

    Ok(())
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
