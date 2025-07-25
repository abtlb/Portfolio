import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MyHeaderComponent } from './my-header/my-header.component';
import { GraphComponent } from './graph/graph.component';
import { LandingComponent } from './landing/landing.component';
import { PopupsComponent } from './popups/popups.component';
import { ContactMeComponent } from './contact-me/contact-me.component';
import { TestComponent } from './test/test.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GraphComponent, MyHeaderComponent, LandingComponent, PopupsComponent, ContactMeComponent, TestComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy{
  @ViewChild('gradient', { static: true, read: ElementRef }) gradient!: ElementRef;
  title = 'portfolio';
  platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.updateGradient);
    }
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
    }
  }
};

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.updateGradient);
    }
  }
}
