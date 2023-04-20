import { Validator, ValidatorFn, Validators } from '@angular/forms';

// either empty, or 0x00, or 0x00 0x00, or 0x00 0x00 0x00 allowed

export const notEmptyValidator: ValidatorFn = Validators.pattern(
  /^$|^0x[0-9a-fA-F]{2}( +0x[0-9a-fA-F]{2}){0,2}$/
);
