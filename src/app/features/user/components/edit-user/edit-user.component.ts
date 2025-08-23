import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {FloatLabelModule} from 'primeng/floatlabel';
import {UserResponseDTO} from "../../models/userResponseDTO";

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    FloatLabelModule
  ],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);

  userForm!: FormGroup;
  user: UserResponseDTO = this.config.data.user;

  roles: any[];

  constructor() {
    this.roles = [
      {label: 'Usuário Padrão', value: 'ROLE_USER'},
      {label: 'Administrador', value: 'ROLE_ADMIN'}
    ];
  }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      login: [this.user.login, [Validators.required, Validators.minLength(3)]],
      role: [this.user.role, Validators.required]
    });
  }

  save(): void {
    if (this.userForm.invalid) {
      return;
    }

    const updatedData = {
      ...this.user,
      ...this.userForm.value
    };

    this.ref.close(updatedData);
  }

  cancel(): void {
    this.ref.close();
  }
}
