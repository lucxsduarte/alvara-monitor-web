import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CalendarModule} from "primeng/calendar";
import {FloatLabelModule} from "primeng/floatlabel";
import {InputTextModule} from "primeng/inputtext";
import {CompanyService} from "../../services/company.service";
import {ToastModule} from "primeng/toast";
import {MessageService} from "primeng/api";
import {requireAtLeastOneDateValidator} from "../../../../utils/form.validator";

@Component({
  selector: 'app-create-company',
  standalone: true,
  imports: [
    CommonModule,
    FloatLabelModule,
    ReactiveFormsModule,
    CalendarModule,
    InputTextModule,
    FormsModule,
    ToastModule,
  ],
  templateUrl: './create-company.component.html',
  styleUrl: './create-company.component.scss',
})
export class CreateCompanyComponent implements OnInit {
  companyForm!: FormGroup;

  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      expLicenseFiredept: [null],
      expLicenseOperating: [null],
      expLicensePolice: [null],
      expLicenseSurveillance: [null],
    }, {
      validators: [requireAtLeastOneDateValidator()]
    });
  }

  save(): void {
    if (this.companyForm.invalid) {
      const detail = this.companyForm.hasError('requireAtLeastOneDate')
        ? 'Preencha pelo menos uma data de alvará.'
        : 'Preencha os campos corretamente.';

      this.messageService.add({ severity: 'error', summary: 'Erro de validação', detail });
      return;
    }

    const formValues = this.companyForm.value;

    const formatDate = (date: Date | null): string | null => date ? date.toISOString().split('T')[0] : null;

    const apiData = {
      name: formValues.name,
      expLicenseFiredept: formatDate(formValues.expLicenseFiredept),
      expLicenseOperating: formatDate(formValues.expLicenseOperating),
      expLicensePolice: formatDate(formValues.expLicensePolice),
      expLicenseSurveillance: formatDate(formValues.expLicenseSurveillance),
    };

    this.companyService.saveCompany(apiData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa cadastrada com sucesso!' });
        this.companyForm.reset();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível cadastrar a empresa.' });
        console.error('Erro ao salvar:', error);
      }
    });
  }
}
