import { EnemyType, Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Canvas } from "../../Context.js";
import { Color, Rectangle, Sprite, Vector2 } from "../../Utilites.js";
import { Player } from "../Player.js";
import { Enemy } from "./Enemy.js";
import { Corpse } from "../Corpse.js";
import { AidKit } from "../../Assets/Items/Item.js";
import { Glock, Weapon } from "../../Assets/Weapons/Weapon.js";
import { GetSprite } from "../../Game.js";
import { GuardFake } from "../QuestGivers/GuardFake.js";
import { FakeEndGuard } from "../QuestGivers/FakeEndGuard.js";
import { Character } from "../QuestGivers/Character.js";
import { Elder } from "../QuestGivers/Elder.js";

export class Human extends Enemy {
	private static readonly _deathSound = new Audio("Sounds/human_death-2.mp3");
	private readonly _frames: {
		Walk: Sprite[];
		Hands: {
			Straight: Sprite;
			Bend: Sprite;
		};
	};
	private readonly _weapon: Weapon;
	private static readonly _visibleDistance = 500;
	private readonly _armHeight = 0.6;
	private _timeToNextFrame = 0;
	private _frameIndex = 0;
	private _angle = 0;
	private _timeFromNotice = -1;
	private _timeFromSaw = -1;
	private _aggresive = false;
	private _friendly = false;
	private readonly _timeToShoot = 500;
	private readonly _timeToTurn = 1500;
	private readonly _fakeCharacter = new GuardFake(0, 0);
	private readonly _fakeEndCharacter = new FakeEndGuard();
	private _warned = false;

	constructor(x: number, y: number, type: EnemyType.Green | EnemyType.Red, direction: -1 | 1 = 1, weapon?: Weapon) {
		super(50, 100, 1, 100, type);

		this._x = x;
		this._y = y;
		this._weapon = weapon ?? new Glock();
		this.Direction = direction;

		this._frames =
			type === EnemyType.Green
				? {
						Walk: GetSprite("Human_Green_Walk"),
						Hands: {
							Straight: GetSprite("Human_Green_Arm_Straight"),
							Bend: GetSprite("Human_Green_Arm_Bend"),
						},
				  }
				: {
						Walk: GetSprite("Human_Red_Walk"),
						Hands: {
							Straight: GetSprite("Human_Red_Arm_Straight"),
							Bend: GetSprite("Human_Red_Arm_Bend"),
						},
				  };

		this._collider = new Rectangle(this._x, this._y, this.Width, this.Height);

		this._angle = this.Direction === -1 ? Math.PI : 0;

		this._weapon.Load();
		this._weapon.Update(0, new Vector2(this._x + this.Width / 2 + Math.cos(this._angle) * 20, this._y + this.Height * this._armHeight - Math.sin(this._angle) * 20), this._angle);
	}

