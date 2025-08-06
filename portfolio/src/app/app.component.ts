import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MyHeaderComponent } from './my-header/my-header.component';
import { GraphComponent } from './graph/graph.component';
import { LandingComponent } from './landing/landing.component';
import { PopupsComponent } from './popups/popups.component';
import { ContactMeComponent } from './contact-me/contact-me.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GraphComponent, MyHeaderComponent, LandingComponent, PopupsComponent, ContactMeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gradient', { static: true, read: ElementRef }) gradient!: ElementRef;
  title = 'portfolio';
  platformId = inject(PLATFORM_ID);
  private observer!: IntersectionObserver;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.addEventListener('scroll', this.updateGradient);
      this.setupIntersectionObserver();
    }
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Check for trigger
          if (entry.target.classList.contains("contact-bg-trigger")) {
            const main = document.querySelector('main');
            main!.style.backgroundColor = '#083783ff'; 
          }
          else if (entry.target.classList.contains("popups-bg-trigger")) {
            const main = document.querySelector('main');
            main!.style.backgroundColor = 'rgba(0, 47, 109, 1)'; 
          }
          else if (entry.target.classList.contains("landing-bg-trigger")) {
            const main = document.querySelector('main');
            main!.style.backgroundColor = '#3F75CB'; 
          }
          else if (entry.target.classList.contains("graph-bg-trigger")) {
            const main = document.querySelector('main');
            main!.style.backgroundColor = '#274b87ff';
          }

        } else {
          entry.target.classList.remove('visible');
        }
      });
    });

    // Use a small delay to ensure DOM is ready
    setTimeout(() => {
      const observables = document.querySelectorAll('.observable');
      observables.forEach(observable => this.observer.observe(observable));
    }, 1000);
  }

  updateGradient = () => {
    if (isPlatformBrowser(this.platformId)) {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      let percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      percent = Math.max(0, percent);
      percent = Math.min(100, percent);

      if (this.gradient?.nativeElement) {
        this.gradient.nativeElement.style.setProperty('--scroll-percent', `${percent}%`);
        this.gradient.nativeElement.style.setProperty('--scroll-percent-num', `${percent}`);
      }
    }
  };

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.updateGradient);
    }
  }
}
