import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AskAiDialogData {
  tripId: string;
  destination: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-ask-ai-dialog',
  templateUrl: './ask-ai-dialog.component.html',
  styleUrls: ['./ask-ai-dialog.component.scss']
})
export class AskAiDialogComponent {
  generating = false;

  constructor(
    public dialogRef: MatDialogRef<AskAiDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AskAiDialogData
  ) { }

  onGenerateWithAI() {
    this.dialogRef.close({ useAI: true });
  }

  onManual() {
    this.dialogRef.close({ useAI: false });
  }
}
