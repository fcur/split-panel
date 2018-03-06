import { Component } from '@angular/core';
import { SpanelModule } from "./spanel/spanel.module";
import { BottomComponent } from "./bottom/bottom.component";
import { CentralComponent } from "./central/central.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { TopComponent } from "./top/top.component";

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'app';
}
