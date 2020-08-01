use yew::prelude::*;

pub struct App;

impl Component for App {
    type Message = ();
    type Properties = ();

    fn create(_: Self::Properties, _link: ComponentLink<Self>) -> Self {
        App
    }

    fn update(&mut self, _msg: Self::Message) -> ShouldRender {
        false
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
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
    type Message = ();
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