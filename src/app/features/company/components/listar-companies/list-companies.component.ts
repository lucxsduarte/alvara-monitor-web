import {Component, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {DatePipe, NgIf} from "@angular/common";
import {Table, TableModule} from "primeng/table";
import {TooltipModule} from "primeng/tooltip";
import {Company} from "../../models/company.model";
import {CompanyService} from "../../services/company.service";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {IconFieldModule} from "primeng/iconfield";
import {InputIconModule} from "primeng/inputicon";
import {ConfirmationService, MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {DialogService, DynamicDialogModule, DynamicDialogRef} from "primeng/dynamicdialog";
import {EditCompanyComponent} from "../edit-company/edit-company.component";
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
import {CompanyStatusFilter} from "../../models/enums/CompanyStatusFilter";


@Component({
  selector: 'app-list-companies',
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
  templateUrl: './list-companies.component.html',
  styleUrl: './list-companies.component.scss',
  providers: [DialogService, ConfirmationService],
})
export class ListCompaniesComponent implements OnInit, OnDestroy {
  companies: Company[] = [];
  globalFilter: string = '';

  private companyService = inject(CompanyService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);

  private globalFilterSubject  = new Subject<string>();
  private refreshSubject = new Subject<void>();
  private subscriptions = new Subscription();
  ref!: DynamicDialogRef;

  @ViewChild('companiesTable') companiesTable!: Table;

  ngOnInit(): void {
    const combinedStream$ = combineLatest([
      this.route.queryParams,
      this.globalFilterSubject .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        startWith('')
      ),
      this.refreshSubject.pipe(startWith(null))
    ]).pipe(
      switchMap(([params, nameFilter]) => {
        const id = params['id'];
        const filter = params['filter'];

        if (id) {
          return this.companyService.getCompanyById(Number(id)).pipe(
            map(company => company ? [company] : [])
          );
        }

        const statusFilter = filter === 'expired' ? CompanyStatusFilter.EXPIRED : undefined;
        return this.companyService.getCompanies(nameFilter, statusFilter);
      })
    );

    this.subscriptions.add(
      combinedStream$.subscribe({
        next: (companies) => {
          this.companies = companies.sort((a, b) => {
            const nameA = a.name || '';
            const nameB = b.name || '';
            return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
          });
        },
        error: (err) => {
          console.error("Erro ao carregar empresas:", err);
          this.messageService .add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as empresas.' });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onGlobalFilterChange(): void {
    this.globalFilterSubject .next(this.globalFilter);
  }

  editCompany(company: Company): void {
    this.ref = this.dialogService.open(EditCompanyComponent, {
      data: { company },
      header: `Editar Empresa: ${company.name}`,
      width: '60%',
      modal: true
    });

    this.subscriptions.add(
      this.ref.onClose.subscribe((editedData: Company) => {
        if (editedData) {
          this.companyService .updateCompany(editedData).subscribe({
            next: () => {
              this.messageService .add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa atualizada com sucesso!' });
              this.refreshSubject.next();
            },
            error: () => this.messageService .add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar empresa.' })
          });
        }
      })
    );
  }

  deleteCompany(company: Company): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a empresa "${company.name}"?`,
      header: 'Confirmação de exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.companyService .deleteCompany(company.id).subscribe({
          next: () => {
            this.messageService .add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa excluída com sucesso!' });
            this.refreshSubject.next();
          },
          error: () => this.messageService .add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir empresa.' })
        });
      }
    });
  }
}
