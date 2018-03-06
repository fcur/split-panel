// src/app/spanel/spanel.component
import {
	Component, OnInit, ModuleWithProviders, ElementRef,
	Input, Output, HostListener, AfterViewInit,
	NgZone, EventEmitter, ViewChild, NgModule
} from '@angular/core';
import { FormsModule } from "@angular/forms";

@Component({
	selector: "spanel",
	templateUrl: "./spanel.component.html",
	styleUrls: ["./spanel.component.css"]
})

//----------------------------------------------------------------------------------------------------------
// Split panel component class
//----------------------------------------------------------------------------------------------------------
export class SpanelComponent implements OnInit {
	/** Panel orientation (true: horizontal/row, false: vertical/column) */
	private _landOrient: boolean = null;
	/** Auto rotate layout on orientation changes. */
	private _rotate: boolean = false;
	/** Splitter line element. */
	private _lineElem: HTMLDivElement = null;
	/** Html element before splitter. */
	private _primaryElem: HTMLDivElement = null;
	/** Html element after splitter. */
	private _secondaryElem: HTMLDivElement = null;
	/** Drag point position */
	private _dragPointPos: number = null;
	/** Flex basis for primary element. */
	private _flexBasisPrim: number = null;
	/** Flex basis for secondary element. */
	private _flexBasisSecnd: number = null;
	/** Primary fixed element H/W. */
	private _primarySize: number = null;
	/** Secondary fixed element H/W. */
	private _secondarySize: number = null;
	/** Minimum primary element H/W. */
	private _minPrimarySize: number = null;
	/** Minimum secondary element H/W. */
	private _minSecondarySize: number = null;
	/** Minimum primary element H/W. */
	private _maxPrimarySize: number = null;
	/** Minimum secondary element H/W. */
	private _maxSecondarySize: number = null;
	/** Minimum element size. */
	private _minSize: number = 30;
	/** Maximum element size. */
	private _maxSize: number = null;
	/** Splitter for touch device */
	private _touchDevice: boolean = false;
	/** Layout name (optional) */
	private _layoutName: string = null;
	/** Returns panel body. */
	public get panelBody(): any { return this.spanElem.nativeElement; }
	/** Returns splitter line body. */
	public get splitLine(): HTMLDivElement { return this._lineElem; }
	/** Returns splitter line styles  */
	public get splitlineClass(): string { return "splitline " + (this._landOrient ? "s-v" : "s-h") + (this._touchDevice ? " splitter-touch" : ""); }

	private _treshold: number = 300;
	private _timeout: number = 400;
	private _lastEmitTime: number = 0;
	private _prepareSizeTimeout: any;
	private _pushOutEvents: boolean = true;

	// Defining DOM Elements
	@ViewChild("splitpanel") spanElem: ElementRef;
	@Input("landscape") set setOrientation(value: boolean) { this._landOrient = value; }
	@Input("auto-rotate") set setRotate(value: boolean) { this._rotate = value; }
	@Input("label-x") set setLabel(value: string) { this._layoutName = value; }
	@Input("push-events") set pushEvents(value: boolean) { this._pushOutEvents = value; }
	@Input("min-size") set setMinSize(value: number) { this._minSize = value; }
	@Input("min-primary-size") set setMinPrimSize(value: number) { this._minPrimarySize = value; }
	@Input("min-secondary-size") set setMinSecSize(value: number) { this._minSecondarySize = value; }
	@Input("primary-size") set setPrimSize(value: number) { this._primarySize = value; }
	@Input("secondary-size") set setSecSize(value: number) { this._secondarySize = value; }
	@Input("max-primary-size") set setMaxPrimSize(value: number) { this._maxPrimarySize = value; }
	@Input("max-secondary-size") set setMaxSecSize(value: number) { this._maxSecondarySize = value; }
	@Output() onChangeState: EventEmitter<any> = new EventEmitter<any>();
	@HostListener('window:resize', ['$event']) onResize(event: Event) {
		this._lineElem.setAttribute("class", this.splitlineClass);
		this.panelBody.style.flexDirection = this._landOrient ? "row" : "column";
		this.prepareSize();
	}
	@HostListener('window:orientationchange', ['$event']) onRotate(event: Event) {
		console.log('window:orientationchange');
		if (this._rotate) {
			this._landOrient = this.panelBody.offsetWidth > this.panelBody.offsetHeight;
			this._lineElem.setAttribute("class", this.splitlineClass);
			this.panelBody.style.flexDirection = this._landOrient ? "row" : "column";
		}
		this.prepareSize();
	}
	@HostListener('mousedown', ['$event']) onMouseDown(e: Event) {
		this.onDragStart(e);
	}
	@HostListener('touchmove', ['$event']) onTouchMove(e: Event) {
		this.onDragMove(e);
	}
	@HostListener('mousemove', ['$event']) onMouseMove(e: Event) {
		this.onDragMove(e);
	}
	@HostListener('mouseout', ['$event']) onMouseOut(e: Event) {
		this.onDragMove(e);
	}
	@HostListener('mouseup', ['$event']) onMouseUp(e: Event) {
		this.onDragEnd(e, true);
	}
	@HostListener('mouseleave', ['$event']) onMouseLeave(e: Event) {
		this.onDragEnd(e, true);
	}

