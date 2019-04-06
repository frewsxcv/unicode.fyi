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
  char: string;
  code: string;
  display: string;
  general_category: string;
  general_category_abbr: string;
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
}

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      inputValue: inputValueFromUrl() || "Family! 👨‍👨‍👧‍👧"
    };
    setInputValueInTitle(this.state.inputValue);
  }

  render() {
    const onInput = (inputValue: string) => {
      setInputValueInUrl(inputValue);
      setInputValueInTitle(inputValue);
      this.setState({ inputValue });
    };

    const words = unicodeInfo(this.state.inputValue).map((word, idx) => {
      return <WordComponent word={word} key={idx} />;
    });

    return (
      <div className="ma4">
        <InputComponent
          onInput={onInput}
          defaultValue={this.state.inputValue}
        />
        <div className="flex">{words}</div>
      </div>
    );
  }
}

const InputComponent = (props: {
  defaultValue: string;
  onInput(inputValue: string): void;
}) => {
  return (
    <input
      type="text"
      id="input"
      onInput={evt => props.onInput(evt.currentTarget.value)}
      defaultValue={props.defaultValue}
      className="mb3 bn pa2"
    />
  );
};

const WordComponent = (props: { word: Word }) => {
  const graphemeClusterComponents = props.word.grapheme_clusters.map(
    (graphemeCluster, idx) => {
      return (
        <GraphemeClusterComponent graphemeCluster={graphemeCluster} key={idx} />
      );
    }
  );

  return (
    <div>
      <div className="pa2 mr2 mb2 bg-yellow">
        <div>{props.word.content}</div>
      </div>
      <div className="flex">{graphemeClusterComponents}</div>
    </div>
  );
};

const GraphemeClusterComponent = (props: {
  graphemeCluster: GraphemeCluster;
}) => {
  const codePointComponents = props.graphemeCluster.code_points.map(
    (codePoint, idx) => {
      return <CodePointComponent codePoint={codePoint} key={idx} />;
    }
  );

  return (
    <div>
      <div className="pa2 mr2 mb2 bg-yellow">
        <div>{props.graphemeCluster.content}</div>
      </div>
      <div className="flex">{codePointComponents}</div>
    </div>
  );
};

const CodePointComponent = (props: { codePoint: CodePoint }) => {
  return (
    <div
      className="pa3 mr2 bg-blue white nowrap tc flex flex-column"
      style={{ height: "10rem" }}
    >
      <div className="flex">
        <div className="f6 w-50 tl font-family-condensed">
          {props.codePoint.code}
        </div>
        <div className="f6 w-50 tr font-family-condensed">
          {props.codePoint.general_category_abbr}
        </div>
      </div>
      <div className="f1 b flex-auto flex items-center justify-center">
        <span>{props.codePoint.display}</span>
      </div>
      <div className="f6 ttc font-family-condensed">
        {props.codePoint.name.toLowerCase()}
      </div>
    </div>
  );
};

const setInputValueInUrl = (inputValue: string) => {
  window.history.replaceState({}, "", "?q=" + encodeURIComponent(inputValue));
};

const inputValueFromUrl = () => {
  return new URL(window.location.toString()).searchParams.get("q");
};

const setInputValueInTitle = (inputValue: string) => {
  const titleElement = document.getElementsByTagName("title").item(0);
  if (titleElement) {
    titleElement.innerText = `unicode.fyi – ${inputValue}`;
  }
};

ReactDOM.render(<App />, app);
