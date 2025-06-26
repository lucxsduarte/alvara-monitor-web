import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {DatePipe, NgIf} from "@angular/common";
import {Table, TableModule} from "primeng/table";
import {TooltipModule} from "primeng/tooltip";
import {Empresa} from "../../models/empresa.model";
import {EmpresaService} from "../../services/empresa.service";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {IconFieldModule} from "primeng/iconfield";
import {InputIconModule} from "primeng/inputicon";
import {ConfirmationService, MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {DialogService, DynamicDialogModule, DynamicDialogRef} from "primeng/dynamicdialog";
import {EditarEmpresaComponent} from "../editar-empresa/editar-empresa.component";
import {ActivatedRoute} from "@angular/router";
import {createDateFromYYYYMMDD} from "../../../../utils/date.utils";


@Component({
  selector: 'app-listar-empresa',
  standalone: true,
  imports: [
    ButtonDirective,
    DatePipe,
    TableModule,
    TooltipModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    NgIf,
    ToastModule,
    ConfirmDialogModule,
    DynamicDialogModule,
  ],
  templateUrl: './listar-empresas.component.html',
  styleUrl: './listar-empresas.component.scss',
  providers: [DialogService, ConfirmationService],
})
export class ListarEmpresasComponent implements OnInit {
  empresas: Empresa[] = [];
  empresasFiltradas: Empresa[] = [];
  private empresaService = inject(EmpresaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);
  ref!: DynamicDialogRef;
  filtroGlobal: string = '';

  @ViewChild('tabelaEmpresas') tabelaEmpresas!: Table;

  ngOnInit(): void {
    this.empresaService.getCompanies().subscribe(empresas => {
      this.empresas = empresas.sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR', {sensitivity: 'base'})
      );

      this.route.queryParams.subscribe(params => {
        this.aplicarFiltro(params);
        this.aplicarFiltroGlobal();
      });
    });
  }

  aplicarFiltro(params: any) {
    let empresasBase = [...this.empresas];

    if (params['filtro'] === 'vencidos') {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      empresasBase = empresasBase.filter(empresa => {
        const vencBombeiros = empresa.vencBombeiros ? createDateFromYYYYMMDD(empresa.vencBombeiros) : null;
        if (vencBombeiros) vencBombeiros.setHours(0, 0, 0, 0);

        const vencFuncionamento = empresa.vencFuncionamento ? createDateFromYYYYMMDD(empresa.vencFuncionamento) : null;
        if (vencFuncionamento) vencFuncionamento.setHours(0, 0, 0, 0);

        const vencPolicia = empresa.vencPolicia ? createDateFromYYYYMMDD(empresa.vencPolicia) : null;
        if (vencPolicia) vencPolicia.setHours(0, 0, 0, 0);

        const vencVigilancia = empresa.vencVigilancia ? createDateFromYYYYMMDD(empresa.vencVigilancia) : null;
        if (vencVigilancia) vencVigilancia.setHours(0, 0, 0, 0);

        return (
          (vencBombeiros && vencBombeiros < hoje) ||
          (vencFuncionamento && vencFuncionamento < hoje) ||
          (vencPolicia && vencPolicia < hoje) ||
          (vencVigilancia && vencVigilancia < hoje)
        );
      });
    } else if (params['filtro'] === 'empresa' && params['id']) {
      const id = Number(params['id']);
      empresasBase = empresasBase.filter(e => e.id === id);
    }

    this.empresasFiltradas = empresasBase;
  }

  aplicarFiltroGlobal() {
    if (this.tabelaEmpresas) {
      this.tabelaEmpresas.filterGlobal(this.filtroGlobal, 'contains');
    }
  }

  editar(empresaId: number) {
    const empresa = this.empresas.find(e => e.id === empresaId);
    if (!empresa) return;

    this.ref = this.dialogService.open(EditarEmpresaComponent, {
      data: { empresa },
      header: 'Editar Empresa',
      width: '75%',
      height: '70%',
      dismissableMask: true,
      modal: true
    });

    this.ref.onClose.subscribe((dadosEditados: Empresa) => {
      if (dadosEditados) {
        this.empresaService.updateCompany(dadosEditados).subscribe(() => {
          this.empresaService.getCompanies().subscribe(updatedCompanies => {
            this.empresas = updatedCompanies.sort((a, b) =>
              a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
            );

            this.route.queryParams.subscribe(params => {
              this.aplicarFiltro(params);
              this.aplicarFiltroGlobal();
            });
          });

          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Empresa atualizada com sucesso!'
          });
        });
      }
    });
  }

  excluir(empresaId: number) {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta empresa?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.empresaService.deleteCompany(empresaId).subscribe({
          next: () => {
            this.empresaService.getCompanies().subscribe(updatedCompanies => {
              this.empresas = updatedCompanies.sort((a, b) =>
                a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
              );

              this.route.queryParams.subscribe(params => {
                this.aplicarFiltro(params);
                this.aplicarFiltroGlobal();
              });
            });

            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Empresa excluída com sucesso!'
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir empresa.'
            });
          }
        });
      }
    });
  }
}
