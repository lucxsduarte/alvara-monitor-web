import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CalendarModule} from "primeng/calendar";
import {FloatLabelModule} from "primeng/floatlabel";
import {InputTextModule} from "primeng/inputtext";
import {EmpresaService} from "../../services/empresa.service";
import {ToastModule} from "primeng/toast";
import {MessageService} from "primeng/api";

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
    });
  }

  save(): void {
    if (this.empresaForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de validação',
        detail: 'Preencha o nome da conveniada corretamente.',
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

    const dados = this.empresaForm.value;
    this.empresaService.saveCompany(dados).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Empresa cadastrada com sucesso!',
        });
        this.empresaForm.reset();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível cadastrar a empresa.',
        });
        console.error('Erro ao salvar:', error);
      }
    });
  }
}
