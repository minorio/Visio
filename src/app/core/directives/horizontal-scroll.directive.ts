import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appHorizontalScroll]',
  standalone: true,
})
export class HorizontalScroll {
  private el = inject(ElementRef);

  @HostListener('wheel', ['$event'])
  public onWheel(event: WheelEvent): void {
    if (event.deltaY !== 0) {
      event.preventDefault();
      this.el.nativeElement.scrollLeft += event.deltaY;
    }
  }
}
