import { DebugElement } from '@angular/core';

export const text = (de: DebugElement): string => {
  if (!de
      || !de.nativeElement
      || !de.nativeElement.textContent) {
    return null;
  }

  return de.nativeElement.textContent.trim();
};

export const attr = (de: DebugElement, attrName: string): string => {
  if (!de
    || !de.nativeElement) {
    return null;
  }
  return de.nativeElement.getAttribute(attrName);
};
