import * as wasm from "unicode-fyi";
import * as React from "react";
import * as ReactDOM from "react-dom";

const app = document.getElementById("app");

interface Word {
  content: string;
  grapheme_clusters: GraphemeCluster[];
}

interface GraphemeCluster {
  content: string;
  code_points: CodePoint[];
}

interface CodePoint {
  age: string;
  category: string;
  category_abbr: string;
  category_color: string;
  char: string;
  code: string;
  display: string;
  grapheme_cluster_break: string;
  is_alphabetic: boolean;
  is_lowercase: boolean;
  is_uppercase: boolean;
  is_white_space: boolean;
  name: string;
}

const unicodeInfo = (s: string): Word[] => {
  return wasm.unicode_info(s) as Word[];
};

interface AppState {
  inputValue: string;
  forceInput: boolean;
}

const examples = [
  // “Iddin-Sin”
  // [Script: Sumerian cuneiform]
  "𒀭𒄿𒋾𒀭𒂗𒍪",
  // “I am Darius the great king” from the Behistun inscription
  // [Script: Old Persian cuneiform]
  "𐏐 𐎠𐎭𐎶 𐏐 𐎭𐎠𐎼𐎹𐎺𐎢𐏁 𐏐 𐎧𐏁𐎠𐎹𐎰𐎡𐎹 𐏐 𐎺𐏀𐎼𐎣",
  // “Here is Corb, son of Labraid”
  // Ballyboodan Ogham Stone
  // [Script: Ogham]
  "᚛ᚉᚑᚏᚁᚔᚕᚑᚔᚋᚐᚊᚔᚂᚐᚏᚔᚇ᚜",
  // “Kenojuak Ashevak”
  // [Script: Inuktitut]
  "ᕿᓐᓄᐊᔪᐊᖅ ᐋᓯᕙᒃ",
  // “Alenush Terian”
  // [Script: Armenian]
  "Ալենուշ Տէրեան",
  // triforce
  "\u{a0}\u{a0}▲\n▲\u{a0}▲",
  // “tomato, tomato” IPA
  // International Phonetic Alphabet (IPA)
  "/təˈmeɪtoʊ təˈmɑːtəʊ/",
  "¡Amo a mi familia! ❤️ 👨‍👨‍👧‍👧",
  "“Arrr!” 🏴‍☠️",
  // Cyrillic lookalikes homograph attack
  "раураӏ.com",
  "Yahtzee: ⚂⚂⚂⚂⚂",
  "תֹ֙הוּ֙ וָבֹ֔הוּ",
  "♸ – Polystyrene",
  "(╯°□°）╯︵ ┻━┻",
  "ಠ_ಠ",
  "¯\\_(ツ)_/¯",
  "14 Street–Union Square\nTrains: ④⑤⑥ⓁⓃⓆⓇⓌ"
];

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      inputValue: inputValueFromUrl() || "",
      forceInput: false
    };
    setInputValueInTitle(this.state.inputValue);
  }

  render() {
    const onInput = (inputValue: string) => {
      setInputValueInUrl(inputValue);
      setInputValueInTitle(inputValue);
      this.setState({ inputValue, forceInput: false });
    };

    const onShuffleClick: () => void = () => {
      const example = randomAndDifferentChoice(examples, this.state.inputValue);

      if (example === this.state.inputValue) {
        return onShuffleClick();
      }

      setInputValueInUrl(example);
      setInputValueInTitle(example);
      this.setState({ inputValue: example, forceInput: true });
    };

    const bottomSection = this.state.inputValue ? (
      <div className="shadow-4 ma4 custom-bg-light-grey custom-border-radius-lg pa3">
        <WordsComponent inputValue={this.state.inputValue} />
      </div>
    ) : null;

    return (
      <>
        <div className="shadow-4 ma4 custom-bg-light-grey custom-border-radius-lg pa3">
          <div className="w-100 flex flex-column">
            <InputComponent
              onInput={onInput}
              forceInput={this.state.forceInput}
              defaultValue={this.state.inputValue}
            />
            <button className="mt2 h3 w3 custom-border-radius-sm bg-white bn" onClick={onShuffleClick}>
              <i className="material-icons">shuffle</i>
            </button>
          </div>
        </div>
        {bottomSection}
      </>
    );
  }
}

