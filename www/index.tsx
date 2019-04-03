import * as wasm from "unicode-fyi";
import * as React from 'react';
import * as ReactDOM from "react-dom";

console.info(wasm.unicode_info("Family! 👪"))

const input = document.getElementById("input");

const results = document.getElementById("results");

input.addEventListener("input", evt => {
    const value = (evt.target as HTMLInputElement).value || "";
    console.log(wasm.unicode_info(value));
    console.log(Hello());
});

export const Hello = () => {
    return (<h1>Hello!</h1>);
};

ReactDOM.render(
    <Hello />,
    results
);