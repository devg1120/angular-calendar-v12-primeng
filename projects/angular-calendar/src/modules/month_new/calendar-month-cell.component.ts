import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef
} from '@angular/core';
import { Injectable } from '@angular/core';
//import { MonthViewDay, CalendarEvent, EVENT_TYPE } from '../../calendar-utils/calendar-utils';
import { EVENT_TYPE } from '../../calendar-utils/calendar-utils';
import { MonthViewDay, CalendarEvent } from '../../calendar-utils/calendar-utils';
import { DateAdapter } from '../../date-adapters/date-adapter'; 
import { isWithinThreshold, trackByEventId } from '../common/util';
import { PlacementArray } from 'positioning';

import {TaskEvent, WeekTaskEventPos } from './calendar-month-view.component';

/*
calendar-utils.ts

export enum EVENT_TYPE {                                                        
   EVENT_TIME= 1,                                                               
   EVENT_DAY = 2,                                                               
   EVENT_TASK = 3                                                               
}                                                                               
       

export interface CalendarEvent<MetaType = any> {
  id?: string | number;
  start: Date;
  end?: Date;
  title: string;
  color?: EventColor;
  actions?: EventAction[];
  allDay?: boolean;
  cssClass?: string;
  resizable?: {
    beforeStart?: boolean;
    afterEnd?: boolean;
  };
  draggable?: boolean;
  meta?: MetaType;
  }
*/

@Injectable({
  providedIn: 'root',
  })

