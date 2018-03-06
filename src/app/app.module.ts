import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopComponent } from './top/top.component';
import { BottomComponent } from './bottom/bottom.component';
import { CentralComponent } from './central/central.component';
import { SpanelDirective } from './spanel.directive';


@NgModule({
	declarations: [
		AppComponent,
		SidebarComponent,
		TopComponent,
		BottomComponent,
		CentralComponent,
		SpanelDirective
	],
	imports: [
		BrowserModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
