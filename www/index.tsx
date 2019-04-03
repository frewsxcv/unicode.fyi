import * as wasm from "unicode-fyi";
import * as React from 'react';
import * as ReactDOM from "react-dom";

console.info(wasm.unicode_info("Family! 👪"))

const app = document.getElementById("app");

interface Word {
    content: string;
    words: GraphemeCluster[];
}

interface GraphemeCluster {
    content: string;
    words: CodePoints[];
}

interface CodePoints {
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

        const words = unicodeInfo(this.state.inputValue).map((word) => {
            return (<WordComponent word={word} />);
        });

        return (
            <>
                <h1>Unicode FYI</h1>
                <input type="text" id="input" onInput={onInput} />
                <div style={ { display: 'flex' } }>
                    {words}
                </div>
            </>
        );
    }
}

const WordComponent = (props: { word: Word }) => {
    return (
        <div>{props.word.content}</div>
    );
};

ReactDOM.render(
    <App />,
    app
);