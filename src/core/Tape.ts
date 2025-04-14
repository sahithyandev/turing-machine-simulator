export class Tape {
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
		let s = "";
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
