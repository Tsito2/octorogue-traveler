export class DialogueBox {
    text: string;

    constructor(text: string) {
        this.text = text;
    }

    show(): void {
        console.log(`Dialogue: ${this.text}`);
    }
}