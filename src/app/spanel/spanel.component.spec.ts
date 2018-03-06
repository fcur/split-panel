import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpanelComponent } from './spanel.component';

describe('SpanelComponent', () => {
	let component: SpanelComponent;
	let fixture: ComponentFixture<SpanelComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SpanelComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SpanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
