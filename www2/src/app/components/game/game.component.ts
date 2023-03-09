import { Component } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  selectedTab = 0;

  onTabChange(event: any) {
    this.selectedTab = event.index;
  }
}
