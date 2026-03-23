export interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  fields: WizardStepField[];
  condition?: (formValue: any) => boolean;
}

export interface WizardStepField {
  key: string;
  type: 'text' | 'textarea' | 'date-range' | 'location-pair' | 'image-url' | 'toggle' | 'card-select';
  label: string;
  placeholder?: string;
  icon?: string;
  hint?: string;
  options?: { value: string; label: string; icon?: string; description?: string }[];
}
