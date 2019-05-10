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
      setInputValueInUrl(example);
      setInputValueInTitle(example);
      this.setState({ inputValue: example, forceInput: true });
    };

    const onAddClick = () => {
      const textArea = document.getElementsByTagName("textarea").item(0);
      if (!textArea) {
        return;
      }
      const char = promptForCodePoint();
      if (!char) {
        return;
      }
      insertAtCursor(textArea, char);
      setInputValueInUrl(textArea.value);
      setInputValueInTitle(textArea.value);
      this.setState({ inputValue: textArea.value });
    };

    const onSourceClick = () => {
      window.location.href = "https://github.com/frewsxcv";
    };

    const bottomSection = this.state.inputValue ? (
      <div className="shadow-4 ma4 bg-white br4 pa3">
        <WordsComponent inputValue={this.state.inputValue} />
      </div>
    ) : null;

    return (
      <>
        <div className="shadow-4 ma4 bg-white br4 pa3">
          <div className="w-100 flex flex-column">
            <InputComponent
              onInput={onInput}
              forceInput={this.state.forceInput}
              defaultValue={this.state.inputValue}
            />
            <div className="flex justify-end">
              <Button
                marginLeft={false}
                bgColor="#df94c9"
                icon="shuffle"
                text="Random"
                onClick={onShuffleClick}
              />
              <Button
                marginLeft={true}
                bgColor="#f49587"
                icon="add"
                text="Add codepoint"
                onClick={onAddClick}
              />
              <Button
                marginLeft={true}
                bgColor="#faba81"
                icon="code"
                text="Source"
                onClick={onSourceClick}
              />
            </div>
          </div>
        </div>
        {bottomSection}
      </>
    );
  }
}

const Button = (props: {
  marginLeft: boolean;
  bgColor: string;
  icon: string;
  text: string;
  onClick?(): void;
}) => {
  let classes = "f7 mt2 inline-flex items-center br3 bn white dim pointer pa2";
  if (props.marginLeft) {
    classes += " ml1";
  }
  return (
    <button
      className={classes}
      style={{ backgroundColor: props.bgColor }}
      onClick={props.onClick}
    >
      <i className="material-icons" style={{ fontSize: "18px" }}>
        {props.icon}
      </i>
      <div className="ml1">{props.text}</div>
    </button>
  );
};

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
      className="bn pa3 flex-auto br3"
      style={{ backgroundColor: "#f6f6f4", resize: "vertical" }}
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

  return <div className="overflow-scroll flex">{words}</div>;
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
          borderStyle: "solid",
          borderTopWidth: "5px",
          borderTopColor: "lightgrey",
          borderRightWidth: "1px",
          borderRightColor: "rgb(240, 240, 240)",
          borderLeftWidth: "1px",
          borderLeftColor: "rgb(240, 240, 240)",
          borderBottomWidth: "1px",
          borderBottomColor: "rgb(240, 240, 240)"
        }}
      >
        <div>{props.word.content}</div>
      </div>
      <div className="flex">{graphemeClusterComponents}</div>
    </>
  );
};

function insertAtCursor(myField: HTMLTextAreaElement, myValue: string) {
  if (myField.selectionStart || myField.selectionStart === 0) {
    var startPos = myField.selectionStart;
    var endPos = myField.selectionEnd;
    myField.value =
      myField.value.substring(0, startPos) +
      myValue +
      myField.value.substring(endPos || 0, myField.value.length);
  } else {
    myField.value += myValue;
  }
}

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
      <div
        className="f6 pa3 ml1 mt1 bg-white h2 flex items-center"
        style={{
          borderStyle: "solid",
          borderWidth: "1px",
          borderColor: "rgb(240, 240, 240)"
        }}
      >
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
        borderStyle: "solid",
        borderBottomWidth: "5px",
        borderBottomColor: props.codePoint.category_color,
        borderTopWidth: "1px",
        borderTopColor: "rgb(240, 240, 240)",
        borderRightWidth: "1px",
        borderRightColor: "rgb(240, 240, 240)",
        borderLeftWidth: "1px",
        borderLeftColor: "rgb(240, 240, 240)"
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
  } while (xs.length > 1 && x === curr);
  return x;
};

const randomChoice = <T extends {}>(xs: T[]): T => {
  return xs[Math.floor(Math.random() * xs.length)];
};

const promptForCodePoint = () => {
  const input = window.prompt(
    "Enter a UTF-8 (or UTF-16?) hex code-point (e.g. '0000' for U+0000)"
  );
  if (!input) {
    return null;
  }
  const num = parseInt(input, 16);
  if (isNaN(num)) {
    return null;
  }
  try {
    return (String as any).fromCodePoint(num) as string;
  } catch (RangeError) {
    return null;
  }
};

ReactDOM.render(<App />, app);
