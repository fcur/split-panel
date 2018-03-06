import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopComponent } from './top/top.component';
import { BottomComponent } from './bottom/bottom.component';
import { CentralComponent } from './central/central.component';
import { SpanelModule } from "./spanel/spanel.module";

@NgModule({
	declarations: [
		AppComponent,
		SidebarComponent,
		TopComponent,
		BottomComponent,
		CentralComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		SpanelModule
	],
	providers: [SpanelModule],
	bootstrap: [AppComponent]
})
export class AppModule { }
