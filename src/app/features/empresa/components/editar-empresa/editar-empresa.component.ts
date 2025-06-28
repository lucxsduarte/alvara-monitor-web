import {Component, inject, Inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { Empresa } from '../../models/empresa.model';
import {MessageService} from "primeng/api";
import {createDateFromYYYYMMDD} from "../../../../utils/date.utils";
import {requireAtLeastOneDateValidator} from "../../../../utils/form.validator";


@Component({
  selector: 'app-editar-empresa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    CalendarModule
  ],
  templateUrl: './editar-empresa.component.html',
  styleUrl: './editar-empresa.component.scss'
})
export class EditarEmpresaComponent implements OnInit {
  empresaForm!: FormGroup;
  empresa: Empresa;

  private fb = inject(FormBuilder);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);

  constructor() {
    this.empresa = this.config.data.empresa;
  }

  ngOnInit(): void {
    this.empresaForm = this.fb.group({
      nome: [this.empresa?.nome ?? '', Validators.required],
      vencBombeiros: [createDateFromYYYYMMDD(this.empresa?.vencBombeiros)],
      vencFuncionamento: [createDateFromYYYYMMDD(this.empresa?.vencFuncionamento)],
      vencPolicia: [createDateFromYYYYMMDD(this.empresa?.vencPolicia)],
      vencVigilancia: [createDateFromYYYYMMDD(this.empresa?.vencVigilancia)],
    }, {
      validators: [requireAtLeastOneDateValidator()]
    });
  }

  salvar(): void {
    if (this.empresaForm.invalid) {
      const detail = this.empresaForm.hasError('requireAtLeastOneDate')
        ? 'Preencha pelo menos uma data de alvará.'
        : 'Preencha o nome da empresa corretamente.';
      this.messageService.add({ severity: 'error', summary: 'Erro de validação', detail });
      return;
    }

    const formValues = this.empresaForm.value;
    const formatDate = (date: Date | null): string | null => date ? date.toISOString().split('T')[0] : null;

    const dadosEditados: Empresa = {
      ...this.empresa,
      ...formValues,
      vencBombeiros: formatDate(formValues.vencBombeiros),
      vencFuncionamento: formatDate(formValues.vencFuncionamento),
      vencPolicia: formatDate(formValues.vencPolicia),
      vencVigilancia: formatDate(formValues.vencVigilancia),
    };

    this.ref.close(dadosEditados);
  }

  cancelar(): void {
    this.ref.close();
  }
}
