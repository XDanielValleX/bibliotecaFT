import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api'; // Asegúrate que la ruta sea .service

type TipoUsuario = 'ESTUDIANTE' | 'DOCENTE' | 'ADMINISTRADOR';

type UsuarioLogin = {
  tipoUsuario?: TipoUsuario | string;
  // Algunos backends envían snake_case
  tipo_usuario?: TipoUsuario | string;
} | null;

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
  errorMessage = '';

  constructor(private apiService: ApiService, private router: Router) { }

  private getTipoUsuario(usuario: UsuarioLogin): string | null {
    if (!usuario || typeof usuario !== 'object') return null;
    const tipo = (usuario as any).tipoUsuario ?? (usuario as any).tipo_usuario;
    return typeof tipo === 'string' && tipo.length > 0 ? tipo : null;
  }

  onLogin() {
    this.errorMessage = ''; // Limpiar errores antes de intentar

    this.apiService.login(this.credenciales).subscribe({
      next: (usuario) => {
        try {
          const tipoUsuario = this.getTipoUsuario(usuario as UsuarioLogin);

          // Si el backend responde 200 pero no devuelve un usuario válido,
          // tratamos esto como credenciales incorrectas.
          if (!tipoUsuario) {
            localStorage.removeItem('usuarioLogueado');
            this.errorMessage = 'Correo o contraseña incorrectos. Por favor, verifica tus datos.';
            return;
          }

          // ¡Éxito! Guardamos los datos del usuario
          localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));

          // Leemos el rol y lo enviamos a su dashboard correspondiente
          if (tipoUsuario === 'ADMINISTRADOR' || tipoUsuario === 'DOCENTE') {
            this.router.navigate(['/admin-dashboard']);
          } else {
            this.router.navigate(['/user-dashboard']);
          }
        } catch (e) {
          console.error('Respuesta inesperada al hacer login:', e, usuario);
          localStorage.removeItem('usuarioLogueado');
          this.errorMessage = 'No se pudo iniciar sesión. Verifica tus credenciales e intenta de nuevo.';
        }
      }, // <-- FÍJATE AQUÍ: Esta coma separa el 'next' del 'error'
      error: (err) => {
        console.log("Detalle completo del error:", err); // Para chismear en la consola

        // Mostramos el mensaje rojo SÍ o SÍ cada vez que falle el inicio de sesión
        const backendMessage = err?.error?.message || err?.error?.error || err?.error;
        this.errorMessage =
          typeof backendMessage === 'string' && backendMessage.trim().length > 0
            ? backendMessage
            : 'Correo o contraseña incorrectos. Por favor, verifica tus datos.';
      }
    }); // <-- Aquí cierra el subscribe
  }

  irARegistro() {
    this.router.navigate(['/register']);
  }
}