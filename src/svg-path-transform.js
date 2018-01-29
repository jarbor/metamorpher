
class Path extends Array {
	static make(input) {
		let path = new Path();

		if (input instanceof Path) {
			path.element = input.element;
			input.forEach(point => path.push(new Point(point)));
		}
		else {
			let dataString;
			
			if (typeof input === 'string') {
				dataString = input;
			}
			else {
				dataString = input.getAttribute('d');
				path.element = input;
			}

			dataString.split(' ').forEach(path.processToken, path);
		}

		return path;
	}

	processToken(token) {

		if (token === '') {
			// Do nothing
		}
		else if (isNaN(token)) {
			this.push(new Point(token));
		}
		else {
			this[this.length - 1].pushData(Number(token));
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
		return this.reduce((dataStringString, instruction) => `${dataStringString} ${instruction}`, '');
	}

	scale(factor, origin) {
		this.forEach(point => point.scale(factor, origin));
		this.paint();
		return this;
	}

	rotate(degrees, origin) {
		this.forEach(point => point.rotate(degrees, origin));
		this.paint();
		return this;
	}

	translate(x, y) {
		this.forEach(point => point.translate(x, y));
		this.paint();
		return this;
	}

	interpolate(startPath, endPath, progress) {
		this.forEach((point, index) => point.interpolate(startPath[index], endPath[index], progress));
		this.paint();
		return this;
	}

	get longestEdge() {
		if (!this._longestEdge) {
			let lastPoint,
				edges = [],
				longestEdge,
				longestEdgeLength = 0
			;

			this.forEach(point => {
				if (point.instruction === 'L') {
					edges.push(new Edge(lastPoint, point))
				}
				lastPoint = point;
			});

			edges.forEach(edge => {
				if (edge.length > longestEdgeLength) {
					longestEdge = edge;
					longestEdgeLength = edge.length;
				}
			})

			this._longestEdge = longestEdge;
		}

		return this._longestEdge;
	}
}

class Point {
	constructor() {
		if (arguments[0] instanceof Point) {
			this.instruction = arguments[0].instruction;
			this.x = arguments[0].x;
			this.y = arguments[0].y;
		}
		else {
			var args = Array.prototype.slice.call(arguments);
			args.forEach(this.pushData.bind(this));
		}
	}

	pushData(data) {
		if (typeof data === 'string') {
			this.instruction = data;
		}
		else {
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
	}

	toString() {
		return `${this.instruction}${this.x ? ' '+this.x : ''}${this.y ? ' '+this.y : ''}`;
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
	Point,
	Edge
};