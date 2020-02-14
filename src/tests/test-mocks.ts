import { ChangeDetectorRef, Renderer2, RendererStyleFlags2 } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalOptions } from '@ionic/core';

export class ModalCtrlMock extends ModalController {
    constructor() {
        super(undefined, undefined, undefined);
    }

    create(_opts: ModalOptions): Promise<HTMLIonModalElement> {
        throw new Error('Method not implemented.');
    }
}

export class RendererMock extends Renderer2 {
    data: { [key: string]: any; };
    destroy(): void {
        throw new Error('Method not implemented.');
    }
    createElement(_name: string, _namespace?: string) {
        throw new Error('Method not implemented.');
    }
    createComment(_value: string) {
        throw new Error('Method not implemented.');
    }
    createText(_value: string) {
        throw new Error('Method not implemented.');
    }
    appendChild(_parent: any, _newChild: any): void {
        throw new Error('Method not implemented.');
    }
    insertBefore(_parent: any, _newChild: any, _refChild: any): void {
        throw new Error('Method not implemented.');
    }
    removeChild(_parent: any, _oldChild: any): void {
        throw new Error('Method not implemented.');
    }
    selectRootElement(_selectorOrNode: any) {
        throw new Error('Method not implemented.');
    }
    parentNode(_node: any) {
        throw new Error('Method not implemented.');
    }
    nextSibling(_node: any) {
        throw new Error('Method not implemented.');
    }
    setAttribute(_el: any, _name: string, _value: string, _namespace?: string): void {
        throw new Error('Method not implemented.');
    }
    removeAttribute(_el: any, _name: string, _namespace?: string): void {
        throw new Error('Method not implemented.');
    }
    addClass(_el: any, _name: string): void {
        throw new Error('Method not implemented.');
    }
    removeClass(_el: any, _name: string): void {
        throw new Error('Method not implemented.');
    }
    setStyle(_el: any, _style: string, _value: any, _flags?: RendererStyleFlags2): void {
        throw new Error('Method not implemented.');
    }
    removeStyle(_el: any, _style: string, _flags?: RendererStyleFlags2): void {
        throw new Error('Method not implemented.');
    }
    setProperty(_el: any, _name: string, _value: any): void {
        throw new Error('Method not implemented.');
    }
    setValue(_node: any, _value: string): void {
        throw new Error('Method not implemented.');
    }
    listen(_target: any, _eventName: string, _callback: (event: any) => boolean | void): () => void {
        throw new Error('Method not implemented.');
    }
}

export class CDRefMock extends ChangeDetectorRef {
    markForCheck(): void {
        throw new Error('Method not implemented.');
    }
    detach(): void {
        throw new Error('Method not implemented.');
    }
    detectChanges(): void {
        throw new Error('Method not implemented.');
    }
    checkNoChanges(): void {
        throw new Error('Method not implemented.');
    }
    reattach(): void {
        throw new Error('Method not implemented.');
    }
}
