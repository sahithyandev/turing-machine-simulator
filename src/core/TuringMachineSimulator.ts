import { html } from "../utils";
import { ProgramEditor } from "./ProgramEditor";
import { Tape } from "./Tape";
import type { ProgramStatement } from "./types";

function generateExplanationFromStatement(
	statement: ProgramStatement,
	index: number,
): string {
	return html`Based on these, the machine will execute the statement
    <span class="font-mono">${(index + 1).toString().padStart(2, "0")}</span>.<br />
    The next state will be <span class="font-mono">${statement.nextState}</span>.<br />
    "${statement.output}" will be written to the tape. After that,
    ${
			statement.action === "H"
				? "the machine will halt."
				: `the head will move <span class="font-mono">${statement.action === "R" ? "right" : "left"}</span>.`
		}`;
}

export class TuringMachineSimulator {
	container: HTMLElement;
	currentState: string;
	currentTape: Tape;
	headPosition: number;
	editor: ProgramEditor;
	isRunning: boolean;

	constructor(container: HTMLElement) {
		this.container = container;
		this.currentState = "Q0";
		this.currentTape = new Tape(["b", "b", "b", "b", "1", "1", "1", "b", "b"]);
		this.headPosition = 4;
		this.isRunning = true;

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
      <div class="grid grid-cols-1 lg:grid-cols-[400px_1fr] h-screen">
        <section class="lg:bg-stone-900/40 h-fit lg:h-full px-3 py-2 flex flex-col">
          <h1 class="mb-4 font-semibold text-2xl">Turing Machine Simulator</h1>

          <label class="block text-lg font-medium mt-2 mb-1">Initial Tape</label>
          <input
            id="initial-tape"
            type="text"
            value="${this.currentTape.stringify()}"
            class="font-mono block p-2 w-full"
          />

          <div class="grid grid-cols-2 grid-flow-col grid-rows-2 gap-x-2">
            <label class="text-lg font-medium mt-2 mb-1 block" for="initial-state">Initial State</label>
            <input id="initial-state" type="text" value="${this.currentState}" class="font-mono block p-2 w-full" />

            <label class="text-lg font-medium mt-2 mb-1 block" for="initial-head-position">Initial Head Position</label>
            <input
              id="initial-head-position"
              type="number"
              value="${this.headPosition + 1}"
              class="font-mono block p-2 w-full"
            />
          </div>

          <h2 class="text-lg font-medium mt-4 mb-1">Program Editor</h2>
          ${this.editor.render()}

          <button class="mt-auto w-full" id="rebuild-machine-btn">Rebuild machine</button>
        </section>
        <section class="canvas">
          <div>
            <h2 class="text-xl mb-1 font-medium">Current Tape</h2>
            <div class="tape">${this.currentTape.render(this.headPosition)}</div>

            <div class="flex justify-end mt-4 gap-5 items-center">
              <button id="next-btn">Next</button>
            </div>

            <p id="explanation" class="max-w-prose mt-5 text-lg"></p>
          </div>
        </section>
      </div>
    `;

		this.addEventListeners();
		this.renderExplanation();
		this.highlightActiveStatement();
	}

	highlightActiveStatement() {
		const activeStatement = this.editor.findActiveStatement(
			this.currentState,
			this.currentTape.read(this.headPosition),
		);
		if (activeStatement != null) {
			this.editor.highlightActiveStatement(this.container, activeStatement[1]);
		}
	}

	renderExplanation() {
		const explanationElement =
			this.container.querySelector<HTMLParagraphElement>("#explanation");
		if (!explanationElement) return;

		if (!this.isRunning) {
			explanationElement.innerHTML = "The machine has halted.";
			return;
		}

		const activeStatement = this.editor.findActiveStatement(
			this.currentState,
			this.currentTape.read(this.headPosition),
		);

		explanationElement.innerHTML = `The machine is in state <b class="font-mono">${this.currentState}</b>. The current input is
    <b class="font-mono">${this.currentTape.read(this.headPosition)}</b>.
    ${
			activeStatement == null
				? "No statements match the current state and input."
				: generateExplanationFromStatement(
						activeStatement[0],
						activeStatement[1],
					)
		}`;
	}

	halt() {
		this.isRunning = false;
		const nextBtn = this.container.querySelector("#next-btn");
		if (nextBtn instanceof HTMLButtonElement) {
			nextBtn.disabled = true;
		}
		this.renderExplanation();
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
				this.halt();
				return;
			}
		}
		this.currentTape.updateHeadPosition(this.container, this.headPosition);

		this.highlightActiveStatement();
		this.renderExplanation();
	}

	rebuildMachine() {
		const initialTapeInputElement =
			this.container.querySelector("#initial-tape");
		if (!(initialTapeInputElement instanceof HTMLInputElement)) return;

		const initialStateInputElement =
			this.container.querySelector("#initial-state");
		if (!(initialStateInputElement instanceof HTMLInputElement)) return;

		const initialHeadPositionInputElement = this.container.querySelector(
			"#initial-head-position",
		);
		if (!(initialHeadPositionInputElement instanceof HTMLInputElement)) return;

		const initialTape = initialTapeInputElement.value;
		const initialState = initialStateInputElement.value;
		const initialHeadPosition = initialHeadPositionInputElement.valueAsNumber;

		this.headPosition = initialHeadPosition - 1;

		this.currentTape.value = initialTape.split(",");

		const tape = this.container.querySelector(".tape");
		if (tape) {
			tape.innerHTML = this.currentTape.render(this.headPosition);
		}

		this.currentState = initialState;
		this.highlightActiveStatement();
		this.renderExplanation();
	}

	addEventListeners() {
		const nextBtn = this.container.querySelector("#next-btn");
		if (nextBtn instanceof HTMLButtonElement) {
			nextBtn.addEventListener("click", () => this.nextStep());
		}

		const rebuildBtn = this.container.querySelector("#rebuild-machine-btn");
		if (rebuildBtn instanceof HTMLButtonElement) {
			rebuildBtn.addEventListener("click", () => this.rebuildMachine());
		}
	}
}
