import * as wasm from "unicode-fyi";
import * as React from 'react';
import * as ReactDOM from "react-dom";

console.info(wasm.unicode_info("Family! 👪"))

const app = document.getElementById("app");

export const App = () => {
    const onInput = (evt: React.FormEvent<HTMLInputElement>) => {
        const value = (evt.target as HTMLInputElement).value || "";
        console.log(wasm.unicode_info(value));
    };

    return (
        <>
            <h1>Unicode FYI</h1>
            <input type="text" id="input" onInput={onInput} />
        </>
    );
};

ReactDOM.render(
    <App />,
    app
);