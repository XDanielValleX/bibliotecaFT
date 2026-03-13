import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
  standalone: false
})
export class UserDashboardComponent implements OnInit {
  usuario: any;
  libros: any[] = [];
  misLibrosAprobados: any[] = []; 
  filtroTitulo: string = '';

  // --- VARIABLES PARA VENTANAS MODALES ---
  alertaVisible: boolean = false;
  mensajeAlerta: string = '';
  modalLibrosVisible: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  private refrescarVista() {
    try {
      this.cdr.detectChanges();
    } catch {
      // componente destruido
    }
  }

  ngOnInit(): void {
    this.usuario = this.apiService.getUserData();
    this.actualizarDatos();
  }

  // --- CONTROL DE VENTANAS MODALES ---
  mostrarMensaje(mensaje: string) {
    this.mensajeAlerta = mensaje;
    this.alertaVisible = true;
    this.refrescarVista();
  }

  cerrarMensaje() {
    this.alertaVisible = false;
    this.refrescarVista();
  }

  abrirMisLibros() {
    this.modalLibrosVisible = true;
    // Aseguramos que la lista esté al día al abrir
    this.cargarMisLibrosPrestados();
    this.refrescarVista();
  }

  cerrarMisLibros() {
    this.modalLibrosVisible = false;
    this.refrescarVista();
  }

  // --- CARGA DE DATOS ---
  actualizarDatos() {
    this.cargarLibros();
    this.cargarMisLibrosPrestados();
  }

  cargarMisLibrosPrestados() {
    const idUsr = this.usuario?.id_usuario || this.usuario?.idUsuario || this.usuario?.id;
    if (!idUsr) {
      this.misLibrosAprobados = [];
      return;
    }

    // Usamos el endpoint correcto: historial del usuario
    this.apiService.obtenerHistorial(idUsr).subscribe({
      next: (data: any) => {
        const lista = Array.isArray(data) ? data : [];
        // "Aprobados" = ACTIVO
        this.misLibrosAprobados = lista.filter((p: any) => {
          const estado = p?.estado;
          return typeof estado === 'string' && estado.toUpperCase() === 'ACTIVO';
        });
        this.refrescarVista();
      },
      error: (err) => {
        const backendMessage = err?.error?.message || err?.error?.error || err?.error;
        this.mostrarMensaje(
          typeof backendMessage === 'string' && backendMessage.trim().length > 0
            ? backendMessage
            : 'Error al cargar tus libros aprobados.'
        );
      }
    });
  }

  cargarLibros() {
    let filtro = this.filtroTitulo ? this.filtroTitulo.trim() : '';
    this.apiService.obtenerLibros(filtro).subscribe({
      next: (data) => {
        this.libros = data;
        this.refrescarVista();
      },
      error: (err) => {
        const backendMessage = err?.error?.message || err?.error?.error || err?.error;
        this.mostrarMensaje(
          typeof backendMessage === 'string' && backendMessage.trim().length > 0
            ? backendMessage
            : 'Error al cargar los libros.'
        );
      }
    });
  }

  reservar(idLibro: number) {
    let idUsr = this.usuario.id_usuario || this.usuario.idUsuario || this.usuario.id;

    this.apiService.reservarLibro(idUsr, idLibro).subscribe({
      next: (res) => {
        // CORRECCIÓN: Usamos nuestra nueva ventana modal
        this.mostrarMensaje('¡Reserva exitosa! Ahora espera a que un administrador la apruebe.');
        this.actualizarDatos(); 
      },
      error: (err) => {
        // CORRECCIÓN: Mostramos el error en nuestra ventana
        this.mostrarMensaje(err.error?.message || err.error || 'No se pudo reservar el libro en este momento.');
      }
    });
  }

  cerrarSesion() {
    this.apiService.logout();
    this.router.navigate(['/login']);
  }
}