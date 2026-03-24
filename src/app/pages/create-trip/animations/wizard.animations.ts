import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const wizardSlideAnimation = trigger('wizardSlide', [
  transition(':increment', [
    query(':enter, :leave', style({ position: 'absolute', width: '100%' }), { optional: true }),
    group([
      query(':leave', [
        animate('300ms ease-out', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ], { optional: true }),
      query(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ], { optional: true })
    ])
  ]),
  transition(':decrement', [
    query(':enter, :leave', style({ position: 'absolute', width: '100%' }), { optional: true }),
    group([
      query(':leave', [
        animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ], { optional: true }),
      query(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);
