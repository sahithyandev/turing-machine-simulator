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
  editor: ProgramEditor;

  constructor(container: HTMLElement) {
    this.container = container;

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

          <h2 class="text-lg font-medium mb-3">Tape</h2>
          <div></div>

          <h2 class="text-lg font-medium mb-3">Initial State</h2>

          <h2 class="text-lg font-medium mb-3">Program Editor</h2>
          ${this.editor.render()}
        </section>
      </div>
    `;
  }
}
