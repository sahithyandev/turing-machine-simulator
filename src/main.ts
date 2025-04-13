import { html } from "./utils";

const app = document.querySelector<HTMLDivElement>("#app");

if (!(app instanceof HTMLDivElement)) {
  throw new Error("App element not found");
}

app.innerHTML = html`
  <main>
    <h1>Hello World!</h1>
  </main>
`;
