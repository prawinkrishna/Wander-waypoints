import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
    title: string;
    message: string;
    type?: 'warning' | 'danger' | 'info';
    confirmText?: string;
    cancelText?: string;
}

@Component({
    selector: 'app-confirm-dialog',
    template: `
        <h2 mat-dialog-title>
            <mat-icon [class]="'dialog-icon ' + (data.type || 'warning')">
                {{ getIcon() }}
            </mat-icon>
            {{ data.title }}
        </h2>
        <mat-dialog-content>
            <p>{{ data.message }}</p>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">{{ data.cancelText || 'Cancel' }}</button>
            <button mat-flat-button [color]="getButtonColor()" (click)="onConfirm()">
                {{ data.confirmText || 'Confirm' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        h2 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0;
        }
        .dialog-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
        }
        .dialog-icon.warning { color: var(--color-warning, #ED8936); }
        .dialog-icon.danger { color: var(--color-error, #F56565); }
        .dialog-icon.info { color: var(--primary, #1E90FF); }
        mat-dialog-content p {
            color: var(--color-text-secondary, #666);
            line-height: 1.5;
        }
        mat-dialog-actions {
            padding: 8px 0;
        }
    `]
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) { }

    getIcon(): string {
        switch (this.data.type) {
            case 'danger': return 'error';
            case 'info': return 'info';
            default: return 'warning';
        }
    }

    getButtonColor(): string {
        return this.data.type === 'danger' ? 'warn' : 'primary';
    }

    onCancel() {
        this.dialogRef.close(false);
    }

    onConfirm() {
        this.dialogRef.close(true);
    }
}
