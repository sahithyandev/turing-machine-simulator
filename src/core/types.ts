export type ProgramStatement =
	| undefined
	| {
			currentState: string;
			input: string;
			nextState: string;
			output: string;
			action: "R" | "L" | "H";
	  };
