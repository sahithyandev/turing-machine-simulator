import { html } from "../utils";

export type ProgramStatement =
	| undefined
	| {
			currentState: string;
			input: string;
			nextState: string;
			output: string;
			action: "R" | "L" | "H";
	  };

export function generateExplanation(
	statement: ProgramStatement,
	index: number,
): string {
	if (statement === undefined) return "";
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
