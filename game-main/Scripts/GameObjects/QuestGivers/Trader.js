import { RatTail, RifleBullet } from "../../Assets/Items/Item.js";
import { AK } from "../../Assets/Weapons/Weapon.js";
import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { GetSprite } from "../../Game.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Rectangle } from "../../Utilites.js";
import { Character } from "./Character.js";
export class Trader extends Character {
    constructor(x, y) {
        super(50, 100);
        this.Tag = Tag.NPC;
        this._x = x;
        this._y = y;
    }
    Render() {
        Canvas.DrawImage(GetSprite("Trader"), new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
    }
    GetDialog() {
        super.GetDialog();
        const active = Scene.Player.GetQuestsBy(this);
        if (active.length > 0) {
            if (active[0].IsCompleted()) {
                this._completedQuests++;
                Scene.Player.RemoveItem(RatTail);
                Scene.Player.RemoveItem(RatTail);
                Scene.Player.RemoveItem(RatTail);
                Scene.Player.RemoveQuest(active[0]);
                return {
                    Messages: [
                        "Ну что вот твои крысы.",
                        "ООО, спасибо тебе большое, удачи тебе в\nтвоих похождениях.",
                        "ЭЭЭ, ты не чего не забыл, а как же моя\nнаграда?",
                        "А, да точно, чуть не забыл, вот возми.",
                    ],
                    Owner: this,
                    OwnerFirst: false,
                    AfterAction: () => {
                        Scene.Player.GiveQuestItem(new AK());
                        Scene.Player.GiveQuestItem(new RifleBullet(20));
                    },
                };
            }
            return {
                Messages: ["Ну что где там мои крысы, не забудь, что ты обещал их принести.", "Да помню, помню."],
                Owner: this,
                OwnerFirst: true,
            };
        }
        switch (this._completedQuests) {
            case 0:
                return {
                    Messages: [
                        "Короче, Меченый, у меня к тебе есть одно\nпредложение: выполнишь для меня задание — за\nне большой приз в виде двух батонов и пяти\nпуль. Заодно посмотрим, как быстро у тебя\nбашка соображает",
                        "Да что собственно вообще нужно?",
                        "Надо убить трех рад крыс ну и принести их\nмне, ну там для дел, тебе не нужно знать.\nНу что как ты в деле?",
                        "Хорошо договорились.",
                    ],
                    AfterAction: () => {
                        Scene.Player.PushQuest(new Quest("Шкурки", this).AddHasItemsTask("Добыть 6 хвостов крыс", [RatTail, 6]).AddTalkTask("Вернуться к Торгашу", this));
                    },
                    Owner: this,
                    OwnerFirst: true,
                };
            default:
                return {
                    Messages: ["Cпасибо."],
                    Owner: this,
                    OwnerFirst: true,
                };
        }
    }
    GetName() {
        return "Торгаш";
    }
}
//# sourceMappingURL=Trader.js.map