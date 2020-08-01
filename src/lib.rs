mod utils;

use serde::Serialize;
use unic::char::property::EnumeratedCharProperty;
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
            .collect::<Vec<_>>(),
    )
    .unwrap()
}

#[wasm_bindgen]
#[derive(Debug, Serialize)]
pub struct Word {
    content: String,
    grapheme_clusters: Vec<GraphemeCluster>,
}

impl Word {
    fn from_str(word_str: &str) -> Self {
        Word {
            content: word_str.to_string(),
            grapheme_clusters: unic_segment::Graphemes::new(word_str)
                .map(|gc| GraphemeCluster::from_str(gc))
                .collect(),
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
            code_points: s.chars().map(CodePoint::from_char).collect(),
        }
    }
}

#[wasm_bindgen]
#[derive(Debug, Serialize)]
pub struct CodePoint {
    age: String,
    category: String,
    category_abbr: &'static str,
    category_color: &'static str,
    char: char,
    code: String,
    display: String,
    grapheme_cluster_break: String,
    is_alphabetic: bool,
    is_lowercase: bool,
    is_uppercase: bool,
    is_white_space: bool,
    name: String,
    utf8_bytes: Vec<u8>,
    utf16_bytes: Vec<u16>,
}

impl CodePoint {
    fn from_char(c: char) -> Self {
        let mut utf8_bytes = vec![0; c.len_utf8()];
        c.encode_utf8(&mut utf8_bytes);
        let mut utf16_bytes = vec![0; c.len_utf16()];
        c.encode_utf16(&mut utf16_bytes);
        CodePoint {
            age: char_age(c),
            category: char_category(c).to_string(),
            category_abbr: char_category(c).abbr_name(),
            category_color: char_category_color(c),
            char: c,
            code: char_code(c),
            display: char_display(c),
            grapheme_cluster_break: unic_ucd::GraphemeClusterBreak::of(c).to_string(),
            is_alphabetic: unic_ucd::Alphabetic::of(c).as_bool(),
            is_lowercase: unic_ucd::Lowercase::of(c).as_bool(),
            is_uppercase: unic_ucd::Uppercase::of(c).as_bool(),
            is_white_space: unic_ucd::WhiteSpace::of(c).as_bool(),
            name: char_name(c),
            utf8_bytes,
            utf16_bytes,
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
        .map(|n| ascii_string_to_title_case(n))
        .or_else(|| char_name_abbreviations(c))
        .unwrap_or_else(|| "<none>".to_owned())
}

fn char_name_abbreviations(c: char) -> Option<String> {
    unic_ucd::name_aliases_of(c, unic_ucd::NameAliasType::NameAbbreviations)
        .map(|abbrs| abbrs[0].to_owned())
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

fn char_category(c: char) -> unic_ucd::GeneralCategory {
    unic_ucd::GeneralCategory::of(c)
}

fn char_category_color(c: char) -> &'static str {
    use unic_ucd::GeneralCategory::*;

    match char_category(c) {
        // Letter
        UppercaseLetter | LowercaseLetter | TitlecaseLetter | ModifierLetter | OtherLetter => {
            "#df94c9"
        }

        // Mark
        NonspacingMark | SpacingMark | EnclosingMark => "#faba81",

        // Number
        DecimalNumber | LetterNumber | OtherNumber => "#f49587",

        // Punctuation
        ConnectorPunctuation | DashPunctuation | OpenPunctuation | ClosePunctuation
        | InitialPunctuation | FinalPunctuation | OtherPunctuation => "#8e8bce",

        // Symbol
        MathSymbol | CurrencySymbol | ModifierSymbol | OtherSymbol => "#81b4f9",

        // Separator
        SpaceSeparator | LineSeparator => "#eacccd",

        // Other
        Format => "#a0d0f7",
        Control => "#f1abf1",
        Surrogate => "#f1abf1",
        ParagraphSeparator => "#f1abf1",
        PrivateUse => "#f1abf1",
        Unassigned => "#f1abf1",
    }
}

// 'c' -> "U+0063"
fn char_code(c: char) -> String {
    format!("U+{:04X}", c as u32)
}

fn ascii_string_to_title_case(s: String) -> String {
    if s.is_empty() {
        return s;
    }
    let mut bytes = s.into_bytes();
    for i in 1..bytes.len() {
        let is_new_word = bytes
            .get(i - 1)
            .map(|c| !(*c as char).is_alphabetic())
            .unwrap_or(true);
        if let Some(b) = bytes.get_mut(i) {
            *b = if is_new_word {
                (*b as char).to_ascii_uppercase()
            } else {
                (*b as char).to_ascii_lowercase()
            } as u8;
        }
    }
    String::from_utf8(bytes).unwrap()
}

use yew::prelude::*;

struct Model {
    link: ComponentLink<Self>,
    value: i64,
}

enum Msg {
    AddOne,
}

impl Component for Model {
    type Message = Msg;
    type Properties = ();
    fn create(_: Self::Properties, link: ComponentLink<Self>) -> Self {
        Self { link, value: 0 }
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        false
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        // Should only return "true" if new properties are different to
        // previously received properties.
        // This component has no properties so we will always return "false".
        false
    }

    fn view(&self) -> Html {
        html! {
            <div>
                <BytesComponent bytes=vec![0, 1] code_unit_byte_len=1 />
                // <button onclick=self.link.callback(|_| Msg::AddOne)>{ "+1" }</button>
                // <p>{ self.value }</p>
            </div>
        }
    }
}

const EXPLORE_COMPONENT_INNER_BORDER_COLOR: &str = "b--black-20";

struct BytesComponent(BytesComponentProps);

#[derive(Clone, PartialEq, yew::Properties)]
struct BytesComponentProps {
    bytes: Vec<u8>,
    code_unit_byte_len: u8,
}

impl Component for BytesComponent {
    type Message = Msg;
    type Properties = BytesComponentProps;

    fn create(props: Self::Properties, _link: ComponentLink<Self>) -> Self {
        Self(props)
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        false
    }

    fn change(&mut self, props: Self::Properties) -> ShouldRender {
        if self.0 != props {
            self.0 = props;
            true
        } else {
            false
        }
    }

    fn view(&self) -> Html {
        let inner = self
            .0
            .bytes
            .iter()
            .map(|b| format_byte(*b, self.0.code_unit_byte_len))
            .map(|b| html! { <div class="pr2">{ b }</div> })
            .collect::<Html>();
        html! {
            <div class=format!("f7 bt br {} pa3 h2 nowrap tc flex items-center code", EXPLORE_COMPONENT_INNER_BORDER_COLOR)>
            {inner}
            </div>
        }
    }
}

fn format_byte(byte: u8, code_unit_byte_len: u8) -> String {
    match code_unit_byte_len {
        1 => format!("{:#04x}", byte),
        2 => format!("{:#06x}", byte),
        _ => unimplemented!(),
    }
}

#[wasm_bindgen(start)]
pub fn run_app() {
    App::<Model>::new().mount_to_body();
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_char_code() {
        assert_eq!(char_code('👨'), "U+1F468");
    }

    #[test]
    fn test_ascii_string_to_title_case() {
        assert_eq!("Foo Bar", ascii_string_to_title_case("FOO BAR".to_string()));
    }
}
