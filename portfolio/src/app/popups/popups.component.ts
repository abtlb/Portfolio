import { AfterViewInit, Component, inject, PLATFORM_ID, OnDestroy, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-popups',
  imports: [],
  templateUrl: './popups.component.html',
  styleUrl: './popups.component.scss'
})
export class PopupsComponent implements AfterViewInit, OnInit, OnDestroy {
  private observer!: IntersectionObserver;
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
    }
  }
  
  ngAfterViewInit(): void {
    // Only run in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
      this.generateRandomKeyframes();
    }
  }

  private generateRandomKeyframes() {
    // Add a small delay to ensure bubbles are rendered
    setTimeout(() => {
      const style = document.createElement('style');
      const bubbles = document.querySelectorAll('.bubble');
      
      if (bubbles.length === 0) {
        console.log('No bubbles found, retrying...');
        // Retry if no bubbles found
        setTimeout(() => this.generateRandomKeyframes(), 100);
        return;
      }

      bubbles.forEach((bubble, index) => {
        const x1 = (Math.random() - 0.5) * 50;
        const y1 = (Math.random() - 0.5) * 50;
        const x2 = (Math.random() - 0.5) * 50;
        const y2 = (Math.random() - 0.5) * 50;

        const keyframeName = `float-${index}`;
        const keyframeRule = `
        @keyframes ${keyframeName} {
          0% { transform: translate(-50%, -50%); }
          25% { transform: translate(calc(${x1}px - 50%), calc(${y1}px - 50%)); }
          50% { transform: translate(calc(${x2}px - 50%), calc(${y2}px - 50%)); }
          100% { transform: translate(-50%, -50%); }
        }
      `;

        style.textContent += keyframeRule;
        (bubble as HTMLElement).style.animation = `${keyframeName} ${10 + Math.random() * 10}s ease-in-out infinite`;
      });

      document.head.appendChild(style);
    }, 100);
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
      const bubbles = document.querySelectorAll('.bubble');
      bubbles.forEach(bubble => this.observer.observe(bubble));
    }, 1000);
  }

  ngOnDestroy(): void {
    // Clean up observer when component is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
