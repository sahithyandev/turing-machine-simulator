export interface ProgramStatement {
	currentState: string;
	input: string;
	nextState: string;
	output: string;
	action: "R" | "L" | "H";
}
