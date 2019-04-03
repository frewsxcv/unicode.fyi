import * as wasm from "unicode-fyi";
import * as React from 'react';
import * as ReactDOM from "react-dom";

console.info(wasm.unicode_info("Family! 👪"))

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
    display: string;
    general_category: string;
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
        this.state = { inputValue: '' };
    }

    render() {
        const onInput = (evt: React.FormEvent<HTMLInputElement>) => {
            const value = (evt.target as HTMLInputElement).value || "";
            this.setState({ inputValue: value });
        };

        const words = unicodeInfo(this.state.inputValue).map((word, idx) => {
            return (<WordComponent word={word} key={idx} />);
        });

        return (
            <>
                <h1>Unicode FYI</h1>
                <input type="text" id="input" onInput={onInput} />
                <div className="flex">
                    {words}
                </div>
            </>
        );
    }
}

const WordComponent = (props: { word: Word }) => {
    const graphemeClusterComponents = props.word.grapheme_clusters.map((graphemeCluster, idx) => {
        return (<GraphemeClusterComponent graphemeCluster={graphemeCluster} key={idx} />);
    });

    return (
        <div className="outline pa3 mr2">
            <div>{props.word.content}</div>
            <div className="flex">
                {graphemeClusterComponents}
            </div>
        </div>
    );
};

const GraphemeClusterComponent = (props: { graphemeCluster: GraphemeCluster }) => {
    const codePointComponents = props.graphemeCluster.code_points.map((codePoint, idx) => {
        return (<CodePointComponent codePoint={codePoint} key={idx} />);
    });

    return (
        <div className="outline pa3 mr2">
            <div>{props.graphemeCluster.content}</div>
            <div className="flex">
                {codePointComponents}
            </div>
        </div>
    );
};

const CodePointComponent = (props: { codePoint: CodePoint }) => {
    return (
        <div className="outline pa3 mr2">
            <div>{props.codePoint.display}</div>
        </div>
    );
};

ReactDOM.render(
    <App />,
    app
);