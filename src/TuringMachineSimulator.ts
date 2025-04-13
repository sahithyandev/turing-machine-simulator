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
	activeStatement: ProgramStatement | null = null;

	constructor(initialStatements: Array<ProgramStatement>) {
		this.statements = initialStatements;
	}

	render(): string {
		let s = `<div class="program-editor">`;

		for (let i = 0; i < this.statements.length; i++) {
			const statement = this.statements[i];
			s = s.concat(
				html`<div class="statement" id="${statement.currentState}-${statement.input}">
          <span>${(i + 1).toString().padStart(2, "0")}</span>
          ${statement.currentState} ${statement.input} : ${statement.nextState} ${statement.output} ${statement.action}
        </div>`,
			);
		}

		s = s.concat("</div>");
		return s;
	}

	highlightActiveStatement(
		container: HTMLElement,
		currentState: string,
		input: string,
	) {
		this.activeStatement = null;
		const previousActiveStatement = container.querySelector(
			".program-editor .statement.active",
		);
		if (previousActiveStatement) {
			previousActiveStatement.classList.remove("active");
		}

		for (let i = 0; i < this.statements.length; i++) {
			const statement = this.statements[i];
			if (
				statement.currentState === currentState &&
				statement.input === input
			) {
				this.activeStatement = statement;
				const statementElement = container.querySelector(
					`.statement#${statement.currentState}-${statement.input}`,
				);
				if (statementElement) {
					statementElement.classList.add("active");
				}
				break;
			}
		}
	}
}

class Tape {
	value: string[];

	constructor(initialValue: string[]) {
		this.value = initialValue;
	}

	stringify(): string {
		return this.value.join(",");
	}
	read(position: number) {
		return this.value[position];
	}

	write(container: HTMLElement, position: number, value: string) {
		this.value[position] = value;
		const element = container.querySelector(`#tape-cell-${position}`);
		if (element) {
			element.innerHTML = value;
		}
	}

	render(headPosition: number) {
		let s = `<div class="tape">`;
		for (let i = 0; i < this.value.length; i++) {
			if (i === headPosition) {
				s = s.concat(
					`<div class="cell head" id="tape-cell-${i}">${this.value[i]}</div>`,
				);
			} else {
				s = s.concat(
					`<div class="cell" id="tape-cell-${i}">${this.value[i]}</div>`,
				);
			}
		}
		s = s.concat("</div>");
		return s;
	}

	updateHeadPosition(container: HTMLElement, newHeadPosition: number) {
		const previousHead = container.querySelector(".tape .cell.head");
		if (previousHead) {
			previousHead.classList.remove("head");
		}

		const newHead = container.querySelector(`#tape-cell-${newHeadPosition}`);
		if (newHead) {
			newHead.classList.add("head");
		}
	}
}

export class TuringMachineSimulator {
	container: HTMLElement;
	currentState: string;
	currentTape: Tape;
	headPosition: number;
	editor: ProgramEditor;

	constructor(container: HTMLElement) {
		this.container = container;
		this.currentState = "Q0";
		this.currentTape = new Tape(["b", "b", "b", "b", "1", "1", "1", "b", "b"]);
		this.headPosition = 4;

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
            value="${this.currentTape.stringify()}"
            class="font-mono block p-2 w-full"
          />

          <label class="text-lg font-medium mt-4 mb-1 block" for="initial-state">Initial State</label>
          <input id="initial-state" type="text" value="${this.currentState}" class="font-mono block p-2 w-full" />

          <h2 class="text-lg font-medium mt-4 mb-1">Program Editor</h2>
          ${this.editor.render()}
        </section>
        <section class="canvas">
          <div>
            <h2 class="text-xl mb-1 font-medium">Current Tape</h2>
            ${this.currentTape.render(this.headPosition)}

            <h2 class="text-xl mb-1 mt-4 font-medium">Current State</h2>
            <span id="current-state" class="font-mono mt-10 mb-4 text-xl"> ${this.currentState} </span>
            <div class="flex justify-end gap-5 items-center">
              <span id="halted-message" class="hidden">The machine has halted.</span>
              <button id="next-btn">Next</button>
            </div>
          </div>
        </section>
      </div>
    `;

		this.editor.highlightActiveStatement(
			this.container,
			this.currentState,
			this.currentTape.read(this.headPosition),
		);
		this.addEventListeners();
	}

	nextStep() {
		if (!this.editor.activeStatement) return;

		this.currentState = this.editor.activeStatement.nextState;
		const currentStateEl = this.container.querySelector("#current-state");
		if (currentStateEl) {
			currentStateEl.textContent = this.currentState;
		}

		this.currentTape.write(
			this.container,
			this.headPosition,
			this.editor.activeStatement.output,
		);

		switch (this.editor.activeStatement.action) {
			case "L":
				this.headPosition -= 1;
				break;
			case "R":
				this.headPosition += 1;
				break;
			case "H": {
				const haltedMessageElement =
					this.container.querySelector("#halted-message");
				if (haltedMessageElement) {
					haltedMessageElement.classList.remove("hidden");
				}
				const nextBtn = this.container.querySelector("#next-btn");
				if (nextBtn instanceof HTMLButtonElement) {
					nextBtn.disabled = true;
				}
				return;
			}
		}
		this.currentTape.updateHeadPosition(this.container, this.headPosition);
		this.editor.highlightActiveStatement(
			this.container,
			this.currentState,
			this.currentTape.read(this.headPosition),
		);
	}

	addEventListeners() {
		const nextBtn = this.container.querySelector("#next-btn");
		if (nextBtn instanceof HTMLButtonElement) {
			nextBtn.addEventListener("click", () => this.nextStep());
		}
	}
}
