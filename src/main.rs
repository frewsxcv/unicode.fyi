use unicode_segmentation::UnicodeSegmentation;
use unic::ucd::{name_aliases_of, Name, NameAliasType, Lowercase, GraphemeClusterBreak};
use wasm_bindgen::prelude::*;
use std::io;

#[wasm_bindgen]
#[derive(Debug)]
struct CharInfo {
    char: char,
    display: String,
    name: String,
    is_lowercase: bool,
    grapheme_cluster_break: String,
}

impl CharInfo {
    fn from_char(c: char) -> Self {
        CharInfo {
            char: c,
            display: char_display(c),
            name: char_name(c),
            is_lowercase: Lowercase::of(c).as_bool(),
            grapheme_cluster_break: format!("{:?}", GraphemeClusterBreak::of(c)),
        }
    }
}

fn main() -> io::Result<()> {
    let mut buffer = String::new();
    io::stdin().read_line(&mut buffer)?;

    for grapheme_cluster in buffer.graphemes(true) {
        println!("cluster");
        for char_info in grapheme_cluster.chars().map(CharInfo::from_char) {
            println!("{:?}", char_info);
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
    Name::of(c).map(|n| n.to_string()).unwrap_or_else(|| {
        match name_aliases_of(c, NameAliasType::NameAbbreviations) {
            Some(abbrs) => abbrs[0].to_owned(),
            None => "<none>".to_owned(),
        }
    })
}
