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
        let string = "Denmark 🇩🇰";
        unic::segment::Graphemes::new(string)
            .map(|gc_str| {
                yew::html! {
                    <div>
                        <grapheme_cluster::Component grapheme_cluster=gc_str />
                    </div>
                }

            })
            .collect::<yew::Html>()
    }
}

const EXPLORE_COMPONENT_INNER_BORDER_COLOR: &str = "b--black-20";

mod grapheme_cluster {
    pub struct Component(Props);

    #[derive(Clone, PartialEq, yew::Properties)]
    pub struct Props {
        pub grapheme_cluster: String,
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
                .grapheme_cluster
                .chars()
                .map(|code_point| {
                    let mut utf8_bytes = vec![0; code_point.len_utf8()];
                    code_point.encode_utf8(&mut utf8_bytes);
                    let mut utf16_bytes = vec![0; code_point.len_utf16()];
                    code_point.encode_utf16(&mut utf16_bytes);
                    yew::html! {
                        <div>
                            // <CodePointComponent codePoint={codePoint} key={idx} />
                            <super::BytesComponent<u8> bytes={utf8_bytes} />
                            <super::BytesComponent<u16> bytes={utf16_bytes} />
                        </div>
                    }
                })
                .collect::<yew::Html>();
            yew::html! {
                <>
                    <div class=format!("bt br {} f6 pa3 h2 flex items-center", super::EXPLORE_COMPONENT_INNER_BORDER_COLOR)>
                        <div>{ self.0.grapheme_cluster.clone() }</div>
                    </div>
                    <div className="flex">{code_points_components}</div>
                </>
            }
        }
    }
}

struct BytesComponent<B: Byte>(BytesComponentProps<B>);

#[derive(Clone, PartialEq, yew::Properties)]
struct BytesComponentProps<B: Byte> {
    bytes: Vec<B>,
}

impl<B: 'static + Byte> yew::Component for BytesComponent<B> {
    type Message = ();
    type Properties = BytesComponentProps<B>;

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
            .map(|b| yew::html! { <div class="pr2">{ b.formatted() }</div> })
            .collect::<yew::Html>();
        yew::html! {
            <div class=format!("f7 bt br {} pa3 h2 nowrap tc flex items-center code", EXPLORE_COMPONENT_INNER_BORDER_COLOR)>
            {inner}
            </div>
        }
    }
}

trait Byte: Clone + PartialEq {
    fn formatted(&self) -> String;
}

impl Byte for u8 {
    fn formatted(&self) -> String {
        format!("{:#04x}", self)
    }
}

impl Byte for u16 {
    fn formatted(&self) -> String {
        format!("{:#06x}", self)
    }
}