	//-------------------------------------------------------------------------------
	constructor(private _el: ElementRef) {
		this._touchDevice = "ontouchstart" in window;
	}

	//-------------------------------------------------------------------------------
	ngOnInit() {
		this._lineElem = document.createElement("div");
		this._lineElem.setAttribute("class", this.splitlineClass);
		this._primaryElem = this.panelBody.children[0];
		this._secondaryElem = this.panelBody.children[1];
		this.panelBody.insertBefore(this._lineElem, this.panelBody.children[1]);
		let primClName: string = this._primaryElem.className;
		let secndClName: string = this._secondaryElem.className;

		this._landOrient = this._landOrient !== null ? this._landOrient : this.panelBody.offsetWidth > this.panelBody.offsetHeight;
		this.panelBody.style.flexDirection = this._landOrient ? "row" : "column";
		this._primaryElem.setAttribute("class", `${primClName} splitlayout`);
		this._secondaryElem.setAttribute("class", `${secndClName} splitlayout`);
		this.prepareSize();

	}

	//-------------------------------------------------------------------------------
	ngAfterViewInit() {
		this.prepareSize();
	}

	//-------------------------------------------------------------------------------
	ngAfterContentInit() {
		this.prepareSize();
	}

	//-------------------------------------------------------------------------------
	private onDragStart(event: any) {
		if (!this._pushOutEvents) return;
		event.preventDefault();
		event.stopPropagation();
		if (event.target === this.splitLine) {
			if (this._dragPointPos) return;
			this._dragPointPos = this.getNewStartPosition(event);
		}
	}

	//-------------------------------------------------------------------------------
	private onDragMove(event: any) {
		if (!this._pushOutEvents || !this._dragPointPos) return;
		event.preventDefault();
		event.stopPropagation();
		this.panelBody.style.cursor = this._landOrient ? "e-resize" : "s-resize";
		let difference = this.getNewStartPosition(event) - this._dragPointPos;
		this.update(difference);
		this._dragPointPos += difference;
		this.prepareSize();
	}

	//-------------------------------------------------------------------------------
	private onDragEnd(event: any, removeDragEnd: boolean = false) {
		if (!this._pushOutEvents || !this._dragPointPos) return;
		event.preventDefault();
		event.stopPropagation();
		if (event.type !== "touchend") {
			let difference = this.getNewStartPosition(event) - this._dragPointPos;
			this.update(difference);
		}
		this.panelBody.style.cursor = "default";
		this._dragPointPos = null;
	}

	//-------------------------------------------------------------------------------
	private getNewStartPosition(event: any): number {
		if (event.pageX) return this._landOrient ? event.pageX : event.pageY;
		else if (event.touches && event.touches[0])
			return this._landOrient ? event.touches[0].pageX : event.touches[0].pageY;
		else return 0;
	}

