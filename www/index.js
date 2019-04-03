import * as wasm from "unicode-fyi";

console.info(wasm.unicode_info("Family! 👪"))

const input = document.getElementById("input");

input.addEventListener("input", evt => {
    const value = evt.target.value || "";
    console.log(wasm.unicode_info(value));
});