import {Component, inject, Inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { Company } from '../../models/company.model';
import {MessageService} from "primeng/api";
import {createDateFromYYYYMMDD} from "../../../../utils/date.utils";
import {requireAtLeastOneDateValidator} from "../../../../utils/form.validator";


@Component({
  selector: 'app-edit-company',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    CalendarModule
  ],
  templateUrl: './edit-company.component.html',
  styleUrl: './edit-company.component.scss'
})
export class EditCompanyComponent implements OnInit {
  companyForm!: FormGroup;
  company: Company;

  private fb = inject(FormBuilder);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);

  constructor() {
    this.company = this.config.data.company;
  }

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      name: [this.company?.name ?? '', Validators.required],
      expLicenseFiredept: [createDateFromYYYYMMDD(this.company?.expLicenseFiredept)],
      expLicenseOperating: [createDateFromYYYYMMDD(this.company?.expLicenseOperating)],
      expLicensePolice: [createDateFromYYYYMMDD(this.company?.expLicensePolice)],
      expLicenseSurveillance: [createDateFromYYYYMMDD(this.company?.expLicenseSurveillance)],
    }, {
      validators: [requireAtLeastOneDateValidator()]
    });
  }

  save(): void {
    if (this.companyForm.invalid) {
      const detail = this.companyForm.hasError('requireAtLeastOneDate')
        ? 'Preencha pelo menos uma data de alvará.'
        : 'Preencha o nome da empresa corretamente.';
      this.messageService.add({ severity: 'error', summary: 'Erro de validação', detail });
      return;
    }

    const formValues = this.companyForm.value;
    const formatDate = (date: Date | null): string | null => date ? date.toISOString().split('T')[0] : null;

    const editedData: Company = {
      ...this.company,
      ...formValues,
      expLicenseFiredept: formatDate(formValues.vencBombeiros),
      expLicenseOperating: formatDate(formValues.vencFuncionamento),
      expLicensePolice: formatDate(formValues.vencPolicia),
      expLicenseSurveillance: formatDate(formValues.vencVigilancia),
    };

    this.ref.close(editedData);
  }

  cancel(): void {
    this.ref.close();
  }
}
