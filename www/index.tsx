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
      inputValue: inputValueFromUrl() || "g̈Family! 👨‍👨‍👧‍👧"
    };
  }

  render() {
    const onInput = (evt: React.FormEvent<HTMLInputElement>) => {
      const inputValue = (evt.target as HTMLInputElement).value || "";
      setInputValueInUrl(inputValue);
      this.setState({ inputValue });
    };

    const words = unicodeInfo(this.state.inputValue).map((word, idx) => {
      return <WordComponent word={word} key={idx} />;
    });

    return (
      <div className="sans-serif ma4">
        <input
          type="text"
          id="input"
          onInput={onInput}
          defaultValue={this.state.inputValue}
          className="mb3"
        />
        <div className="flex">{words}</div>
      </div>
    );
  }
}

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
    <div className="pa4 mr2 bg-blue washed-red nowrap tc">
      <div className="f7 code">{props.codePoint.code}</div>
      <div className="f7 code">{props.codePoint.general_category_abbr}</div>
      <div className="f1 pa3 b lh-copy">{props.codePoint.display}</div>
      <div className="f7 ttc">{props.codePoint.name.toLowerCase()}</div>
    </div>
  );
};

const setInputValueInUrl = (inputValue: string) => {
  window.history.replaceState({}, "", "?q=" + encodeURIComponent(inputValue));
};

const inputValueFromUrl = () => {
  return new URL(window.location.toString()).searchParams.get("q");
};

ReactDOM.render(<App />, app);