@Component({
  selector: 'mwl-calendar-month-cell',
  template: `
    <ng-template
      #defaultTemplate
      let-day="day"
      let-openDay="openDay"
      let-locale="locale"
      let-weekTaskEventPos="weekTaskEventPos"
      let-tooltipPlacement="tooltipPlacement"
      let-highlightDay="highlightDay"
      let-unhighlightDay="unhighlightDay"
      let-eventClicked="eventClicked"
      let-tooltipTemplate="tooltipTemplate"
      let-tooltipAppendToBody="tooltipAppendToBody"
      let-tooltipDelay="tooltipDelay"
      let-trackByEventId="trackByEventId"
      let-validateDrag="validateDrag"
 
    >
      <div
        class="cal-cell-top"
        [attr.aria-label]="
          { day: day, locale: locale } | calendarA11y: 'monthCell'
        "
      >
        <span aria-hidden="true">
          <span class="cal-day-badge" *ngIf="debug && day.badgeTotal > 0">{{
            day.badgeTotal
          }}</span>
          <span class="cal-day-number">{{
            day.date | calendarDate: 'monthViewDayNumber':locale
          }}</span>
        </span>
      </div>


<!--
<div fxLayout="column">
  <div fxFlexOrder="4">1. One</div>
  <div fxFlexOrder="2">2. Two</div>
  <div fxFlexOrder="3">3. Three</div>
  <div fxFlexOrder="1">4. Four</div>
</div>
               fxFlexOrder="{{event.task_pos_index[rowIndex/7]+1}}" 
-->

   <div  *ngIf="debug">
      <div  *ngIf="weekTaskEventPos_array.length">
          {{weekTaskEventPos_array.length}}
      </div>
      <div  *ngFor="let task of this.weekTaskEventPos_array">
              {{ task.event.title}}
      </div>
   </div>
   <div *ngIf="task_view" >
      <div   *ngFor="let task of this.weekTaskEventPos_array">
        <div *ngIf="(this.dateAdapter.isSameDay(task.event.start , day.date)) ||
          ((task.event.start.getTime() <  day.date.getTime()) && (task.event.end.getTime() > day.date.getTime())) ||
                    (this.dateAdapter.isSameDay(task.event.end , day.date)); then thenBlock else elseBlock"></div>
        <ng-template #thenBlock>
                <div 
                [ngClass]="{
                         'cal-event-task-start': this.dateAdapter.isSameDay(task.event.start , day.date) ,
                         'cal-event-task-mid'  : (task.event.start.getTime() <  day.date.getTime()) && 
                                                 (task.event.end.getTime() > day.date.getTime()) ,
                         'cal-event-task-end'  : this.dateAdapter.isSameDay(task.event.end , day.date) 
                        }"
                [ngStyle]="{ backgroundColor: task.event.color?.primary }"
		[ngStyle]="{ order: task.event.task_pos_index[rowIndex/7]+1 }"
                [ngClass]="task.event?.cssClass"
                
                
                [mwlCalendarTooltip]="
                  task.event.title | calendarEventTitle: 'monthTooltip':task.event
                "
                [tooltipPlacement]="tooltipPlacement"
                [tooltipEvent]="task.event"
                [tooltipTemplate]="tooltipTemplate"
                [tooltipAppendToBody]="tooltipAppendToBody"
                [tooltipDelay]="tooltipDelay"
                mwlDraggable
                [class.cal-draggable]="task.event.draggable"
                dragActiveClass="cal-drag-active"
                [dropData]="{ event: task.event, draggedFrom: day }"
                [dragAxis]="{ x: task.event.draggable, y: task.event.draggable }"
                [validateDrag]="validateDrag"
                (mwlClick)="eventClicked.emit({ event: task.event, sourceEvent: $event })"
                [attr.aria-hidden]="{} | calendarA11y: 'hideMonthCellEvents'"
                > 
	     {{ task.event.task_pos_index[rowIndex/7]}}/{{ task.event.task_pos_max[rowIndex/7]}}-
             {{ this.substr(task.event.title,12,'..') }} 
            </div>
        </ng-template>
        <ng-template #elseBlock>
            <div class="cal-event-task-free">FREE</div>
        </ng-template>
     </div>
     </div>

      <div class="cal-events" *ngIf="day.events.length > 0">
<!--
       <div  *ngFor="let event of day.events; trackBy: trackByEventId"
             [ngSwitch]="event.eventType"
        >

        <div  *ngSwitchCase="event_type_enum.EVENT_TASK"   
                [ngClass]="{
                         'cal-event-task-start': this.dateAdapter.isSameDay(event.start , day.date) ,
                         'cal-event-task-mid'  : !this.dateAdapter.isSameDay(event.start , day.date) && !this.dateAdapter.isSameDay(event.end , day.date) ,
                         'cal-event-task-end'  : this.dateAdapter.isSameDay(event.end , day.date) 
                        }"

                [ngStyle]="{ backgroundColor: event.color?.primary }"
		[ngStyle]="{ order: event.task_pos_index[rowIndex/7]+1 }"
                [ngClass]="event?.cssClass"
                (mouseenter)="highlightDay.emit({ event: event })"
                (mouseleave)="unhighlightDay.emit({ event: event })"
                [mwlCalendarTooltip]="
                  event.title | calendarEventTitle: 'monthTooltip':event
                "
                [tooltipPlacement]="tooltipPlacement"
                [tooltipEvent]="event"
                [tooltipTemplate]="tooltipTemplate"
                [tooltipAppendToBody]="tooltipAppendToBody"
                [tooltipDelay]="tooltipDelay"
                mwlDraggable
                [class.cal-draggable]="event.draggable"
                dragActiveClass="cal-drag-active"
                [dropData]="{ event: event, draggedFrom: day }"
                [dragAxis]="{ x: event.draggable, y: event.draggable }"
                [validateDrag]="validateDrag"
                (mwlClick)="eventClicked.emit({ event: event, sourceEvent: $event })"
                [attr.aria-hidden]="{} | calendarA11y: 'hideMonthCellEvents'"
                > 
	     {{ event.task_pos_index[rowIndex/7]}}/{{ event.task_pos_max[rowIndex/7]}}-
             {{ this.substr(event.title,12,'..') }} 
            </div>  
       </div> 
       -->
       <div  *ngFor="let event of day.events; trackBy: trackByEventId"
                    [ngSwitch]="event.eventType"
		            >
            <div  *ngSwitchCase="event_type_enum.EVENT_DAY" 
                class="cal-event-day"
                [ngStyle]="{ backgroundColor: event.color?.primary }"
                [ngClass]="event?.cssClass"
                (mouseenter)="highlightDay.emit({ event: event })"
                (mouseleave)="unhighlightDay.emit({ event: event })"
                [mwlCalendarTooltip]="
                  event.title | calendarEventTitle: 'monthTooltip':event
                "
                [tooltipPlacement]="tooltipPlacement"
                [tooltipEvent]="event"
                [tooltipTemplate]="tooltipTemplate"
                [tooltipAppendToBody]="tooltipAppendToBody"
                [tooltipDelay]="tooltipDelay"
                mwlDraggable
                [class.cal-draggable]="event.draggable"
                dragActiveClass="cal-drag-active"
                [dropData]="{ event: event, draggedFrom: day }"
                [dragAxis]="{ x: event.draggable, y: event.draggable }"
                [validateDrag]="validateDrag"
                (mwlClick)="eventClicked.emit({ event: event, sourceEvent: $event })"
                [attr.aria-hidden]="{} | calendarA11y: 'hideMonthCellEvents'"
                > {{ event.title.substr(0,14) }}
            </div>  
 
	    <!-- <div *ngSwitchDefault -->
            <div  *ngSwitchCase="event_type_enum.EVENT_TIME" 
                class="cal-event"
                [ngStyle]="{ backgroundColor: event.color?.primary }"
                [ngClass]="event?.cssClass"
                (mouseenter)="highlightDay.emit({ event: event })"
                (mouseleave)="unhighlightDay.emit({ event: event })"
                [mwlCalendarTooltip]="
                  event.title | calendarEventTitle: 'monthTooltip':event
                "
                [tooltipPlacement]="tooltipPlacement"
                [tooltipEvent]="event"
                [tooltipTemplate]="tooltipTemplate"
                [tooltipAppendToBody]="tooltipAppendToBody"
                [tooltipDelay]="tooltipDelay"
                mwlDraggable
                [class.cal-draggable]="event.draggable"
                dragActiveClass="cal-drag-active"
                [dropData]="{ event: event, draggedFrom: day }"
                [dragAxis]="{ x: event.draggable, y: event.draggable }"
                [validateDrag]="validateDrag"
                (mwlClick)="eventClicked.emit({ event: event, sourceEvent: $event })"
                [attr.aria-hidden]="{} | calendarA11y: 'hideMonthCellEvents'"
                > {{ event.title.substr(0,14) }}
            </div>
  

       </div>
      </div>
    </ng-template>
    <ng-template
      [ngTemplateOutlet]="customTemplate || defaultTemplate"
      [ngTemplateOutletContext]="{
        day: day,
        openDay: openDay,
        locale: locale,
        weekTaskEventPos_array: weekTaskEventPos_array,
        tooltipPlacement: tooltipPlacement,
        highlightDay: highlightDay,
        unhighlightDay: unhighlightDay,
        eventClicked: eventClicked,
        tooltipTemplate: tooltipTemplate,
        tooltipAppendToBody: tooltipAppendToBody,
        tooltipDelay: tooltipDelay,
        trackByEventId: trackByEventId,
        validateDrag: validateDrag
      }"
    >
    </ng-template>
  `,
  host: {
    class: 'cal-cell cal-day-cell',
    '[class.cal-past]': 'day.isPast',
    '[class.cal-today]': 'day.isToday',
    '[class.cal-future]': 'day.isFuture',
    '[class.cal-weekend]': 'day.isWeekend',
    '[class.cal-in-month]': 'day.inMonth',
    '[class.cal-out-month]': '!day.inMonth',
    '[class.cal-has-events]': 'day.events.length > 0',
    '[class.cal-open]': 'day === openDay',
    '[class.cal-event-highlight]': '!!day.backgroundColor'
  }
})
export class CalendarMonthCellComponent {
  @Input() debug: boolean;

