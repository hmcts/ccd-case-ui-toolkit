// Identifies whether a read palette value came from persisted case data or the current edit form.
// Form-origin DateTime values on Check Your Answers must not be service-local adjusted before submit.
export enum PaletteValueOrigin {
  BACKEND = 'BACKEND',
  FORM = 'FORM',
}
