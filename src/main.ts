import { html } from "./utils";

const app = document.querySelector<HTMLElement>("main");

if (!(app instanceof HTMLElement)) {
  throw new Error("main element not found");
}

app.innerHTML = html`
  <div className="grid grid-cols-2">
    <section>
      <h1>Turing Machine Simulator</h1>
    </section>
  </div>
`;
