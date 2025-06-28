import {Component, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  Subject,
  Subscription,
  switchMap
} from "rxjs";
import {FiltroStatusEmpresa} from "../../models/enums/FiltroStatusEmpresa";


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
export class ListarEmpresasComponent implements OnInit, OnDestroy {
  empresas: Empresa[] = [];
  filtroGlobal: string = '';

  private empresaService = inject(EmpresaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);

  private filtroGlobalSubject = new Subject<string>();
  private refreshSubject = new Subject<void>();
  private subscriptions = new Subscription();
  ref!: DynamicDialogRef;

  @ViewChild('tabelaEmpresas') tabelaEmpresas!: Table;

  ngOnInit(): void {
    const combinedStream$ = combineLatest([
      this.route.queryParams,
      this.filtroGlobalSubject.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        startWith('')
      ),
      this.refreshSubject.pipe(startWith(null))
    ]).pipe(
      switchMap(([params, nomeFiltro]) => {
        const id = params['id'];
        const filtro = params['filtro'];

        if (id) {
          return this.empresaService.buscarEmpresaPorId(Number(id)).pipe(
            map(empresa => empresa ? [empresa] : [])
          );
        }

        const statusFiltro = filtro === 'vencidos' ? FiltroStatusEmpresa.VENCIDOS : undefined;
        return this.empresaService.buscarEmpresas(nomeFiltro, statusFiltro);
      })
    );

    this.subscriptions.add(
      combinedStream$.subscribe({
        next: (empresas) => {
          this.empresas = empresas.sort((a, b) =>
            a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
          );
        },
        error: (err) => {
          console.error("Erro ao carregar empresas:", err);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as empresas.' });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onFiltroGlobalChange(): void {
    this.filtroGlobalSubject.next(this.filtroGlobal);
  }

  editar(empresa: Empresa): void {
    this.ref = this.dialogService.open(EditarEmpresaComponent, {
      data: { empresa },
      header: `Editar Empresa: ${empresa.nome}`,
      width: '60%',
      modal: true
    });

    this.subscriptions.add(
      this.ref.onClose.subscribe((dadosEditados: Empresa) => {
        if (dadosEditados) {
          this.empresaService.atualizarEmpresa(dadosEditados).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa atualizada com sucesso!' });
              this.refreshSubject.next();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar empresa.' })
          });
        }
      })
    );
  }

  excluir(empresa: Empresa): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a empresa "${empresa.nome}"?`,
      header: 'Confirmação de Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.empresaService.deletarEmpresa(empresa.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa excluída com sucesso!' });
            this.refreshSubject.next();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir empresa.' })
        });
      }
    });
  }
}
