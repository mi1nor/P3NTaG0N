import { Canvas } from "../../Context.js";
import { GetSound, GetSprite } from "../../Game.js";
import { Scene } from "../../Scene.js";
import { Rectangle, Sound, Sprite, Vector2 } from "../../Utilites.js";

export class Item {
	protected readonly _usingSound: Sound;
	readonly Icon: Sprite;
	readonly UseTime: number;
	readonly Big: boolean = false;
	protected _isUsing = false;
	protected _usingTime = -1;
	protected _usingCallback: () => void;
	protected _count = 0;

	constructor(count?: number) {
		this._count = Math.clamp(count ?? Math.round(Math.random() * this.GetStack()), 0, this.GetStack());
	}

	public Update(dt: number, position: Vector2, angle: number) {
		if (this._usingTime >= 0) {
			this._usingTime += dt;

			if (this._usingTime >= this.UseTime) {
				this._usingTime = -1;
				this._usingCallback();
				this.OnUsed();
			}
		}
	}

	public Use(callback: () => void) {
		if (this.UseTime === undefined) return;
		if (this._isUsing) return;
		this._isUsing = true;

		this._usingSound?.Play();
		this._usingCallback = callback;
		this._usingTime = 0;
	}

	public Render(at: Vector2, angle: number) {}

	public IsUsing() {
		return this._isUsing;
	}

	public GetCount() {
		return this._count;
	}

	public Take(count: number) {
		this._count = Math.clamp(this._count - count, 0, this.GetStack());
	}

	public GetStack() {
		return 1;
	}

	protected OnUsed() {}
}

export class Vodka extends Item {
	public readonly UseTime = 2500;
	public readonly Icon: Sprite = GetSprite("Vodka");
	protected readonly _usingSound = GetSound("Drink");

	static toString(): string {
		return "Водка";
	}

	public Render(at: Vector2, angle: number): void {
		const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;

		if ((angle > Math.PI / 2 && angle <= Math.PI) || (angle < Math.PI / -2 && angle >= -Math.PI))
			Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(at.X, at.Y, 35 * ratio, 35), angle, -(35 * ratio) / 2, 35);
		else Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 35 * ratio, 35), angle, -(35 * ratio) / 2, 35);
	}
}

export class Radio extends Item {
	public readonly UseTime = 1000;
	public readonly Icon = GetSprite("Radio") as Sprite;

	static toString(): string {
		return "Радио";
	}

	public Render(at: Vector2, angle: number): void {
		const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;

		if ((angle > Math.PI / 2 && angle <= Math.PI) || (angle < Math.PI / -2 && angle >= -Math.PI))
			Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 20);
		else Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 10);
	}

	protected OnUsed() {
		Scene.Player.Heal(10);
	}
}

export class DogTag extends Item {
	public readonly Icon = GetSprite("DogTag") as Sprite;

	static toString(): string {
		return "Жетон";
	}

	public Render(at: Vector2, angle: number): void {
		const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;

		if ((angle > Math.PI / 2 && angle <= Math.PI) || (angle < Math.PI / -2 && angle >= -Math.PI))
			Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 20);
		else Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 10);
	}
}

export class RatTail extends Item {
	public readonly Icon = GetSprite("RatTail") as Sprite;

	static toString(): string {
		return "Крысинный хвост";
	}

	public Render(at: Vector2, angle: number): void {
		const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;

		if ((angle > Math.PI / 2 && angle <= Math.PI) || (angle < Math.PI / -2 && angle >= -Math.PI))
			Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(at.X, at.Y, 15 * ratio, 15), angle, -10, 20);
		else Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 15 * ratio, 15), angle, -10, 10);
	}

	public Use(callback: () => void) {}
}

export class AidKit extends Item {
	public readonly UseTime = 5500;
	public readonly Icon: Sprite = GetSprite("AidKit");
	public readonly Big = true;
	protected readonly _usingSound = GetSound("AidKit");

	static toString(): string {
		return "Аптека";
	}

	public Render(at: Vector2): void {
		const ratio = this.Icon.BoundingBox.Height / this.Icon.BoundingBox.Width;
		const offset = new Vector2(-28, -40);

		Canvas.DrawImage(this.Icon, new Rectangle(at.X + offset.X, at.Y + offset.Y, 50, 50 * ratio));
	}

	protected OnUsed() {
		Scene.Player.Heal(50);
	}
}

export class Sausage extends Item {
	public readonly UseTime = 1500;
	public readonly Icon: Sprite = GetSprite("Sausage");
	protected readonly _usingSound = GetSound("Eat");

	static toString(): string {
		return "Колбаса";
	}

	public Render(at: Vector2, angle: number): void {
		const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;

		if ((angle > Math.PI / 2 && angle <= Math.PI) || (angle < Math.PI / -2 && angle >= -Math.PI))
			Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(at.X, at.Y, 15 * ratio, 15), angle, -10, 14);
		else Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 15 * ratio, 15), angle + Math.PI / 2, -15, 7);
	}

	protected OnUsed() {
		Scene.Player.Heal(10);
	}
}

export class Adrenalin extends Item {
	public readonly UseTime = 1000;
	public readonly Icon: Sprite = GetSprite("Syringe");
	protected readonly _usingSound = GetSound("Syringe");

	static toString(): string {
		return "Адреналин";
	}

	public Render(at: Vector2, angle: number): void {
		const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;

		if ((angle > Math.PI / 2 && angle <= Math.PI) || (angle < Math.PI / -2 && angle >= -Math.PI))
			Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 6);
		else Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -3, 3);
	}

	protected OnUsed() {
		Scene.Player.Heal(30);
	}
}

export class Bread extends Item {
	public readonly UseTime = 1500;
	public readonly Icon: Sprite = GetSprite("Bread");
	protected readonly _usingSound = GetSound("Eat");

	static toString(): string {
		return "Хлеб";
	}

	public Render(at: Vector2, angle: number): void {
		const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;

		if ((angle > Math.PI / 2 && angle <= Math.PI) || (angle < Math.PI / -2 && angle >= -Math.PI))
			Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 20);
		else Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 10);
	}

	protected OnUsed() {
		Scene.Player.Heal(15);
	}
}

export class PistolBullet extends Item {
	public readonly Icon: Sprite = GetSprite("Pistol_Bullet");
	public declare readonly Stack = 60;

	static toString(): string {
		return "9x19";
	}

	public Render(at: Vector2, angle: number): void {
		const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;

		if ((angle > Math.PI / 2 && angle <= Math.PI) || (angle < Math.PI / -2 && angle >= -Math.PI))
			Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 20);
		else Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 10);
	}

	public GetStack() {
		return 60;
	}
}

export class RifleBullet extends Item {
	public readonly Icon: Sprite = GetSprite("Rifle_Bullet");
	public declare readonly Stack = 60;

	static toString(): string {
		return "7,62x39";
	}

	public Render(at: Vector2, angle: number): void {
		const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;

		if ((angle > Math.PI / 2 && angle <= Math.PI) || (angle < Math.PI / -2 && angle >= -Math.PI))
			Canvas.DrawImageWithAngleVFlipped(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 20);
		else Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 10);
	}

	public GetStack() {
		return 30;
	}
}
