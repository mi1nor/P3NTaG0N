import { Tag } from "../Enums.js";
import { Rectangle, GameObject } from "../Utilites.js";
export class Platform extends GameObject {
    constructor(x, y, width, height) {
        super(width, height);
        this.Tag = Tag.Platform;
        this._x = x;
        this._y = y;
        this._collider = new Rectangle(0, 0, width, height);
    }
    Render() {
        // Canvas.SetFillColor(new Color(100, 50, 50, 100));
        // Canvas.DrawRectangle(
        // 	this._x - Scene.Current.GetLevelPosition(),
        // 	this._y,
        // 	this._width,
        // 	this._height
        // );
    }
}
