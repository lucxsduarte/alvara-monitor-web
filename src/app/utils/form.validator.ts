import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function requireAtLeastOneDateValidator(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const expLicenseFiredept  = formGroup.get('expLicenseFiredept')?.value;
    const expLicenseOperating  = formGroup.get('expLicenseOperating')?.value;
    const expLicensePolice  = formGroup.get('expLicensePolice')?.value;
    const expLicenseSurveillance  = formGroup.get('expLicenseSurveillance')?.value;

    const atLeastOneFilled = expLicenseFiredept || expLicenseOperating || expLicensePolice || expLicenseSurveillance ;

    return atLeastOneFilled ? null : { requireAtLeastOneDate: true };
  };
}
