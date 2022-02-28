import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'heroes-component',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeroesComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}
