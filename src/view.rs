pub struct App;

impl yew::Component for App {
    type Message = ();
    type Properties = ();

    fn create(_: Self::Properties, _link: yew::ComponentLink<Self>) -> Self {
        App
    }

    fn update(&mut self, _msg: Self::Message) -> yew::ShouldRender {
        false
    }

    fn change(&mut self, _props: Self::Properties) -> yew::ShouldRender {
        false
    }

    fn view(&self) -> yew::Html {
        yew::html! {
            <div>
                <BytesComponent bytes=vec![0, 1] code_unit_byte_len=1 />
                // <button onclick=self.link.callback(|_| Msg::AddOne)>{ "+1" }</button>
                // <p>{ self.value }</p>
            </div>
        }
    }
}

const EXPLORE_COMPONENT_INNER_BORDER_COLOR: &str = "b--black-20";

mod grapheme_cluster {
    struct Component(Props);

    #[derive(Clone, PartialEq, yew::Properties)]
    struct Props {
        content: String,
        code_points: Vec<crate::CodePoint>,
    }

    impl yew::Component for Component {
        type Message = ();
        type Properties = Props;

        fn create(props: Self::Properties, _link: yew::ComponentLink<Self>) -> Self {
            Self(props)
        }

        fn update(&mut self, _msg: Self::Message) -> yew::ShouldRender {
            false
        }

        fn change(&mut self, props: Self::Properties) -> yew::ShouldRender {
            if self.0 != props {
                self.0 = props;
                true
            } else {
                false
            }
        }

        fn view(&self) -> yew::Html {
            let code_points_components = self
                .0
                .code_points
                .iter()
                .map(|code_point| {
                    yew::html! {
                        <div>
                            // <CodePointComponent codePoint={codePoint} key={idx} />
                            <super::BytesComponent bytes={code_point.utf8_bytes.clone()} code_unit_byte_len={1} />
                            // <super::BytesComponent bytes={code_point.utf16_bytes} />
                        </div>
                    }
                })
                .collect::<yew::Html>();
            yew::html! {
                <>
                    <div class=format!("bt br {} f6 pa3 h2 flex items-center", super::EXPLORE_COMPONENT_INNER_BORDER_COLOR)>
                        <div>{ self.0.content.clone() }</div>
                    </div>
                    <div className="flex">{code_points_components}</div>
                </>
            }
        }
    }
}

struct BytesComponent(BytesComponentProps);

#[derive(Clone, PartialEq, yew::Properties)]
struct BytesComponentProps {
    bytes: Vec<u8>,
    code_unit_byte_len: u8,
}

impl yew::Component for BytesComponent {
    type Message = ();
    type Properties = BytesComponentProps;

    fn create(props: Self::Properties, _link: yew::ComponentLink<Self>) -> Self {
        Self(props)
    }

    fn update(&mut self, _msg: Self::Message) -> yew::ShouldRender {
        false
    }

    fn change(&mut self, props: Self::Properties) -> yew::ShouldRender {
        if self.0 != props {
            self.0 = props;
            true
        } else {
            false
        }
    }

    fn view(&self) -> yew::Html {
        let inner = self
            .0
            .bytes
            .iter()
            .map(|b| format_byte(*b, self.0.code_unit_byte_len))
            .map(|b| yew::html! { <div class="pr2">{ b }</div> })
            .collect::<yew::Html>();
        yew::html! {
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
