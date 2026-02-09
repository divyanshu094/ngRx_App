import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  constructor(private _sanitizer: DomSanitizer) { }

  transform(list: any, searchText: string): SafeHtml {

    if (!list) { return []; }
    if (!searchText) { return list; }

    const value = list.replace(
      searchText.toUpperCase(), `<span style='background-color:yellow'>${searchText.toUpperCase()}</span>`);

    return this._sanitizer.bypassSecurityTrustHtml(value);
  }

}
