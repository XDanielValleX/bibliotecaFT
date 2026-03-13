import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api'; // Asegúrate que la ruta sea .service

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

  // Para mostrar mensajes de error
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) { }

  onLogin() {
    this.errorMessage = ''; // Limpiar errores antes de intentar

    this.apiService.login(this.credenciales).subscribe({
      next: (usuario) => {
        // ¡Éxito! Guardamos los datos del usuario
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));

        // Leemos el rol y lo enviamos a su dashboard correspondiente
        if (usuario.tipoUsuario === 'ADMINISTRADOR' || usuario.tipoUsuario === 'DOCENTE') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      }, // <-- FÍJATE AQUÍ: Esta coma separa el 'next' del 'error'
      error: (err) => {
        console.log("Detalle completo del error:", err); // Para chismear en la consola

        // Mostramos el mensaje rojo SÍ o SÍ cada vez que falle el inicio de sesión
        this.errorMessage = 'Correo o contraseña incorrectos. Por favor, verifica tus datos.';
      }
    }); // <-- Aquí cierra el subscribe
  }

  irARegistro() {
    this.router.navigate(['/register']);
  }
}