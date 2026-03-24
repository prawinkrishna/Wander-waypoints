import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, switchMap, filter } from 'rxjs/operators';
import { PlaceSearchService, PlaceSearchResult, AutocompleteResult } from '../../core/service/place-search.service';

export interface PlaceSearchDialogData {
    currentPlace: {
        name: string;
        address: string;
    };
}

export interface PlaceSearchDialogResult {
    place: {
        name: string;
        address: string;
        latitude: number;
        longitude: number;
        category?: string;
    };
    source: 'search' | 'url';
}

@Component({
    selector: 'app-place-search-dialog',
    templateUrl: './place-search-dialog.component.html',
    styleUrls: ['./place-search-dialog.component.scss']
})
export class PlaceSearchDialogComponent implements OnInit, OnDestroy {
    activeMode: 'search' | 'url' = 'search';

    searchControl = new FormControl('');
    urlControl = new FormControl('');

    searchResults: PlaceSearchResult[] = [];
    autocompleteResults: AutocompleteResult[] = [];
    selectedPlace: PlaceSearchResult | null = null;

    isSearching = false;
    isParsingUrl = false;
    urlError: string | null = null;

    private destroy$ = new Subject<void>();

    constructor(
        public dialogRef: MatDialogRef<PlaceSearchDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PlaceSearchDialogData,
        private placeSearchService: PlaceSearchService
    ) { }

    ngOnInit() {
        this.searchControl.valueChanges.pipe(
            takeUntil(this.destroy$),
            debounceTime(300),
            filter((value): value is string => typeof value === 'string' && value.length >= 2),
            switchMap(query => {
                this.isSearching = true;
                this.selectedPlace = null;
                return this.placeSearchService.searchPlaces(query);
            })
        ).subscribe(results => {
            this.searchResults = results;
            this.isSearching = false;
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    setMode(mode: 'search' | 'url') {
        this.activeMode = mode;
        this.selectedPlace = null;
        this.urlError = null;
        this.searchResults = [];
    }

    selectPlace(place: PlaceSearchResult) {
        this.selectedPlace = place;
        this.searchControl.setValue(place.name, { emitEvent: false });
        this.searchResults = [];
    }

    parseUrl() {
        const url = this.urlControl.value?.trim();
        if (!url) {
            this.urlError = 'Please enter a Google Maps URL';
            return;
        }

        if (!this.isGoogleMapsUrl(url)) {
            this.urlError = 'Please enter a valid Google Maps URL';
            return;
        }

        this.isParsingUrl = true;
        this.urlError = null;

        this.placeSearchService.parseMapsUrl(url).subscribe({
            next: (response) => {
                this.isParsingUrl = false;
                if (response.success && response.place) {
                    this.selectedPlace = {
                        name: response.place.name,
                        address: response.place.address,
                        latitude: response.place.latitude,
                        longitude: response.place.longitude
                    };
                } else {
                    this.urlError = response.error || 'Could not extract place from URL';
                }
            },
            error: (error) => {
                this.isParsingUrl = false;
                this.urlError = 'Failed to parse URL. Please try a different format.';
            }
        });
    }

    private isGoogleMapsUrl(url: string): boolean {
        return url.includes('google.com/maps') ||
               url.includes('goo.gl/maps') ||
               url.includes('maps.app.goo.gl') ||
               url.includes('maps.google.com') ||
               url.includes('g.co/');
    }

    onConfirm() {
        if (!this.selectedPlace) return;

        const result: PlaceSearchDialogResult = {
            place: {
                name: this.selectedPlace.name,
                address: this.selectedPlace.address,
                latitude: this.selectedPlace.latitude,
                longitude: this.selectedPlace.longitude
            },
            source: this.activeMode
        };

        this.dialogRef.close(result);
    }

    onCancel() {
        this.dialogRef.close(null);
    }

    clearSearch() {
        this.searchControl.setValue('');
        this.searchResults = [];
        this.selectedPlace = null;
    }

    clearUrl() {
        this.urlControl.setValue('');
        this.selectedPlace = null;
        this.urlError = null;
    }
}
