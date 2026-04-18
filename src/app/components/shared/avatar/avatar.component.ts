import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

/**
 * Inline SVG avatar with deterministic color based on the user's name.
 *
 * Replaces external `ui-avatars.com` calls — those create a network
 * dependency, slow first paint, and look like a placeholder when they
 * fail. This component renders instantly with no HTTP request.
 *
 * If `imageUrl` is provided and loads successfully, it's shown instead
 * of the SVG; the SVG is the fallback for missing/failed avatars.
 *
 * Usage:
 *   <app-avatar [imageUrl]="user.profileImage" [name]="user.username" [size]="48"></app-avatar>
 */
@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnChanges {
    @Input() imageUrl?: string | null;
    @Input() name?: string | null;
    @Input() size = 40;

    initials = '?';
    backgroundColor = '#48BB78';
    showImage = false;

    // Brand-aligned palette: mint, accent blue, charcoal, follow purple,
    // share teal, warning orange. Keeps the feed colorful but on-brand.
    private static readonly PALETTE = [
        '#48BB78', // mint
        '#4299E1', // ocean blue
        '#9F7AEA', // follow purple
        '#319795', // share teal
        '#ED8936', // warning orange
        '#38B2AC', // teal
        '#667EEA', // indigo
        '#ED64A6', // pink
    ];

    ngOnChanges(_changes: SimpleChanges): void {
        this.initials = this.computeInitials(this.name);
        this.backgroundColor = this.colorForName(this.name);
        // Only show the image if a URL was actually passed in. The
        // template's (error) handler will flip this back to false on load
        // failure so we fall through to the SVG fallback.
        this.showImage = !!this.imageUrl;
    }

    onImageError(): void {
        this.showImage = false;
    }

    private computeInitials(name?: string | null): string {
        if (!name) return '?';
        const trimmed = name.trim();
        if (!trimmed) return '?';
        const parts = trimmed.split(/\s+/);
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    private colorForName(name?: string | null): string {
        if (!name) return AvatarComponent.PALETTE[0];
        // Simple deterministic hash — same name always picks the same color.
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = (hash * 31 + name.charCodeAt(i)) | 0;
        }
        const idx = Math.abs(hash) % AvatarComponent.PALETTE.length;
        return AvatarComponent.PALETTE[idx];
    }
}
