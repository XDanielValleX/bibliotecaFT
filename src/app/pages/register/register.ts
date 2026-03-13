import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: false // <-- Tu gran descubrimiento, lo mantenemos así
})
export class RegisterComponent {
  nuevoUsuario = {
    nombre: '',
    email: '',
    password: '',
    tipoUsuario: 'ESTUDIANTE' // Valor por defecto
  };

  mensaje: string = '';
  isError: boolean = false;

  constructor(private apiService: ApiService, private router: Router) { }

  onRegister() {
    this.apiService.registrarUsuario(this.nuevoUsuario).subscribe({
      next: (res) => {
        this.isError = false;
        this.mensaje = '¡Usuario registrado con éxito! Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isError = true;
        this.mensaje = err.error || 'Error al registrar el usuario.';
      }
    });
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}