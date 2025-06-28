import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function requireAtLeastOneDateValidator(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const vencBombeiros = formGroup.get('vencBombeiros')?.value;
    const vencFuncionamento = formGroup.get('vencFuncionamento')?.value;
    const vencPolicia = formGroup.get('vencPolicia')?.value;
    const vencVigilancia = formGroup.get('vencVigilancia')?.value;

    const atLeastOneFilled = vencBombeiros || vencFuncionamento || vencPolicia || vencVigilancia;

    return atLeastOneFilled ? null : { requireAtLeastOneDate: true };
  };
}
