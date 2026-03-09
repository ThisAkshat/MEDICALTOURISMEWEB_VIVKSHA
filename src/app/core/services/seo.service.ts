import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {

constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private dom: Document
) {}

setTitle(title: string) {
    this.title.setTitle(title);
}

setDescription(description: string) {
    this.meta.updateTag({ name: 'description', content: description });
}

setCanonical(url: string) {
    let link: HTMLLinkElement | null = this.dom.querySelector("link[rel='canonical']");
    if (!link) {
    link = this.dom.createElement('link');
    link.setAttribute('rel', 'canonical');
    this.dom.head.appendChild(link);
    }
    link.setAttribute('href', url);
}
}