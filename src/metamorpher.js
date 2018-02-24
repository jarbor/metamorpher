
class Path {
	constructor(input) {
		this.instructions = [];

		if (input instanceof Path) {
			this.element = input.element;
			input.instructions.forEach(instruction => this.instructions.push(new Instruction(instruction)));
		}
		else {
			let dataString;
			
			if (typeof input === 'string') {
				dataString = input;
			}
			else {
				dataString = input.getAttribute('d');
				this.element = input;
			}

			dataString.split(' ').forEach(this.pushData, this);
		}
	}

	pushData(data) {

		if (data === '') {
			// Do nothing
		}
		else if (isNaN(data)) {
			this.instructions.push(new Instruction(data));
		}
		else {
			this.instructions[this.instructions.length - 1].pushData(Number(data));
		}
	}

	attach(element) {
		this.element = element;
		return this;
	}

	detach() {
		delete this.element;
		return this;
	}

	paint() {
		this.element && this.element.setAttribute('d', this.toString());
		return this;
	}

	toString() {
		return this.instructions.reduce((accumulator, instruction) => `${accumulator} ${instruction}`, '');
	}

	scale(factor, origin) {
		this.instructions.forEach(instruction => instruction.scale(factor, origin));
		return this;
	}

	rotate(degrees, origin) {
		this.instructions.forEach(instruction => instruction.rotate(degrees, origin));
		return this;
	}

	transform(path) {
		// TODO: Throw error if path lengths don't match
		this.instructions.forEach((instruction, index) => instruction.transform(path.instructions[index]));
		return this;
	}

	translate(x, y) {
		this.instructions.forEach(instruction => instruction.translate(x, y));
		return this;
	}

	interpolate(startPath, endPath, progress) {
		// TODO: Throw error if path lengths don't match
		this.instructions.forEach((instruction, index) => instruction.interpolate(startPath.instructions[index], endPath.instructions[index], progress));
		return this;
	}

	get longestEdge() {
		let lastPoint,
			edges = [],
			longestEdge,
			longestEdgeLength = 0
		;

		this.instructions.forEach(instruction => {
			let nextPoint = instruction.lastPoint;
			if (instruction.type === 'L') {
				edges.push(new Edge(lastPoint, nextPoint))
			}
			lastPoint = nextPoint;
		});

		edges.forEach(edge => {
			if (edge.length > longestEdgeLength) {
				longestEdge = edge;
				longestEdgeLength = edge.length;
			}
		})

		return longestEdge;
	}
}

class Instruction {
	constructor() {
		if (arguments[0] instanceof Instruction) {
			this.type = arguments[0].type;
			this.points = arguments[0].points.map(point => new Point(point));
		}
		else {
			this.points = [];
			var args = Array.prototype.slice.call(arguments);
			args.forEach(this.pushData.bind(this));
		}
	}

	pushData(data) {
		if (typeof data === 'string') {
			this.type = data;
		}
		else {
			this.nextIncompletePoint.pushData(data);
		}
	}

	get nextIncompletePoint() {
		let point;

		if (!this.points.length || this.points[this.points.length - 1].y !== undefined) {
			point = new Point();
			this.points.push(point);
		}
		else {
			point = this.points[this.points.length - 1];
		}

		return point;
	}

	get lastPoint() {
		return this.points.length ? this.points[this.points.length - 1] : undefined;
	}

	toString() {
		return this.points.reduce((accumulator, point) => `${accumulator} ${point}`, this.type);
	}

	scale(factor, origin) {
		this.points.forEach(point => point.scale(factor, origin));
		return this;
	}

	rotate(degrees, origin) {
		this.points.forEach(point => point.rotate(degrees, origin));
		return this;
	}

	transform(instruction) {
		// TODO: Throw error if path lengths don't match
		this.points.forEach((point, index) => point.transform(instruction.points[index]));
		return this;
	}

	translate(x, y) {
		this.points.forEach(point => point.translate(x, y));
		return this;
	}

	interpolate(startInstruction, endInstruction, progress) {
		// TODO: Throw error if path lengths don't match
		this.points.forEach((point, index) => point.interpolate(startInstruction.points[index], endInstruction.points[index], progress));
		return this;
	}

}

class Point {
	constructor() {
		if (arguments[0] instanceof Point) {
			this.x = arguments[0].x;
			this.y = arguments[0].y;
		}
		else {
			var args = Array.prototype.slice.call(arguments);
			args.forEach(this.pushData.bind(this));
		}
	}

	pushData(data) {
		if (this.x === undefined) {
			this.x = data;
		}
		else if (this.y === undefined) {
			this.y = data;
		}
		else {
			throw new Error(`Can't push ${data} - coordinates already defined: ${this}`);
		}
	}

	toString() {
		return `${this.x} ${this.y}`;
	}

	scale(factor, origin) {
		origin = origin || new Point(0, 0);
		this.x = (this.x - origin.x) * factor + origin.x;
		this.y = (this.y - origin.y) * factor + origin.y;
	}

	rotate(degrees, origin) {
		origin = origin || new Point(0, 0);
		let radians = degrees * Math.PI / 180; 
		let sin = Math.sin(radians);
		let cos = Math.cos(radians);

		// Translate point to origin
		let x = this.x - origin.x;
		let y = this.y - origin.y;

		// Rotate point
		let newX = x * cos - y * sin;
		let newY = x * sin + y * cos;

		// Translate point back
		this.x = newX + origin.x;
		this.y = newY + origin.y;
	}

	transform(point) {
		this.instruction = point.instruction;
		this.x = point.x;
		this.y = point.y;
	}

	translate(x, y) {
		this.x += x;
		this.y += y;
	}

	interpolate(startPoint, endPoint, progress) {
		this.x = (endPoint.x - startPoint.x) * progress + startPoint.x;
		this.y = (endPoint.y - startPoint.y) * progress + startPoint.y;
	}
}

class Edge {
	constructor(p1, p2) {
		this.p1 = p1;
		this.p2 = p2;
	}

	get length() {
		if (!this._length) {
			this._length = Math.sqrt(Math.pow(Math.abs(this.p1.x - this.p2.x), 2) + Math.pow(Math.abs(this.p1.y - this.p2.y), 2));
		}
		return this._length;
	}

	get angle() {
		if (!this._angle) {
			this._angle = (this.p1.y - this.p2.y) / (this.p1.x - this.p2.x);
		}
		return this._angle;
	}
}

export {
	Path,
	Instruction,
	Point,
	Edge
};