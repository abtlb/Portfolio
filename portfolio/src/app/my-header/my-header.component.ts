import { Component } from '@angular/core';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

@Component({
  selector: 'app-my-header',
  imports: [],
  templateUrl: './my-header.component.html',
  styleUrl: './my-header.component.scss'
})
export class MyHeaderComponent {
    scrollTo(elementId: string): void {
  const element = document.getElementById(elementId);
  
  if (element) {
    scrollIntoView(element, {
      duration: 1200, // Slower duration (default is usually 300-500ms)
      ease: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    });
  }
}
}
