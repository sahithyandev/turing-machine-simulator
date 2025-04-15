import { html } from "../utils";
import type { ProgramStatement } from "./types";

export class ProgramEditor {
	statements: Array<ProgramStatement>;
	activeStatement: ProgramStatement | null = null;

	constructor(initialStatements: Array<ProgramStatement>) {
		this.statements = initialStatements;
	}

	addStatement(statement: ProgramStatement, index = -1) {
		if (
			statement === undefined ||
			index < 0 ||
			index >= this.statements.length
		) {
			this.statements.push(statement);
			return;
		}
		this.statements[index] = statement;
	}

	render(mode: "editable" | "readonly"): string {
		let s = "";
		for (let i = 0; i < this.statements.length; i++) {
			const statement = this.statements[i];

			if (statement === undefined) {
				switch (mode) {
					case "readonly":
						s = s.concat(
							html`<div class="statement" id="statement-${i}">
                <span>${(i + 1).toString().padStart(2, "0")}</span>
              </div>`,
						);
						break;
					case "editable":
						s = s.concat(
							html`<div class="statement" id="statement-${i}">
                <span>${(i + 1).toString().padStart(2, "0")}</span>
                <input data-index="${i}" type="text" value="" placeholder="" />
                <button id="delete-statement-btn-${i}" class="delete-statement-btn" data-index="${i}">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 7l16 0" />
                    <path d="M10 11l0 6" />
                    <path d="M14 11l0 6" />
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                  </svg>
                </button>
              </div>`,
						);
						break;
				}
				continue;
			}

			switch (mode) {
				case "readonly":
					s = s.concat(
						html`<div class="statement" id="${statement.currentState}-${statement.input}">
              <span>${(i + 1).toString().padStart(2, "0")}</span>
              ${statement.currentState} ${statement.input} : ${statement.nextState} ${statement.output}
              ${statement.action}
            </div>`,
					);
					break;
				case "editable":
					s = s.concat(
						html`<div class="statement" id="${statement.currentState}-${statement.input}">
              <span>${(i + 1).toString().padStart(2, "0")}</span>
              <input
                data-index="${i}"
                type="text"
                value="${statement.currentState} ${statement.input} : ${statement.nextState} ${statement.output} ${statement.action}"
              />
              <button id="delete-statement-btn-${i}" class="delete-statement-btn" data-index="${i}">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 7l16 0" />
                  <path d="M10 11l0 6" />
                  <path d="M14 11l0 6" />
                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                </svg>
              </button>
            </div>`,
					);
					break;
			}
		}
		return s;
	}

	removeStatement(index: number): boolean {
		if (index < 0 || index >= this.statements.length) return false;
		if (index === 0) {
			this.statements.shift();
			return true;
		}

		this.statements = this.statements
			.slice(0, index)
			.concat(this.statements.slice(index + 1));
		return true;
	}

	findActiveStatement(
		currentState: string,
		input: string,
	): [ProgramStatement, number] | null {
		for (let i = 0; i < this.statements.length; i++) {
			const statement = this.statements[i];
			if (statement === undefined) continue;
			if (
				statement.currentState === currentState &&
				statement.input === input
			) {
				return [statement, i];
			}
		}
		return null;
	}

	highlightActiveStatement(container: HTMLElement, statementIndex: number) {
		this.activeStatement = null;
		const previousActiveStatement = container.querySelector(
			".program-editor .statement.active",
		);
		if (previousActiveStatement) {
			previousActiveStatement.classList.remove("active");
		}

		const statement = this.statements[statementIndex];
		if (statement === undefined) return;
		this.activeStatement = statement;
		const statementElement = container.querySelector(
			`.statement#${statement.currentState}-${statement.input}`,
		);
		if (statementElement) {
			statementElement.classList.add("active");
		}
	}

	static parseProgramStatementInput(input: string): null | ProgramStatement {
		const separatedByColon = input.split(":");
		if (separatedByColon.length !== 2) return null;

		const inputConditions = separatedByColon[0].trim().split(" ");
		if (inputConditions.length !== 2) return null;

		const outputConditions = separatedByColon[1].trim().split(" ");
		if (outputConditions.length !== 3) return null;

		if (
			outputConditions[2] !== "H" &&
			outputConditions[2] !== "R" &&
			outputConditions[2] !== "L"
		)
			return null;

		return {
			currentState: inputConditions[0],
			input: inputConditions[1],
			nextState: outputConditions[0],
			output: outputConditions[1],
			action: outputConditions[2],
		};
	}
}
