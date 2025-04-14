import { TuringMachineSimulator } from "./core/TuringMachineSimulator";

const app = document.querySelector<HTMLElement>("main");

if (!(app instanceof HTMLElement)) {
  throw new Error("main element not found");
}

new TuringMachineSimulator(app);
