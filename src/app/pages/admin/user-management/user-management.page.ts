import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {UserService} from '../../../features/user/services/user.service';
import {CreateUserDTO, EditUserDTO, UserDTO} from '../../../features/user/models/user.dto';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {ToastModule} from 'primeng/toast';
import {PasswordModule} from 'primeng/password';
import {FloatLabelModule} from "primeng/floatlabel";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TableModule} from "primeng/table";
import {TooltipModule} from "primeng/tooltip";
import {TagModule} from "primeng/tag";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {DynamicDialogModule} from "primeng/dynamicdialog";
import {EditUserComponent} from "../../../features/user/components/edit-user/edit-user.component";

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    PasswordModule,
    FloatLabelModule,
    ConfirmDialogModule,
    TableModule,
    TooltipModule,
    TagModule,
    DynamicDialogModule
  ],
  templateUrl: './user-management.page.html',
  styleUrls: ['./user-management.page.scss'],
  providers: [MessageService, ConfirmationService, DialogService]
})
export class UserManagementPage implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);

  userForm!: FormGroup;
  roles: any[];
  isLoading = false;
  users: UserDTO[] = [];
  ref!: DynamicDialogRef;

  constructor() {
    this.roles = [
      {label: 'Usuário Padrão', value: 'ROLE_USER'},
      {label: 'Administrador', value: 'ROLE_ADMIN'}
    ];
  }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      login: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ROLE_USER', Validators.required]
    });

    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe(data => {
      this.users = data;
    });
  }

  createUser(): void {
    if (this.userForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha o formulário corretamente.'
      });
      return;
    }

    this.isLoading = true;
    const data: CreateUserDTO = {
      login: this.userForm.value.login,
      password: this.userForm.value.password,
      role: this.userForm.value.role
    };

    this.userService.create(data).subscribe({
      next: (createdUser) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Usuário '${createdUser.login}' criado com sucesso!`
        });
        this.userForm.reset({role: 'ROLE_USER'});
        this.loadUsers();
      },
      error: (err) => {
        this.isLoading = false;
        const errorMsg = err.error?.message || 'Não foi possível criar o usuário.';
        this.messageService.add({severity: 'error', summary: 'Erro', detail: errorMsg});
        console.error('Erro ao criar usuário:', err);
      }
    });
  }

  editUser(user: UserDTO): void {
    this.ref = this.dialogService.open(EditUserComponent, {
      data: {user},
      header: `Editar Usuário: ${user.login}`,
      width: '50%',
      modal: true,
    });

    this.ref.onClose.subscribe((editedData: EditUserDTO) => {
      if (editedData) {
        this.userService.update(user.id, editedData).subscribe({
          next: () => {
            this.messageService.add({severity: 'success', summary: 'Sucesso', detail: 'Usuário atualizado.'});
            this.loadUsers();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Não foi possível atualizar o usuário.';
            this.messageService.add({severity: 'error', summary: 'Erro', detail: errorMsg});
          }
        });
      }
    });
  }

  deleteUser(user: UserDTO): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o usuário '${user.login}'?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.delete(user.id).subscribe({
          next: () => {
            this.messageService.add({severity: 'success', summary: 'Sucesso', detail: 'Usuário excluído.'});
            this.loadUsers();
          },
          error: (err) => this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível excluir o usuário.'
          })
        });
      }
    });
  }
}
