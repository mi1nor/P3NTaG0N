import { Tag } from "../Enums.js";
import { Rectangle } from "../Utilites.js";
import { GameObject } from "./GameObject.js";
export class Spikes extends GameObject {
    constructor(x, y, width, height) {
        super(width, height);
        this.Tag = Tag.Wall;
        this._x = x;
        this._y = y;
        this._collider = new Rectangle(0, 0, width, height);
    }
}
//# sourceMappingURL=Spikes.js.map