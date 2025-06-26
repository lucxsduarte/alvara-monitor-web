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
  private fb = inject(FormBuilder);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);

  empresaForm!: FormGroup;
  empresa: Empresa = this.config.data.empresa;

  ngOnInit(): void {
    this.empresaForm = this.fb.group({
      nome: [this.empresa?.nome ?? '', Validators.required],
      vencBombeiros: [createDateFromYYYYMMDD(this.empresa?.vencBombeiros)],
      vencFuncionamento: [createDateFromYYYYMMDD(this.empresa?.vencFuncionamento)],
      vencPolicia: [createDateFromYYYYMMDD(this.empresa?.vencPolicia)],
      vencVigilancia: [createDateFromYYYYMMDD(this.empresa?.vencVigilancia)],
    });
  }

  salvar(): void {
    if (this.empresaForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de validação',
        detail: 'Preencha o nome da empresa corretamente.',
      });
      return;
    }

    const {
      vencBombeiros,
      vencFuncionamento,
      vencPolicia,
      vencVigilancia
    } = this.empresaForm.value;

    const nenhumaDataPreenchida = !vencBombeiros && !vencFuncionamento && !vencPolicia && !vencVigilancia;
    if (nenhumaDataPreenchida) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de validação',
        detail: 'Preencha pelo menos uma data de alvará.',
      });
      return;
    }

    const formattedData = {
      ...this.empresaForm.value,
      vencBombeiros: vencBombeiros ? vencBombeiros.toISOString().split('T')[0] : null,
      vencFuncionamento: vencFuncionamento ? vencFuncionamento.toISOString().split('T')[0] : null,
      vencPolicia: vencPolicia ? vencPolicia.toISOString().split('T')[0] : null,
      vencVigilancia: vencVigilancia ? vencVigilancia.toISOString().split('T')[0] : null,
    };


    const dadosEditados: Empresa = {
      ...this.empresa,
      ...formattedData
    };

    this.ref.close(dadosEditados);
  }

  cancelar(): void {
    this.ref.close();
  }
}
