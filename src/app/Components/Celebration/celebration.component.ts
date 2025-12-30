import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-celebration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './celebration.component.html',
  styleUrls: ['./celebration.component.scss']
})
export class CelebrationComponent implements OnInit, OnDestroy {
  confetti: Array<{
    left: number;
    delay: number;
    duration: number;
    color: string;
    size: number;
  }> = [];

  ngOnInit(): void {
    this.generateConfetti();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private generateConfetti(): void {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff', '#ff6bdc', '#ffab00'];
    
    for (let i = 0; i < 100; i++) {
      this.confetti.push({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 10
      });
    }
  }
}
