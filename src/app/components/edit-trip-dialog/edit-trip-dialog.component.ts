import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface EditTripDialogData {
  tripId: string;
  title: string;
  description: string;
  origin?: string;
  destination?: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  isPublic?: boolean;
}

@Component({
  selector: 'app-edit-trip-dialog',
  templateUrl: './edit-trip-dialog.component.html',
  styleUrls: ['./edit-trip-dialog.component.scss']
})
export class EditTripDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTripDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditTripDialogData
  ) {
    this.form = this.fb.group({
      title: [data.title || '', Validators.required],
      description: [data.description || ''],
      origin: [data.origin || ''],
      destination: [data.destination || ''],
      startDate: [data.startDate ? new Date(data.startDate) : null, Validators.required],
      endDate: [data.endDate ? new Date(data.endDate) : null, Validators.required],
      coverImage: [data.coverImage || ''],
      isPublic: [data.isPublic || false]
    });
  }

  onSave() {
    if (this.form.invalid) return;

    const value = this.form.value;
    // Format dates to ISO strings
    if (value.startDate instanceof Date) {
      value.startDate = value.startDate.toISOString().split('T')[0];
    }
    if (value.endDate instanceof Date) {
      value.endDate = value.endDate.toISOString().split('T')[0];
    }
    this.dialogRef.close(value);
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