	override Update(dt: number): void {
		if (this._timeFromNotice >= 0) this._timeFromNotice += dt;
		if (this._timeFromSaw >= 0) this._timeFromSaw += dt;

		this.ApplyVForce(dt);

		const plrPos = Scene.Current.Player.GetPosition();
		const plrSize = Scene.Current.Player.GetCollider();

		if (Scene.Current.Player.IsMoving() === 2 && this.GetDirectionToPlayer() != this.Direction && this.GetDistanceToPlayer() < Human._visibleDistance && this._timeFromNotice === -1)
			this._timeFromNotice = 0;
		else if (this._timeFromNotice > this._timeToTurn) {
			this.Direction = this.GetDirectionToPlayer();

			if (this._timeFromSaw === -1) this._timeFromSaw = 0;
		}

		if (this.IsSpotPlayer()) {
			this._timeFromNotice = this._timeToTurn + 1;

			this._angle = -Math.atan2(plrPos.Y + plrSize.Height * 0.5 - (this._y + this.Height * this._armHeight), plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2));

			this._weapon?.Update(dt, new Vector2(this._x + this.Width / 2 + Math.cos(this._angle) * 20, this._y + this.Height * this._armHeight - Math.sin(this._angle) * 20), this._angle);

			if (this._aggresive) {
				if (this._timeFromSaw > this._timeToShoot) {
					const prevX = this._x;

					if (this.GetDistanceToPlayer() < Human._visibleDistance) {
						if (this.Direction == -1) this.MoveRight(dt);
						else this.MoveLeft(dt);

						if (prevX != this._x) {
							this._timeToNextFrame -= dt;

							if (this._timeToNextFrame < 0) {
								this._frameIndex = (this._frameIndex + 1) % this._frames.Walk.length;
								this._timeToNextFrame = 150;
							}
						} else this._frameIndex = 0;
					}

					if (!this._weapon.IsReloading()) {
						if (this._weapon.GetLoadedAmmo() === 0) this._weapon.Reload();
						else this._weapon.TryShoot(Tag.Player);
					}
				}
			} else {
				if (this._type === EnemyType.Red) {
					if ((Scene.Current.GetByType(Elder)[0] as Character).GetCompletedQuestsCount() === 1) {
						if (!this._warned) {
							Scene.Current.GetByTag(Tag.Enemy).forEach((x) => {
								if (x instanceof Human) x.MakeWarned();
							});

							Scene.Player.SpeakWith(this._fakeEndCharacter);
						}
					} else if (this.GetDistanceToPlayer() < 700 && !this._warned) {
						this._warned = true;
						Scene.Player.SpeakWith(this._fakeEndCharacter);
					} else if (this.GetDistanceToPlayer() < 500 && this._warned) {
						this._aggresive = true;
					} else if (this.GetDistanceToPlayer() > 1000)
						Scene.Current.GetByTag(Tag.Enemy).forEach((x) => {
							if (x instanceof Human) x.MakeUnwarned();
						});
				} else if (!this._friendly && this.GetDistanceToPlayer() < 500 && this._fakeCharacter.GetCompletedQuestsCount() === 0) {
					Scene.Current.GetByTag(Tag.Enemy).forEach((x) => {
						if (x instanceof Human) x.MakeFriendly();
					});

					Scene.Player.SpeakWith(this._fakeCharacter);
					this._friendly = true;
				}
			}
		} else this._frameIndex = 0;
	}

	override Render(): void {
		const framesPack = this._frames.Walk;
		const scale = this.Height / framesPack[0].BoundingBox.Height;
		const scaledWidth = framesPack[0].BoundingBox.Width * scale;
		const widthOffset = (scaledWidth - this.Width) / 2;

		if (this._timeFromNotice >= 0 && this._timeFromSaw < this._timeToShoot)
			Canvas.DrawImage(GetSprite("Notice") as Sprite, new Rectangle(this._x - Scene.Current.GetLevelPosition() + widthOffset, this._y + this.Height + 15, 20, 20));

		if (this.Direction == 1) {
			if (this._weapon.Heavy)
				Canvas.DrawImageWithAngle(
					this._frames.Hands.Straight,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * this._armHeight,
						this._frames.Hands.Straight.BoundingBox.Width * scale,
						this._frames.Hands.Straight.BoundingBox.Height * scale
					),
					this._angle - 0.05,
					-4 * scale,
					(this._frames.Hands.Straight.BoundingBox.Height - 3) * scale
				);

			Canvas.DrawImage(framesPack[this._frameIndex], new Rectangle(this._x - Scene.Current.GetLevelPosition() - widthOffset, this._y, scaledWidth, this.Height));

			this._weapon.Render();

			if (this._weapon.Heavy)
				Canvas.DrawImageWithAngle(
					this._frames.Hands.Bend,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * this._armHeight,
						this._frames.Hands.Bend.BoundingBox.Width * scale,
						this._frames.Hands.Bend.BoundingBox.Height * scale
					),
					this._angle,
					-4 * scale,
					(this._frames.Hands.Straight.BoundingBox.Height + 3) * scale
				);
			else
				Canvas.DrawImageWithAngle(
					this._frames.Hands.Straight,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * this._armHeight,
						this._frames.Hands.Straight.BoundingBox.Width * scale,
						this._frames.Hands.Straight.BoundingBox.Height * scale
					),
					this._angle - 0.05,
					-4 * scale,
					(this._frames.Hands.Straight.BoundingBox.Height - 3) * scale
				);
		} else {
			if (this._weapon.Heavy)
				Canvas.DrawImageWithAngleVFlipped(
					this._frames.Hands.Bend,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * this._armHeight,
						this._frames.Hands.Bend.BoundingBox.Width * scale,
						this._frames.Hands.Bend.BoundingBox.Height * scale
					),
					this._angle,
					-4 * scale,
					(this._frames.Hands.Straight.BoundingBox.Height + 3) * scale
				);

			Canvas.DrawImageFlipped(framesPack[this._frameIndex], new Rectangle(this._x - Scene.Current.GetLevelPosition() - widthOffset, this._y, scaledWidth, this.Height));

			this._weapon.Render();

			Canvas.DrawImageWithAngleVFlipped(
				this._frames.Hands.Straight,
				new Rectangle(
					this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
					this._y + this.Height * this._armHeight,
					this._frames.Hands.Straight.BoundingBox.Width * scale,
					this._frames.Hands.Straight.BoundingBox.Height * scale
				),
				this._angle + 0.05,
				-4 * scale,
				(this._frames.Hands.Straight.BoundingBox.Height - 3) * scale
			);
		}
	}

	override IsSpotPlayer(): boolean {
		if (!Scene.Player.IsAlive()) return false;

		const plrPos = Scene.Current.Player.GetPosition();
		const plrSize = Scene.Current.Player.GetCollider();

		if (Math.sign(plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2)) != this.Direction) return false;

		const hit = Scene.Current.Raycast(
			new Vector2(this._x + this.Width / 2, this._y + this.Height * 0.4),
			new Vector2(plrPos.X - this._x, plrPos.Y + plrSize.Height * 0.9 - (this._y + this.Height * 0.4)),
			1000,
			Tag.Player | Tag.Wall
		)[0];

		return hit !== undefined && hit.instance instanceof Player && hit.instance.IsAlive();
	}

	override TakeDamage(damage: number): void {
		super.TakeDamage(damage);

		Scene.Current.GetByTag(Tag.Enemy).forEach((x) => {
			if (x instanceof Human) x.MakeAgressive();
		});
		this.Direction = this.GetDirectionToPlayer();
		if (this._timeFromNotice === -1) this._timeFromNotice = 0;

		if (this._health <= 0) {
			this.Destroy();

			Scene.Current.Player.OnKilled(this._type);
			Scene.Current.Instantiate(new Corpse(this._x, this._y, this._weapon, new AidKit()));

			const s = Human._deathSound.cloneNode() as HTMLAudioElement;
			s.playbackRate = 0.5;
			s.volume = 1;
			s.play();
		}
	}

	public MakeFriendly() {
		this._friendly = true;
	}

	public MakeAgressive() {
		this._aggresive = true;
	}

	public MakeWarned() {
		if (this._type === EnemyType.Red) this._warned = true;
	}

	public MakeUnwarned() {
		if (this._type === EnemyType.Red) this._warned = false;
	}
}
