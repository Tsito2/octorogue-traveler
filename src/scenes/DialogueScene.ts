export class DialogueScene {
    dialogues: string[];

    constructor(dialogues: string[]) {
        this.dialogues = dialogues;
    }

    display(): void {
        this.dialogues.forEach((line) => console.log(line));
    }
}