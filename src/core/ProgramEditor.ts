import { html } from "../utils";
import type { ProgramStatement } from "./types";

export class ProgramEditor {
	statements: Array<ProgramStatement>;
	activeStatement: ProgramStatement | null = null;

	constructor(initialStatements: Array<ProgramStatement>) {
		this.statements = initialStatements;
	}

	render(mode: "editable" | "readonly"): string {
		let s = "";
		for (let i = 0; i < this.statements.length; i++) {
			const statement = this.statements[i];

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
            </div>`,
					);
					break;
			}
		}
		return s;
	}

	findActiveStatement(
		currentState: string,
		input: string,
	): [ProgramStatement, number] | null {
		for (let i = 0; i < this.statements.length; i++) {
			const statement = this.statements[i];
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
