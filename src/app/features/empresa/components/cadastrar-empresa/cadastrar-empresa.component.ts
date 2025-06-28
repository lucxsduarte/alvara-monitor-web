import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CalendarModule} from "primeng/calendar";
import {FloatLabelModule} from "primeng/floatlabel";
import {InputTextModule} from "primeng/inputtext";
import {EmpresaService} from "../../services/empresa.service";
import {ToastModule} from "primeng/toast";
import {MessageService} from "primeng/api";
import {requireAtLeastOneDateValidator} from "../../../../utils/form.validator";

@Component({
  selector: 'app-cadastrar-empresa',
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
  templateUrl: './cadastrar-empresa.component.html',
  styleUrl: './cadastrar-empresa.component.scss',
})
export class CadastrarEmpresaComponent implements OnInit {
  empresaForm!: FormGroup;

  private fb = inject(FormBuilder);
  private empresaService = inject(EmpresaService);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.empresaForm = this.fb.group({
      nome: ['', Validators.required],
      vencBombeiros: [null],
      vencFuncionamento: [null],
      vencPolicia: [null],
      vencVigilancia: [null],
    }, {
      validators: [requireAtLeastOneDateValidator()]
    });
  }

  save(): void {
    if (this.empresaForm.invalid) {
      const detail = this.empresaForm.hasError('requireAtLeastOneDate')
        ? 'Preencha pelo menos uma data de alvará.'
        : 'Preencha os campos corretamente.';

      this.messageService.add({ severity: 'error', summary: 'Erro de validação', detail });
      return;
    }

    const formValues = this.empresaForm.value;

    const formatDate = (date: Date | null): string | null => date ? date.toISOString().split('T')[0] : null;

    const dadosParaApi = {
      ...formValues,
      vencBombeiros: formatDate(formValues.vencBombeiros),
      vencFuncionamento: formatDate(formValues.vencFuncionamento),
      vencPolicia: formatDate(formValues.vencPolicia),
      vencVigilancia: formatDate(formValues.vencVigilancia),
    };

    this.empresaService.salvarEmpresa(dadosParaApi).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa cadastrada com sucesso!' });
        this.empresaForm.reset();
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível cadastrar a empresa.' });
        console.error('Erro ao salvar:', error);
      }
    });
  }
}