	//-------------------------------------------------------------------------------
	private prepareExtremumSize() {
		if (!this._minPrimarySize) this._minPrimarySize = this._minSize;
		if (!this._minSecondarySize) this._minSecondarySize = this._minSize;
		if (!this._maxPrimarySize) this._maxPrimarySize = (this._landOrient ? this.panelBody.offsetWidth : this.panelBody.offsetHeight) - this._minSize;
		if (!this._maxSecondarySize) this._maxSecondarySize = (this._landOrient ? this.panelBody.offsetWidth : this.panelBody.offsetHeight) - this._minSize;
	}

	//-------------------------------------------------------------------------------
	public resetLayout() {
		this._flexBasisPrim = null;
		this._flexBasisSecnd = null;
	}

	//-------------------------------------------------------------------------------
	private prepareSize() {
		this._maxSize = (this._landOrient ? this.panelBody.offsetWidth : this.panelBody.offsetHeight) - this._minSize;

		if (this._flexBasisPrim) {
			this.update(this._flexBasisPrim - (this._landOrient ? this._primaryElem.offsetWidth : this._primaryElem.offsetHeight));
		}
		else if (this._primarySize) {
			this.update(this._primarySize - (this._landOrient ? this._primaryElem.offsetWidth : this._primaryElem.offsetHeight));
		} else if (this._secondarySize) {
			this.update((this._landOrient ? this._secondaryElem.offsetWidth : this._secondaryElem.offsetHeight) - this._secondarySize);
		} else {
			this._flexBasisPrim = null;
			this._flexBasisSecnd = null;
			this._primaryElem.style.flex = `1 1 auto`;
			this._secondaryElem.style.flex = `1 1 auto`;
			console.log("reset layut");
		}

		if (this._pushOutEvents) {
			let timeNow: number = Date.now();
			clearTimeout(this._prepareSizeTimeout);
			this._prepareSizeTimeout = setTimeout(this.prepareSizeTimeout.bind(this), this._timeout);
			if (timeNow - this._lastEmitTime > this._treshold) {
				this._lastEmitTime = timeNow;
				this.onChangeState.emit();
			}
		}
	}

	//-------------------------------------------------------------------------------
	private prepareSizeTimeout() {
		this.onChangeState.emit();
	}

	//-------------------------------------------------------------------------------
	private update(basisDelta: number) {
		if (!basisDelta || basisDelta === 0) return;
		let min: number = this._minPrimarySize ? this._minPrimarySize : this._minSize;
		let max: number = this._maxPrimarySize ? this._maxPrimarySize : this._maxSize;

		if ((this._primaryElem.offsetWidth <= min && basisDelta < 0 && this._landOrient) ||
			(this._primaryElem.offsetWidth >= max && basisDelta > 0 && this._landOrient) ||
			(this._primaryElem.offsetHeight <= min && basisDelta < 0 && !this._landOrient) ||
			(this._primaryElem.offsetHeight >= max && basisDelta > 0 && !this._landOrient)) return;

		min = this._minSecondarySize ? this._minSecondarySize : this._minSize;
		max = this._maxSecondarySize ? this._maxSecondarySize : this._maxSize;

		if ((this._secondaryElem.offsetWidth <= min && basisDelta > 0 && this._landOrient) ||
			(this._secondaryElem.offsetWidth >= max && basisDelta < 0 && this._landOrient) ||
			(this._secondaryElem.offsetHeight <= min && basisDelta > 0 && !this._landOrient) ||
			(this._secondaryElem.offsetHeight >= max && basisDelta < 0 && !this._landOrient)) return;

		this._flexBasisPrim = this._landOrient ?
			(this._primaryElem.offsetWidth + basisDelta) : (this._primaryElem.offsetHeight + basisDelta);
		this._flexBasisSecnd = this._landOrient ?
			(this._secondaryElem.offsetWidth - basisDelta) : (this._secondaryElem.offsetHeight - basisDelta);
		this._primaryElem.style.flex = `1 1 ${this._flexBasisPrim}px`;
		this._secondaryElem.style.flex = `1 1 ${this._flexBasisSecnd}px`;

	}
}

