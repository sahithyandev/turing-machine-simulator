import { html } from "../utils";
import { ProgramEditor } from "./ProgramEditor";
import { generateExplanation } from "./ProgramStatement";
import { Tape } from "./Tape";
import {
	INITIAL_HEAD_POSITION,
	INITIAL_PROGRAM_STATEMENTS,
	INITIAL_STATE,
	INITIAL_TAPE_INPUT,
} from "./constants";

export class TuringMachineSimulator {
	container: HTMLElement;
	currentState: string;
	currentTape: Tape;
	headPosition: number;
	editor: ProgramEditor;
	runningState: "idle" | "started" | "halted";

	constructor(container: HTMLElement) {
		this.container = container;
		this.currentState = INITIAL_STATE;
		this.currentTape = new Tape(INITIAL_TAPE_INPUT);
		this.headPosition = INITIAL_HEAD_POSITION;
		this.runningState = "idle";

		this.editor = new ProgramEditor(INITIAL_PROGRAM_STATEMENTS);

		this.container.innerHTML = html`
      <div class="grid grid-cols-1 lg:grid-cols-[400px_1fr] h-screen">
        <section id="control-panel" class="lg:bg-stone-900/40 h-fit lg:h-full px-3 py-2 flex flex-col">
          <h1 class="font-semibold text-2xl">Turing Machine Simulator</h1>
          <p class="mb-5 text-lg">
            Made by <a href="https://sahithyan.dev" class="underline" target="_blank">Sahithyan</a>
          </p>

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
          <div class="program-editor"></div>
          <div class="program-editor-controls">
            <button id="add-statement-btn">Add statement</button>
          </div>

          <button class="mt-auto w-full" id="build-machine-btn">Build machine</button>
        </section>
        <section class="canvas"></section>
      </div>
    `;

		const buildMachineBtn = this.container.querySelector("#build-machine-btn");
		if (buildMachineBtn instanceof HTMLButtonElement) {
			buildMachineBtn.addEventListener("click", () => {
				switch (this.runningState) {
					case "idle":
						this.buildMachine();
						break;
					case "halted":
					case "started":
						this.reset();
						break;
				}
			});
		}

		const addStatementBtn = this.container.querySelector("#add-statement-btn");
		if (addStatementBtn) {
			addStatementBtn.addEventListener("click", () => {
				this.editor.addStatement(undefined);
				this.renderProgramEditor();
			});
		}

		this.reset();
		this.buildMachine();
	}

	renderEmptyCanvas() {
		const canvasElement = this.container.querySelector(".canvas");
		if (!canvasElement) return;
		canvasElement.innerHTML = html` <p class="text-xl py-40 xl:text-2xl text-center">
      Edit the machine in the control panel.<br />
      Build the machine to visualize it.
    </p>`;
	}

	renderMachine() {
		const canvasElement = this.container.querySelector(".canvas");
		if (!canvasElement) return;
		canvasElement.innerHTML = html`<div class="px-3">
      <h2 class="text-xl mb-1 font-medium">Current Tape</h2>
      <div class="tape">${this.currentTape.render(this.headPosition)}</div>
      <div class="flex justify-end mt-4 gap-5 items-center">
        <button id="next-btn">Next</button>
      </div>
      <p id="explanation" class="max-w-prose mt-5 text-lg"></p>
    </div>`;

		const nextBtn = this.container.querySelector("#next-btn");
		if (nextBtn instanceof HTMLButtonElement) {
			nextBtn.addEventListener("click", () => this.nextStep());
		}

		this.renderProgramEditor();
		this.highlightActiveStatement();
		this.renderExplanation();
	}

	highlightActiveStatement() {
		if (this.runningState !== "started") {
			const previousActiveStatement = this.container.querySelector(
				".program-editor .statement.active",
			);
			if (previousActiveStatement) {
				previousActiveStatement.classList.remove("active");
			}
			return;
		}

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

		if (this.runningState === "halted") {
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
				: generateExplanation(activeStatement[0], activeStatement[1])
		}`;
	}

	deleteStatement(statementIndex: number) {
		const shouldUpdate = this.editor.removeStatement(statementIndex);
		if (!shouldUpdate) return;
		this.renderProgramEditor();
	}

	renderProgramEditor(shouldAddListeners = false) {
		const programEditorElement =
			this.container.querySelector(".program-editor");
		if (!programEditorElement) return;

		if (this.runningState === "started") {
			programEditorElement.innerHTML = this.editor.render("readonly");
		} else if (this.runningState === "idle") {
			programEditorElement.innerHTML = this.editor.render("editable");

			if (shouldAddListeners) {
				programEditorElement.addEventListener("click", (event) => {
					const target = event.target;
					if (!(target instanceof HTMLElement || target instanceof SVGElement))
						return;
					const btn = target.closest(".delete-statement-btn");
					if (!(btn instanceof HTMLButtonElement)) return;

					const index = btn.dataset.index;
					if (index === undefined) return;
					const parsedIndex = Number.parseInt(index);
					if (Number.isNaN(parsedIndex)) return;

					this.deleteStatement(parsedIndex);
				});

				programEditorElement.addEventListener("input", (e) => {
					const target = e.target;
					if (!(target instanceof HTMLInputElement)) return;
					const index = target.dataset.index;
					if (typeof index === "undefined") return;
					const indexParsed = Number.parseInt(index);
					if (Number.isNaN(indexParsed)) return;

					const parsed = ProgramEditor.parseProgramStatementInput(target.value);
					if (parsed === null) {
						// TODO: show invalid state
						return;
					}
					this.editor.statements[indexParsed] = parsed;
				});
			}
		}
	}

	reset() {
		const buildMachineBtn = this.container.querySelector("#build-machine-btn");
		if (buildMachineBtn) {
			buildMachineBtn.innerHTML = "Build machine";
		}

		this.runningState = "idle";
		this.renderProgramEditor(true);

		const programEditorControlsElement = this.container.querySelector(
			".program-editor-controls",
		);
		if (programEditorControlsElement) {
			programEditorControlsElement.classList.remove("hide");
		}

		const inputsInSidebar = this.container.querySelectorAll(
			"#control-panel input",
		);
		for (let i = 0; i < inputsInSidebar.length; i++) {
			const inputElement = inputsInSidebar.item(i);
			if (inputElement instanceof HTMLInputElement) {
				inputElement.disabled = false;
			}
		}
		this.renderEmptyCanvas();
		this.highlightActiveStatement();
	}

	halt() {
		this.runningState = "halted";
		const nextBtn = this.container.querySelector("#next-btn");
		if (nextBtn instanceof HTMLButtonElement) {
			nextBtn.disabled = true;
		}
		this.renderExplanation();
		this.highlightActiveStatement();
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

	buildMachine() {
		const buildMachineBtn = this.container.querySelector("#build-machine-btn");
		if (buildMachineBtn instanceof HTMLButtonElement) {
			buildMachineBtn.innerHTML = "Reset";
		}

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
		const inputsInSidebar = this.container.querySelectorAll(
			"#control-panel input",
		);
		for (let i = 0; i < inputsInSidebar.length; i++) {
			const inputElement = inputsInSidebar.item(i);
			if (inputElement instanceof HTMLInputElement) {
				inputElement.disabled = true;
			}
		}

		this.currentState = initialState;
		this.runningState = "started";

		const programEditorControlsElement = this.container.querySelector(
			".program-editor-controls",
		);
		if (programEditorControlsElement) {
			programEditorControlsElement.classList.add("hide");
		}

		this.renderMachine();
	}
}
