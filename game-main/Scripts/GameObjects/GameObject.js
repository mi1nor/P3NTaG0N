import { Rectangle, Vector2 } from "../Utilites.js";
export class GameObject {
    _x = 0;
    _y = 0;
    Width;
    Height;
    _collider;
    OnDestroy;
    Tag;
    constructor(width, height) {
        this.Width = width;
        this.Height = height;
    }
    Destroy() {
        if (this.OnDestroy !== undefined)
            this.OnDestroy();
    }
    GetRectangle() {
        return new Rectangle(this._x, this._y, this.Width, this.Height);
    }
    GetPosition() {
        return new Vector2(this._x, this._y);
    }
    GetSize() {
        return new Vector2(this.Width, this.Height);
    }
    GetCenter() {
        return new Vector2(this._x + this.Width / 2, this._y + this.Height / 2);
    }
    Update(dt) { }
    Render() { }
    GetCollider() {
        return this._collider;
    }
    static IsCollide(who, other) {
        const colliderWho = who.GetCollider();
        const colliderOther = other.GetCollider();
        return (colliderWho !== undefined &&
            colliderOther !== undefined &&
            who._x + colliderWho.Width > other._x &&
            who._x < other._x + colliderOther.Width &&
            who._y + colliderWho.Height > other._y &&
            who._y < other._y + colliderOther.Height);
    }
    static IsCollideByRect(who, other) {
        const colliderOther = other.GetCollider();
        return (colliderOther !== undefined && who.X + who.Width > other._x && who.X < other._x + colliderOther.Width && who.Y + who.Height > other._y && who.Y < other._y + colliderOther.Height);
    }
    static GetCollide(who, other) {
        if (this.IsCollide(who, other) === false)
            return false;
        const xstart = who._x + who.Width - other._x;
        const xend = other._x + other.Width - who._x;
        const ystart = other._y + other.Height - who._y;
        const yend = other._y - (who._y + who.Height);
        return {
            instance: other,
            position: new Vector2(0, 0),
            Normal: new Vector2(Math.sign(xstart), Math.sign(ystart)),
            start: new Vector2(xstart, ystart),
            end: new Vector2(xend, yend),
        };
    }
    static GetCollideByRect(who, other) {
        if (this.IsCollideByRect(who, other) === false)
            return false;
        const xstart = who.X + who.Width - other._x;
        const ystart = other._y + other.Height - who.Y;
        const xend = other._x + other.Width - who.X;
        const yend = other._y - (who.Y + who.Height);
        return {
            instance: other,
            position: new Vector2(0, 0),
            Normal: new Vector2(Math.sign(xstart), Math.sign(ystart)),
            start: new Vector2(xstart, ystart),
            end: new Vector2(xend, yend),
        };
    }
}
export class Interactable extends GameObject {
}
//# sourceMappingURL=GameObject.js.map