  @Input() day: MonthViewDay;

  @Input() openDay: MonthViewDay;

  @Input() locale: string;
  @Input() task_view: boolean;

  @Input() rowIndex: number;   //GUSA
  @Input() weekTaskEventPos_array: WeekTaskEventPos[];   //GUSA

  @Input() tooltipPlacement: PlacementArray;

  @Input() tooltipAppendToBody: boolean;

  @Input() customTemplate: TemplateRef<any>;

  @Input() tooltipTemplate: TemplateRef<any>;

  @Input() tooltipDelay: number | null;


  @Output() highlightDay: EventEmitter<any> = new EventEmitter();

  @Output() unhighlightDay: EventEmitter<any> = new EventEmitter();

  @Output()
  eventClicked = new EventEmitter<{
    event: CalendarEvent;
    sourceEvent: MouseEvent;
  }>();

  trackByEventId = trackByEventId;

  validateDrag = isWithinThreshold;

  event_type_enum = EVENT_TYPE;

  constructor(
    protected dateAdapter: DateAdapter
  ) {
  }

  ngOnInit() {
     //console.log("START!!");
     //console.dir(this.weekTaskEventPos_array);
     //console.log(this.weekTaskEventPos_array.length);
  }

  substr(text, len, truncation) {
    if (truncation === undefined) { truncation = ''; }
    var text_array = text.split('');
    var count = 0;
    var str = '';
    for (let i = 0; i < text_array.length; i++) {
         var n = escape(text_array[i]);

         if (n.length < 4) count++;
         else count += 2;

         if (count > len) {
           return str + truncation;
         }
         str += text.charAt(i);
    }
    return text;
  }

}
