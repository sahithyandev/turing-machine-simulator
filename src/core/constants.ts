import type { ProgramStatement } from "./ProgramStatement";

export const INITIAL_STATE = "Q0";
export const INITIAL_HEAD_POSITION = 4;
export const INITIAL_TAPE_INPUT = ["b", "b", "b", "b", "1", "1", "1", "b", "b"];
export const INITIAL_PROGRAM_STATEMENTS: Array<ProgramStatement> = [
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
];