const InputComponent = (props: {
  defaultValue: string;
  forceInput: boolean;
  onInput(inputValue: string): void;
}) => {
  const extraAttributes = {
    spellcheck: "false"
  };
  return (
    <textarea
      onInput={evt => props.onInput(evt.currentTarget.value)}
      defaultValue={props.defaultValue}
      value={props.forceInput ? props.defaultValue : undefined}
      className="bn pa3 flex-auto custom-border-radius-sm"
      placeholder="Enter text..."
      {...extraAttributes}
    />
  );
};

const WordsComponent = (props: { inputValue: string }) => {
  const words = unicodeInfo(props.inputValue).map((word, idx) => {
    return (
      <div>
        <WordComponent word={word} key={idx} />
      </div>
    );
  });

  return (
    <div className="overflow-scroll flex">{words}</div>
  );
};

const WordComponent = (props: { word: Word }) => {
  const graphemeClusterComponents = props.word.grapheme_clusters.map(
    (graphemeCluster, idx) => {
      return (
        <div>
          <GraphemeClusterComponent
            graphemeCluster={graphemeCluster}
            key={idx}
          />
        </div>
      );
    }
  );

  return (
    <>
      <div
        className="f6 pa3 ml1 bg-white h2 flex items-center custom-border-radius-sm-top"
        style={{
          borderTopWidth: "5px",
          borderTopStyle: "solid",
          borderTopColor: "lightgrey"
        }}
      >
        <div>{props.word.content}</div>
      </div>
      <div className="flex">{graphemeClusterComponents}</div>
    </>
  );
};

const GraphemeClusterComponent = (props: {
  graphemeCluster: GraphemeCluster;
}) => {
  const codePointComponents = props.graphemeCluster.code_points.map(
    (codePoint, idx) => {
      return (
        <div>
          <CodePointComponent codePoint={codePoint} key={idx} />
        </div>
      );
    }
  );

  return (
    <>
      <div className="f6 pa3 ml1 mt1 bg-white h2 flex items-center">
        <div>{props.graphemeCluster.content}</div>
      </div>
      <div className="flex">{codePointComponents}</div>
    </>
  );
};

const CodePointComponent = (props: { codePoint: CodePoint }) => {
  return (
    <div
      className="pa3 mt1 ml1 nowrap tc flex flex-column bg-white custom-border-radius-sm-bottom"
      style={{
        height: "10rem",
        borderBottomWidth: "5px",
        borderBottomStyle: "solid",
        borderBottomColor: props.codePoint.category_color
      }}
    >
      <div className="flex">
        <div className="f6 w-50 tl font-family-condensed">
          {props.codePoint.code}
        </div>
        <div className="f6 w-50 tr font-family-condensed ml3">
          {props.codePoint.category_abbr}
        </div>
      </div>
      <div className="f1 b flex-auto flex items-center justify-center">
        <span>{props.codePoint.display}</span>
      </div>
      <div className="f6 font-family-condensed">{props.codePoint.name}</div>
    </div>
  );
};

const setInputValueInUrl = (inputValue: string) => {
  window.history.replaceState({}, "", "?q=" + encodeURIComponent(inputValue));
};

const inputValueFromUrl = () =>
  new URL(window.location.toString()).searchParams.get("q");

const setInputValueInTitle = (inputValue: string) => {
  const titleElement = document.getElementsByTagName("title").item(0);
  if (titleElement) {
    titleElement.innerText = `unicode.fyi – ${inputValue}`;
  }
};

const randomAndDifferentChoice = <T extends {}>(xs: T[], curr: T): T => {
  let x;
  do {
    x = randomChoice(xs);
  } while (xs.length > 1 && x === curr)
  return x;
};

const randomChoice = <T extends {}>(xs: T[]): T => {
  return xs[Math.floor(Math.random() * xs.length)];
};

ReactDOM.render(<App />, app);
