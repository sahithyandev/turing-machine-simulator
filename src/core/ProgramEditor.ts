import { html } from "../utils";
import type { ProgramStatement } from "./types";

export class ProgramEditor {
	statements: Array<ProgramStatement>;
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
}
