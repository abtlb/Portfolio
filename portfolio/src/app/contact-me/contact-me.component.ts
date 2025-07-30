import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-contact-me',
  imports: [],
  templateUrl: './contact-me.component.html',
  styleUrl: './contact-me.component.scss'
})
export class ContactMeComponent implements AfterViewInit {
  private observer!: IntersectionObserver;
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    }
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    });

    // Use a small delay to ensure DOM is ready
    setTimeout(() => {
      const contacts = document.querySelectorAll('.contact');
      const lets = document.querySelectorAll('.lets');
      contacts.forEach(contact => this.observer.observe(contact));
      lets.forEach(l => this.observer.observe(l));
    }, 1000);
  }
}


