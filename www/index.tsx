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

export const App = () => {
    const onInput = (evt: React.FormEvent<HTMLInputElement>) => {
        const value = (evt.target as HTMLInputElement).value || "";
        console.log(unicodeInfo(value));
    };

    return (
        <>
            <h1>Unicode FYI</h1>
            <input type="text" id="input" onInput={onInput} />
            <div style={ { display: 'flex' } }>
            </div>
        </>
    );
};

ReactDOM.render(
    <App />,
    app
);