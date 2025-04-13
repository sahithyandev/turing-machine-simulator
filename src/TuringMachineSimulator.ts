import { html } from "./utils";

interface ProgramStatement {
  currentState: string;
  input: string;
  nextState: string;
  output: string;
  action: "R" | "L" | "H";
}

class ProgramEditor {
  statements: ProgramStatement[];
  constructor(initialStatements: Array<ProgramStatement>) {
    this.statements = initialStatements;
  }

  render(): string {
    let s = `<div class="program-editor">`;

    for (let i = 0; i < this.statements.length; i++) {
      const statement = this.statements[i];
      s = s.concat(
        html`<div class="statement">
          <span>${(i + 1).toString().padStart(2, "0")}</span>
          ${statement.currentState} ${statement.input} : ${statement.nextState} ${statement.output} ${statement.action}
        </div>`,
      );
    }

    s = s.concat("</div>");
    return s;
  }
}

export class TuringMachineSimulator {
  container: HTMLElement;
  currentState: string;
  currentTape: string[];
  editor: ProgramEditor;

  constructor(container: HTMLElement) {
    this.container = container;
    this.currentState = "Q0";
    this.currentTape = ["b", "b", "b", "1", "1", "b", "b"];

    this.editor = new ProgramEditor([
      {
        currentState: "Q0",
        input: "1",
        nextState: "Q1",
        output: "X",
        action: "L",
      },
      {
        currentState: "Q0",
        input: "X",
        nextState: "Q0",
        output: "X",
        action: "R",
      },
      {
        currentState: "Q0",
        input: "Y",
        nextState: "Q0",
        output: "Y",
        action: "R",
      },
      {
        currentState: "Q1",
        input: "X",
        nextState: "Q1",
        output: "X",
        action: "L",
      },
      {
        currentState: "Q1",
        input: "Y",
        nextState: "Q1",
        output: "Y",
        action: "L",
      },
      {
        currentState: "Q1",
        input: "b",
        nextState: "Q0",
        output: "Y",
        action: "R",
      },
      {
        currentState: "Q0",
        input: "b",
        nextState: "Q2",
        output: "b",
        action: "L",
      },
      {
        currentState: "Q2",
        input: "X",
        nextState: "Q2",
        output: "1",
        action: "L",
      },
      {
        currentState: "Q2",
        input: "Y",
        nextState: "Q2",
        output: "1",
        action: "L",
      },
      {
        currentState: "Q2",
        input: "b",
        nextState: "Q2",
        output: "b",
        action: "R",
      },
      {
        currentState: "Q2",
        input: "1",
        nextState: "Q2",
        output: "1",
        action: "H",
      },
    ]);

    this.container.innerHTML = html`
      <div class="grid grid-cols-[400px_1fr] h-screen">
        <section class="bg-stone-900/40 h-full px-3 py-2">
          <h1 class="mb-4 font-semibold text-2xl">Turing Machine Simulator</h1>

          <label class="block text-lg font-medium mt-4 mb-1">Initial Tape</label>
          <input
            id="initial-tape"
            type="text"
            value="${this.currentTape.join(",")}"
            class="font-mono block p-2 w-full"
            / >

          <label class="text-lg font-medium mt-4 mb-1 block" for="initial-state">Initial State</label>
          <input id="initial-state" type="text" value="${this.currentState}" class="font-mono block p-2 w-full" />

          <h2 class="text-lg font-medium mt-4 mb-1">Program Editor</h2>
          ${this.editor.render()}
        </section>
      </div>
    `;
  }
}
