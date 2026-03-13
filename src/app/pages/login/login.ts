import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  // Aquí guardamos lo que el usuario escribe
  credenciales = {
    email: '',
    password: ''
  };

  // Para mostrar mensajes de error (ej: contraseña incorrecta)
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) { }

  onLogin() {
    this.errorMessage = ''; // Limpiar errores antes de intentar

    this.apiService.login(this.credenciales).subscribe({
      next: (usuario) => {
        // ¡Éxito! Guardamos los datos del usuario en la memoria del navegador
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));

        // Leemos el rol y lo enviamos a su dashboard correspondiente
        if (usuario.tipoUsuario === 'ADMINISTRADOR') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      },
      error: (err) => {
        // Capturamos los errores que programamos en Spring Boot
        if (err.status === 401) {
          this.errorMessage = 'Contraseña incorrecta.';
        } else if (err.status === 404) {
          this.errorMessage = 'El usuario no existe.';
        } else {
          this.errorMessage = 'Error al conectar con el servidor (¿Está encendido el backend?).';
        }
      }
    });
  }

  irARegistro() {
    this.router.navigate(['/register']);
  }
}