import { NgModule, ModuleWithProviders } from '@angular/core';
import { SpanelComponent } from "./spanel.component"


@NgModule({
	declarations: [SpanelComponent],
	entryComponents: [SpanelComponent],
	exports: [SpanelComponent]
})

//----------------------------------------------------------------------------------------------------------
// Spanel component module
//----------------------------------------------------------------------------------------------------------
export class SpanelModule {
	constructor() { }
}
